import { fail, failFromError, ok } from "@/server/lib/api-response";
import { requireAdminAccess } from "@/server/security/admin-guard";
import { prisma } from "@/lib/prisma";

function parseInteger(value: string | null, fallback: number) {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return null;
  return parsed;
}

export async function GET(request: Request) {
  try {
    const auth = await requireAdminAccess(request, {
      operation: "inventory:alerts:list",
      requireRecentAuth: false,
    });
    if (!auth.ok) return auth.response;

    const { searchParams } = new URL(request.url);
    const threshold = parseInteger(searchParams.get("threshold"), 5);
    if (threshold === null || threshold < 0 || threshold > 100000) {
      return fail("threshold는 0~100000 범위의 정수여야 합니다.", 400);
    }

    const limit = parseInteger(searchParams.get("limit"), 20);
    if (limit === null || limit < 1 || limit > 200) {
      return fail("limit는 1~200 범위의 정수여야 합니다.", 400);
    }

    const [totalLowStock, lowStockItems] = await Promise.all([
      prisma.product.count({
        where: { stock: { lte: threshold } },
      }),
      prisma.product.findMany({
        where: { stock: { lte: threshold } },
        orderBy: [{ stock: "asc" }, { id: "asc" }],
        take: limit,
        select: {
          id: true,
          name: true,
          stock: true,
          category: true,
          badge: true,
        },
      }),
    ]);

    return ok({
      threshold,
      totalLowStock,
      items: lowStockItems,
    });
  } catch (error) {
    return failFromError(error, "재고 경보 조회 중 오류가 발생했습니다.");
  }
}

