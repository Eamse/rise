import { useTranslation } from "react-i18next";
import { BsSearch } from "react-icons/bs";
import { TfiCamera } from "react-icons/tfi";
import "./SearchBar.css";

function SearchBar() {
  const { t } = useTranslation();

  return (
    <div className="search">
      <div className="search-box">
        <input
          type="search"
          placeholder={t("header.search.placeholder", "검색어를 입력하세요...")}
        />
        <div className="img-and-search">
          <div className="img-text-box">
            <div className="img-upload">
              <span className="img-icon"></span>
              <div className="camera-icon">
                <TfiCamera size={20} color="currentColor" />
                <span className="img-search-text">
                  {t("header.search.imageSearch", "이미지 검색")}
                </span>
              </div>
            </div>
          </div>
          <div className="search-icon">
            <button
              type="button"
              aria-label={t("header.search.button", "검색")}
            >
              <div className="searchicon">
                <BsSearch size={20} color="white" />
              </div>
              {t("header.search.button", "검색")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchBar;
