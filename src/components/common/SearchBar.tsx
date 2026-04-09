"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { BsSearch } from "react-icons/bs";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
  isCompact?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ isCompact }) => {
  const { t } = useTranslation();

  return (
    <div className={`${styles.search} ${isCompact ? styles.compact : ""}`}>
      <div className={styles["search-box"]}>
        <input
          type="search"
          placeholder={t("header.search.placeholder", "Search products...")}
        />
        <div className={styles["img-and-search"]}>
          <div className={styles["img-text-box"]}>
            <div className={styles["img-upload"]}>
              <span className={styles["img-icon"]}></span>
            </div>
          </div>
          <div className={styles["search-icon"]}>
            <button
              type="button"
              aria-label={t("header.search.button", "Search")}
            >
              <div className={styles.searchicon}>
                <BsSearch size={20} color="white" />
              </div>
              {t("header.search.button", "Search")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
