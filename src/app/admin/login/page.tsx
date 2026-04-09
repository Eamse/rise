'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './AdminLogin.module.css';

const AdminLoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  function getAdminLoginErrorMessage(status: number, fallback?: string) {
    if (status === 401) return '아이디/비밀번호(또는 OTP)를 확인해주세요';
    if (status === 403)
      return '접근이 차단되었습니다. 보안 정책을 확인해주세요';
    if (status === 429)
      return '시도가 너무 많습니다. 잠시 후 다시 시도해주세요.';
    return fallback || '로그인에 실패했습니다.';
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ username, password, otpCode }),
      });
      const data = await res.json();

      if (res.ok) {
        router.push('/admin/dashboard');
      } else {
        setError(getAdminLoginErrorMessage(res.status, data?.message));
      }
    } catch {
      setError('서버와 연결할 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.adminLoginPage}>
      <div className={styles.adminLoginCard}>
        <div className={styles.adminLoginHeader}>
          <h1>RISE AUTOPARTS</h1>
          <span>관리자 로그인</span>
        </div>

        <form onSubmit={handleLogin} className={styles.adminLoginForm}>
          <div className={styles.formGroup}>
            <label htmlFor="username">아이디</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="관리자 아이디"
              required
              autoComplete="username"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              required
              autoComplete="current-password"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="otpCode">OTP 코드</label>
            <input
              id="otpCode"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              value={otpCode}
              onChange={(e) =>
                setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))
              }
              placeholder="6자리 OTP"
              autoComplete="one-time-code"
            />
          </div>

          {error && <p className={styles.loginError}>{error}</p>}

          <button
            type="submit"
            className={styles.loginBtn}
            disabled={isLoading}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
