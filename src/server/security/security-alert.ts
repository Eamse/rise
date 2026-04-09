type SecurityEventLevel = "info" | "warn" | "error";

type SecurityEvent = {
  type: string;
  level: SecurityEventLevel;
  message: string;
  ip?: string;
  username?: string;
  path?: string;
  detail?: string;
};

function serializeSecurityEvent(event: SecurityEvent) {
  return {
    ...event,
    timestamp: new Date().toISOString(),
  };
}

export async function notifySecurityEvent(event: SecurityEvent) {
  const payload = serializeSecurityEvent(event);
  const webhookUrl = process.env.SECURITY_ALERT_WEBHOOK_URL;

  if (!webhookUrl) {
    console.log("[SECURITY]", JSON.stringify(payload));
    return;
  }

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("보안 알림 전송 실패:", error);
  }
}

