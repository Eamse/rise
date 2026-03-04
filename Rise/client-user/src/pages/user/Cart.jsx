import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Cart.css";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [checkedIds, setCheckedIds] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    const fetchCartData = async () => {
      try {
        const response = await fetch(`/api/cart?userId=${userId}`);
        const data = await response.json();
        if (response.ok) {
          setCartItems(data);
          setCheckedIds(new Set(data.map((item) => item.id)));
        }
      } catch (error) {
        console.error("통신 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCartData();
  }, []);

  // ── 전체 선택 / 해제 ─────────────────────────
  const isAllChecked =
    cartItems.length > 0 && checkedIds.size === cartItems.length;

  const handleCheckAll = () => {
    if (isAllChecked) {
      setCheckedIds(new Set());
    } else {
      setCheckedIds(new Set(cartItems.map((item) => item.id)));
    }
  };

  // ── 개별 체크박스 ─────────────────────────────
  const handleCheck = (id) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // ── 아이템 삭제 ──────────────────────────────
  const handleDelete = async (cartItemId) => {
    if (!window.confirm("이 상품을 장바구니에서 제거할까요?")) return;
    try {
      const res = await fetch(`/api/cart/${cartItemId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
        setCheckedIds((prev) => {
          const next = new Set(prev);
          next.delete(cartItemId);
          return next;
        });
      } else {
        alert("삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("삭제 오류:", error);
    }
  };

  // ── 수량 변경 ────────────────────────────────
  const handleQuantity = async (item, delta) => {
    const minQ = item.product.minorder || 1;
    const newQty = item.quantity + delta;
    if (newQty < minQ) {
      alert(`최소 주문 수량은 ${minQ}개 입니다.`);
      return;
    }
    try {
      const res = await fetch(`/api/cart/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQty }),
      });
      if (res.ok) {
        setCartItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, quantity: newQty } : i)),
        );
      }
    } catch (error) {
      console.error("수량 변경 오류:", error);
    }
  };

  // ── 선택된 항목 합계 (인보이스용) ─────────────
  const selectedItems = cartItems.filter((item) => checkedIds.has(item.id));
  const selectedTotal = selectedItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  if (isLoading)
    return (
      <div className="cart-loading">장바구니를 불러오는 중입니다... 🛒</div>
    );

  return (
    <div className="cart-page-container">
      {/* ── 상단 헤더 ── */}
      <div className="cart-page-header">
        <button className="cart-back-btn" onClick={() => navigate(-1)}>
          &lt;
        </button>
        <h1 className="cart-page-title">장바구니 ({cartItems.length})</h1>
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <p>장바구니가 텅 비어있어요!</p>
          <button className="go-shop-btn" onClick={() => navigate("/products")}>
            쇼핑하러 가기
          </button>
        </div>
      ) : (
        <div className="cart-layout">
          {/* ── 좌측: 상품 목록 ── */}
          <div className="cart-left">
            {/* 전체 선택 바 */}
            <div className="cart-select-all-bar">
              <label className="cart-checkbox-label">
                <input
                  type="checkbox"
                  checked={isAllChecked}
                  onChange={handleCheckAll}
                />
                <span>
                  전체선택 ({checkedIds.size}/{cartItems.length})
                </span>
              </label>
            </div>

            {/* 아이템 목록 */}
            {cartItems.map((item) => {
              let imageUrl = null;
              if (item.product.imageUrl) {
                try {
                  const parsed = JSON.parse(item.product.imageUrl);
                  imageUrl = Array.isArray(parsed) ? parsed[0] : parsed;
                } catch (e) {
                  imageUrl = item.product.imageUrl;
                }
              }

              return (
                <div key={item.id} className="cart-item-card">
                  {/* 체크박스 */}
                  <input
                    type="checkbox"
                    className="cart-item-checkbox"
                    checked={checkedIds.has(item.id)}
                    onChange={() => handleCheck(item.id)}
                  />

                  {/* 상품 이미지 */}
                  <div className="cart-item-img-wrap">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.product.name}
                        className="cart-item-img"
                        onClick={() => navigate(`/products/${item.productId}`)}
                      />
                    ) : (
                      <div className="cart-no-img">📦</div>
                    )}
                  </div>

                  {/* 상품 정보 */}
                  <div className="cart-item-info">
                    <p
                      className="cart-item-name"
                      onClick={() => navigate(`/products/${item.productId}`)}
                    >
                      {item.product.name}
                    </p>
                    <p className="cart-item-category">
                      {item.product.category}
                    </p>
                    <p className="cart-item-unit-price">
                      단가: {item.product.price.toLocaleString()}원
                    </p>

                    {/* 수량 컨트롤 */}
                    <div className="cart-qty-control">
                      <button onClick={() => handleQuantity(item, -1)}>
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => handleQuantity(item, +1)}>
                        +
                      </button>
                    </div>
                  </div>

                  {/* 우측: 합계 가격 + 삭제 */}
                  <div className="cart-item-right">
                    <p className="cart-item-total-price">
                      {(item.product.price * item.quantity).toLocaleString()}원
                    </p>
                    <button
                      className="cart-item-delete-btn"
                      onClick={() => handleDelete(item.id)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── 우측: 인보이스 패널 (sticky) ── */}
          <aside className="cart-invoice">
            <h2 className="invoice-title">주문 예상 금액</h2>

            <div className="invoice-rows">
              <div className="invoice-row">
                <span>총 상품 가격</span>
                <span>{selectedTotal.toLocaleString()}원</span>
              </div>
              <div className="invoice-row">
                <span>총 배송비</span>
                <span className="free-shipping">+0원</span>
              </div>
            </div>

            <div className="invoice-divider" />

            <div className="invoice-total-row">
              <span>최종 결제 금액</span>
              <strong>{selectedTotal.toLocaleString()}원</strong>
            </div>

            <button
              className="invoice-order-btn"
              disabled={checkedIds.size === 0}
              onClick={() => {
                const selectedItems = cartItems.filter((item) =>
                  checkedIds.has(item.id),
                );
                navigate("/checkout", { state: { items: selectedItems } });
              }}
            >
              {checkedIds.size === 0
                ? "상품을 선택해주세요"
                : `${checkedIds.size}개 상품 주문하기`}
            </button>

            <p className="invoice-notice">
              * B2B 거래 특성상 별도 인보이스가 발행됩니다.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}

export default Cart;
