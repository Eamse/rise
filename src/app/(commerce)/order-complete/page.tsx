"use client";

import { useRouter } from "next/navigation";
import styles from "./OrderComplete.module.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const OrderCompletePage: React.FC = () => {
  const router = useRouter();

  return (
    <>
      <Header />
      <div className={styles.orderCompleteContainer}>
        <div className={styles.orderCompleteCard}>
          <div className={styles.orderIcon}>✓</div>
          <h2>Your order has been completed.</h2>
          <p className={styles.orderNumber}>Your order has been successfully received.</p>

          <div className={styles.orderButtons}>
            <button className={styles.btnHome} onClick={() => router.push("/")}>
              Go to Home
            </button>
            <button
              className={styles.btnProducts}
              onClick={() => router.push("/products")}
            >
              Go to Products
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OrderCompletePage;
