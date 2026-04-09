'use client';

// 이 파일은 '클라이언트 컴포넌트'야.
// 이유: usePathname(현재 URL 감지)은 브라우저에서만 동작해.

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './AdminLayout.module.css';

const navItems = [
  { name: '대시보드', href: '/admin/dashboard', hasSeparator: true },
  { name: '상품 등록', href: '/admin/products/upload' },
  { name: '일반 상품 관리', href: '/admin/products/manage', hasSeparator: true },
  { name: '인기특가 등록', href: '/admin/hot-deals/upload' },
  { name: '인기특가 관리', href: '/admin/hot-deals/manage', hasSeparator: true },
  { name: 'TOP 랭킹 등록', href: '/admin/top-ranking/upload' },
  { name: 'TOP 랭킹 관리', href: '/admin/top-ranking/manage', hasSeparator: true },
  { name: '재고주의 관리', href: '/admin/inventory/alerts' },
  { name: '주문 현황', href: '/admin/orders' },
  { name: '감사 로그', href: '/admin/audit-logs' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.adminSidebar}>
      <div className={styles.adminLogo}>
        <Link href="/admin/dashboard">
          <h2>RISE AUTOPARTS</h2>
        </Link>
        <span className={styles.adminBadge}>Admin 센터</span>
      </div>

      <nav className={styles.adminNav}>
        <ul className={styles.adminNavList}>
          {navItems.map((item) => (
            <li
              key={item.href}
              className={item.hasSeparator ? styles.navSeparator : ''}
            >
              <Link
                href={item.href}
                className={`${styles.adminNavItem} ${
                  pathname === item.href ? styles.adminNavItemActive : ''
                }`}
              >
                {item.name}
              </Link>
            </li>
          ))}
          <li className={styles.navBottom}>
            <Link href="/" className={`${styles.adminNavItem} ${styles.backToShop}`}>
              쇼핑몰로 돌아가기
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
