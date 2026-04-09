import { prisma } from "@/lib/prisma";
import { s3Client } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import sharp from "sharp";
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
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const MAX_IMAGE_COUNT = 10;

async function processAndUploadImage(file: File, prefix: string) {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(`허용되지 않는 파일 형식입니다: ${file.type}`);
  }

  // 파일 크기 검증
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `파일 크기가 너무 큽니다. 최대 ${MAX_FILE_SIZE / 1024 / 1024}MB까지 허용됩니다.`,
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

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
    }),
  );

  return `${R2_PUBLIC_BASE_URL.replace(/\/$/, "")}/products/${fileName}`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const badge = searchParams.get("badge");
    const category = searchParams.get("category");

    const whereClause: {
      badge?: string | null;
      category?: string;
    } = {};

    if (badge === "NONE") {
      whereClause.badge = null;
    } else if (badge) {
      whereClause.badge = badge;
    }
    
    if (category) whereClause.category = category;

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: { id: "desc" },
    });
    return NextResponse.json(
      { success: true, message: "상품조회 완료", products },
      { status: 200 },
    );
  } catch (error) {
    console.error("상품조회 실패:", error);
    return NextResponse.json({ message: "상품조회 실패" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdminAccess(request, {
      operation: "products:create",
      requireRecentAuth: true,
    });
    if (!auth.ok) return auth.response;

    const formData = await request.formData();
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const subcategory = formData.get("subcategory") as string;
    const price = formData.get("price") as string;
    const description = formData.get("description") as string;
    const stock = formData.get("stock") as string;
    const minorder = formData.get("minorder") as string;
    const badge = formData.get("badge") as string; // 뱃지 (HOT_DEAL, TOP_RANKING 등)
    const discountRate = formData.get("discountRate") as string;

    if (!name || !price) {
      return NextResponse.json(
        { message: "필수 항목을 모두 입력해주세요." },
        { status: 400 },
      );
    }

    // (유효성 검사는 기존 동일)
    const numPrice = Number(price);
    const numStock = Number(stock) || 0;
    const numMinorder = Number(minorder) || 0;
    const numDiscountRate = Number(discountRate) || 0;

    if (isNaN(numPrice) || numPrice < 0) {
      return NextResponse.json(
        { message: "유효하지 않은 가격입니다." },
        { status: 400 },
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
        { status: 400 },
      );
    }

    let imageUrl = null;
    if (imageFiles.length > 0) {
      const validFiles = imageFiles.filter((f) => f.size > 0);
      if (validFiles.length > 0) {
        const urls = await Promise.all(
          validFiles.map((file) => processAndUploadImage(file, "product")),
        );
        if (urls.length > 0) imageUrl = JSON.stringify(urls);
      }
    }

    let detailImageUrls = null;
    if (detailImageFiles.length > 0) {
      const validFiles = detailImageFiles.filter((f) => f.size > 0);
      if (validFiles.length > 0) {
        const urls = await Promise.all(
          validFiles.map((file) => processAndUploadImage(file, "detail")),
        );
        if (urls.length > 0) detailImageUrls = JSON.stringify(urls);
      }
    }

    const createdProduct = await prisma.product.create({
      data: {
        name: String(name).slice(0, 200),
        category: String(category || "").slice(0, 100),
        subcategory: String(subcategory || "").slice(0, 100),
        price: numPrice,
        description: String(description || "").slice(0, 5000),
        stock: numStock,
        minorder: numMinorder,
        badge: badge ? String(badge).slice(0, 50) : null,
        discountRate: numDiscountRate,
        imageUrl,
        detailImageUrls,
      },
      select: { id: true, name: true, category: true, badge: true },
    });

    await recordAdminAuditLog({
      adminId: auth.admin.id,
      adminUsername: auth.admin.username,
      ip: getClientIp(request),
      action: "PRODUCT_CREATED",
      targetType: "PRODUCT",
      targetId: String(createdProduct.id),
      detail: "상품 등록",
      metadata: {
        name: createdProduct.name,
        category: createdProduct.category,
        badge: createdProduct.badge,
      },
    });

    return NextResponse.json(
      { success: true, message: "상품 등록이 완료되었습니다." },
      { status: 201 },
    );
  } catch (error) {
    console.error("상품등록에 실패했습니다.:", error);
    if (error instanceof Error && error.message.includes("허용되지 않는")) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { success: false, message: "오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
