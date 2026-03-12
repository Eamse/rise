import Link from "next/link";
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
  return (
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
      </nav>
    </header>
  );
}
