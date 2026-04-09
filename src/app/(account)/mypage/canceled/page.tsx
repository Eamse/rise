"use client";

import { sendAuthenticatedRequest } from "@/utils/api";
import { useEffect, useState } from "react";
import styles from "../Mypage.module.css";

type OrderItem = {
  id: number;
  productName: string;
  quantity: number;
};

type CanceledOrder = {
  id: number;
  createdAt: string;
  updatedAt: string;
  status: "CANCELED" | string;
  totalPrice: number;
  items: OrderItem[];
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: {
    message?: string;
  };
};

export default function CanceledOrdersPage() {
  const [orders, setOrders] = useState<CanceledOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCanceledOrders = async () => {
      setError("");
      try {
        const response = await sendAuthenticatedRequest(
          "/api/v1/orders?status=CANCELED",
          "GET",
        );
        if (!response) {
          setError("Failed to load canceled order data.");
          return;
        }

        const result = (await response.json()) as ApiResponse<CanceledOrder[]>;
        if (!response.ok || !result.success || !Array.isArray(result.data)) {
          setError(result.error?.message || "Failed to load canceled order data.");
          return;
        }

        setOrders(result.data);
      } catch {
        setError("An error occurred while loading canceled order data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCanceledOrders();
  }, []);

  return (
    <div>
      <h3 className={styles.contentTitle}>Canceled Orders</h3>

      {isLoading ? (
        <div className={styles.emptyState}>
          <p>Loading canceled order data.</p>
        </div>
      ) : error ? (
        <div className={styles.emptyState}>
          <p>{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No canceled orders.</p>
        </div>
      ) : (
        <div className={styles.orderList}>
          {orders.map((order) => {
            const primaryItem = order.items[0];
            const remainingCount = order.items.length - 1;
            const itemTitle = primaryItem
              ? remainingCount > 0
                ? `${primaryItem.productName} + ${remainingCount} more`
                : primaryItem.productName
              : "No product info";

            return (
              <div key={order.id} className={styles.orderItemCard}>
                <div className={styles.orderItemHeader}>
                  <div className={styles.orderMeta}>
                    <span>
                      Order Date: {new Date(order.createdAt).toLocaleDateString("en-US")}
                    </span>
                    <span>Order No.: {order.id}</span>
                    <span>
                      Canceled Date: {new Date(order.updatedAt).toLocaleDateString("en-US")}
                    </span>
                  </div>
                  <span className={styles.orderStatusText}>Order Canceled</span>
                </div>

                <div className={styles.orderProductInfo}>
                  <div className={styles.productThumb} />
                  <div className={styles.productDetails}>
                    <h4 className={styles.productName}>{itemTitle}</h4>
                    <p className={styles.productPriceQty}>
                      {order.totalPrice.toLocaleString()}PHP
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
