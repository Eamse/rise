'use client';

// 로그아웃 버튼 클릭(onClick)과 router.replace는 브라우저에서만 동작해.
// 그래서 이 파일은 클라이언트 컴포넌트야.

import { useRouter } from 'next/navigation';
import styles from './AdminLayout.module.css';

type Props = {
  adminName: string; // 서버에서 검증된 이름을 props로 받음
};

export default function AdminTopbar({ adminName }: Props) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => null);
    router.replace('/admin/login');
  };

  return (
    <header className={styles.adminTopbar}>
      <div className={styles.topbarTitle}>관리자 패널</div>
      <div className={styles.topbarUser}>
        <span className={styles.adminGreeting}>{adminName}님 환영합니다</span>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          로그아웃
        </button>
      </div>
    </header>
  );
}
