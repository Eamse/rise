import { fail, failFromError, ok } from "@/server/lib/api-response";
import { verifyUserTokenFromRequest } from "@/server/auth/jwt";
import { removePaymentMethod } from "@/server/payments/services/payment.service";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authenticatedUserId = verifyUserTokenFromRequest(request);
    if (!authenticatedUserId) return fail("로그인이 필요합니다.", 401);

    const { id } = await params;
    const methodId = Number(id);
    if (!Number.isInteger(methodId) || methodId < 1) {
      return fail("유효하지 않은 결제 수단 ID입니다.", 400);
    }

    const data = await removePaymentMethod(authenticatedUserId, methodId);
    return ok(data);
  } catch (error) {
    return failFromError(error, "결제 수단 삭제 중 오류가 발생했습니다.");
  }
}
