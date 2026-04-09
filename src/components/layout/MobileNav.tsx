"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { CartIcon, GridIcon, HomeIcon, UserIcon } from "../common/icons";
import styles from "./MobileNav.module.css";

const MobileNav: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className={styles.mobileNav}>
      <Link
        href="/"
        className={`${styles.navItem} ${pathname === "/" ? styles.active : ""}`}
      >
        <HomeIcon size={26} color="currentColor" />
        <span>Home</span>
      </Link>
      <Link
        href="/products"
        className={`${styles.navItem} ${pathname?.startsWith("/products") ? styles.active : ""}`}
      >
        <GridIcon size={26} color="currentColor" />
        <span>Category</span>
      </Link>
      <Link
        href="/cart"
        className={`${styles.navItem} ${pathname === "/cart" ? styles.active : ""}`}
      >
        <CartIcon size={26} color="currentColor" />
        <span>Cart</span>
      </Link>
      <Link
        href="/mypage"
        className={`${styles.navItem} ${pathname?.startsWith("/mypage") ? styles.active : ""}`}
      >
        <UserIcon size={26} color="currentColor" />
        <span>My Page</span>
      </Link>
    </nav>
  );
};

export default MobileNav;
