import crypto from 'crypto';
import { ok, fail, failFromError } from '@/server/lib/api-response';
import { handlePaymentWebhook } from '@/server/payments/webhook.service';

function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  secret: string,
) {
  const received = signatureHeader.startsWith('sha256=')
    ? signatureHeader.slice('sha256='.length)
    : signatureHeader;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('hex');

  const receivedBuf = Buffer.from(received, 'hex');
  const expectedBuf = Buffer.from(expected, 'hex');

  if (receivedBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(receivedBuf, expectedBuf);
}
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-payment-signature');

    if (!signature) {
      return fail('서명 헤더가 없습니다');
    }

    const secret = process.env.WEBHOOK_SHARED_SECRET;
    if (!secret) {
      return fail('시크릿 설정이 없습니다.', 500);
    }
    const isValid = verifyWebhookSignature(rawBody, signature, secret);
    if (!isValid) {
      return fail('서명이 유효하지 않습니다', 403);
    }

    const result = await handlePaymentWebhook(rawBody);
    return ok(
      {
        received: true,
        eventId: result.eventId,
        status: result.status,
      },
      200,
    );
  } catch (error) {
    return failFromError(error, '처리 중 오류 발생');
  }
}
