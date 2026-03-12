"use client";

import { FaFacebookF, FaInstagram, FaPhone } from "react-icons/fa6";
import styles from "./sideBar.module.css";

export default function SideBar() {
  return (
    <div className={styles.sidebarContainer}>
      <a href="#" className={styles.iconWrapper} aria-label="Facebook">
        <FaFacebookF />
      </a>
      <a href="#" className={styles.iconWrapper} aria-label="Instagram">
        <FaInstagram />
      </a>
      <a
        href="tel:010-6358-9413"
        className={styles.iconWrapper}
        aria-label="Call"
      >
        <FaPhone />
      </a>
    </div>
  );
}
