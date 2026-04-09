import { fail, failFromError, ok } from "@/server/lib/api-response";
import { requireAdminAccess } from "@/server/security/admin-guard";
import { getOrderDetailForAdmin } from "@/server/orders/services/order.service";

function parseOrderId(raw: string) {
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1) return null;
  return value;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const auth = await requireAdminAccess(request, {
      operation: "orders:detail",
      requireRecentAuth: false,
    });
    if (!auth.ok) return auth.response;

    const { orderId } = await params;
    const parsedOrderId = parseOrderId(orderId);
    if (!parsedOrderId) return fail("유효하지 않은 주문 번호입니다.", 400);

    const data = await getOrderDetailForAdmin(parsedOrderId);
    return ok(data);
  } catch (error) {
    return failFromError(error, "주문 상세 조회 중 오류가 발생했습니다.");
  }
}

