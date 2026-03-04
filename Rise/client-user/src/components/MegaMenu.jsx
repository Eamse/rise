import { forwardRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CATEGORIES, SUBCATEGORIES } from "./constants/categoryData";

const MegaMenu = forwardRef((props, ref) => {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].name);
  const navigate = useNavigate();

  // 대카테고리 클릭 → 해당 카테고리 상품 목록으로 이동
  const handleCategoryClick = (catName) => {
    setActiveCategory(catName);
  };

  // 서브카테고리 클릭 → URL에 category + sub 담아서 이동
  const handleSubClick = (catName, subName) => {
    const params = new URLSearchParams();
    params.set("category", catName);
    params.set("sub", subName);
    navigate(`/products?${params.toString()}`);
    props.onClose?.(); // 메뉴 닫기 (있을 경우)
  };

  return (
    <div className="mega-dropdown" ref={ref}>
      <div className="mega-menu-container">
        {/* 왼쪽: 카테고리 목록 */}
        <div className="category-sidebar">
          {CATEGORIES.map((category) => (
            <a
              href="#"
              className="category-item"
              key={category.name}
              onClick={(e) => {
                e.preventDefault();
                handleCategoryClick(category.name);
              }}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-text">{category.name}</span>
            </a>
          ))}
        </div>

        {/* 오른쪽: 서브카테고리 그리드 */}
        <div className="subcategory-panel">
          <div className="subcategory-header">
            <h3>{activeCategory}</h3>
            <a href="#" className="view-all">
              모든 분류 보기 ›
            </a>
          </div>
          <div className="subcategory-grid">
            {(SUBCATEGORIES[activeCategory] || SUBCATEGORIES.기본).map(
              (sub) => (
                <div
                  className="subcategory-card"
                  key={sub.name}
                  onClick={() => handleSubClick(activeCategory, sub.name)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="subcategory-image">
                    <img
                      src={`https://via.placeholder.com/120x120?text=${encodeURIComponent(
                        sub.image,
                      )}`}
                      alt={sub.name}
                    />
                  </div>
                  <p className="subcategory-name">{sub.name}</p>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

MegaMenu.displayName = "MegaMenu"; // forwardRef 사용 시 디버깅을 위해 displayName 설정

export default MegaMenu;
