import { fail, failFromError, ok } from "@/server/lib/api-response";
import { requireAdminAccess } from "@/server/security/admin-guard";
import { advanceOrderStatusForAdmin } from "@/server/orders/services/order.service";
import { recordAdminAuditLog } from "@/server/security/admin-audit";
import { getClientIp } from "@/server/security/request-ip";

type FulfilmentStatus = "PREPARING" | "SHIPPED" | "DELIVERED";

function parseOrderId(raw: string) {
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1) return null;
  return value;
}

function isFulfilmentStatus(value: unknown): value is FulfilmentStatus {
  return value === "PREPARING" || value === "SHIPPED" || value === "DELIVERED";
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const auth = await requireAdminAccess(request, {
      operation: "orders:update_status",
      requireRecentAuth: true,
    });
    if (!auth.ok) return auth.response;

    const { orderId } = await params;
    const parsedOrderId = parseOrderId(orderId);
    if (!parsedOrderId) return fail("유효하지 않은 주문 번호입니다.", 400);

    const body = await request.json().catch(() => null);
    const toStatus = body?.toStatus;
    if (!isFulfilmentStatus(toStatus)) {
      return fail("유효하지 않은 주문 상태입니다.", 400);
    }

    const data = await advanceOrderStatusForAdmin(parsedOrderId, toStatus);
    await recordAdminAuditLog({
      adminId: auth.admin.id,
      adminUsername: auth.admin.username,
      ip: getClientIp(request),
      action: "ORDER_STATUS_CHANGED",
      targetType: "ORDER",
      targetId: String(parsedOrderId),
      detail: `${data.from} -> ${data.to}`,
      metadata: { from: data.from, to: data.to },
    });
    return ok(data);
  } catch (error) {
    return failFromError(error, "주문 상태 변경 중 오류가 발생했습니다.");
  }
}
