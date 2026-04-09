'use client';

import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { Product } from '@/types';
import { sendAuthenticatedRequest } from '@/utils/api';
import Image from 'next/image';
import { use, useEffect, useState } from 'react';
import styles from './ProductDetail.module.css';
interface PageProps {
  params: Promise<{ id: string }>;
}

const ProjectDetailPage = ({ params }: PageProps) => {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const p = data.product;
          if (p.imageUrl) {
            try {
              p.imageUrl = JSON.parse(p.imageUrl);
            } catch {
              p.imageUrl = [p.imageUrl].filter(Boolean);
            }
          } else {
            p.imageUrl = [];
          }
          if (p.detailImageUrls) {
            try {
              p.detailImageUrls = JSON.parse(p.detailImageUrls);
            } catch {
              p.detailImageUrls = [p.detailImageUrls].filter(Boolean);
            }
          } else {
            p.detailImageUrls = [];
          }

          setProduct(p);
          if (p.minorder && p.minorder > 1) {
            setQuantity(p.minorder);
          }
        }
      });
  }, [id]);

  if (!product) return <h2>Loading product information...⏳</h2>;

  const images = Array.isArray(product.imageUrl)
    ? (product.imageUrl as string[])
    : [];

  const handleQuantity = (type: 'plus' | 'minus') => {
    const minQ = product.minorder || 1;
    if (type === 'plus') {
      setQuantity((prev) => prev + 1);
    } else if (type === 'minus' && quantity > minQ) {
      setQuantity((prev) => prev - 1);
    } else if (type === 'minus' && quantity <= minQ) {
      alert(`Minimum order quantity is ${minQ} units.`);
    }
  };

  const handleAddToCart = async () => {
    const userId = localStorage.getItem('userId');
    try {
      const response = await sendAuthenticatedRequest('/api/cart', 'POST', {
        userId: userId,
        productId: product.id,
        quantity: quantity,
      });
      if (!response) return;
      if (response.ok) {
        alert('Added to cart.');
      } else {
        alert('Failed to add to cart.');
      }
    } catch (error) {
      console.error(error, 'Error occurred');
      alert('A server communication error occurred.');
    }
  };

  return (
    <>
      <Header />
      <div className={styles.productDetailPage}>
        <div className={styles.breadcrumb}>
          <span>Home</span> {'>'} <span>{product.category}</span> {'>'}{' '}
          <span className={styles.current}>{product.subcategory}</span>
        </div>

        <div className={styles.detailTop}>
          <div className={styles.detailGallerySection}>
            <div className={styles.detailThumbList}>
              {images.map((url: string, i: number) => (
                <div
                  key={i}
                  className={`${styles.thumbItem} ${mainImageIndex === i ? styles.active : ''}`}
                  onMouseEnter={() => setMainImageIndex(i)}
                >
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '100%',
                    }}
                  >
                    <Image
                      src={url}
                      alt={`Thumbnail${i}`}
                      fill
                      sizes="80px"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div
              className={styles.detailMainImage}
              style={{ position: 'relative' }}
            >
              {images.length > 0 ? (
                <Image
                  src={images[mainImageIndex]}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: 'contain' }}
                />
              ) : (
                <div className={styles.noImageBox}>No image</div>
              )}
            </div>
          </div>

          <div className={styles.detailInfo}>
            <h1 className={styles.productTitle}>{product.name}</h1>

            <div className={styles.productMeta}>
              <span className={styles.stars}>★★★★★</span>
              <span className={styles.ratingScore}>5.0</span>
              <span className={styles.reviewCount}>Reviews (124)</span>
              <span className={styles.metaDivider}>|</span>
              <span className={styles.soldCount}>Trusted Seller</span>
            </div>

            <div className={styles.priceOrderPanel}>
              <div className={styles.priceRow}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {product.discountRate > 0 && (
                    <div className={styles.originalPrice}>
                      ₱{Number(product.price).toLocaleString()}
                    </div>
                  )}
                  <div className={styles.priceValueRow}>
                    {product.discountRate > 0 && (
                      <span className={styles.discountBadge}>
                        {product.discountRate}%
                      </span>
                    )}
                    <div className={styles.priceValue}>
                      <span className={styles.currency}>₱</span>
                      {Math.floor(
                        Number(product.price) *
                          (1 - (product.discountRate || 0) / 100),
                      ).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className={styles.minOrderBlock}>
                  <span className={styles.moqLabel}>
                    MOQ (Minimum Order Qty)
                  </span>
                  <span className={styles.moqValue}>
                    {product.minorder}+ units
                  </span>
                </div>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Basic Product Info</span>
                <span className={`${styles.infoValue} ${styles.descText}`}>
                  {product.description?.slice(0, 50)}...
                </span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Stock Status</span>
                <span className={styles.infoValue}>
                  {product.stock > 0 ? (
                    <span className={styles.inStock}>
                      In stock ({product.stock} pcs)
                    </span>
                  ) : (
                    <span className={styles.outOfStock}>Out of stock</span>
                  )}
                </span>
              </div>

              <hr className={styles.divider} />

              <div className={styles.purchaseControls}>
                <div className={styles.quantityWrapper}>
                  <span className={styles.qtyLabel}>Quantity</span>
                  <div className={styles.quantitySelector}>
                    <button onClick={() => handleQuantity('minus')}>-</button>
                    <input type="text" value={quantity} readOnly />
                    <button onClick={() => handleQuantity('plus')}>+</button>
                  </div>
                </div>

                <div className={styles.totalWrapper}>
                  <span className={styles.totalLabel}>
                    Total Product Price:
                  </span>
                  <span className={styles.totalAmount}>
                    ₱
                    {Math.floor(
                      Number(product.price) *
                        (1 - (product.discountRate || 0) / 100) *
                        quantity,
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className={styles.actionButtons}>
                <button className={styles.btnAddCart} onClick={handleAddToCart}>
                  Add to Cart
                </button>
                <button className={styles.btnBuyNow}>Start Order</button>
              </div>

              <div className={styles.supplierAssurance}>
                <p>
                  🛡️ Secure Payment Protection: once your order starts, your
                  payment is securely protected.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.detailBottomSection}>
          <div className={styles.bottomTabs}>
            <button className={`${styles.tabBtn} ${styles.active}`}>
              Product Details
            </button>
            <button className={styles.tabBtn}>Company Profile</button>
            <button className={styles.tabBtn}>Customer Reviews</button>
          </div>

          <div className={styles.detailImagesContainer}>
            {product.detailImageUrls &&
            (product.detailImageUrls as unknown as string[]).length > 0 ? (
              (product.detailImageUrls as unknown as string[]).map(
                (url: string, i: number) => (
                  <div
                    key={i}
                    className={styles.bottomDetailImgWrapper}
                    style={{
                      position: 'relative',
                      width: '100%',
                      minHeight: '600px',
                    }}
                  >
                    <Image
                      src={url}
                      alt={`Detail Image ${i}`}
                      fill
                      sizes="100vw"
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                ),
              )
            ) : (
              <div className={styles.emptyDetails}>
                No detail images have been uploaded.
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProjectDetailPage;
