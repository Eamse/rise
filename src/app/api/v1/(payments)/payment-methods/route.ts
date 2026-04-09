import { fail, failFromError, ok } from "@/server/lib/api-response";
import { verifyUserTokenFromRequest } from "@/server/auth/jwt";
import {
  getPaymentMethods,
  registerPaymentMethod,
} from "@/server/payments/services/payment.service";

export async function GET(request: Request) {
  try {
    const authenticatedUserId = verifyUserTokenFromRequest(request);
    if (!authenticatedUserId) return fail("로그인이 필요합니다.", 401);

    const data = await getPaymentMethods(authenticatedUserId);
    return ok(data);
  } catch (error) {
    return failFromError(error, "결제 수단 조회 중 오류가 발생했습니다.");
  }
}

export async function POST(request: Request) {
  try {
    const authenticatedUserId = verifyUserTokenFromRequest(request);
    if (!authenticatedUserId) return fail("로그인이 필요합니다.", 401);

    const body = await request.json();
    const data = await registerPaymentMethod(authenticatedUserId, {
      bank: String(body?.bank || ""),
      cardBrand: String(body?.cardBrand || ""),
      cardAlias: typeof body?.cardAlias === "string" ? body.cardAlias : "",
      cardLast4: String(body?.cardLast4 || ""),
    });

    return ok(data, 201);
  } catch (error) {
    return failFromError(error, "결제 수단 등록 중 오류가 발생했습니다.");
  }
}
