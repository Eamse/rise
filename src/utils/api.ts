"use client";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
type RequestBody = BodyInit | Record<string, unknown> | unknown[] | null;

const METHODS_WITHOUT_BODY: ReadonlySet<HttpMethod> = new Set([
  "GET",
  "DELETE",
]);

function isBodyInitValue(value: unknown): value is BodyInit {
  return (
    typeof value === "string" ||
    value instanceof Blob ||
    value instanceof ArrayBuffer ||
    ArrayBuffer.isView(value) ||
    value instanceof FormData ||
    value instanceof URLSearchParams ||
    value instanceof ReadableStream
  );
}

function buildRequestInit(
  method: HttpMethod,
  token: string | null,
  body?: RequestBody,
): RequestInit {
  const hasBody = body !== undefined && !METHODS_WITHOUT_BODY.has(method);
  const headers = new Headers();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let requestBody: BodyInit | undefined;
  if (hasBody) {
    if (body === null) {
      headers.set("Content-Type", "application/json");
      requestBody = "null";
    } else if (isBodyInitValue(body)) {
      requestBody = body;
    } else {
      headers.set("Content-Type", "application/json");
      requestBody = JSON.stringify(body);
    }
  }

  return {
    method,
    headers,
    credentials: "same-origin",
    ...(requestBody !== undefined ? { body: requestBody } : {}),
  };
}

export async function sendAuthenticatedRequest(
  url: string,
  method: HttpMethod,
  body?: RequestBody,
): Promise<Response | null> {
  if (!url.trim()) {
    console.error("[sendAuthenticatedRequest] url이 비어 있습니다.");
    return null;
  }

  // 인증 토큰은 HttpOnly 쿠키로 관리됩니다.
  // credentials: 'same-origin' 설정으로 브라우저가 쿠키를 자동으로 전송합니다.
  // (buildRequestInit 내부에 credentials: 'same-origin'이 포함되어 있습니다)
  try {
    return await fetch(url, buildRequestInit(method, null, body));
  } catch (error) {
    console.error("전송 실패", error);
    return null;
  }
}
