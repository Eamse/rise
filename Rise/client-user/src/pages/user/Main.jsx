import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdBanner from "../../components/common/AdBanner";
import {
  CATEGORIES,
  SUBCATEGORIES,
} from "../../components/constants/categoryData";
import MainMiddleSection from "../../components/MainMiddleSection";
import "./Main.css";

function Main() {
  const [activeCategory, setActiveCategory] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const navigate = useNavigate();

  // 서브카테고리 클릭 → /products?category=...&sub=... 이동
  const handleSubClick = (catName, subName) => {
    const params = new URLSearchParams();
    params.set("category", catName);
    params.set("sub", subName);
    navigate(`/products?${params.toString()}`);
  };
  const featuredProducts = [
    SUBCATEGORIES["엔진 부품"][0],
    SUBCATEGORIES["제동 장치"][0],
    SUBCATEGORIES["소모품 및 오일류"][0],
  ].slice(0, 3);

  return (
    <main className="main-contents">
      <div className="main-content-wrapper">
        <div className="main-contents-container">
          <div
            className="main-container"
            onMouseLeave={() => setShowDetail(false)}
          >
            {/* 왼쪽 카테고리: 높이를 고정하고 스크롤 적용 */}
            <aside className="category-sidebar sub">
              <ul className="category-list">
                {CATEGORIES.map((cat) => (
                  <li
                    key={cat.name}
                    className={`category-item ${activeCategory === cat.name ? "active" : ""}`}
                    onClick={() => {
                      setActiveCategory(cat.name);
                      setShowDetail(true);
                    }}
                  >
                    <span className="cat-icon">{cat.icon}</span>
                    <span className="cat-name">{cat.name}</span>
                    <span className="cat-arrow">›</span>
                  </li>
                ))}
              </ul>
            </aside>

            {/* 오른쪽 기본 패널: 카테고리 호버 전에 보여줄 콘텐츠 */}
            {!showDetail && (
              <section className="category-default-panel">
                <div className="default-panel-header">
                  <span className="title">자주 검색되는 제품</span>
                </div>
                <div className="default-panel-grid">
                  {featuredProducts.map((product, index) => (
                    <a href="#" className="default-product-card" key={index}>
                      <span className="cat-name">{product.name}</span>
                      <div className="image-wrapper">
                        <img
                          src={`https://via.placeholder.com/80?text=${product.image}`}
                          alt={product.name}
                        />
                      </div>
                    </a>
                  ))}
                  <div className="image-wrapper">
                    <img src={AdBanner} alt="광고 베너 들어갈 자리" />
                  </div>
                </div>
              </section>
            )}

            {showDetail && activeCategory && (
              <section className="category-detail-panel">
                <div className="detail-header">
                  <h3>{activeCategory} 인기 제품</h3>
                </div>
                <div className="detail-grid">
                  {(SUBCATEGORIES[activeCategory] || SUBCATEGORIES.기본).map(
                    (sub, index) => (
                      <div
                        className="detail-item"
                        key={index}
                        onClick={() => handleSubClick(activeCategory, sub.name)}
                        style={{ cursor: "pointer" }}
                      >
                        <img
                          src={`https://via.placeholder.com/80?text=${sub.image}`}
                          alt={sub.name}
                        />
                        <span>{sub.name}</span>
                      </div>
                    ),
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
        <MainMiddleSection />
      </div>
    </main>
  );
}

export default Main;
