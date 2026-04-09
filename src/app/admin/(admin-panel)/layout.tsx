// 'use client' 없음 = 서버 컴포넌트
// 서버에서 실행되므로 HTML을 만들기 전에 인증 체크가 가능해.

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAdminTokenString } from '@/server/auth/jwt';
import { AUTH_COOKIE_NAME } from '@/server/auth/cookies';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';
import styles from './AdminLayout.module.css';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. 서버에서 쿠키를 읽음 (브라우저가 아닌 서버에서 실행)
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  // 2. 서버에서 JWT 서명까지 완전히 검증
  const admin = token ? verifyAdminTokenString(token) : null;

  // 3. 검증 실패 시 브라우저에 HTML 보내기 전에 redirect
  //    → 어드민 화면이 잠깐도 보이지 않음
  if (!admin) {
    redirect('/admin/login');
  }

  const adminName = admin.name ?? admin.username;

  // 4. 검증 성공 시에만 화면 렌더링
  return (
    <div className={styles.adminContainer}>
      {/* 왼쪽 사이드바 - 클라이언트 컴포넌트 (usePathname 사용) */}
      <AdminSidebar />

      {/* 오른쪽 메인 영역 */}
      <main className={styles.adminMain}>
        {/* 상단 바 - 클라이언트 컴포넌트 (로그아웃 버튼), 서버에서 검증한 이름 전달 */}
        <AdminTopbar adminName={adminName} />
        <div className={styles.adminContentWrapper}>{children}</div>
      </main>
    </div>
  );
}
