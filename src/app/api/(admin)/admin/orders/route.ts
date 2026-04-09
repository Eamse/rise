import { fail, failFromError, ok } from "@/server/lib/api-response";
import { requireAdminAccess } from "@/server/security/admin-guard";
import { listOrdersForAdmin } from "@/server/orders/services/order.service";
import type { OrderStatus } from "@prisma/client";

const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "PAID",
  "PREPARING",
  "SHIPPED",
  "DELIVERED",
  "CANCELED",
  "REFUNDED",
];

function parseOrderStatus(value: string | null) {
  if (!value) return undefined;
  const normalized = value.toUpperCase() as OrderStatus;
  if (!ORDER_STATUSES.includes(normalized)) return null;
  return normalized;
}

function parseSearchOrderId(value: string | null) {
  if (!value) return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return null;
  return parsed;
}

export async function GET(request: Request) {
  try {
    const auth = await requireAdminAccess(request, {
      operation: "orders:list",
      requireRecentAuth: false,
    });
    if (!auth.ok) return auth.response;

    const { searchParams } = new URL(request.url);
    const status = parseOrderStatus(searchParams.get("status"));
    if (status === null) return fail("유효하지 않은 주문 상태입니다.", 400);

    const searchOrderId = parseSearchOrderId(searchParams.get("orderId"));
    if (searchOrderId === null) {
      return fail("유효하지 않은 주문 번호입니다.", 400);
    }

    const data = await listOrdersForAdmin({
      status,
      searchOrderId,
    });
    return ok(data);
  } catch (error) {
    return failFromError(error, "주문 목록 조회 중 오류가 발생했습니다.");
  }
}

