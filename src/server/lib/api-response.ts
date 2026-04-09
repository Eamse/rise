import { NextResponse } from "next/server";
import { isAppError } from "@/server/lib/app-error";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ success: false, error: { message } }, { status });
}

export function failFromError(error: unknown, fallbackMessage: string) {
  if (isAppError(error)) {
    return fail(error.message, error.statusCode);
  }
  if (error instanceof Error) {
    return fail(error.message, 400);
  }
  return fail(fallbackMessage, 500);
}
