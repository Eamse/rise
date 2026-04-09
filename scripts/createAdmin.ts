import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const admins = [
    {
      id: "master",
      pw: "qwer1234!!",
      name: "Master Admin",
    },
    {
      id: "admin", // 어드민 계정
      pw: process.env.ADMIN_PW_ADMIN || null,
      name: "Admin",
    },
    {
      id: "admin1", // 어드민 계정 1
      pw: process.env.ADMIN_PW_ADMIN1 || null,
      name: "Admin 1",
    },
  ];

  for (const account of admins) {
    if (!account.pw) {
      console.error(
        `❌ [${account.id}] 환경변수 비밀번호가 없습니다. 생성 중단.`,
      );
      console.error(
        `   → 서버 터미널에서 먼저 실행하세요: export ADMIN_PW_${account.id.toUpperCase()}="강한비밀번호"`,
      );
      continue;
    }

    const pwRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;
    if (!pwRegex.test(account.pw)) {
      console.error(`❌ [${account.id}] 비밀번호가 너무 약합니다!`);
      console.error(
        `   → 최소 8자 이상, 영문+숫자+특수문자(!@#$%^&*) 포함 필수`,
      );
      continue;
    }

    const hashedPassword = await bcrypt.hash(account.pw, 12);

    try {
      await prisma.admin.upsert({
        where: { username: account.id },
        update: { password: hashedPassword, name: account.name },
        create: {
          username: account.id,
          password: hashedPassword,
          name: account.name,
        },
      });
      console.log(
        `✅ 성공: ${account.id} (${account.name}) 관리자 계정 생성/업데이트 완료`,
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`❌ 실패 (${account.id}):`, error.message);
      } else {
        console.error(`❌ 실패 (${account.id}):`, error);
      }
    }
  }

  console.log(
    `\n⚠️  완료! 보안을 위해 이 파일(createAdmin.ts)을 프로젝트에서 즉시 삭제하세요!`,
  );
  console.log(`   → rm scripts/createAdmin.ts`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
