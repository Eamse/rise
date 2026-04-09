"use client";

import { forwardRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { CATEGORIES, ProductImage, SUBCATEGORIES } from "@/constants/categoryData";
import Image from "next/image";
import styles from "./MegaMenu.module.css";

interface MegaMenuProps {
  onClose?: () => void;
}

const MegaMenu = forwardRef<HTMLDivElement, MegaMenuProps>((props, ref) => {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].name);
  const router = useRouter();
  const { t } = useTranslation();

  const navLinks = [
    { href: "/brands", label: t("header.nav.brands", "Brands") },
    { href: "/inquiry", label: t("header.nav.inquiry", "Contact") },
    { href: "/about", label: t("header.nav.about", "About Us") },
    { href: "/notices", label: t("header.nav.notices", "Notices") },
  ];

  const handleCategoryClick = (catName: string) => {
    setActiveCategory(catName);
  };

  const handleSubClick = (catName: string, subName: string) => {
    const params = new URLSearchParams();
    params.set("category", catName);
    params.set("sub", subName);
    router.push(`/products?${params.toString()}`);
    props.onClose?.();
  };

  return (
    <div className={styles.megaDropdown} ref={ref}>
      {/* Mobile Header */}
      <div className={styles.mobileOnly}>
        <div className={styles.mobileHeader}>
          <div className={styles.mobileHeaderLeft}>
            <h2>Category</h2>
            <div className={styles.mobileNavLinks}>
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={styles.mobileNavLink}
                  onClick={props.onClose}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <span className={styles.closeBtn} onClick={props.onClose}>
            ✕
          </span>
        </div>
      </div>


      <div className={styles.megaMenuContainer}>
        <div className={styles.categorySidebar}>
          {CATEGORIES.map((category) => (
            <a
              href="#"
              className={`${styles.categoryItem} ${activeCategory === category.name ? styles.active : ""}`}
              key={category.name}
              onClick={(e) => {
                e.preventDefault();
                handleCategoryClick(category.name);
              }}
            >
              <div className={styles.categoryIcon} style={{ position: "relative", overflow: "hidden" }}>
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="36px"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <span className={styles.categoryText}>{category.name}</span>
            </a>
          ))}

        </div>

        <div className={styles.subcategoryPanel}>
          <div className={styles.subcategoryHeader}>
            <h3>
              {activeCategory} <span>{">"}</span>
            </h3>
          </div>
          <div className={styles.subcategoryGrid}>
            {(SUBCATEGORIES[activeCategory] || SUBCATEGORIES.DEFAULT || []).map(
              (sub) => (
                <div
                  className={styles.subcategoryCard}
                  key={sub.name}
                  onClick={() => handleSubClick(activeCategory, sub.name)}
                >
                  <div className={styles.subcategoryImage}>
                    <Image
                      src={ProductImage}
                      alt={sub.name}
                      fill
                      sizes="100px"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <p className={styles.subcategoryName}>{sub.name}</p>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
});


MegaMenu.displayName = "MegaMenu";

export default MegaMenu;
