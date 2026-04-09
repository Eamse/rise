import { fail, failFromError, ok } from "@/server/lib/api-response";
import { verifyUserTokenFromRequest } from "@/server/auth/jwt";
import { getShipments } from "@/server/orders/services/order.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const authenticatedUserId = verifyUserTokenFromRequest(request);
    if (!authenticatedUserId) return fail("로그인이 필요합니다.", 401);

    const { orderId } = await params;
    const numericOrderId = Number(orderId);
    if (!Number.isInteger(numericOrderId) || numericOrderId < 1) {
      return fail("유효하지 않은 주문 ID입니다.", 400);
    }

    const data = await getShipments(authenticatedUserId, numericOrderId);
    return ok(data);
  } catch (error) {
    return failFromError(error, "배송 조회 중 오류가 발생했습니다.");
  }
}
