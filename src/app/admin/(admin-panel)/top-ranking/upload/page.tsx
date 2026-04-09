'use client';

import { useRef, useState } from 'react';
import { CATEGORIES, SUBCATEGORIES } from '@/constants/categoryData';
import styles from './ProductUpload.module.css';

const TopRankingUploadPage: React.FC = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [minorder, setMinorder] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [discountRate, setDiscountRate] = useState('0');
  const [loading, setLoading] = useState(false);
  const [thumbImages, setThumbImages] = useState<File[]>([]);
  const [detailImages, setDetailImages] = useState<File[]>([]);

  const imageRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setName('');
    setPrice('');
    setMinorder('');
    setCategory('');
    setSubcategory('');
    setStock('');
    setDescription('');
    setDiscountRate('0');
    setThumbImages([]);
    setDetailImages([]);
    if (imageRef.current) imageRef.current.value = '';
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('price', price);
      formData.append('minorder', minorder);
      formData.append('category', category);
      formData.append('subcategory', subcategory);
      formData.append('stock', stock);
      formData.append('description', description);
      formData.append('discountRate', discountRate);
      formData.append('badge', 'TOP_RANKING'); // TOP 랭킹 뱃지 강제 부여

      thumbImages.forEach((file) => formData.append('image', file));
      detailImages.forEach((file) => formData.append('detailImage', file));

      setLoading(true);
      const res = await fetch('/api/products', {
        method: 'POST',
        credentials: 'same-origin',
        body: formData,
      });

      if (res.ok) {
        alert('TOP 랭킹 상품이 등록되었습니다! 🎉');
        resetForm();
      } else {
        const data = await res.json();
        alert(data.message || '등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('상품 등록 에러:', error);
      alert('서버 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.uploadPage}>
      <div className={styles.uploadCard}>
        <h2 className={styles.uploadTitle}>🏆 TOP 랭킹 상품 등록</h2>
        <p className={styles.uploadSubtitle}>
          가장 인기 있는 프리미엄 상품을 등록해주세요.
        </p>

        <form className={styles.uploadForm} onSubmit={handleUpload}>
          {/* Left Column */}
          <div className={styles.formLeft}>
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>이미지 자산</h3>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>썸네일 이미지</label>
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
                      alert(
                        '파일이 너무 큽니다. 50mb 이하 이미지를 선택해주세요.',
                      );
                      e.target.value = '';
                      return;
                    }
                    setThumbImages(filesArray);
                  }}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  상세 이미지 (여러 장 선택 가능)
                </label>
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
            </div>
          </div>

          {/* Right Column */}
          <div className={styles.formRight}>
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>기본 정보</h3>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>상품명 *</label>
                <input
                  className={styles.formInput}
                  type="text"
                  placeholder="상품명을 입력하세요"
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
                      (sub: { name: string }) => (
                        <option key={sub.name} value={sub.name}>
                          {sub.name}
                        </option>
                      ),
                    )}
                  </select>
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>판매 정보</h3>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>판매금액 (PESO) *</label>
                  <input
                    className={styles.formInput}
                    type="number"
                    placeholder="0"
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
                    placeholder="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>최소주문량</label>
                  <input
                    className={styles.formInput}
                    type="number"
                    placeholder="1"
                    value={minorder}
                    onChange={(e) => setMinorder(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>할인율 (%)</label>
                  <input
                    className={styles.formInput}
                    type="number"
                    placeholder="0"
                    min="0"
                    max="100"
                    value={discountRate}
                    onChange={(e) => setDiscountRate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>추가 설명</h3>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>상품 상세 설명</label>
                <textarea
                  className={`${styles.formInput} ${styles.formTextarea}`}
                  placeholder="상품에 대한 설명을 최대한 자세히 입력하세요..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Footer Area */}
          <div className={styles.formFooter}>
            <button
              className={styles.uploadButton}
              type="submit"
              disabled={loading}
            >
              {loading ? '등록 중...' : '상품 등록하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TopRankingUploadPage;
