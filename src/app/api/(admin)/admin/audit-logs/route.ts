import { fail, ok } from "@/server/lib/api-response";
import { requireAdminAccess } from "@/server/security/admin-guard";
import { listRecentAdminAuditLogs } from "@/server/security/admin-audit";

export async function GET(request: Request) {
  const auth = await requireAdminAccess(request, {
    operation: "admin:audit_logs:list",
    requireRecentAuth: false,
  });
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const limitParam = Number(searchParams.get("limit") || "20");
  const limit = Number.isInteger(limitParam) ? limitParam : 20;
  if (limit < 1 || limit > 100) {
    return fail("limit는 1~100 범위여야 합니다.", 400);
  }

  return ok(listRecentAdminAuditLogs(limit));
}

