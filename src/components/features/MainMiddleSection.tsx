"use client";

import { Product } from "@/types";
import React, { useEffect, useState } from "react";
import styles from "./MainMiddleSection.module.css";
import ProductSection from "./ProductSection";

const MainMiddleSection: React.FC = () => {
  const [hotDeals, setHotDeals] = useState<Product[]>([]);
  const [topRanking, setTopRanking] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBadgedProducts = async () => {
      try {
        const [hotRes, topRes] = await Promise.all([
          fetch("/api/products?badge=HOT_DEAL"),
          fetch("/api/products?badge=TOP_RANKING"),
        ]);

        if (hotRes.ok) {
          const hotData = await hotRes.json();
          setHotDeals(hotData.products || []);
        }
        
        if (topRes.ok) {
          const topData = await topRes.json();
          setTopRanking(topData.products || []);
        }
      } catch (error) {
        console.error("Failed to fetch badged products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBadgedProducts();
  }, []);

  if (isLoading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading data...</div>;
  }

  // Keep rendering sections even when data is empty.
  return (
    <div className={styles["main-middle-section-wrapper"]}>
      <ProductSection
        title="Hot Deals"
        products={hotDeals}
        viewMoreLink="/products?badge=HOT_DEAL"
      />
      <ProductSection
        title="Top Ranking"
        products={topRanking}
        viewMoreLink="/products?badge=TOP_RANKING"
      />
    </div>
  );
};

export default MainMiddleSection;
