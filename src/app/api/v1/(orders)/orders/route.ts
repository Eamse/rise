import { fail, failFromError, ok } from '@/server/lib/api-response';
import { verifyUserTokenFromRequest } from '@/server/auth/jwt';
import { parseCreateOrderInput } from '@/server/orders/schemas/order.schema';
import {
  createOrder,
  listOrders,
} from '@/server/orders/services/order.service';
import type { OrderStatus } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const authenticatedUserId = verifyUserTokenFromRequest(request);
    if (!authenticatedUserId) return fail('로그인이 필요합니다.', 401);

    const body = await request.json();
    const input = parseCreateOrderInput(body);
    if (!input) return fail('요청 본문 형식이 올바르지 않습니다.', 400);

    const data = await createOrder(authenticatedUserId, input);
    return ok(data, 201);
  } catch (error) {
    return failFromError(error, '서버 오류가 발생했습니다.');
  }
}

export async function GET(request: Request) {
  try {
    const authenticatedUserId = verifyUserTokenFromRequest(request);
    if (!authenticatedUserId) return fail('로그인이 필요합니다.', 401);

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');

    let statusFilter: OrderStatus | undefined;
    if (statusParam) {
      const normalized = statusParam.toUpperCase();
      const validStatuses: OrderStatus[] = [
        'PENDING',
        'PAID',
        'PREPARING',
        'SHIPPED',
        'DELIVERED',
        'CANCELED',
        'REFUNDED',
      ];
      if (!validStatuses.includes(normalized as OrderStatus)) {
        return fail('유효하지 않은 주문 상태 필터입니다.', 400);
      }
      statusFilter = normalized as OrderStatus;
    }

    const data = await listOrders(authenticatedUserId, statusFilter);
    return ok(data);
  } catch {
    return fail('주문 목록 조회 중 오류가 발생했습니다.', 500);
  }
}

