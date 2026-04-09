import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyUserTokenString } from '@/server/auth/jwt';
import { AUTH_COOKIE_NAME } from '@/server/auth/cookies';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MypageSidebar from './MypageSidebar';
import styles from './Mypage.module.css';

export default async function MypageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  const user = token ? verifyUserTokenString(token) : null;
  if (!user) {
    redirect('/login');
  }
  return (
    <>
      <Header />
      <div className={styles.mypageContainer}>
        <MypageSidebar />
        <main className={styles.contentArea}>{children}</main>
      </div>
      <Footer />
    </>
  );
}
