"use client";

import styles from "../Mypage.module.css";

export default function ShippingPage() {
  return (
    <div>
      <div className={styles.shippingHeader}>
        <h3 className={styles.contentTitle}>Shipping Addresses</h3>
        <button className={styles.addBtn}>Add New Address</button>
      </div>

      <div className={styles.addressGrid}>
        {/* Address Card 1 */}
        <div className={`${styles.addressCard} ${styles.addressCardDefault}`}>
          <div className={styles.badgeDefault}>Default Address</div>
          <h4 className={styles.addressName}>Home (Park Rise)</h4>
          <p className={styles.addressPhone}>010-1234-5678</p>
          <div className={styles.addressText}>
            <p>[12345] 123 Teheran-ro, Gangnam-gu, Seoul</p>
            <p>Coding Building, 15F, Room 1501</p>
          </div>
          <div className={styles.addressActions}>
            <button className={styles.actionBtn}>Edit</button>
            <button className={styles.actionBtn}>Delete</button>
          </div>
        </div>

        {/* Address Card 2 */}
        <div className={styles.addressCard}>
          <h4 className={styles.addressName}>Office (Park Rise)</h4>
          <p className={styles.addressPhone}>010-9876-5432</p>
          <div className={styles.addressText}>
            <p>[54321] 456 Pangyo Station-ro, Gyeonggi-do</p>
            <p>Digital Quest Center B, Room 1205</p>
          </div>
          <div className={styles.addressActions}>
            <button className={styles.actionBtn}>Edit</button>
            <button className={styles.actionBtn}>Delete</button>
            <button className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}>Set as Default Address</button>
          </div>
        </div>
      </div>
    </div>
  );
}
