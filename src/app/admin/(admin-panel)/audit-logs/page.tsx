"use client";

import { useEffect, useState } from "react";
import styles from "./AuditLogs.module.css";

type AuditItem = {
  id: string;
  createdAt: string;
  adminId?: number;
  adminUsername: string;
  ip: string;
  action: string;
  targetType: string;
  targetId?: string;
  detail?: string;
  metadata?: Record<string, unknown>;
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: { message?: string };
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("ko-KR");
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadAuditLogs = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/admin/audit-logs?limit=50", {
        credentials: "same-origin",
        cache: "no-store",
      });
      const result = (await response.json()) as ApiResponse<AuditItem[]>;
      if (!response.ok || !result.success || !Array.isArray(result.data)) {
        throw new Error(result.error?.message || "감사 로그 조회에 실패했습니다.");
      }
      setLogs(result.data);
    } catch (error) {
      console.error(error);
      setErrorMessage(error instanceof Error ? error.message : "감사 로그 조회 실패");
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadAuditLogs();
  }, []);

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h2>감사 로그</h2>
        <p>관리자 액션 이력을 확인합니다. (최근 50건)</p>
      </header>

      <button
        type="button"
        className={styles.refreshButton}
        onClick={() => void loadAuditLogs()}
        disabled={isLoading}
      >
        {isLoading ? "불러오는 중..." : "새로고침"}
      </button>

      {errorMessage ? <p className={styles.errorBox}>{errorMessage}</p> : null}

      {isLoading ? (
        <p className={styles.placeholder}>로그를 불러오는 중...</p>
      ) : logs.length === 0 ? (
        <p className={styles.placeholder}>기록된 로그가 없습니다.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>시간</th>
                <th>관리자</th>
                <th>IP</th>
                <th>액션</th>
                <th>대상</th>
                <th>상세</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{formatDate(log.createdAt)}</td>
                  <td>{log.adminUsername}</td>
                  <td>{log.ip}</td>
                  <td>{log.action}</td>
                  <td>
                    {log.targetType}
                    {log.targetId ? ` #${log.targetId}` : ""}
                  </td>
                  <td>{log.detail || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

