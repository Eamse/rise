'use client';

import { useEffect, useRef, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { CATEGORIES, SUBCATEGORIES } from '@/constants/categoryData';
import Image from 'next/image';
import styles from './ProductEdit.module.css';

interface ProductEditPageProps {
  params: Promise<{ id: string }>;
}

const ProductEditPage: React.FC<ProductEditPageProps> = ({ params }) => {
  const { id } = use(params);
  const router = useRouter();
  const imageRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [minorder, setMinorder] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [thumbImage, setThumbImage] = useState<File[]>([]);
  const [thumbPreview, setThumbPreview] = useState<string[]>([]);
  const [detailImages, setDetailImages] = useState<File[]>([]);
  const [detailPreviews, setDetailPreviews] = useState<string[]>([]);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const p = data.product;
          setName(p.name);
          setPrice(p.price);
          setMinorder(p.minorder || '');
          setCategory(p.category || '');
          setSubcategory(p.subcategory || '');
          setStock(p.stock || '');
          setDescription(p.description || '');
          if (p.imageUrl) {
            try {
              const arr = JSON.parse(p.imageUrl);
              setThumbPreview(Array.isArray(arr) ? arr : [arr]);
            } catch {
              setThumbPreview([p.imageUrl]);
            }
          }
          if (p.detailImageUrls) {
            try {
              const arr = JSON.parse(p.detailImageUrls);
              setDetailPreviews(Array.isArray(arr) ? arr : [arr]);
            } catch {
              setDetailPreviews([p.detailImageUrls]);
            }
          }
        }
      })
      .catch((err) => console.error('Failed to load product for edit:', err));
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('minorder', minorder);
    formData.append('category', category);
    formData.append('subcategory', subcategory);
    formData.append('stock', stock);
    formData.append('description', description);

    if (thumbImage.length > 0) {
      thumbImage.forEach((file) => formData.append('image', file));
    }
    if (detailImages.length > 0) {
      detailImages.forEach((file) => formData.append('detailImage', file));
    }

    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      credentials: 'same-origin',
      body: formData,
    });

    if (res.ok) {
      alert('상품 정보가 수정되었습니다. ✨');
      router.push('/admin/products/manage');
    } else {
      const data = await res.json();
      alert(data.message || '수정에 실패했습니다.');
    }
  };

  return (
    <div className={styles.uploadPage}>
      <div className={styles.uploadCard}>
        <h2 className={styles.uploadTitle}>📝 상품 수정</h2>
        <p className={styles.uploadSubtitle}>상품 정보를 수정해주세요.</p>

        <form className={styles.uploadForm} onSubmit={handleUpdate}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              상품 이미지 (변경 시 선택)
            </label>
            {thumbPreview.length > 0 && thumbImage.length === 0 && (
              <div className={styles.previewContainer}>
                {thumbPreview.map((url, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'relative',
                      width: '100px',
                      height: '100px',
                    }}
                  >
                    <Image
                      src={url}
                      alt={`THUMB_PREVIEW_${i}`}
                      className={styles.previewImg}
                      fill
                      sizes="100px"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            )}
            <input
              className={styles.formInput}
              type="file"
              multiple
              ref={imageRef}
              accept="image/*"
              onChange={(e) => {
                const filesArray = Array.from(e.target.files || []);
                const hasBigFile = filesArray.some(
                  (file) => file.size > 50 * 1024 * 1024,
                );
                if (hasBigFile) {
                  alert('파일이 너무 큽니다. 50mb 이하 이미지를 선택해주세요.');
                  e.target.value = '';
                  return;
                }
                setThumbImage(filesArray);
              }}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              상세 이미지 (여러 장 선택 가능)
            </label>
            {detailPreviews.length > 0 && detailImages.length === 0 && (
              <div className={styles.previewContainer}>
                {detailPreviews.map((url, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'relative',
                      width: '100px',
                      height: '100px',
                    }}
                  >
                    <Image
                      src={url}
                      alt={`DETAIL_PREVIEW_${i}`}
                      className={styles.previewImg}
                      fill
                      sizes="100px"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            )}
            <input
              className={styles.formInput}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                const filesArray = Array.from(e.target.files || []);
                setDetailImages(filesArray);
              }}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>상품명 *</label>
            <input
              className={styles.formInput}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>카테고리</label>
              <select
                className={styles.formInput}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">카테고리 선택</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>서브 카테고리</label>
              <select
                className={styles.formInput}
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
              >
                <option value="">
                  {category
                    ? '서브 카테고리 선택'
                    : '카테고리를 먼저 선택해주세요'}
                </option>
                {(SUBCATEGORIES[category] || []).map(
                  (sub: { name: string; image: string }) => (
                    <option key={sub.name} value={sub.name}>
                      {sub.name}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>판매금액 (PESO) *</label>
              <input
                className={styles.formInput}
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>재고</label>
              <input
                className={styles.formInput}
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>최소주문량</label>
              <input
                className={styles.formInput}
                type="number"
                value={minorder}
                onChange={(e) => setMinorder(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>상품 설명</label>
            <textarea
              className={`${styles.formInput} ${styles.formTextarea}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className={styles.buttonGroup}>
            <button
              className={`${styles.uploadButton} ${styles.submitButton}`}
              type="submit"
            >
              수정 완료
            </button>
            <button
              className={`${styles.uploadButton} ${styles.cancelButton}`}
              type="button"
              onClick={() => router.push('/admin/products/manage')}
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEditPage;
