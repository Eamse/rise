import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Checkout.css";

function Checkout() {
  const { state } = useLocation();
  const items = state?.items || [];
  const navigate = useNavigate();
  const [receiver, setReceiver] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [memo, setMemo] = useState("");

  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const handleOrder = async () => {
    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: localStorage.getItem("userId"),
          items: items.map((item) => ({
            productId: item.productId,
            productName: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
          })),
          receiver,
          phone,
          address,
          memo,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        navigate("/order-complete");
      }
    } catch (error) {
      console.error("주문 실패:", error);
      alert("주문 중 오류가 발생했습니다.");
    }
  };
  return (
    <div className="checkout-container">
      <div className="checkout-form">
        <h2>배송지 정보</h2>
        <input
          placeholder="수령인"
          value={receiver}
          onChange={(e) => setReceiver(e.target.value)}
        />
        <input
          placeholder="연락처"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          placeholder="주소"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <textarea
          placeholder="배송 메모"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      </div>

      {/* 오른쪽: 주문 목록 + 합계 + 버튼 */}
      <div className="checkout-summary">
        <h2>주문 상품</h2>
        {items.map((item) => (
          <div key={item.id}>
            <span>{item.product.name}</span>
            <span>{item.quantity}개</span>
            <span>
              {(item.product.price * item.quantity).toLocaleString()}원
            </span>
          </div>
        ))}
        <p>총 금액: {totalPrice.toLocaleString()}원</p>
        <button onClick={handleOrder}>주문 완료하기</button>
      </div>
    </div>
  );
}

export default Checkout;
