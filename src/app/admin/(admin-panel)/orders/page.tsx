"use client";

import { useEffect, useState } from "react";
import styles from "./Orders.module.css";

type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PREPARING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELED"
  | "REFUNDED";

type RefundStatus = "REQUESTED" | "APPROVED" | "REJECTED";

type AdminOrderListItem = {
  id: number;
  userId: string;
  status: OrderStatus;
  totalPrice: number;
  receiver: string;
  phone: string;
  address: string;
  createdAt: string;
  payment: {
    status: string;
    refunds: Array<{
      id: number;
      status: RefundStatus;
      reason: string;
      amount: number;
      requestedAt: string;
      approvedAt: string | null;
    }>;
  } | null;
};

type AdminOrderDetail = {
  id: number;
  userId: string;
  status: OrderStatus;
  totalPrice: number;
  receiver: string;
  phone: string;
  address: string;
  memo: string | null;
  createdAt: string;
  items: Array<{
    id: number;
    productId: number;
    productName: string;
    price: number;
    quantity: number;
  }>;
  payment: {
    id: number;
    status: string;
    amount: number;
    provider: string;
    paymentKey: string;
    refunds: Array<{
      id: number;
      status: RefundStatus;
      reason: string;
      amount: number;
      requestedAt: string;
      approvedAt: string | null;
    }>;
  } | null;
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: { message?: string };
};

const ORDER_FILTERS: Array<{ label: string; value: string }> = [
  { label: "전체", value: "" },
  { label: "결제완료", value: "PAID" },
  { label: "배송준비", value: "PREPARING" },
  { label: "배송중", value: "SHIPPED" },
  { label: "배송완료", value: "DELIVERED" },
  { label: "취소", value: "CANCELED" },
  { label: "환불완료", value: "REFUNDED" },
];

const NEXT_STATUS_ACTIONS: Array<{ label: string; value: "PREPARING" | "SHIPPED" | "DELIVERED" }> = [
  { label: "배송준비로 변경", value: "PREPARING" },
  { label: "배송중으로 변경", value: "SHIPPED" },
  { label: "배송완료로 변경", value: "DELIVERED" },
];

function formatCurrency(value: number) {
  return `${value.toLocaleString()} KRW`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("ko-KR");
}

function getStatusBadgeClass(status: OrderStatus) {
  if (status === "DELIVERED" || status === "REFUNDED") return styles.success;
  if (status === "CANCELED") return styles.danger;
  if (status === "SHIPPED") return styles.info;
  if (status === "PREPARING" || status === "PAID") return styles.warn;
  return styles.default;
}

