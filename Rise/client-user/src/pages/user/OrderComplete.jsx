import { useLocation, useNavigate } from "react-router-dom";
import "./OrderComplete.css";

function OrderComplete() {
  const { state } = useLocation();
  const orderId = state?.orderId;
  const navigate = useNavigate();

  return (
    <div className="order-complete-container">
      <div className="order-complete-card">
        <div className="order-icon">✓</div>
        <h2>주문이 완료되었습니다.</h2>
        <p className="order-number">주문번호: {orderId}</p>

        <div className="order-buttons">
          <button className="btn-home" onClick={() => navigate("/")}>
            메인 페이지로 가기
          </button>
          <button
            className="btn-products"
            onClick={() => navigate("/products")}
          >
            상품 페이지로 가기
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderComplete;
