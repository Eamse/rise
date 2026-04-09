import React from "react";
import Link from "next/link";
import ProductCard from "../common/ProductCard";
import { Product } from "@/types";
import styles from "./ProductSection.module.css";

interface ProductSectionProps {
  title: string;
  products: Product[];
  viewMoreLink: string;
}

const ProductSection: React.FC<ProductSectionProps> = ({ title, products, viewMoreLink }) => {
  return (
    <section className={styles["product-section"]}>
      <header className={styles["product-section-header"]}>
        <h2 className={styles["product-section-title"]}>{title}</h2>
        <Link href={viewMoreLink} className={styles["product-section-view-more"]}>
          See More ›
        </Link>
      </header>
      <div className={styles["product-section-grid"]}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default ProductSection;

