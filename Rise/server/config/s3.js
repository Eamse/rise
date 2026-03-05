import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import "dotenv/config";

const { R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME } =
  process.env;

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// [중요] 사용자가 .env에 R2_PUBLIC_BASE_URL로 적었을 경우도 허용 (Fallback)
let R2_PUBLIC_URL = (
  process.env.R2_PUBLIC_URL ||
  process.env.R2_PUBLIC_BASE_URL ||
  ""
).trim();

// [보정] URL 형식이 올바르지 않으면 자동 수정 (https:// 추가, 끝 슬래시 제거)
if (R2_PUBLIC_URL) {
  if (!R2_PUBLIC_URL.startsWith("http")) {
    R2_PUBLIC_URL = `https://${R2_PUBLIC_URL}`;
  }
  // 끝에 붙은 슬래시(/) 제거 -> 나중에 합칠 때 중복 방지
  R2_PUBLIC_URL = R2_PUBLIC_URL.replace(/\/$/, "");
}

// [디버깅]
console.log("🔧 [R2 설정 확인]");
console.log(`   - Bucket: ${R2_BUCKET_NAME || "❌ 누락됨"}`);
console.log(`   - Base URL: ${R2_PUBLIC_URL || "❌ 누락됨"}`);

if (!R2_PUBLIC_URL) {
  console.error(
    "🚨 [치명적 오류] R2_PUBLIC_BASE_URL이 없습니다. 이미지 주소를 생성할 수 없습니다.",
  );
}

export const deleteFileFromR2 = async (urlOrKey) => {
  if (!urlOrKey) return;

  let key = urlOrKey;
  if (key.includes(R2_PUBLIC_URL)) {
    key = key.replace(`${R2_PUBLIC_URL}/`, "");
  }

  if (key.startsWith("/")) key = key.slice(1);

  console.log(`🗑️ [R2 Delete] 삭제 시도 Key: ${key}`);

  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  try {
    await s3Client.send(command);
    console.log("✅ [R2 Delete] 삭제 성공");
  } catch (error) {
    console.error("❌ [R2 Delete Error]", error);
  }
};

export { s3Client };
