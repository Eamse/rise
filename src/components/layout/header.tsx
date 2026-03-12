"use client";

import Link from "next/link";
import { useState } from "react";
import { LuAlignJustify, LuX } from "react-icons/lu";
import styles from "./header.module.css";

const NAV_ITEMS = [
  { label: "HOME", href: "/" },
  { label: "SERVICES", href: "/services" },
  { label: "PROJECTS", href: "/projects" },
  { label: "PARTNERS", href: "/partners" },
  { label: "ABOUT", href: "/about" },
  { label: "CONTACT US", href: "/contact" },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className={styles.header}>
        <div>
          {/* 로고 영역 */}
          <Link href="/" className={styles.logoWrapper}>
            <span className={styles.logoText}>
              <span className={styles.logoAccent}>Rise</span> Autoparts Inc.
            </span>
          </Link>
        </div>
        {/* 네비게이션 */}
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            {NAV_ITEMS.map((item) => (
              <li className={styles.navli} key={item.label}>
                <Link href={item.href} className={styles.navLink}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <LuAlignJustify
            className={styles.toggle}
            size={28}
            onClick={toggleMenu}
          />
        </nav>
      </header>

      {/* 모바일 사이드 메뉴 오버레이 (열렸을 때만 표시) */}
      <div
        className={`${styles.mobileMenuOverlay} ${isMenuOpen ? styles.open : ""}`}
        onClick={closeMenu}
      />

      {/* 모바일 사이드 메뉴 패널 */}
      <div
        className={`${styles.mobileMenuPanel} ${isMenuOpen ? styles.open : ""}`}
      >
        <div className={styles.mobileMenuHeader}>
          <span className={styles.logoText}>
            <span className={styles.logoAccent}>Rise</span> Menu
          </span>
          <LuX className={styles.closeIcon} size={28} onClick={closeMenu} />
        </div>
        <ul className={styles.mobileNavList}>
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className={styles.mobileNavLink}
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
