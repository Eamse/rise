import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import Image from 'next/image';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product & { minOrder?: number; image?: string };
}

import { parseImageUrl } from '@/utils/imageUtils';

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const thumbnail = parseImageUrl(product.image || product.imageUrl);

  const hasDiscount = product.discountRate > 0;
  const discountedPrice = hasDiscount
    ? product.price * (1 - product.discountRate / 100)
    : product.price;

  return (
    <Link href={`/products/${product.id}`} className={styles['product-card']}>
      <div
        className={styles['product-card-image-wrapper']}
        style={{ position: 'relative' }}
      >
        {hasDiscount && (
          <div className={styles['discount-tag']}>
            {product.discountRate}% OFF
          </div>
        )}
        <Image
          src={thumbnail}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: 'cover' }}
        />
      </div>
      <div className={styles['product-card-info']}>
        <div className={styles['product-card-price-wrapper']}>
          {hasDiscount && (
            <p className={styles['product-card-original-price']}>
              ₱{product.price.toLocaleString()}
            </p>
          )}
          <div className={styles['product-card-final-price-row']}>
            {hasDiscount && (
              <span className={styles['product-card-discount']}>
                {product.discountRate}%
              </span>
            )}
            <p className={styles['product-card-price']}>
              ₱{discountedPrice.toLocaleString()}
            </p>
          </div>
        </div>
        <p className={styles['product-card-moq']}>
          MOQ: {product.minorder || product.minOrder} pcs
        </p>
      </div>
    </Link>
  );
};

export default ProductCard;
