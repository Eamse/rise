This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Required Payment Security Env

아래 환경변수는 결제 보안 기능에 필수입니다.

```bash
# 32-byte key를 base64로 인코딩한 값 (AES-256-GCM)
PAYMENT_TOKEN_ENCRYPTION_KEY=

# 내부 결제확정 API 보호용 시크릿
INTERNAL_PAYMENT_CONFIRM_SECRET=

# 운영환경에서 mock 결제 허용 여부 (기본 false 권장)
PAYMENT_MOCK_ENABLED=false
```

`PAYMENT_TOKEN_ENCRYPTION_KEY` 생성 예시:

```bash
openssl rand -base64 32
```

## Admin Security Env

관리자 보안 관련 환경변수입니다.

```bash
# 관리자 JWT 검증
JWT_SECRET=
JWT_ISSUER=rise-autoparts
JWT_ADMIN_AUDIENCE=rise-admin

# 앱 내부 IP allowlist (비워두면 비활성)
# 운영 권장: Cloudflare WAF에서 /admin, /api/admin 차단/허용 관리
ADMIN_ALLOWED_IPS=

# OTP는 기본 비활성. 필요 시 true + secret 설정으로 즉시 활성화
ADMIN_OTP_REQUIRED=false
ADMIN_OTP_SECRET=
ADMIN_OTP_SECRETS=

# 민감 작업 재인증 기준(분)
ADMIN_REAUTH_MAX_AGE_MINUTES=15

# 관리자 변경 요청 Origin 검증(CSRF 완화)
ADMIN_STRICT_ORIGIN_CHECK=true

# 로그인 실패/권한 실패 보안 알림 웹훅(선택)
SECURITY_ALERT_WEBHOOK_URL=

# 관리자 액션 감사 로그 웹훅(선택)
ADMIN_AUDIT_WEBHOOK_URL=
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