function getStatusLabel(status: OrderStatus) {
  if (status === "PENDING") return "결제대기";
  if (status === "PAID") return "결제완료";
  if (status === "PREPARING") return "배송준비";
  if (status === "SHIPPED") return "배송중";
  if (status === "DELIVERED") return "배송완료";
  if (status === "CANCELED") return "취소";
  return "환불완료";
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderDetail | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchOrderId, setSearchOrderId] = useState("");
  const [isListLoading, setIsListLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [refundRejectReason, setRefundRejectReason] = useState("");

  const fetchOrders = async () => {
    setIsListLoading(true);
    setErrorMessage("");
    try {
      const query = new URLSearchParams();
      if (statusFilter) query.set("status", statusFilter);
      if (searchOrderId.trim()) query.set("orderId", searchOrderId.trim());

      const response = await fetch(`/api/admin/orders?${query.toString()}`, {
        method: "GET",
        credentials: "same-origin",
      });
      const result = (await response.json()) as ApiResponse<AdminOrderListItem[]>;
      if (!response.ok || !result.success || !Array.isArray(result.data)) {
        throw new Error(result.error?.message || "주문 목록 조회에 실패했습니다.");
      }

      setOrders(result.data);
      if (result.data.length === 0) {
        setSelectedOrderId(null);
        setSelectedOrder(null);
      } else if (!selectedOrderId || !result.data.some((order) => order.id === selectedOrderId)) {
        setSelectedOrderId(result.data[0].id);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage(error instanceof Error ? error.message : "주문 목록 조회 실패");
      setOrders([]);
    } finally {
      setIsListLoading(false);
    }
  };

  const fetchOrderDetail = async (orderId: number) => {
    setIsDetailLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "GET",
        credentials: "same-origin",
      });
      const result = (await response.json()) as ApiResponse<AdminOrderDetail>;
      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error?.message || "주문 상세 조회에 실패했습니다.");
      }
      setSelectedOrder(result.data);
    } catch (error) {
      console.error(error);
      setErrorMessage(error instanceof Error ? error.message : "주문 상세 조회 실패");
      setSelectedOrder(null);
    } finally {
      setIsDetailLoading(false);
    }
  };

  useEffect(() => {
    void fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => {
    if (!selectedOrderId) return;
    void fetchOrderDetail(selectedOrderId);
  }, [selectedOrderId]);

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void fetchOrders();
  };

  const handleChangeOrderStatus = async (
    toStatus: "PREPARING" | "SHIPPED" | "DELIVERED",
  ) => {
    if (!selectedOrderId) return;
    setIsActionLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch(`/api/admin/orders/${selectedOrderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ toStatus }),
      });
      const result = (await response.json()) as ApiResponse<{
        orderId: number;
        from: OrderStatus;
        to: OrderStatus;
      }>;
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || "주문 상태 변경에 실패했습니다.");
      }

      await fetchOrders();
      await fetchOrderDetail(selectedOrderId);
    } catch (error) {
      console.error(error);
      setErrorMessage(error instanceof Error ? error.message : "주문 상태 변경 실패");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRefundDecision = async (action: "APPROVE" | "REJECT") => {
    if (!selectedOrderId) return;
    if (action === "REJECT" && !refundRejectReason.trim()) {
      setErrorMessage("환불 거절 시 사유 입력이 필요합니다.");
      return;
    }

    setIsActionLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch(`/api/admin/orders/${selectedOrderId}/refund`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          action,
          reason: refundRejectReason.trim() || undefined,
        }),
      });
      const result = (await response.json()) as ApiResponse<{
        refundStatus: RefundStatus;
      }>;
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || "환불 처리에 실패했습니다.");
      }

      setRefundRejectReason("");
      await fetchOrders();
      await fetchOrderDetail(selectedOrderId);
    } catch (error) {
      console.error(error);
      setErrorMessage(error instanceof Error ? error.message : "환불 처리 실패");
    } finally {
      setIsActionLoading(false);
    }
  };

  const latestRefund = selectedOrder?.payment?.refunds?.[0] || null;

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h2>주문 관리</h2>
        <p>주문 상태 변경, 취소/환불 요청 처리를 한 곳에서 관리합니다.</p>
      </header>

      <div className={styles.filters}>
        <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
          <label htmlFor="orderId">주문번호 검색</label>
          <input
            id="orderId"
            type="text"
            inputMode="numeric"
            placeholder="예: 1024"
            value={searchOrderId}
            onChange={(event) =>
              setSearchOrderId(event.target.value.replace(/\D/g, "").slice(0, 12))
            }
          />
          <button type="submit">조회</button>
        </form>
        <div className={styles.statusFilters}>
          {ORDER_FILTERS.map((filter) => (
            <button
              key={filter.label}
              type="button"
              className={filter.value === statusFilter ? styles.activeFilter : ""}
              onClick={() => setStatusFilter(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {errorMessage ? <p className={styles.errorBox}>{errorMessage}</p> : null}

      <div className={styles.contentGrid}>
        <div className={styles.listPanel}>
          <h3>주문 목록</h3>
          {isListLoading ? (
            <p className={styles.placeholder}>목록을 불러오는 중...</p>
          ) : orders.length === 0 ? (
            <p className={styles.placeholder}>조회된 주문이 없습니다.</p>
          ) : (
            <ul className={styles.orderList}>
              {orders.map((order) => (
                <li
                  key={order.id}
                  className={`${styles.orderItem} ${
                    selectedOrderId === order.id ? styles.selectedOrder : ""
                  }`}
                >
                  <button type="button" onClick={() => setSelectedOrderId(order.id)}>
                    <div className={styles.orderTopRow}>
                      <strong>#{order.id}</strong>
                      <span className={`${styles.badge} ${getStatusBadgeClass(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <p>주문자: {order.userId}</p>
                    <p>금액: {formatCurrency(order.totalPrice)}</p>
                    <p>결제: {order.payment?.status || "-"}</p>
                    {order.payment?.refunds?.[0] ? (
                      <p>환불: {order.payment.refunds[0].status}</p>
                    ) : null}
                    <p>주문일: {formatDate(order.createdAt)}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.detailPanel}>
          <h3>주문 상세</h3>
          {isDetailLoading ? (
            <p className={styles.placeholder}>상세 정보를 불러오는 중...</p>
          ) : !selectedOrder ? (
            <p className={styles.placeholder}>주문을 선택해주세요.</p>
          ) : (
            <>
              <div className={styles.section}>
                <h4>기본 정보</h4>
                <dl>
                  <div>
                    <dt>주문번호</dt>
                    <dd>#{selectedOrder.id}</dd>
                  </div>
                  <div>
                    <dt>주문 상태</dt>
                    <dd>{getStatusLabel(selectedOrder.status)}</dd>
                  </div>
                  <div>
                    <dt>주문자</dt>
                    <dd>{selectedOrder.userId}</dd>
                  </div>
                  <div>
                    <dt>총 금액</dt>
                    <dd>{formatCurrency(selectedOrder.totalPrice)}</dd>
                  </div>
                  <div>
                    <dt>주소</dt>
                    <dd>{selectedOrder.address}</dd>
                  </div>
                  <div>
                    <dt>연락처</dt>
                    <dd>{selectedOrder.phone}</dd>
                  </div>
                </dl>
              </div>

              <div className={styles.section}>
                <h4>주문 상품</h4>
                <ul className={styles.itemList}>
                  {selectedOrder.items.map((item) => (
                    <li key={item.id}>
                      <strong>{item.productName}</strong>
                      <span>
                        {item.quantity}개 · {formatCurrency(item.price)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.section}>
                <h4>주문 상태 변경</h4>
                <div className={styles.actionButtons}>
                  {NEXT_STATUS_ACTIONS.map((action) => (
                    <button
                      key={action.value}
                      type="button"
                      onClick={() => void handleChangeOrderStatus(action.value)}
                      disabled={isActionLoading}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.section}>
                <h4>취소/환불 관리</h4>
                <p>최근 환불 상태: {latestRefund?.status || "요청 없음"}</p>
                {latestRefund ? (
                  <p className={styles.refundReason}>사유: {latestRefund.reason}</p>
                ) : null}
                <textarea
                  placeholder="환불 거절 사유를 입력하세요 (거절 시 필수)"
                  value={refundRejectReason}
                  onChange={(event) => setRefundRejectReason(event.target.value)}
                />
                <div className={styles.actionButtons}>
                  <button
                    type="button"
                    onClick={() => void handleRefundDecision("APPROVE")}
                    disabled={isActionLoading}
                  >
                    환불 승인
                  </button>
                  <button
                    type="button"
                    className={styles.rejectButton}
                    onClick={() => void handleRefundDecision("REJECT")}
                    disabled={isActionLoading}
                  >
                    환불 거절
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
