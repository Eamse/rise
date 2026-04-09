/**
 * ⚠️  이 라우트는 최초 관리자 계정 생성 전용입니다.
 *
 * 사용법:
 * 1. .env 파일에 MASTER_SETUP_SECRET 값을 설정하세요.
 * 2. GET /api/admin/create-master?secret=<MASTER_SETUP_SECRET> 으로 요청하세요.
 * 3. 계정 생성 후, 반드시 이 파일을 삭제하거나 라우트를 비활성화하세요.
 *
 * 초기 비밀번호는 환경변수 MASTER_INITIAL_PASSWORD 로 설정합니다.
 * (설정하지 않으면 배포 차단됩니다)
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { isIpAllowed } from '@/server/security/ip-allowlist';
import { notifySecurityEvent } from '@/server/security/security-alert';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const ipCheck = isIpAllowed(request);
  if (!ipCheck.allowed) {
    await notifySecurityEvent({
      type: 'admin_create_master_ip_blocked',
      level: 'warn',
      message: '허용되지 않은 IP에서 create-master 접근',
      ip: ipCheck.ip,
      path: '/api/admin/create-master',
    });
    return NextResponse.json(
      { success: false, error: '허용되지 않은 IP입니다.' },
      { status: 403 },
    );
  }

  // 프로덕션 환경에서는 이 엔드포인트를 완전 차단
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { success: false, error: 'This endpoint is disabled in production.' },
      { status: 403 },
    );
  }

  // 시크릿 키 확인 (환경변수에 설정된 값과 반드시 일치해야 함)
  const setupSecret = process.env.MASTER_SETUP_SECRET;
  if (!setupSecret) {
    return NextResponse.json(
      {
        success: false,
        error:
          'MASTER_SETUP_SECRET 환경변수가 설정되지 않았습니다. .env 파일을 확인하세요.',
      },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const providedSecret = searchParams.get('secret');

  if (providedSecret !== setupSecret) {
    await notifySecurityEvent({
      type: 'admin_create_master_secret_failed',
      level: 'warn',
      message: 'create-master secret 검증 실패',
      ip: ipCheck.ip,
      path: '/api/admin/create-master',
    });
    return NextResponse.json(
      { success: false, error: '인증에 실패했습니다.' },
      { status: 401 },
    );
  }

  // 초기 비밀번호 확인
  const initialPassword = process.env.MASTER_INITIAL_PASSWORD;
  if (!initialPassword || initialPassword.length < 8) {
    return NextResponse.json(
      {
        success: false,
        error: 'MASTER_INITIAL_PASSWORD 환경변수를 8자 이상으로 설정해주세요.',
      },
      { status: 500 },
    );
  }

  try {
    const id = 'master';
    const name = 'Master Admin';

    const hashedPassword = await bcrypt.hash(initialPassword, 12);

    await prisma.admin.upsert({
      where: { username: id },
      update: { password: hashedPassword, name: name },
      create: {
        username: id,
        password: hashedPassword,
        name: name,
      },
    });

    return NextResponse.json({
      success: true,
      message: `✅ [${id}] 어드민 계정이 성공적으로 생성/업데이트 되었습니다. 설정된 비밀번호로 로그인하세요.`,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { success: false, error: '알 수 없는 에러 발생' },
      { status: 500 },
    );
  }
}
