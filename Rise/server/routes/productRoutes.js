import { PutObjectCommand } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import express from "express";
import multer from "multer";
import sharp from "sharp";
import { s3Client } from "../config/s3.js";
import { adminAuthMiddleware } from "../middleware/adminAuth.js";

const router = express.Router();
const prisma = new PrismaClient();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, //최대 50mb
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("이미지 파일만 업로드 가능합니다."), false);
    }
  },
});

// 등록 (관리자 인증 필요)
router.post(
  "/",
  adminAuthMiddleware,
  upload.fields([
    { name: "image", maxCount: 5 },
    { name: "detailImage", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const {
        name,
        category,
        subcategory,
        price,
        description,
        stock,
        minorder,
      } = req.body;

      if (!name || !price) {
        return res.status(400).json({
          message: "필수 항목을 모두 입력해주세요.",
        });
      }
      // 썸네일 이미지
      let imageUrl = null;
      if (req.files["image"]) {
        const urls = await Promise.all(
          req.files["image"].map(async (file) => {
            const fileName = `product_${Date.now()}_${Math.floor(Math.random() * 1000)}.webp`;
            const processedBuffer = await sharp(file.buffer)
              .rotate()
              .resize({ width: 800, withoutEnlargement: true })
              .webp({ quality: 80 })
              .toBuffer();

            await s3Client.send(
              new PutObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME,
                Key: `products/${fileName}`,
                body: processedBuffer,
                ContentType: "image/webp",
              }),
            );
            return `${process.env.R2_PUBLIC_BASE_URL}/products/${fileName}`;
          }),
        );
        imageUrl = JSON.stringify(urls);
      }
      // 상세 이미지
      let detailImageUrls = null;
      if (req.files["detailImage"]) {
        const urls = await Promise.all(
          req.files["detailImage"].map(async (file) => {
            const fileName = `detail_${Date.now()}_${Math.floor(Math.random() * 1000)}.webp`;
            const processedBuffer = await sharp(file.buffer)
              .rotate()
              .resize({ width: 800, withoutEnlargement: true })
              .webp({ quality: 80 })
              .toBuffer();

            await s3Client.send(
              new PutObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME,
                Key: `products/${fileName}`,
                body: processedBuffer,
                ContentType: "image/webp",
              }),
            );
            return `${process.env.R2_PUBLIC_BASE_URL}/products/${fileName}`;
          }),
        );
        detailImageUrls = JSON.stringify(urls);
      }

      await prisma.product.create({
        data: {
          name,
          category,
          subcategory,
          price: Number(price),
          description,
          stock: Number(stock),
          minorder: Number(minorder),
          imageUrl,
          detailImageUrls,
        },
      });
      res.status(201).json({
        success: true,
        message: "상품 등록이 완료되었습니다.",
      });
    } catch (error) {
      console.error("상품등록에 실패했습니다.:", error);
      res.status(500).json({
        success: false,
        message: "오류가 발생했습니다.",
      });
    }
  },
);

// 조회

router.get("/", async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.status(200).json({
      success: true,
      message: "상품조회 완료",
      products,
    });
  } catch (error) {
    console.error("상품조회 실패:", error);
    return res.status(400).json({
      message: "상품조회 실패",
    });
  }
});

//개별 조회

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const product = await prisma.product.findUnique({
      where: { id: id },
    });
    if (!product) {
      return res.status(404).json({
        message: "상품을 찾을 수 없습니다.",
      });
    }
    res.status(200).json({
      success: true,
      message: "상품조회 성공",
      product,
    });
  } catch (error) {
    console.error("개별 상품 조회 실패:", error);
    res.status(500).json({
      success: false,
      message: "에러발생",
    });
  }
});

// 수정 (관리자 인증 필요)
router.put(
  "/:id",
  adminAuthMiddleware,
  upload.fields([{ name: "image" }, { name: "detailImage" }]),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const {
        name,
        category,
        subcategory,
        price,
        description,
        stock,
        minorder,
      } = req.body;

      let imageUrl = undefined;
      if (req.files["image"]) {
        const urls = await Promise.all(
          req.files["image"].map(async (file) => {
            const fileName = `product_${Date.now()}_${Math.floor(Math.random() * 1000)}.webp`;
            const processedBuffer = await sharp(file.buffer)
              .rotate()
              .resize({ width: 800, withoutEnlargement: true })
              .webp({ quality: 80 })
              .toBuffer();

            await s3Client.send(
              new PutObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME,
                Key: `products/${fileName}`,
                Body: processedBuffer,
                ContentType: "image/webp",
              }),
            );
            return `${process.env.R2_PUBLIC_BASE_URL}/products/${fileName}`;
          }),
        );
        imageUrl = JSON.stringify(urls);
      }

      let detailImageUrls = undefined;
      if (req.files["detailImage"]) {
        const urls = await Promise.all(
          req.files["detailImage"].map(async (file) => {
            const fileName = `detail_${Date.now()}_${Math.floor(Math.random() * 1000)}.webp`;
            const processedBuffer = await sharp(file.buffer)
              .rotate()
              .resize({ width: 800, withoutEnlargement: true })
              .webp({ quality: 80 })
              .toBuffer();

            await s3Client.send(
              new PutObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME,
                Key: `products/${fileName}`,
                Body: processedBuffer,
                ContentType: "image/webp",
              }),
            );
            return `${process.env.R2_PUBLIC_BASE_URL}/products/${fileName}`;
          }),
        );
        detailImageUrls = JSON.stringify(urls);
      }

      await prisma.product.update({
        where: { id: id },
        data: {
          name,
          category,
          subcategory,
          price: Number(price),
          description,
          stock: Number(stock),
          minorder: Number(minorder),
          imageUrl,
          detailImageUrls,
        },
      });
      res.status(200).json({
        success: true,
        message: "수정이 완료되었습니다.",
      });
    } catch (error) {
      console.error("상품 수정 실패:", error);
      res.status(500).json({
        success: false,
        message: "에러 발생 수정에 실패했습니다.",
      });
    }
  },
);

// 삭제 (관리자 인증 필요)
router.delete("/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.product.delete({
      where: { id: id },
    });
    res.status(200).json({
      success: true,
      message: "삭제 완료되었습니다.",
    });
  } catch (error) {
    console.error("상품 삭제 실패:", error);
    res.status(500).json({
      success: false,
      message: "에러 발생 삭제에 실패했습니다.",
    });
  }
});
export default router;
