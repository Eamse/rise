import { createHmac, timingSafeEqual } from "crypto";

type OtpSecretMap = Record<string, string>;

function base32ToBuffer(input: string) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const cleaned = input.toUpperCase().replace(/=+$/g, "").replace(/\s+/g, "");
  let bits = "";

  for (const char of cleaned) {
    const value = alphabet.indexOf(char);
    if (value === -1) continue;
    bits += value.toString(2).padStart(5, "0");
  }

  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(Number.parseInt(bits.slice(i, i + 8), 2));
  }

  return Buffer.from(bytes);
}

function generateTotp(secret: string, counter: number, digits = 6) {
  const key = base32ToBuffer(secret);
  const message = Buffer.alloc(8);
  message.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  message.writeUInt32BE(counter % 0x100000000, 4);

  const hash = createHmac("sha1", key).update(message).digest();
  const offset = hash[hash.length - 1] & 0x0f;
  const binary =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);

  const otp = binary % 10 ** digits;
  return otp.toString().padStart(digits, "0");
}

function parseSecretMap(raw: string) {
  const result: OtpSecretMap = {};
  for (const pair of raw.split(",")) {
    const [username, secret] = pair.split(":").map((item) => item?.trim() || "");
    if (!username || !secret) continue;
    result[username] = secret;
  }
  return result;
}

function findSecretByUsername(username: string) {
  const mappedSecrets = parseSecretMap(process.env.ADMIN_OTP_SECRETS || "");
  if (mappedSecrets[username]) return mappedSecrets[username];
  return process.env.ADMIN_OTP_SECRET || null;
}

export function isAdminOtpRequired() {
  return (
    process.env.ADMIN_OTP_REQUIRED === "true" ||
    Boolean(process.env.ADMIN_OTP_SECRET) ||
    Boolean(process.env.ADMIN_OTP_SECRETS)
  );
}

export function verifyAdminOtp(username: string, otpCode: string) {
  const secret = findSecretByUsername(username);
  if (!secret) return false;

  if (!/^\d{6}$/.test(otpCode)) return false;
  const nowCounter = Math.floor(Date.now() / 1000 / 30);
  const input = Buffer.from(otpCode);

  for (const drift of [-1, 0, 1]) {
    const expected = Buffer.from(generateTotp(secret, nowCounter + drift));
    if (input.length !== expected.length) continue;
    if (timingSafeEqual(input, expected)) {
      return true;
    }
  }

  return false;
}

