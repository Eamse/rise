"use client";

import styles from "../Mypage.module.css";

export default function ProfilePage() {
  return (
    <div className={styles.profileContainer}>
      <h3 className={styles.contentTitle}>Profile Settings</h3>
      
      <div className={styles.avatarSection}>
        <div className={styles.avatarCircle}>👤</div>
        <button className={styles.actionBtn}>Change Image</button>
      </div>

      <form>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>User ID</label>
          <input type="text" value="master" disabled className={`${styles.formInput} ${styles.formInputDisabled}`} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Name</label>
          <input type="text" placeholder="Master" className={styles.formInput} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Email</label>
          <input type="email" placeholder="master@example.com" className={styles.formInput} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Phone Number</label>
          <input type="tel" placeholder="010-1234-5678" className={styles.formInput} />
        </div>

        <button type="button" className={styles.submitBtn}>
          Update Profile
        </button>
      </form>
    </div>
  );
}
