import React from "react";
import ProductCard from "./ProductCard";
import "./ProductSection.css";

const ProductSection = ({ title, products, viewMoreLink }) => {
  return (
    <section className="product-section">
      <header className="product-section-header">
        <h2 className="product-section-title">{title}</h2>
        {/* react-router-dom을 사용한다면 a 태그 대신 Link 컴포넌트를 사용합니다. */}
        <a href={viewMoreLink} className="product-section-view-more">
          더 보기 ›
        </a>
      </header>
      <div className="product-section-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default ProductSection;
