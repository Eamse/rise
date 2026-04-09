import crypto from "crypto";
import { fail, failFromError, ok } from "@/server/lib/api-response";
import { verifyUserTokenFromRequest } from "@/server/auth/jwt";
import { parsePaymentConfirmInput } from "@/server/orders/schemas/order.schema";
import { confirmPayment } from "@/server/orders/services/order.service";
import { AppError } from "@/server/lib/app-error";

function assertInternalConfirmAccess(request: Request) {
  const expectedSecret = process.env.INTERNAL_PAYMENT_CONFIRM_SECRET;
  if (!expectedSecret) {
    throw new AppError(
      "INTERNAL_PAYMENT_CONFIRM_SECRET 환경변수가 필요합니다.",
      500,
    );
  }

  const providedSecret = request.headers.get("x-internal-payment-secret");
  if (!providedSecret) {
    throw new AppError("내부 결제 확인 요청만 허용됩니다.", 403);
  }

  const providedBuffer = Buffer.from(providedSecret);
  const expectedBuffer = Buffer.from(expectedSecret);
  const isMatch =
    providedBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(providedBuffer, expectedBuffer);

  if (!isMatch) {
    throw new AppError("내부 결제 확인 요청만 허용됩니다.", 403);
  }
}

export async function POST(request: Request) {
  try {
    assertInternalConfirmAccess(request);

    const authenticatedUserId = verifyUserTokenFromRequest(request);
    if (!authenticatedUserId) return fail("로그인이 필요합니다.", 401);

    const body = await request.json();
    const input = parsePaymentConfirmInput(body);
    if (!input) return fail("요청 본문 형식이 올바르지 않습니다.", 400);

    const data = await confirmPayment(authenticatedUserId, input);
    return ok(data, 201);
  } catch (error) {
    return failFromError(error, "결제 승인 중 오류가 발생했습니다.");
  }
}
