import { useRef, useState } from "react";
import { CATEGORIES, SUBCATEGORIES } from "../../constants/categoryData";
import "./ProductUpload.css";

function ProductUpload() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [minorder, setMinorder] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [thumbImage, setThumbImage] = useState([]);
  const [detailImages, setDetailImages] = useState([]);

  const imageRef = useRef(null);

  const resetForm = () => {
    setName("");
    setPrice("");
    setMinorder("");
    setCategory("");
    setSubcategory("");
    setStock("");
    setDescription("");
    setThumbImage([]);
    setDetailImages([]);
    imageRef.current.value = "";
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("minorder", minorder);
      formData.append("category", category);
      formData.append("subcategory", subcategory);
      formData.append("stock", stock);
      formData.append("description", description);
      if (thumbImage) {
        thumbImage.forEach((file) => formData.append("image", file));
      }
      detailImages.forEach((file) => formData.append("detailImage", file));

      const token = localStorage.getItem("adminToken");
      setLoading(true);
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        alert("상품이 등록되었습니다! 🎉");
        resetForm();
      } else {
        const data = await res.json();
        alert(data.message || "등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("상품 등록 에러:", error);
      alert(
        "서버 연결에 실패했습니다. 백엔드 서버가 켜져 있는지 확인해주세요.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-page">
      <div className="upload-card">
        <h2 className="upload-title">📦 상품 등록</h2>
        <p className="upload-subtitle">새로운 상품 정보를 입력해주세요.</p>

        <form className="upload-form" onSubmit={handleUpload}>
          {/* 썸네일 이미지 */}
          <div className="form-group">
            <label className="form-label">썸네일 이미지</label>
            <input
              className="form-input"
              type="file"
              multiple
              ref={imageRef}
              accept="image/*"
              name="image"
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

          {/* 상세 이미지 */}
          <div className="form-group">
            <label className="form-label">
              상세 이미지 (여러 장 선택 가능)
            </label>
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

          {/* 상품명 */}
          <div className="form-group">
            <label className="form-label">상품명 *</label>
            <input
              className="form-input a"
              type="text"
              placeholder="상품명을 입력하세요"
              value={name}
              name="name"
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* 카테고리 2개 나란히 */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">카테고리</label>
              <select
                className="form-input a"
                value={category}
                name="category"
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
            <div className="form-group">
              <label className="form-label">서브 카테고리</label>
              <select
                className="form-input a"
                value={subcategory}
                name="subcategory"
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

          {/* 가격 / 재고 / 최소주문 나란히 */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">판매금액 (원) *</label>
              <input
                className="form-input a"
                type="number"
                placeholder="0"
                value={price}
                name="price"
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">재고</label>
              <input
                className="form-input a"
                type="number"
                placeholder="0"
                value={stock}
                name="stock"
                onChange={(e) => setStock(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">최소주문량</label>
              <input
                className="form-input a"
                type="number"
                placeholder="1"
                value={minorder}
                name="minorder"
                onChange={(e) => setMinorder(e.target.value)}
              />
            </div>
          </div>

          {/* 상품 설명 */}
          <div className="form-group">
            <label className="form-label">상품 설명</label>
            <textarea
              className="form-input form-textarea"
              placeholder="상품에 대한 설명을 입력하세요..."
              value={description}
              name="description"
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button className="upload-button" type="submit" disabled={loading}>
            {loading ? "등록 중..." : "상품 등록하기"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProductUpload;
