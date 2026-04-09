"use client";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { CartItem } from "@/types";
import { sendAuthenticatedRequest } from "@/utils/api";
import { parseImageUrl } from "@/utils/imageUtils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./Cart.module.css";

const CartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [checkedIds, setCheckedIds] = useState(new Set<number>());
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Please log in.");
      router.push("/login");
      return;
    }

    const fetchCartData = async () => {
      try {
        const response = await sendAuthenticatedRequest(`/api/cart?userId=${userId}`, "GET");
        if (!response) return;
        const data = await response.json();
        if (response.ok && Array.isArray(data)) {
          setCartItems(data);
          setCheckedIds(new Set(data.map((item: CartItem) => item.id)));
        }
      } catch (error) {
        console.error("Communication failed:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCartData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isAllChecked =
    cartItems.length > 0 && checkedIds.size === cartItems.length;

  const handleCheckAll = () => {
    if (isAllChecked) {
      setCheckedIds(new Set());
    } else {
      setCheckedIds(new Set(cartItems.map((item) => item.id)));
    }
  };

  const handleCheck = (id: number) => {
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

  const handleDelete = async (cartItemId: number) => {
    if (!window.confirm("Remove this item from your cart?")) return;
    try {
      const res = await sendAuthenticatedRequest(
        `/api/cart/${cartItemId}`,
        "DELETE",
        null,
      );

      if (!res) return;
      if (res.ok) {
        setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
        setCheckedIds((prev) => {
          const next = new Set(prev);
          next.delete(cartItemId);
          return next;
        });
      } else {
        alert("Failed to delete.");
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleQuantity = async (item: CartItem, delta: number) => {
    if (!item.product) return;
    const minQ = item.product.minorder || 1;
    const newQty = item.quantity + delta;
    if (newQty < minQ) {
      alert(`Minimum order quantity is ${minQ} units.`);
      return;
    }

    try {
      const res = await sendAuthenticatedRequest(`/api/cart/${item.id}`, "PATCH", {
        quantity: newQty,
      });
      if (!res) return;
      if (res.ok) {
        setCartItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, quantity: newQty } : i)),
        );
      } else {
        const data = await res.json().catch(() => null);
        alert(data?.message || "Failed to update quantity.");
      }
    } catch (error) {
      console.error("Quantity update error:", error);
    }
  };

  const selectedItems = cartItems.filter((item) => checkedIds.has(item.id));
  const selectedTotal = selectedItems.reduce((sum, item) => {
    const p = item.product;
    if (!p) return sum;
    const discountedPrice = Math.floor(
      p.price * (1 - (p.discountRate || 0) / 100),
    );
    return sum + discountedPrice * item.quantity;
  }, 0);

  if (isLoading)
    return (
      <div className={styles.cartLoading}>
        Loading cart... 🛒
      </div>
    );

  return (
    <>
      <Header />
      <div className={styles.cartPageContainer}>
        <div className={styles.cartPageHeader}>
          <button className={styles.cartBackBtn} onClick={() => router.back()}>
            &lt;
          </button>
          <h1 className={styles.cartPageTitle}>
            Cart ({cartItems.length})
          </h1>
        </div>

        {cartItems.length === 0 ? (
          <div className={styles.emptyCart}>
            <div className={styles.emptyCartIcon}>🛒</div>
            <p>Your cart is empty!</p>
            <button
              className={styles.goShopBtn}
              onClick={() => router.push("/products")}
            >
              Go Shopping
            </button>
          </div>
        ) : (
          <div className={styles.cartLayout}>
            <div className={styles.cartLeft}>
              <div className={styles.cartSelectAllBar}>
                <label className={styles.cartCheckboxLabel}>
                  <input
                    type="checkbox"
                    checked={isAllChecked}
                    onChange={handleCheckAll}
                  />
                  <span>
                    Select All ({checkedIds.size}/{cartItems.length})
                  </span>
                </label>
              </div>

              {cartItems.map((item) => {
                if (!item.product) return null;
                let imageUrl = "";
                if (item.product.imageUrl) {
                  imageUrl = parseImageUrl(item.product.imageUrl);
                }

                return (
                  <div key={item.id} className={styles.cartItemCard}>
                    <input
                      type="checkbox"
                      className={styles.cartItemCheckbox}
                      checked={checkedIds.has(item.id)}
                      onChange={() => handleCheck(item.id)}
                    />

                    {imageUrl ? (
                      <div
                        className={styles.cartItemImgWrap}
                        style={{
                          position: "relative",
                          width: "80px",
                          height: "80px",
                        }}
                      >
                        <Image
                          src={imageUrl}
                          alt={item.product.name}
                          fill
                          sizes="80px"
                          style={{ objectFit: "cover", cursor: "pointer" }}
                          onClick={() =>
                            router.push(`/products/${item.productId}`)
                          }
                        />
                      </div>
                    ) : (
                      <div className={styles.cartNoImg}>📦</div>
                    )}

                    <div className={styles.cartItemInfo}>
                      <p
                        className={styles.cartItemName}
                        onClick={() =>
                          router.push(`/products/${item.productId}`)
                        }
                      >
                        {item.product.name}
                      </p>
                      <p className={styles.cartItemCategory}>
                        {item.product.category}
                      </p>
                      <p className={styles.cartItemUnitPrice}>
                        Unit Price:{" "}
                        {Math.floor(
                          item.product.price *
                            (1 - (item.product.discountRate || 0) / 100),
                        ).toLocaleString()}
                        PHP
                        {item.product.discountRate > 0 && (
                          <span className={styles.cartItemOriginalPrice}>
                            ({item.product.price.toLocaleString()}PHP)
                          </span>
                        )}
                      </p>

                      <div className={styles.cartQtyControl}>
                        <button onClick={() => handleQuantity(item, -1)}>
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => handleQuantity(item, +1)}>
                          +
                        </button>
                      </div>
                    </div>

                    <div className={styles.cartItemRight}>
                      <p className={styles.cartItemTotalPrice}>
                        {Math.floor(
                          item.product.price *
                            (1 - (item.product.discountRate || 0) / 100) *
                            item.quantity,
                        ).toLocaleString()}
                        PHP
                      </p>
                      <button
                        className={styles.cartItemDeleteBtn}
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <aside className={styles.cartInvoice}>
              <h2 className={styles.invoiceTitle}>Estimated Order Total</h2>
              <div className={styles.invoiceRows}>
                <div className={styles.invoiceRow}>
                  <span>Subtotal</span>
                  <span>{selectedTotal.toLocaleString()}PHP</span>
                </div>
                <div className={styles.invoiceRow}>
                  <span>Shipping</span>
                  <span className={styles.freeShipping}>+0PHP</span>
                </div>
              </div>
              <div className={styles.invoiceDivider} />
              <div className={styles.invoiceTotalRow}>
                <span>Final Total</span>
                <strong>{selectedTotal.toLocaleString()}PHP</strong>
              </div>
              <button
                className={styles.invoiceOrderBtn}
                disabled={checkedIds.size === 0}
                onClick={() => {
                  router.push("/checkout");
                }}
              >
                {checkedIds.size === 0
                  ? "Please select items"
                  : `${checkedIds.size} item(s) to checkout`}
              </button>
              <p className={styles.invoiceNotice}>
                * A separate invoice will be issued for this B2C transaction.
              </p>
            </aside>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default CartPage;
