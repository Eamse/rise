import React, { useState, useEffect } from "react";
import ProductSection from "./ProductSection";
import "./MainMiddleSection.css";

// 임시 데이터입니다. 실제 애플리케이션에서는 백엔드에서 가져옵니다.
const mockHotDeals = Array.from({ length: 12 }, (_, i) => ({
  id: `hd-${i}`,
  name: `인기 특가 상품 ${i + 1}`,
  price: (Math.floor(Math.random() * 10) + 1) * 10000,
  minOrder: (Math.floor(Math.random() * 5) + 1) * 10,
  image: `https://via.placeholder.com/200x200?text=Hot+Deal+${i + 1}`,
}));

const mockTopRanking = Array.from({ length: 12 }, (_, i) => ({
  id: `tr-${i}`,
  name: `Top 랭킹 상품 ${i + 1}`,
  price: (Math.floor(Math.random() * 20) + 5) * 10000,
  minOrder: (Math.floor(Math.random() * 10) + 1) * 5,
  image: `https://via.placeholder.com/200x200?text=Top+Rank+${i + 1}`,
}));

const MainMiddleSection = () => {
  const [hotDeals, setHotDeals] = useState([]);
  const [topRanking, setTopRanking] = useState([]);

  // 백엔드에서 데이터를 가져오는 것을 시뮬레이션합니다.
  useEffect(() => {
    // 실제 앱에서는 다음과 같이 API를 호출합니다.
    // const fetchProducts = async () => {
    //   const hotDealsData = await fetch('/api/products/hot-deals?limit=12').then(res => res.json());
    //   setHotDeals(hotDealsData);
    //
    //   const topRankingData = await fetch('/api/products/top-ranking?limit=12').then(res => res.json());
    //   setTopRanking(topRankingData);
    // };
    // fetchProducts();

    // 지금은 임시 데이터를 사용합니다.
    setHotDeals(mockHotDeals);
    setTopRanking(mockTopRanking);
  }, []);

  return (
    <div className="main-middle-section-wrapper">
      <ProductSection
        title="인기 특가"
        products={hotDeals}
        viewMoreLink="/products/hot-deals"
      />
      <ProductSection
        title="Top 랭킹"
        products={topRanking}
        viewMoreLink="/products/top-ranking"
      />
    </div>
  );
};

export default MainMiddleSection;
