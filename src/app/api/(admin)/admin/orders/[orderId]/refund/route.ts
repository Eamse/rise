import { fail, failFromError, ok } from "@/server/lib/api-response";
import { requireAdminAccess } from "@/server/security/admin-guard";
import { resolveRefundRequestForAdmin } from "@/server/orders/services/order.service";
import { recordAdminAuditLog } from "@/server/security/admin-audit";
import { getClientIp } from "@/server/security/request-ip";

type RefundAction = "APPROVE" | "REJECT";

function parseOrderId(raw: string) {
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1) return null;
  return value;
}

function isRefundAction(value: unknown): value is RefundAction {
  return value === "APPROVE" || value === "REJECT";
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const auth = await requireAdminAccess(request, {
      operation: "orders:resolve_refund",
      requireRecentAuth: true,
    });
    if (!auth.ok) return auth.response;

    const { orderId } = await params;
    const parsedOrderId = parseOrderId(orderId);
    if (!parsedOrderId) return fail("유효하지 않은 주문 번호입니다.", 400);

    const body = await request.json().catch(() => null);
    const action = body?.action;
    const reason = typeof body?.reason === "string" ? body.reason : undefined;
    if (!isRefundAction(action)) {
      return fail("유효하지 않은 환불 처리 액션입니다.", 400);
    }
    if (action === "REJECT" && !reason?.trim()) {
      return fail("거절 시 사유 입력이 필요합니다.", 400);
    }

    const data = await resolveRefundRequestForAdmin({
      orderId: parsedOrderId,
      action,
      reason,
    });
    await recordAdminAuditLog({
      adminId: auth.admin.id,
      adminUsername: auth.admin.username,
      ip: getClientIp(request),
      action: "REFUND_RESOLVED",
      targetType: "REFUND",
      targetId: String(parsedOrderId),
      detail: action === "APPROVE" ? "환불 승인" : "환불 거절",
      metadata: {
        action,
        refundStatus: data.refundStatus,
        reason: reason || null,
      },
    });
    return ok(data);
  } catch (error) {
    return failFromError(error, "환불 처리 중 오류가 발생했습니다.");
  }
}
