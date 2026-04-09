"use client";

import { sendAuthenticatedRequest } from "@/utils/api";
import { useEffect, useMemo, useState } from "react";
import styles from "../Mypage.module.css";

type PaymentMethod = {
  id: number;
  bank: "BPI" | "BDO" | string;
  cardBrand: string;
  cardAlias: string | null;
  maskedCard: string;
  isDefault: boolean;
  lastUsedAt: string | null;
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: {
    message?: string;
  };
};

const BANK_OPTIONS = ["BPI", "BDO"] as const;

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [bank, setBank] = useState<(typeof BANK_OPTIONS)[number]>("BPI");
  const [cardBrand, setCardBrand] = useState("VISA");
  const [cardAlias, setCardAlias] = useState("");
  const [cardLast4, setCardLast4] = useState("");

  const fetchMethods = async () => {
    setError("");
    try {
      const response = await sendAuthenticatedRequest("/api/v1/payment-methods", "GET");
      if (!response) {
        setError("Failed to load payment methods.");
        return;
      }

      const result = (await response.json()) as ApiResponse<PaymentMethod[]>;
      if (!response.ok || !result.success || !Array.isArray(result.data)) {
        setError(result.error?.message || "Failed to load payment methods.");
        return;
      }

      setMethods(result.data);
    } catch {
      setError("An error occurred while loading payment methods.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const sortedMethods = useMemo(
    () =>
      [...methods].sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        const aTime = a.lastUsedAt ? new Date(a.lastUsedAt).getTime() : 0;
        const bTime = b.lastUsedAt ? new Date(b.lastUsedAt).getTime() : 0;
        return bTime - aTime;
      }),
    [methods],
  );

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const last4 = cardLast4.replace(/\D/g, "");
    if (last4.length !== 4) {
      alert("Please enter the last 4 digits of your card.");
      return;
    }

    const response = await sendAuthenticatedRequest("/api/v1/payment-methods", "POST", {
      bank,
      cardBrand,
      cardAlias,
      cardLast4: last4,
    });
    if (!response) {
      alert("Failed to register payment method.");
      return;
    }

    const result = (await response.json()) as ApiResponse<PaymentMethod>;
    if (!response.ok || !result.success) {
      alert(result.error?.message || "Failed to register payment method.");
      return;
    }

    setCardAlias("");
    setCardLast4("");
    await fetchMethods();
    alert("Payment method registered.");
  };

  return (
    <div>
      <h3 className={styles.contentTitle}>Payment Methods</h3>

      <form className={styles.paymentForm} onSubmit={handleRegister}>
        <div className={styles.paymentFormGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Bank</label>
            <select
              className={styles.formInput}
              value={bank}
              onChange={(e) => setBank(e.target.value as (typeof BANK_OPTIONS)[number])}
            >
              {BANK_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Card Brand</label>
            <input
              className={styles.formInput}
              value={cardBrand}
              onChange={(e) => setCardBrand(e.target.value)}
              placeholder="VISA"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Card Alias</label>
            <input
              className={styles.formInput}
              value={cardAlias}
              onChange={(e) => setCardAlias(e.target.value)}
              placeholder="Personal Card"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Last 4 Digits</label>
            <input
              className={styles.formInput}
              value={cardLast4}
              onChange={(e) => setCardLast4(e.target.value)}
              placeholder="1234"
              maxLength={4}
              inputMode="numeric"
              required
            />
          </div>
        </div>

        <button type="submit" className={styles.actionBtnPrimarySolid}>
          Add Card
        </button>
      </form>

      {isLoading ? (
        <div className={styles.emptyState}>
          <p>Loading payment methods.</p>
        </div>
      ) : error ? (
        <div className={styles.emptyState}>
          <p>{error}</p>
        </div>
      ) : sortedMethods.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No payment methods added.</p>
        </div>
      ) : (
        <div className={styles.paymentMethodList}>
          {sortedMethods.map((method) => (
            <div key={method.id} className={styles.paymentMethodCard}>
              <div className={styles.paymentMethodTop}>
                <h4>
                  {method.bank} · {method.cardBrand}
                </h4>
                {method.isDefault && <span className={styles.badgeDefault}>Default Payment Method</span>}
              </div>
              <p className={styles.paymentMethodMeta}>
                {method.cardAlias ? `${method.cardAlias} · ` : ""}
                {method.maskedCard}
              </p>
              <p className={styles.paymentMethodMeta}>
                Last used: {method.lastUsedAt ? new Date(method.lastUsedAt).toLocaleString("en-US") : "No history"}
              </p>

              <div className={styles.addressActions}>
                <button
                  type="button"
                  className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                  disabled={method.isDefault}
                  onClick={async () => {
                    const response = await sendAuthenticatedRequest(
                      `/api/v1/payment-methods/${method.id}/default`,
                      "PATCH",
                      null,
                    );
                    if (!response) {
                      alert("Failed to change default payment method.");
                      return;
                    }
                    const result = (await response.json()) as ApiResponse<{ id: number }>;
                    if (!response.ok || !result.success) {
                      alert(result.error?.message || "Failed to change default payment method.");
                      return;
                    }
                    await fetchMethods();
                  }}
                >
                  Set as default
                </button>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={async () => {
                    const shouldDelete = window.confirm("Delete this payment method?");
                    if (!shouldDelete) return;

                    const response = await sendAuthenticatedRequest(
                      `/api/v1/payment-methods/${method.id}`,
                      "DELETE",
                      null,
                    );
                    if (!response) {
                      alert("Payment Method Failed to delete.");
                      return;
                    }
                    const result = (await response.json()) as ApiResponse<{ id: number }>;
                    if (!response.ok || !result.success) {
                      alert(result.error?.message || "Payment Method Failed to delete.");
                      return;
                    }
                    await fetchMethods();
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
