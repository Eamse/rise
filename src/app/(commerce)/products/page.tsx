'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CATEGORIES, SUBCATEGORIES } from '@/constants/categoryData';
import { Product } from '@/types';
import styles from './ProductList.module.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Image from 'next/image';
import { parseImageUrl } from '@/utils/imageUtils';

const ProductListContent: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  const categoryFromUrl = searchParams.get('category') || '';
  const subFromUrl = searchParams.get('sub') || '';
  const badgeFromUrl = searchParams.get('badge') || '';

  // ── Filter state ─────────────────────────────────
  const [selectedSubcategory, setSelectedSubcategory] = useState(subFromUrl);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minOrder, setMinOrder] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);

  const [appliedMinPrice, setAppliedMinPrice] = useState('');
  const [appliedMaxPrice, setAppliedMaxPrice] = useState('');
  const [appliedMinOrder, setAppliedMinOrder] = useState('');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Reset subcategory selection when URL changes
  useEffect(() => {
    setSelectedSubcategory(subFromUrl);
  }, [subFromUrl]);

  // ── Load products from server ────────────────────
  useEffect(() => {
    let url = '/api/products';
    const params = new URLSearchParams();
    if (badgeFromUrl) params.append('badge', badgeFromUrl);
    if (categoryFromUrl) params.append('category', categoryFromUrl);

    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => setProducts(data.products || []))
      .catch(() => setProducts([])); // fall back to empty list on error
  }, [badgeFromUrl, categoryFromUrl]);

  // Lock body scroll while mobile bottom sheet is open.
  useEffect(() => {
    if (!isMobileFilterOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileFilterOpen]);

  // ── Apply filters ─────────────────────────────────
  const filtered = products.filter((product) => {
    if (categoryFromUrl && product.category !== categoryFromUrl) return false;
    if (selectedSubcategory && product.subcategory !== selectedSubcategory)
      return false;
    if (appliedMinPrice && product.price < Number(appliedMinPrice))
      return false;
    if (appliedMaxPrice && product.price > Number(appliedMaxPrice))
      return false;
    if (appliedMinOrder && product.minorder < Number(appliedMinOrder))
      return false;
    if (inStockOnly && product.stock <= 0) return false;
    return true;
  });

  const handleReset = () => {
    setSelectedSubcategory('');
    setMinPrice('');
    setMaxPrice('');
    setMinOrder('');
    setAppliedMinPrice('');
    setAppliedMaxPrice('');
    setAppliedMinOrder('');
    setInStockOnly(false);
  };

  const handleApplyRangeFilters = () => {
    setAppliedMinPrice(minPrice);
    setAppliedMaxPrice(maxPrice);
    setAppliedMinOrder(minOrder);
  };

  const moveCategory = (category: string) => {
    if (!category) {
      router.push('/products');
      return;
    }
    router.push(`/products?category=${encodeURIComponent(category)}`);
  };

  const badgeTitle =
    badgeFromUrl === 'HOT_DEAL'
      ? '🔥 Hot Deals'
      : badgeFromUrl === 'TOP_RANKING'
        ? '🏆 Top Ranking'
        : '';

  const pageTitle =
    selectedSubcategory || badgeTitle || categoryFromUrl || 'All Products';
  const subList = categoryFromUrl ? SUBCATEGORIES[categoryFromUrl] || [] : [];

  return (
    <div className={styles.productListPage}>
      <div className={styles.mobileCategoryBar}>
        <div className={styles.mobileCategoryScroller}>
          <button
            className={`${styles.mobileCategoryChip} ${!categoryFromUrl ? styles.active : ''}`}
            onClick={() => moveCategory('')}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              className={`${styles.mobileCategoryChip} ${categoryFromUrl === cat.name ? styles.active : ''}`}
              onClick={() => moveCategory(cat.name)}
            >
              {cat.name}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={styles.mobileExpandButton}
          onClick={() => setIsMobileFilterOpen(true)}
          aria-label="Open filter panel"
        >
          ∨
        </button>
      </div>

      {/* ─── Left filter sidebar ─── */}
      <aside className={styles.filterSidebar}>
        <div className={styles.filterHeader}>
          <span className={styles.filterTitle}>Filters</span>
          <button className={styles.filterReset} onClick={handleReset}>
            Reset
          </button>
        </div>

        <div className={styles.filterSection}>
          <p className={styles.filterSectionTitle}>All Category</p>
          <ul className={styles.filterCategoryList}>
            <li>
              <button
                className={`${styles.filterCatItem} ${!categoryFromUrl ? styles.active : ''}`}
                onClick={() => router.push('/products')}
              >
                View All
              </button>
            </li>
            {CATEGORIES.map((cat) => (
              <li key={cat.name}>
                <button
                  className={`${styles.filterCatItem} ${categoryFromUrl === cat.name ? styles.active : ''}`}
                  onClick={() =>
                    router.push(
                      `/products?category=${encodeURIComponent(cat.name)}`,
                    )
                  }
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.filterDivider} />

        <div className={styles.filterSection}>
          <label className={styles.filterCheckboxLabel}>
            <input
              type="checkbox"
              className={styles.filterCheckbox}
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
            />
            <span>In-stock only</span>
          </label>
        </div>

        <div className={styles.filterDivider} />

        {subList.length > 0 && (
          <div className={styles.filterSection}>
            <p className={styles.filterSectionTitle}>Type</p>
            <ul className={styles.filterCategoryList}>
              <li>
                <button
                  className={`${styles.filterCatItem} ${!selectedSubcategory ? styles.active : ''}`}
                  onClick={() => setSelectedSubcategory('')}
                >
                  All
                </button>
              </li>
              {subList.map((sub) => (
                <li key={sub.name}>
                  <button
                    className={`${styles.filterCatItem} ${selectedSubcategory === sub.name ? styles.active : ''}`}
                    onClick={() => setSelectedSubcategory(sub.name)}
                  >
                    {sub.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className={styles.filterDivider} />

        <div className={styles.filterSection}>
          <p className={styles.filterSectionTitle}>Price (PHP)</p>
          <div className={styles.filterPriceRow}>
            <input
              className={styles.filterInput}
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <span className={styles.filterDash}>~</span>
            <input
              className={styles.filterInput}
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
            <button
              className={styles.filterOk}
              onClick={handleApplyRangeFilters}
            >
              OK
            </button>
          </div>
        </div>

        <div className={styles.filterDivider} />

        <div className={styles.filterSection}>
          <p className={styles.filterSectionTitle}>Min Order Quantity</p>
          <div className={styles.filterPriceRow}>
            <input
              className={styles.filterInput}
              type="number"
              placeholder="e.g. 10"
              value={minOrder}
              onChange={(e) => setMinOrder(e.target.value)}
            />
            <button
              className={styles.filterOk}
              onClick={handleApplyRangeFilters}
            >
              OK
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Mobile filter bottom sheet ─── */}
      {isMobileFilterOpen && (
        <div
          className={styles.mobileSheetOverlay}
          onClick={() => setIsMobileFilterOpen(false)}
          role="presentation"
        >
          <section
            className={styles.mobileSheet}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.mobileSheetHandle} />
            <div className={styles.mobileSheetHeader}>
              <strong>Filters</strong>
              <button
                type="button"
                className={styles.mobileSheetClose}
                onClick={() => setIsMobileFilterOpen(false)}
              >
                닫기
              </button>
            </div>

            <div className={styles.mobileSheetSection}>
              <p className={styles.mobileSheetTitle}>Category</p>
              <ul className={styles.mobileCategoryList}>
                <li>
                  <button
                    className={`${styles.mobileListItem} ${!categoryFromUrl ? styles.active : ''}`}
                    onClick={() => moveCategory('')}
                  >
                    <span>All</span>
                    <span>{!categoryFromUrl ? '●' : '○'}</span>
                  </button>
                </li>
                {CATEGORIES.map((cat) => (
                  <li key={cat.name}>
                    <button
                      className={`${styles.mobileListItem} ${categoryFromUrl === cat.name ? styles.active : ''}`}
                      onClick={() => moveCategory(cat.name)}
                    >
                      <span>{cat.name}</span>
                      <span>{categoryFromUrl === cat.name ? '●' : '○'}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {subList.length > 0 && (
              <div className={styles.mobileSheetSection}>
                <p className={styles.mobileSheetTitle}>Type</p>
                <ul className={styles.mobileCategoryList}>
                  <li>
                    <button
                      className={`${styles.mobileListItem} ${!selectedSubcategory ? styles.active : ''}`}
                      onClick={() => setSelectedSubcategory('')}
                    >
                      <span>All</span>
                      <span>{!selectedSubcategory ? '●' : '○'}</span>
                    </button>
                  </li>
                  {subList.map((sub) => (
                    <li key={sub.name}>
                      <button
                        className={`${styles.mobileListItem} ${selectedSubcategory === sub.name ? styles.active : ''}`}
                        onClick={() => setSelectedSubcategory(sub.name)}
                      >
                        <span>{sub.name}</span>
                        <span>{selectedSubcategory === sub.name ? '●' : '○'}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className={styles.mobileSheetSection}>
              <label className={styles.filterCheckboxLabel}>
                <input
                  type="checkbox"
                  className={styles.filterCheckbox}
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                />
                <span>In-stock only</span>
              </label>
            </div>

            <div className={styles.mobileSheetSection}>
              <p className={styles.mobileSheetTitle}>Price (PHP)</p>
              <div className={styles.filterPriceRow}>
                <input
                  className={styles.filterInput}
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <span className={styles.filterDash}>~</span>
                <input
                  className={styles.filterInput}
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.mobileSheetSection}>
              <p className={styles.mobileSheetTitle}>Min Order Quantity</p>
              <div className={styles.filterPriceRow}>
                <input
                  className={styles.filterInput}
                  type="number"
                  placeholder="e.g. 10"
                  value={minOrder}
                  onChange={(e) => setMinOrder(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.mobileSheetActions}>
              <button
                type="button"
                className={styles.mobileResetButton}
                onClick={() => {
                  handleReset();
                }}
              >
                Reset
              </button>
              <button
                type="button"
                className={styles.mobileApplyButton}
                onClick={() => {
                  handleApplyRangeFilters();
                  setIsMobileFilterOpen(false);
                }}
              >
                Apply
              </button>
            </div>
          </section>
        </div>
      )}

      {/* ─── Product content area ─── */}
      <div className={styles.productContent}>
        <div className={styles.productListHeader}>
          <h2 className={styles.productListTitle}>{pageTitle}</h2>
          <span className={styles.productCount}>
            {filtered.length} products
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className={styles.productEmpty}>
            <p>😢 No products match your filters.</p>
          </div>
        ) : (
          <ul className={styles.productGrid}>
            {filtered.map((product) => {
              const mainImageUrl = parseImageUrl(product.imageUrl);

              return (
                <li
                  key={product.id}
                  className={styles.productCard}
                  onClick={() => router.push(`/products/${product.id}`)}
                >
                  <div
                    className={styles.productCardImage}
                    style={{ position: 'relative' }}
                  >
                    {product.discountRate > 0 && (
                      <div className={styles.discountBadge}>
                        {product.discountRate}% OFF
                      </div>
                    )}
                    {mainImageUrl ? (
                      <Image
                        src={mainImageUrl}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 20vw"
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div className={styles.productNoImage}>📦</div>
                    )}
                  </div>
                  <div className={styles.productCardInfo}>
                    <p className={styles.productCardCategory}>
                      {product.category}
                    </p>
                    <p className={styles.productCardName}>{product.name}</p>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {product.discountRate > 0 && (
                        <span className={styles.productCardOriginalPrice}>
                          ₱{product.price.toLocaleString()}
                        </span>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {product.discountRate > 0 && (
                          <span className={styles.productCardDiscount}>
                            {product.discountRate}%
                          </span>
                        )}
                        <p className={styles.productCardPrice}>
                          ₱
                          {Math.floor(
                            product.price *
                              (1 - (product.discountRate || 0) / 100),
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className={styles.productCardMoq}>
                      Min {product.minorder} pcs
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

const ProductListPage = () => {
  return (
    <>
      <Header />
      <Suspense fallback={<div>Loading...</div>}>
        <ProductListContent />
      </Suspense>
      <Footer />
    </>
  );
};

export default ProductListPage;
