import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProductManage.css";

function ProductManage() {
  const [products, setProducts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const navigate = useNavigate();

  // 단일 삭제
  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    const token = localStorage.getItem("adminToken");

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("서버 응답 에러");
      }
      alert("삭제 되었습니다..");
      setProducts(products.filter((p) => p.id !== id));
    } catch (error) {
      console.error("삭제 중 에러 발생:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  // 체크박스 선택
  const handleCheck = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // 전체 선택
  const handleCheckAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p.id));
    }
  };

  // 선택 삭제
  const handleBulDelete = async () => {
    if (selectedIds.length === 0) {
      return;
    }
    if (!window.confirm(`${selectedIds.length}개를 삭제 하시겠습니다까? `)) {
      return;
    }

    const token = localStorage.getItem("adminToken");

    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/products/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }),
        ),
      );
      alert(`${selectedIds.length}개를 삭제했습니다.`);

      setProducts(products.filter((p) => !selectedIds.includes(p.id)));
      setSelectedIds([]);
    } catch (error) {
      console.error("삭제 에러.:", error);
      alert(`${selectedIds.length}개 삭제를 실패했습니다.`);
    }
  };

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data.products));
  }, []);

  return (
    <div className="manage-page">
      <div className="manage-header">
        <h2 className="manage-title">📋 상품 관리</h2>
        <div>
          {selectedIds.length > 0 && (
            <button className="delete-button show" onClick={handleBulDelete}>
              선택 삭제 ({selectedIds.length})
            </button>
          )}
          <span className="manage-count">등록된 상품 {products.length}개</span>
        </div>
      </div>

      <div className="manage-card">
        <table className="manage-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={
                    selectedIds.length === products.length &&
                    products.length > 0
                  }
                  onChange={handleCheckAll}
                />
              </th>
              <th className="text-center">ID</th>
              <th className="text-center">이미지</th>
              <th className="text-center">상품명</th>
              <th className="text-center">가격</th>
              <th className="text-center">카테고리</th>
              <th className="text-center">재고</th>
              <th className="text-center">삭제</th>
              <th className="text-center">수정</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="manage-empty">
                  등록된 상품이 없습니다.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(product.id)}
                      onChange={() => handleCheck(product.id)}
                    />
                  </td>
                  <td className="text-center">{product.id}</td>
                  <td className="text-center">
                    {(() => {
                      let mainImageUrl = null;
                      if (product.imageUrl) {
                        try {
                          const parsed = JSON.parse(product.imageUrl);
                          mainImageUrl = Array.isArray(parsed)
                            ? parsed[0]
                            : parsed;
                        } catch (error) {
                          console.error("서버 에러 발생:", error);
                          mainImageUrl = product.imageUrl;
                        }
                      }
                      return mainImageUrl ? (
                        <img
                          className="product-thumb"
                          src={`${mainImageUrl}`}
                          alt={product.name}
                        />
                      ) : (
                        <div className="no-image">no img</div>
                      );
                    })()}
                  </td>
                  <td className="text-center">{product.name}</td>
                  <td className="text-center price-cell">
                    {product.price.toLocaleString()}원
                  </td>
                  <td className="text-center">{product.category}</td>
                  <td className="text-center">{product.stock}</td>
                  <td className="text-center">
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(product.id)}
                    >
                      삭제
                    </button>
                  </td>
                  <td className="text-center">
                    <button
                      className="edit-button"
                      onClick={() => navigate(`/admin/edit/${product.id}`)}
                    >
                      수정
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductManage;
