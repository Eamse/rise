import crypto from "crypto";
import { AppError } from "@/server/lib/app-error";

const KEY_BYTES = 32;

function getTokenEncryptionKey() {
  const raw = process.env.PAYMENT_TOKEN_ENCRYPTION_KEY;
  if (!raw) {
    throw new AppError(
      "PAYMENT_TOKEN_ENCRYPTION_KEY 환경변수가 필요합니다.",
      500,
    );
  }

  let key: Buffer;
  try {
    key = Buffer.from(raw, "base64");
  } catch {
    throw new AppError("PAYMENT_TOKEN_ENCRYPTION_KEY 형식이 올바르지 않습니다.", 500);
  }

  if (key.length !== KEY_BYTES) {
    throw new AppError(
      "PAYMENT_TOKEN_ENCRYPTION_KEY는 base64 인코딩된 32바이트 키여야 합니다.",
      500,
    );
  }

  return key;
}

export function encryptPaymentToken(plainToken: string) {
  const key = getTokenEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plainToken, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return `v1:${iv.toString("base64")}:${encrypted.toString("base64")}:${tag.toString("base64")}`;
}

export function decryptPaymentToken(cipherText: string) {
  const key = getTokenEncryptionKey();
  const [version, ivB64, encryptedB64, tagB64] = cipherText.split(":");

  if (version !== "v1" || !ivB64 || !encryptedB64 || !tagB64) {
    throw new AppError("저장된 결제 토큰 형식이 올바르지 않습니다.", 500);
  }

  const iv = Buffer.from(ivB64, "base64");
  const encrypted = Buffer.from(encryptedB64, "base64");
  const tag = Buffer.from(tagB64, "base64");

  try {
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  } catch {
    throw new AppError("결제 토큰 복호화에 실패했습니다.", 500);
  }
}
