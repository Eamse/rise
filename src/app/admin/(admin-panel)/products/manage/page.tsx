"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { parseImageUrl } from "@/utils/imageUtils";
import styles from "./ProductManage.module.css";
import { Product } from "@/types/product";

const ProductManagePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const router = useRouter();

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products?badge=NONE");
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      if (res.ok) {
        alert("삭제 되었습니다.");
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert("삭제 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleCheck = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCheckAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`${selectedIds.length}개를 삭제 하시겠습니까?`)) return;

    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/products/${id}`, {
            method: "DELETE",
            credentials: "same-origin",
          })
        )
      );
      alert(`${selectedIds.length}개를 삭제했습니다.`);
      setProducts((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
      setSelectedIds([]);
    } catch (error) {
      console.error(error);
      alert("일부 삭제에 실패했습니다.");
    }
  };

  return (
    <div className={styles.managePage}>
      <div className={styles.manageHeader}>
        <h2 className={styles.manageTitle}>📦 일반 상품 관리</h2>
        <div>
          {selectedIds.length > 0 && (
            <button
              className={`${styles.deleteButton} ${styles.bulkDeleteButton}`}
              onClick={handleBulkDelete}
            >
              선택 삭제 ({selectedIds.length})
            </button>
          )}
          <span className={styles.manageCount}>등록된 상품 {products.length}개</span>
        </div>
      </div>

      <div className={styles.manageCard}>
        <table className={styles.manageTable}>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedIds.length === products.length && products.length > 0}
                  onChange={handleCheckAll}
                />
              </th>
              <th>ID</th>
              <th>이미지</th>
              <th>상품명</th>
              <th>가격</th>
              <th>카테고리</th>
              <th>재고</th>
              <th>삭제</th>
              <th>수정</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={9} className={styles.manageEmpty}>
                  등록된 상품이 없습니다.
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const mainImageUrl = parseImageUrl(product.imageUrl);

                return (
                  <tr key={product.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(product.id)}
                        onChange={() => handleCheck(product.id)}
                      />
                    </td>
                    <td>{product.id}</td>
                    <td>
                      {mainImageUrl ? (
                        <div className={styles.productThumb} style={{ position: 'relative', width: '50px', height: '50px' }}>
                          <Image
                            src={mainImageUrl}
                            alt={product.name}
                            fill
                            sizes="50px"
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                      ) : (
                        <div className={styles.noImage}>no img</div>
                      )}
                    </td>
                    <td>{product.name}</td>
                    <td className={styles.priceCell}>
                      {product.price.toLocaleString()}원
                    </td>
                    <td>{product.category}</td>
                    <td>{product.stock}</td>
                    <td>
                      <button
                        className={styles.deleteButton}
                        onClick={() => handleDelete(product.id)}
                      >
                        삭제
                      </button>
                    </td>
                    <td>
                      <button
                        className={styles.editButton}
                        onClick={() => router.push(`/admin/products/edit/${product.id}`)}
                      >
                        수정
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductManagePage;
