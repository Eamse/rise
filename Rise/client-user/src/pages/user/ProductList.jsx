import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SUBCATEGORIES } from "../../components/constants/categoryData";
import "./ProductList.css";

function ProductList() {
  const [products, setProducts] = useState([]);

  // URL에서 ?category=xxx&sub=xxx 읽기
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get("category") || "";
  const subFromUrl = searchParams.get("sub") || "";

  // ── 필터 상태 ─────────────────────────────────
  const [selectedSubcategory, setSelectedSubcategory] = useState(subFromUrl);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);

  const [appliedMinPrice, setAppliedMinPrice] = useState("");
  const [appliedMaxPrice, setAppliedMaxPrice] = useState("");
  const [appliedMinOrder, setAppliedMinOrder] = useState("");

  // URL이 바뀌면 서브카테고리 선택도 초기화
  useEffect(() => {
    setSelectedSubcategory(subFromUrl);
  }, [subFromUrl]);

  // ── 서버에서 상품 불러오기 ────────────────────
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data.products));
  }, []);

  // ── 필터 적용 ─────────────────────────────────
  const filtered = products.filter((product) => {
    // URL에서 읽은 대카테고리로 필터
    if (categoryFromUrl && product.category !== categoryFromUrl) return false;
    // 사이드바에서 선택한 서브카테고리로 필터
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

  // ── 필터 초기화 ───────────────────────────────
  const handleReset = () => {
    setSelectedSubcategory("");
    setMinPrice("");
    setMaxPrice("");
    setMinOrder("");
    setAppliedMinPrice("");
    setAppliedMaxPrice("");
    setAppliedMinOrder("");
    setInStockOnly(false);
  };

  // 헤더 제목
  const pageTitle = selectedSubcategory
    ? selectedSubcategory
    : categoryFromUrl
      ? categoryFromUrl
      : "전체 상품";

  // 현재 카테고리의 서브카테고리 목록
  const subList = categoryFromUrl ? SUBCATEGORIES[categoryFromUrl] || [] : [];

  return (
    <div className="product-list-page">
      {/* ─── 왼쪽 필터 사이드바 ─── */}
      <aside className="filter-sidebar">
        <div className="filter-header">
          <span className="filter-title">필터</span>
          <button className="filter-reset" onClick={handleReset}>
            초기화
          </button>
        </div>

        {/* 재고 */}
        <div className="filter-section">
          <label className="filter-checkbox-label">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
            />
            <span>재고 있는 상품만</span>
          </label>
        </div>

        <div className="filter-divider" />

        {/* 범주 - 선택된 대카테고리의 서브카테고리만 표시 */}
        {subList.length > 0 && (
          <div className="filter-section">
            <p className="filter-section-title">범주</p>
            <ul className="filter-category-list">
              <li>
                <button
                  className={`filter-cat-item ${!selectedSubcategory ? "active" : ""}`}
                  onClick={() => setSelectedSubcategory("")}
                >
                  전체
                </button>
              </li>
              {subList.map((sub) => (
                <li key={sub.name}>
                  <button
                    className={`filter-cat-item ${selectedSubcategory === sub.name ? "active" : ""}`}
                    onClick={() => setSelectedSubcategory(sub.name)}
                  >
                    {sub.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="filter-divider" />

        {/* 가격 */}
        <div className="filter-section">
          <p className="filter-section-title">가격 (원)</p>
          <div className="filter-price-row">
            <input
              className="filter-input"
              type="number"
              placeholder="최소"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <span className="filter-dash">~</span>
            <input
              className="filter-input"
              type="number"
              placeholder="최대"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
            <button
              className="filter-ok"
              onClick={() => {
                setAppliedMinPrice(minPrice);
                setAppliedMaxPrice(maxPrice);
              }}
            >
              OK
            </button>
          </div>
        </div>

        <div className="filter-divider" />

        {/* 최소 주문량 */}
        <div className="filter-section">
          <p className="filter-section-title">최소 주문량</p>
          <div className="filter-price-row">
            <input
              className="filter-input"
              type="number"
              placeholder="예: 10"
              value={minOrder}
              onChange={(e) => setMinOrder(e.target.value)}
            />
            <button
              className="filter-ok"
              onClick={() => setAppliedMinOrder(minOrder)}
            >
              OK
            </button>
          </div>
        </div>
      </aside>

      {/* ─── 오른쪽 상품 영역 ─── */}
      <div className="product-content">
        <div className="product-list-header">
          <h2 className="product-list-title">{pageTitle}</h2>
          <span className="product-count">{filtered.length}개 상품</span>
        </div>

        {filtered.length === 0 ? (
          <div className="product-empty">
            <p>😢 조건에 맞는 상품이 없습니다.</p>
          </div>
        ) : (
          <ul className="product-grid">
            {filtered.map((product) => {
              let mainImageUrl = null;
              if (product.imageUrl) {
                try {
                  const parsed = JSON.parse(product.imageUrl);
                  mainImageUrl = Array.isArray(parsed) ? parsed[0] : parsed;
                } catch (error) {
                  mainImageUrl = product.imageUrl;
                }
              }

              return (
                <li
                  key={product.id}
                  className="product-card"
                  onClick={() => navigate(`/products/${product.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="product-card-image">
                    {mainImageUrl ? (
                      <img src={mainImageUrl} alt={product.name} />
                    ) : (
                      <div className="product-no-image">📦</div>
                    )}
                  </div>
                  <div className="product-card-info">
                    <p className="product-card-category">{product.category}</p>
                    <p className="product-card-name">{product.name}</p>
                    <p className="product-card-price">
                      {Number(product.price).toLocaleString()}원
                    </p>
                    <p className="product-card-moq">
                      최소 {product.minorder}개
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
}

export default ProductList;
