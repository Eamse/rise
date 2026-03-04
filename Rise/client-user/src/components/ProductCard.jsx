import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product }) => {
  // product 객체에 image, price, minOrder, name 속성이 있다고 가정합니다.
  return (
    <a href="#" className="product-card">
      <div className="product-card-image-wrapper">
        <img src={product.image} alt={product.name} />
      </div>
      <div className="product-card-info">
        <p className="product-card-price">
          {new Intl.NumberFormat("ko-KR", {
            style: "currency",
            currency: "KRW",
          }).format(product.price)}
        </p>
        <p className="product-card-moq">최소 주문: {product.minOrder}개</p>
      </div>
    </a>
  );
};

export default ProductCard;
