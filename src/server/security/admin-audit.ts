type AdminAuditAction =
  | 'ORDER_STATUS_CHANGED'
  | 'REFUND_RESOLVED'
  | 'PRODUCT_CREATED'
  | 'PRODUCT_UPDATED'
  | 'PRODUCT_DELETED';

type AdminAuditTarget = 'ORDER' | 'REFUND' | 'PRODUCT';

export type AdminAuditLogItem = {
  id: string;
  createdAt: string;
  adminId?: number;
  adminUsername: string;
  ip: string | number;
  action: AdminAuditAction;
  targetType: AdminAuditTarget;
  targetId?: string;
  detail?: string;
  metadata?: Record<string, unknown>;
};

type RecordAdminAuditLogInput = Omit<AdminAuditLogItem, 'id' | 'createdAt'>;

const MAX_RECENT_AUDIT_LOGS = 300;
const recentAuditLogs: AdminAuditLogItem[] = [];

function createId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function pushRecentLog(item: AdminAuditLogItem) {
  recentAuditLogs.unshift(item);
  if (recentAuditLogs.length > MAX_RECENT_AUDIT_LOGS) {
    recentAuditLogs.length = MAX_RECENT_AUDIT_LOGS;
  }
}

export function listRecentAdminAuditLogs(limit = 20) {
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  return recentAuditLogs.slice(0, safeLimit);
}

export async function recordAdminAuditLog(input: RecordAdminAuditLogInput) {
  const log: AdminAuditLogItem = {
    ...input,
    id: createId(),
    createdAt: new Date().toISOString(),
  };

  pushRecentLog(log);
  console.log('[ADMIN_AUDIT]', JSON.stringify(log));

  const webhookUrl = process.env.ADMIN_AUDIT_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log),
    });
  } catch (error) {
    console.error('관리자 감사 로그 웹훅 전송 실패:', error);
  }
}
