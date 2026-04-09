'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Mypage.module.css';

const MYPAGE_MENU = [
  { name: 'My Page Home', path: '/mypage' },
  { name: 'Order History / Track Shipment', path: '/mypage/orders' },
  { name: 'Canceled Orders', path: '/mypage/canceled' },
  { name: 'Shipping Addresses', path: '/mypage/shipping' },
  { name: 'Profile Settings', path: '/mypage/profile' },
  { name: 'Payment Methods', path: '/mypage/payment' },
];

export default function MypageSidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <h2>My Page</h2>
      <nav className={styles.sidebarNav}>
        {MYPAGE_MENU.map((menu) => (
          <Link
            key={menu.path}
            href={menu.path}
            className={`${styles.navLink} ${
              pathname === menu.path ? styles.navLinkActive : ''
            }`}
          >
            {menu.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
