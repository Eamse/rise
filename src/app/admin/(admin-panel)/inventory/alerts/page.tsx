"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./InventoryAlerts.module.css";

type InventoryAlertItem = {
  id: number;
  name: string;
  stock: number;
  category: string;
  badge: string | null;
};

type InventoryAlertResponse = {
  threshold: number;
  totalLowStock: number;
  items: InventoryAlertItem[];
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: { message?: string };
};

export default function InventoryAlertsPage() {
  const [thresholdInput, setThresholdInput] = useState("5");
  const [thresholdApplied, setThresholdApplied] = useState(5);
  const [totalLowStock, setTotalLowStock] = useState(0);
  const [items, setItems] = useState<InventoryAlertItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadInventoryAlerts = async (threshold: number) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch(
        `/api/admin/inventory/alerts?threshold=${threshold}&limit=100`,
        {
          credentials: "same-origin",
          cache: "no-store",
        },
      );
      const result = (await response.json()) as ApiResponse<InventoryAlertResponse>;
      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error?.message || "재고주의 조회에 실패했습니다.");
      }

      setThresholdApplied(result.data.threshold);
      setTotalLowStock(result.data.totalLowStock);
      setItems(Array.isArray(result.data.items) ? result.data.items : []);
    } catch (error) {
      console.error(error);
      setErrorMessage(error instanceof Error ? error.message : "재고주의 조회 실패");
      setItems([]);
      setTotalLowStock(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadInventoryAlerts(5);
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const numeric = Number(thresholdInput);
    if (!Number.isInteger(numeric) || numeric < 0) {
      setErrorMessage("임계치는 0 이상의 정수만 가능합니다.");
      return;
    }
    void loadInventoryAlerts(numeric);
  };

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h2>재고주의 관리</h2>
        <p>임계치 이하 재고 상품을 모아서 확인하고 빠르게 수정합니다.</p>
      </header>

      <form className={styles.filterRow} onSubmit={handleSubmit}>
        <label htmlFor="threshold">재고 임계치</label>
        <input
          id="threshold"
          type="number"
          min={0}
          value={thresholdInput}
          onChange={(event) => setThresholdInput(event.target.value)}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "조회 중..." : "조회"}
        </button>
      </form>

      <div className={styles.summaryBox}>
        <strong>현재 기준:</strong> 재고 {thresholdApplied}개 이하 · 대상 {totalLowStock}개
      </div>

      {errorMessage ? <p className={styles.errorBox}>{errorMessage}</p> : null}

      {isLoading ? (
        <p className={styles.placeholder}>재고주의 목록을 불러오는 중...</p>
      ) : items.length === 0 ? (
        <p className={styles.placeholder}>해당 임계치에서 부족 재고 상품이 없습니다.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>상품명</th>
                <th>카테고리</th>
                <th>뱃지</th>
                <th>현재 재고</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.category || "-"}</td>
                  <td>{item.badge || "-"}</td>
                  <td className={styles.stockCell}>{item.stock}</td>
                  <td>
                    <Link href={`/admin/products/edit/${item.id}`} className={styles.editLink}>
                      상품 수정
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

