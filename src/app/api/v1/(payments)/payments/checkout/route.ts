import { fail, failFromError, ok } from "@/server/lib/api-response";
import { verifyUserTokenFromRequest } from "@/server/auth/jwt";
import { checkoutWithPaymentMethod } from "@/server/payments/services/payment.service";

export async function POST(request: Request) {
  try {
    const authenticatedUserId = verifyUserTokenFromRequest(request);
    if (!authenticatedUserId) return fail("로그인이 필요합니다.", 401);

    const body = await request.json();
    const orderId = Number(body?.orderId);
    const paymentMethodId = Number(body?.paymentMethodId);

    if (!Number.isInteger(orderId) || orderId < 1) {
      return fail("유효하지 않은 주문 ID입니다.", 400);
    }
    if (!Number.isInteger(paymentMethodId) || paymentMethodId < 1) {
      return fail("유효하지 않은 결제 수단 ID입니다.", 400);
    }

    const data = await checkoutWithPaymentMethod(authenticatedUserId, {
      orderId,
      paymentMethodId,
    });

    return ok(data, 201);
  } catch (error) {
    return failFromError(error, "결제 처리 중 오류가 발생했습니다.");
  }
}
