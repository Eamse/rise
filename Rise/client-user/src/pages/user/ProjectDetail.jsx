import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./ProjectDetail.css";

function ProjectDetail() {
  const { id } = useParams(); // URL에서 상품 번호(id) 가져오기
  const [product, setProduct] = useState(null);
  const [mainImageIndex, setMainImageIndex] = useState(0); // 썸네일 선택 인덱스
  const [quantity, setQuantity] = useState(1); // 수량

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const p = data.product;
          if (p.imageUrl) {
            try {
              p.imageUrl = JSON.parse(p.imageUrl);
            } catch (e) {
              p.imageUrl = [p.imageUrl];
            }
          } else {
            p.imageUrl = [];
          }
          if (p.detailImageUrls) {
            try {
              p.detailImageUrls = JSON.parse(p.detailImageUrls);
            } catch (e) {
              p.detailImageUrls = [p.detailImageUrls];
            }
          } else {
            p.detailImageUrls = [];
          }

          setProduct(p);
          // 최소주문량이 있다면 기본 수량을 최소주문량으로 세팅
          if (p.minorder && p.minorder > 1) {
            setQuantity(p.minorder);
          }
        }
      });
  }, [id]);

  if (!product) return <h2>상품 정보를 불러오는 중입니다...⏳</h2>;

  const images =
    product.imageUrl && Array.isArray(product.imageUrl) ? product.imageUrl : [];

  // 수량 증감 함수
  const handleQuantity = (type) => {
    const minQ = product.minorder || 1;
    if (type === "plus") {
      setQuantity((prev) => prev + 1);
    } else if (type === "minus" && quantity > minQ) {
      setQuantity((prev) => prev - 1);
    } else if (type === "minus" && quantity <= minQ) {
      alert(`최소 주문 수량은 ${minQ}개 입니다.`);
    }
  };

  // 장바구니 담기 함수
  const handleAddToCart = async () => {
    // 🚧 TODO: 클라이언트(여기)에서 현재 로그인한 유저의 정보를 확인해야 합니다!
    const token = localStorage.getItem("token");
    // -> localStorage에서 "token"을 꺼내오고, 없다면 "로그인이 필요합니다" alert 띄우고 로그인 폼('/')으로 이동하기! (추후 리팩토링 가능)
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }
    // -> 토큰에서 userId를 해독해야 하는데, 프론트에서는 보통 저장해둔 userId나, 서버로 토큰을 보내서 검증받습니다.
    const userId = localStorage.getItem("userId");
    // -> 임시로 localStorage.getItem("userId") 같은 걸로 로그인 시 저장소에 userId를 저장했다고 가정하거나 가짜 아이디를 보냅니다. 연습을 위해 일단 임의의 아이디 써보세요.
    try {
      // 🚧 TODO: 백엔드 API (POST http://localhost:5050/api/cart) 로 fetch 날리기
      const response = await fetch("/api/cart", {
        method: "POST",
        // -> headers에 "Content-Type": "application/json" 필수!
        headers: {
          "Content-Type": "application/json",
        },
        // -> body에 JSON.stringify({ userId: "jaein", productId: product.id, quantity: quantity }) 넘겨주기
        body: JSON.stringify({
          userId: userId,
          productId: product.id,
          quantity: quantity,
        }),
      });
      // 🚧 TODO: 통신이 성공(res.ok)했다면 장바구니에 잘 담겼다는 alert 띄우기!
      if (response.ok) {
        alert("장바구니에 담았습니다.");
      } else {
        alert("장바구니 담기에 실패했습니다.");
      }
    } catch (error) {
      console.error("서버 에러 발생:", error);
      alert("서버와 통신 중 문제가 발생했습니다.");
    }
  };

  return (
    <div className="product-detail-page-b2b">
      {/* 1. 상단 브레드크럼 (경로) */}
      <div className="breadcrumb">
        <span>홈</span> {">"} <span>{product.category}</span> {">"}{" "}
        <span className="current">{product.subcategory}</span>
      </div>

      <div className="detail-top-b2b">
        {/* === 왼쪽 섹션: 갤러리 === */}
        <div className="detail-gallery-section">
          <div className="detail-thumb-list">
            {images.map((url, i) => (
              <div
                key={i}
                className={`thumb-item ${mainImageIndex === i ? "active" : ""}`}
                onMouseEnter={() => setMainImageIndex(i)}
              >
                <img src={url} alt={`썸네일${i}`} />
              </div>
            ))}
          </div>

          <div className="detail-main-image">
            {images.length > 0 ? (
              <img src={images[mainImageIndex]} alt={product.name} />
            ) : (
              <div className="no-image-box">이미지 없음</div>
            )}
          </div>
        </div>

        {/* === 오른쪽 섹션: 상품 정보 및 주문 패널 === */}
        <div className="detail-info-b2b">
          <h1 className="product-title">{product.name}</h1>

          <div className="product-meta">
            <span className="stars">★★★★★</span>
            <span className="rating-score">5.0</span>
            <span className="review-count">리뷰 (124)</span>
            <span className="meta-divider">|</span>
            <span className="sold-count">단골 판매처</span>
          </div>

          <div className="price-order-panel">
            <div className="price-row">
              <div className="price-block">
                <span className="price-label">도매 가격</span>
                <div className="price-value">
                  <span className="currency">₩</span>
                  {product.price.toLocaleString()}
                </div>
              </div>
              <div className="min-order-block">
                <span className="moq-label">MOQ (최소주문량)</span>
                <span className="moq-value">{product.minorder}개 이상</span>
              </div>
            </div>

            <div className="info-row">
              <span className="info-label">상품 기본 정보</span>
              <span className="info-value desc-text">
                {product.description.slice(0, 50)}...
              </span>
            </div>

            <div className="info-row">
              <span className="info-label">재고 현황</span>
              <span className="info-value">
                {product.stock > 0 ? (
                  <span className="in-stock">
                    재고 있음 ({product.stock}개)
                  </span>
                ) : (
                  <span className="out-of-stock">품절</span>
                )}
              </span>
            </div>

            <hr className="divider" />

            {/* 수량 및 총 가격 */}
            <div className="purchase-controls">
              <div className="quantity-wrapper">
                <span className="qty-label">수량</span>
                <div className="quantity-selector">
                  <button onClick={() => handleQuantity("minus")}>-</button>
                  <input type="text" value={quantity} readOnly />
                  <button onClick={() => handleQuantity("plus")}>+</button>
                </div>
              </div>

              <div className="total-wrapper">
                <span className="total-label">총 상품금액:</span>
                <span className="total-amount">
                  ₩{(product.price * quantity).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="action-buttons">
              <button className="btn-add-cart" onClick={handleAddToCart}>
                장바구니 달기
              </button>
              <button className="btn-buy-now">주문 시작하기</button>
            </div>

            <div className="supplier-assurance">
              <p>
                🛡️ <strong>안전 결제 보호</strong>: 주문이 시작되면 결제 대금이
                안전하게 보호됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* === 하단 상세 이미지 뷰 === */}
      <div className="detail-bottom-section">
        <div className="bottom-tabs">
          <button className="tab-btn active">상품 상세 정보</button>
          <button className="tab-btn">회사 프로필</button>
          <button className="tab-btn">고객 리뷰</button>
        </div>

        <div className="detail-images-container">
          {product.detailImageUrls &&
          Array.isArray(product.detailImageUrls) &&
          product.detailImageUrls.length > 0 ? (
            product.detailImageUrls.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`상세정보${i}`}
                className="bottom-detail-img"
              />
            ))
          ) : (
            <div className="empty-details">
              상세 이미지가 등록되지 않았습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectDetail;
