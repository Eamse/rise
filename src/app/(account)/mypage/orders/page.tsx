"use client";

import styles from "../Mypage.module.css";
import { sendAuthenticatedRequest } from "@/utils/api";
import { useEffect, useMemo, useState } from "react";

type OrderItem = {
  id: number;
  productName: string;
  quantity: number;
};

type OrderRecord = {
  id: number;
  createdAt: string;
  status: string;
  totalPrice: number;
  items: OrderItem[];
};

type OrdersApiResponse = {
  success: boolean;
  data?: OrderRecord[];
  error?: {
    message?: string;
  };
};

const CANCELABLE_STATUSES = new Set(["PENDING", "PAID", "PREPARING"]);

function getOrderStatusLabel(status: string) {
  if (status === "PENDING" || status === "PAID") return "Order Completed";
  if (status === "PREPARING") return "Preparing Shipment";
  if (status === "SHIPPED") return "In Transit";
  if (status === "DELIVERED") return "Delivered";
  if (status === "CANCELED") return "Order Canceled";
  if (status === "REFUNDED") return "Refunded";
  return status;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    setError("");
    try {
      const response = await sendAuthenticatedRequest("/api/v1/orders", "GET");
      if (!response) {
        setError("Failed to load order data.");
        return;
      }

      const result = (await response.json()) as OrdersApiResponse;
      if (!response.ok || !result.success || !Array.isArray(result.data)) {
        setError(result.error?.message || "Failed to load order data.");
        return;
      }

      setOrders(result.data);
    } catch {
      setError("An error occurred while loading order data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const hasOrders = useMemo(() => orders.length > 0, [orders]);

  return (
    <div>
      <h3 className={styles.contentTitle}>Orders & Shipping</h3>

      {isLoading ? (
        <div className={styles.emptyState}>
          <p>Loading order data.</p>
        </div>
      ) : error ? (
        <div className={styles.emptyState}>
          <p>{error}</p>
        </div>
      ) : !hasOrders ? (
        <div className={styles.emptyState}>
          <p>No orders found.</p>
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
            const totalQuantity = order.items.reduce(
              (sum, item) => sum + item.quantity,
              0,
            );
            const statusLabel = getOrderStatusLabel(order.status);

            return (
              <div key={order.id} className={styles.orderItemCard}>
                <div className={styles.orderItemHeader}>
                  <div className={styles.orderMeta}>
                    <span>Order Date: {new Date(order.createdAt).toLocaleDateString("en-US")}</span>
                    <span>Order No.: {order.id}</span>
                  </div>
                  <span
                    className={`${styles.orderStatusText} ${
                      order.status === "PREPARING" || order.status === "SHIPPED"
                        ? styles.statusHighlight
                        : ""
                    }`}
                  >
                    {statusLabel}
                  </span>
                </div>

                <div className={styles.orderProductInfo}>
                  <div className={styles.productThumb} />
                  <div className={styles.productDetails}>
                    <h4 className={styles.productName}>{itemTitle}</h4>
                    <p className={styles.productPriceQty}>
                      {order.totalPrice.toLocaleString()}PHP | Total {totalQuantity} pcs
                    </p>
                  </div>
                  <div className={styles.orderSideBtns}>
                    <button className={styles.sideBtn} type="button">
                      Track Shipment
                    </button>
                    <button
                      className={styles.sideBtn}
                      type="button"
                      disabled={!CANCELABLE_STATUSES.has(order.status)}
                      onClick={async () => {
                        if (!CANCELABLE_STATUSES.has(order.status)) return;
                        const shouldCancel = window.confirm(
                          "Do you want to cancel this order?",
                        );
                        if (!shouldCancel) return;

                        const response = await sendAuthenticatedRequest(
                          `/api/v1/orders/${order.id}/cancel`,
                          "POST",
                          null,
                        );
                        if (!response) {
                          alert("Failed to cancel order.");
                          return;
                        }
                        const result = (await response.json()) as OrdersApiResponse;
                        if (!response.ok || !result.success) {
                          alert(
                            result.error?.message ||
                              "Failed to cancel order.",
                          );
                          return;
                        }

                        await fetchOrders();
                        alert("Order has been canceled.");
                      }}
                    >
                      Cancel Order
                    </button>
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
