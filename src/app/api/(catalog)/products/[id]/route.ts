import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { s3Client } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { randomUUID } from "crypto";
import { requireAdminAccess } from "@/server/security/admin-guard";
import { recordAdminAuditLog } from "@/server/security/admin-audit";
import { getClientIp } from "@/server/security/request-ip";

const R2_PUBLIC_BASE_URL =
  process.env.R2_PUBLIC_BASE_URL || process.env.R2_PUBLIC_URL || "";
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_IMAGE_COUNT = 10;

async function processAndUploadImage(file: File, prefix: string) {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(`허용되지 않는 파일 형식입니다: ${file.type}`);
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`파일 크기가 너무 큽니다. 최대 ${MAX_FILE_SIZE / 1024 / 1024}MB까지 허용됩니다.`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  // 랜덤 파일명 생성 (경로 탐색 방지를 위해 안전한 문자만 사용)
  const randomSuffix = randomUUID().replace(/-/g, "");
  const fileName = `${prefix}_${Date.now()}_${randomSuffix}.webp`;

  const processedBuffer = await sharp(buffer)
    .rotate()
    .resize({ width: 800, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  await s3Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: `products/${fileName}`,
      Body: processedBuffer,
      ContentType: "image/webp",
      ContentLength: processedBuffer.length,
    })
  );

  return `${R2_PUBLIC_BASE_URL.replace(/\/$/, "")}/products/${fileName}`;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = Number(id);

    if (!Number.isInteger(numericId) || numericId < 1) {
      return NextResponse.json(
        { message: "유효하지 않은 상품 ID입니다." },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: numericId },
    });

    if (!product) {
      return NextResponse.json(
        { message: "상품을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "상품조회 성공", product },
      { status: 200 }
    );
  } catch (error) {
    console.error("개별 상품 조회 실패:", error);
    return NextResponse.json(
      { success: false, message: "에러발생" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminAccess(request, {
      operation: "products:update",
      requireRecentAuth: true,
    });
    if (!auth.ok) return auth.response;

    const { id } = await params;
    const numericId = Number(id);

    if (!Number.isInteger(numericId) || numericId < 1) {
      return NextResponse.json(
        { message: "유효하지 않은 상품 ID입니다." },
        { status: 400 }
      );
    }

    // 상품 존재 여부 확인
    const existing = await prisma.product.findUnique({
      where: { id: numericId },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json(
        { message: "수정할 상품을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const subcategory = formData.get("subcategory") as string;
    const price = formData.get("price") as string;
    const description = formData.get("description") as string;
    const stock = formData.get("stock") as string;
    const minorder = formData.get("minorder") as string;
    const badge = formData.get("badge") as string;
    const discountRate = formData.get("discountRate") as string;

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return NextResponse.json(
        { message: "유효하지 않은 가격입니다." },
        { status: 400 }
      );
    }

    const imageFiles = formData.getAll("image") as File[];
    const detailImageFiles = formData.getAll("detailImage") as File[];

    if (
      imageFiles.length > MAX_IMAGE_COUNT ||
      detailImageFiles.length > MAX_IMAGE_COUNT
    ) {
      return NextResponse.json(
        { message: `이미지는 최대 ${MAX_IMAGE_COUNT}개까지 업로드 가능합니다.` },
        { status: 400 }
      );
    }

    let imageUrl = undefined;
    if (imageFiles.length > 0) {
      const validFiles = imageFiles.filter((f) => f.size > 0);
      if (validFiles.length > 0) {
        const urls = await Promise.all(
          validFiles.map((file) => processAndUploadImage(file, "product"))
        );
        if (urls.length > 0) imageUrl = JSON.stringify(urls);
      }
    }

    let detailImageUrls = undefined;
    if (detailImageFiles.length > 0) {
      const validFiles = detailImageFiles.filter((f) => f.size > 0);
      if (validFiles.length > 0) {
        const urls = await Promise.all(
          validFiles.map((file) => processAndUploadImage(file, "detail"))
        );
        if (urls.length > 0) detailImageUrls = JSON.stringify(urls);
      }
    }

    const updated = await prisma.product.update({
      where: { id: numericId },
      data: {
        name: String(name || "").slice(0, 200),
        category: String(category || "").slice(0, 100),
        subcategory: String(subcategory || "").slice(0, 100),
        price: numPrice,
        description: String(description || "").slice(0, 5000),
        stock: Number(stock) || 0,
        minorder: Number(minorder) || 0,
        badge: badge ? String(badge).slice(0, 50) : null,
        discountRate: Number(discountRate) || 0,
        ...(imageUrl && { imageUrl }),
        ...(detailImageUrls && { detailImageUrls }),
      },
      select: { id: true, name: true, category: true, badge: true },
    });

    await recordAdminAuditLog({
      adminId: auth.admin.id,
      adminUsername: auth.admin.username,
      ip: getClientIp(request),
      action: "PRODUCT_UPDATED",
      targetType: "PRODUCT",
      targetId: String(updated.id),
      detail: "상품 수정",
      metadata: {
        name: updated.name,
        category: updated.category,
        badge: updated.badge,
      },
    });

    return NextResponse.json(
      { success: true, message: "수정이 완료되었습니다." },
      { status: 200 }
    );
  } catch (error) {
    console.error("상품 수정 실패:", error);
    if (error instanceof Error && error.message.includes("허용되지 않는")) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "에러 발생 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminAccess(request, {
      operation: "products:delete",
      requireRecentAuth: true,
    });
    if (!auth.ok) return auth.response;

    const { id } = await params;
    const numericId = Number(id);

    if (!Number.isInteger(numericId) || numericId < 1) {
      return NextResponse.json(
        { message: "유효하지 않은 상품 ID입니다." },
        { status: 400 }
      );
    }

    const deleted = await prisma.product.delete({
      where: { id: numericId },
      select: { id: true, name: true, category: true, badge: true },
    });

    await recordAdminAuditLog({
      adminId: auth.admin.id,
      adminUsername: auth.admin.username,
      ip: getClientIp(request),
      action: "PRODUCT_DELETED",
      targetType: "PRODUCT",
      targetId: String(deleted.id),
      detail: "상품 삭제",
      metadata: {
        name: deleted.name,
        category: deleted.category,
        badge: deleted.badge,
      },
    });

    return NextResponse.json(
      { success: true, message: "삭제 완료되었습니다." },
      { status: 200 }
    );
  } catch (error) {
    console.error("상품 삭제 실패:", error);
    return NextResponse.json(
      { success: false, message: "에러 발생 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}
