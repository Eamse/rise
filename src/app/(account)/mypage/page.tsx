"use client";

import { sendAuthenticatedRequest } from "@/utils/api";
import { useEffect, useMemo, useState } from "react";
import styles from "./Mypage.module.css";

type OrderRecord = {
  id: number;
  status: string;
  totalPrice: number;
  createdAt: string;
};

type OrdersApiResponse = {
  success: boolean;
  data?: OrderRecord[];
  error?: {
    message?: string;
  };
};

const IN_PROGRESS_STATUSES = new Set(["PREPARING", "SHIPPED"]);
const ORDER_COMPLETED_STATUSES = new Set(["PENDING", "PAID"]);

function toDateKey(dateLike: string) {
  return new Date(dateLike).toISOString().slice(0, 10);
}

export default function MypageMain() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10),
  );

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await sendAuthenticatedRequest("/api/v1/orders", "GET");
        if (!response) {
          setError("Failed to load order statistics.");
          return;
        }

        const result = (await response.json()) as OrdersApiResponse;
        if (!response.ok || !result.success || !Array.isArray(result.data)) {
          setError(result.error?.message || "Failed to load order statistics.");
          return;
        }

        setOrders(result.data);
      } catch {
        setError("An error occurred while loading order statistics.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const inProgressCount = useMemo(
    () => orders.filter((order) => IN_PROGRESS_STATUSES.has(order.status)).length,
    [orders],
  );
  const deliveredCount = useMemo(
    () => orders.filter((order) => order.status === "DELIVERED").length,
    [orders],
  );
  const canceledCount = useMemo(
    () => orders.filter((order) => order.status === "CANCELED").length,
    [orders],
  );
  const totalOrderPrice = useMemo(
    () => orders.reduce((sum, order) => sum + order.totalPrice, 0),
    [orders],
  );
  const selectedDateOrders = useMemo(
    () => orders.filter((order) => toDateKey(order.createdAt) === selectedDate),
    [orders, selectedDate],
  );
  const completedCountByDate = useMemo(
    () =>
      selectedDateOrders.filter((order) =>
        ORDER_COMPLETED_STATUSES.has(order.status),
      ).length,
    [selectedDateOrders],
  );
  const totalAmountByDate = useMemo(
    () =>
      selectedDateOrders
        .filter((order) => order.status !== "CANCELED" && order.status !== "REFUNDED")
        .reduce((sum, order) => sum + order.totalPrice, 0),
    [selectedDateOrders],
  );
  const hasOrders = useMemo(() => orders.length > 0, [orders]);

  return (
    <div>
      <h3 className={styles.contentTitle}>Welcome! Here is your order overview.</h3>

      <div className={styles.dateFilterBar}>
        <label htmlFor="order-date-filter" className={styles.formLabel}>
          Selected Date
        </label>
        <input
          id="order-date-filter"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className={styles.formInput}
        />
      </div>

      <div className={styles.statGrid}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Completed Orders (Selected Date)</p>
          <span className={`${styles.statValue} ${styles.statValuePrimary}`}>
            {isLoading ? "-" : `${completedCountByDate} orders`}
          </span>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Total Order Amount (Selected Date)</p>
          <span className={styles.statValue}>
            {isLoading ? "-" : `${totalAmountByDate.toLocaleString()}PHP`}
          </span>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Orders in Progress</p>
          <span className={`${styles.statValue} ${styles.statValueAccent}`}>
            {isLoading ? "-" : `${inProgressCount} orders`}
          </span>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Canceled Orders</p>
          <span className={styles.statValue}>
            {isLoading ? "-" : `${canceledCount} orders`}
          </span>
        </div>
      </div>

      <div className={styles.emptyState}>
        {isLoading ? (
          <p>Loading order statistics.</p>
        ) : error ? (
          <p>{error}</p>
        ) : hasOrders ? (
          <p>
            Stats for the selected date and orders from the last 6 months are shown.
            Delivered {deliveredCount} orders / Canceled {canceledCount} orders / Total order amount{" "}
            {totalOrderPrice.toLocaleString()}PHP
          </p>
        ) : (
          <p>No recent orders.</p>
        )}
      </div>
    </div>
  );
}
