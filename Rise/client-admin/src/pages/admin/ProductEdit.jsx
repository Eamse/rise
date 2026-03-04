import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CATEGORIES, SUBCATEGORIES } from "../../constants/categoryData";
import "./ProductEdit.css";

function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const imageRef = useRef(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [minorder, setMinorder] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [thumbImage, setThumbImage] = useState([]);
  const [thumbPreview, setThumbPreview] = useState([]);
  const [detailImages, setDetailImages] = useState([]);
  const [detailPreviews, setDetailPreviews] = useState([]);

  // 1. 기존 데이터 불러오기
  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const p = data.product;
          setName(p.name);
          setPrice(p.price);
          setMinorder(p.minorder || "");
          setCategory(p.category || "");
          setSubcategory(p.subcategory || "");
          setStock(p.stock || "");
          setDescription(p.description || "");
          if (p.imageUrl) {
            const arr = JSON.parse(p.imageUrl);
            const fullUrls = arr.map((url) => `${url}`);
            setThumbPreview(fullUrls);
          }
          if (p.detailImageUrls) {
            const arr = JSON.parse(p.detailImageUrls);
            const fullUrls = arr.map((url) => `${url}`);
            setDetailPreviews(fullUrls);
          }
        }
      })
      .catch((err) => console.error("데이터 로드 실패:", err));
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("minorder", minorder);
    formData.append("category", category);
    formData.append("subcategory", subcategory);
    formData.append("stock", stock);
    formData.append("description", description);
    if (thumbImage.length > 0) {
      thumbImage.forEach((file) => formData.append("image", file));
    }
    detailImages.forEach((file) => formData.append("detailImage", file));

    const token = localStorage.getItem("adminToken");
    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (res.ok) {
      alert("상품 정보가 수정되었습니다. ✨");
      navigate("/admin/manage");
    } else {
      const data = await res.json();
      alert(data.message || "수정에 실패했습니다.");
    }
  };

  return (
    <div className="upload-page">
      <div className="upload-card">
        <h2 className="upload-title">📝 상품 수정</h2>
        <p className="upload-subtitle">상품 정보를 수정해주세요.</p>

        <form className="upload-form" onSubmit={handleUpdate}>
          <div className="form-group">
            <label className="form-label">상품 이미지 (변경 시 선택)</label>
            {thumbPreview.length > 0 && thumbImage.length === 0 && (
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "10px",
                  flexWrap: "wrap",
                }}
              >
                {thumbPreview.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`THUMB_PREVIEW_${i}`}
                    style={{ width: "100px", borderRadius: "8px" }}
                  />
                ))}
              </div>
            )}
            <input
              className="form-input"
              type="file"
              multiple
              ref={imageRef}
              accept="image/*"
              onChange={(e) => {
                const filesArray = Array.from(e.target.files);
                const hasBigFile = filesArray.some(
                  (file) => file.size > 50 * 1024 * 1024,
                );
                if (hasBigFile) {
                  alert("파일이 너무 큽니다. 50mb 이하 이미지를 선택해주세요.");
                  e.target.value = "";
                  return;
                }
                setThumbImage(filesArray);
              }}
            />
          </div>
          {/* ----- 상세 이미지 섹션 시작 ----- */}
          <div className="form-group">
            <label className="form-label">
              상세 이미지 (여러 장 선택 가능)
            </label>

            {/* 기존 상세 이미지들 미리보기 */}
            {detailPreviews.length > 0 && detailImages.length === 0 && (
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "10px",
                  flexWrap: "wrap",
                }}
              >
                {detailPreviews.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`DETAIL_PREVIEW_${i}`}
                    style={{ width: "100px", borderRadius: "8px" }}
                  />
                ))}
              </div>
            )}

            <input
              className="form-input"
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                const filesArray = Array.from(e.target.files);
                setDetailImages(filesArray);
              }}
            />
          </div>
          {/* ----- 상세 이미지 섹션 끝 ----- */}

          <div className="form-group">
            <label className="form-label">상품명 *</label>
            <input
              className="form-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* ----- 카테고리 ----- */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">카테고리</label>
              <select
                className="form-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">카테고리 선택</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* ----- 사브 카테고리 ----- */}
            <div className="form-group">
              <label className="form-label">서브 카테고리</label>
              <select
                className="form-input"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
              >
                <option value="">
                  {category
                    ? "서브 카테고리 선택"
                    : "카테고리를 먼저 선택해주세요"}
                </option>
                {(SUBCATEGORIES[category] || []).map((sub) => (
                  <option key={sub.name} value={sub.name}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">판매금액 (원) *</label>
              <input
                className="form-input"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">재고</label>
              <input
                className="form-input"
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">최소주문량</label>
              <input
                className="form-input"
                type="number"
                value={minorder}
                onChange={(e) => setMinorder(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">상품 설명</label>
            <textarea
              className="form-input form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="button-group">
            <button className="upload-button submit" type="submit">
              수정 완료
            </button>
            <button
              className="upload-button cancel"
              type="button"
              onClick={() => navigate("/admin/manage")}
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductEdit;
