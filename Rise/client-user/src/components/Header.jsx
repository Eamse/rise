import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import i18n from "../i18n.js";
import "./Header.css";
import { CartIcon, LanguageIcon, UserIcon } from "./iconComponents";
import MegaMenu from "./MegaMenu";
import SearchBar from "./SearchBar";

function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false); // 언어 드롭다운 열림/닫힘
  const dropdownRef = useRef(null); // 카테고리 버튼 ref
  const megaMenuRef = useRef(null); // 메가메뉴 ref
  const langRef = useRef(null); // 언어 드롭다운 ref
  const headerRef = useRef(null);
  const location = useLocation();
  const { t } = useTranslation(); // ← i18n 훅
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 지원하는 언어 목록
  const LANGUAGES = [
    { code: "ko", label: "🇰🇷 한국어" },
    { code: "en", label: "🇺🇸 English" },
    { code: "vn", label: "🇻🇳 Tiếng Việt" },
    { code: "ph", label: "🇵🇭 Filipino" },
  ];

  // 언어 전환 함수
  const handleChangeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    setIsLangOpen(false);
  };

  //패아자 로드 시 토큰 확인
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  // 스크롤 시 헤더 영역 검색 기능 압&다운
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
        document.body.classList.add("scrolled-header");
      } else {
        setIsScrolled(false);
        document.body.classList.remove("scrolled-header");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.classList.remove("scrolled-header");
    };
  }, []);

  const UtilsMenu = (
    <div className="header-utils">
      {/* 🌐 언어 선택 드롭다운 */}
      <div className="lang-switcher" ref={langRef}>
        <button
          className="icon-button lang-button"
          onClick={() => setIsLangOpen((prev) => !prev)}
          aria-label={t("header.utils.languageLabel")}
        >
          <LanguageIcon size={24} color="currentColor" />
          <span className="lang-current">
            {t("header.utils.languageValue")}
          </span>
        </button>

        {/* 드롭다운 메뉴 — isLangOpen이 true일 때만 표시 */}
        {isLangOpen && (
          <ul className="lang-dropdown">
            {LANGUAGES.map((lang) => (
              <li key={lang.code}>
                <button
                  className={`lang-option ${i18n.language === lang.code ? "active" : ""}`}
                  onClick={() => handleChangeLanguage(lang.code)}
                >
                  {lang.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Link
        to="/cart"
        className="icon-button"
        aria-label={t("header.utils.cart")}
      >
        <CartIcon size={24} color="currentColor" />
      </Link>
      {isLoggedIn ? (
        <button className="signup-button" onClick={handleLogout}>
          로그아웃
        </button>
      ) : (
        <>
          <Link
            to="/login"
            className="icon-button login"
            aria-label={t("header.utils.login")}
          >
            <UserIcon size={24} color="currentColor" />
            {t("header.utils.login")}
          </Link>

          <Link to="/Signup" className="signup-button">
            {t("header.utils.signup")}
          </Link>
        </>
      )}
    </div>
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedButton = dropdownRef.current?.contains(event.target);
      const clickedMenu = megaMenuRef.current?.contains(event.target);
      const clickedLang = langRef.current?.contains(event.target);

      if (!clickedButton && !clickedMenu) {
        setIsDropdownOpen(false);
      }
      if (!clickedLang) {
        setIsLangOpen(false); // 언어 드롭다운 외부 클릭 시 닫기
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 메인 페이지가 아닐 때는 항상 스크롤된 상태(상단 작은 검색바)로 취급합니다.
  const isHeaderScrolled = isScrolled || location.pathname !== "/";

  return (
    <header
      ref={headerRef}
      className={`header ${isHeaderScrolled ? "scrolled" : ""}`}
    >
      {/* 첫 번째 행: 로고와 우측 유틸리티 메뉴 */}
      <div className="header-top">
        <div className="header-container">
          {/* 왼쪽: 로고 */}
          <div className="header-logo">
            <a href="/">
              <img src="RISE AUTOPARTS-logo.png" alt="RISE AUTOPARTS" />
            </a>
          </div>

          {/* 오른쪽: 유틸리티 메뉴 */}
          {isHeaderScrolled && <SearchBar />}
          {UtilsMenu}
        </div>
      </div>

      {/* 두 번째 행: 네비게이션 메뉴 (모든 페이지에서 표시) */}
      <div className="header-nav">
        <div className="header-container">
          {/* 왼쪽 메뉴 */}
          <nav className="nav-left">
            <div className="nav-item-wrapper">
              <button
                ref={dropdownRef}
                className="nav-item categories"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
              >
                <span className="hamburger-icon">☰</span>
                {t("header.nav.allCategories")}
              </button>
            </div>
            <a href="#" className="nav-item">
              {t("header.nav.featuredSelection")}
            </a>
            <a href="#" className="nav-item">
              {t("header.nav.tradeAssurance")}
            </a>
          </nav>

          {/* 오른쪽 메뉴 */}
          <nav className="nav-right">
            <a href="#" className="nav-item">
              {t("header.nav.buyerCentral")}
            </a>
            <a href="#" className="nav-item">
              {t("header.nav.helpCenter")}
            </a>
            <a href="#" className="nav-item">
              {t("header.nav.appAndPlatform")}
            </a>
            <a href="#" className="nav-item">
              {t("header.nav.sellOn")}
            </a>
          </nav>
        </div>

        {isDropdownOpen && (
          <MegaMenu
            ref={megaMenuRef}
            onClose={() => setIsDropdownOpen(false)}
          />
        )}
      </div>

      {/* 세 번째 행: 탭 네비게이션 (메인페이지에서만 표시) */}
      {location.pathname === "/" && !isScrolled && (
        <div className="header-tabs">
          <div className="header-container third">
            <nav className="tabs-nav">
              <a href="#" className="tab-item">
                <span className="tab-label">{t("header.tabs.aiMode")}</span>
                <span className="tab-badge">✨</span>
              </a>
              <span className="tab-divider">|</span>
              <a href="#" className="tab-item active">
                <span className="tab-label">{t("header.tabs.products")}</span>
                <span className="tab-underline"></span>
              </a>
              <a href="#" className="tab-item">
                <span className="tab-label">
                  {t("header.tabs.manufacturers")}
                </span>
              </a>
              <a href="#" className="tab-item">
                <span className="tab-label">{t("header.tabs.worldwide")}</span>
              </a>
            </nav>
          </div>
          {<SearchBar />}
        </div>
      )}
    </header>
  );
}

export default Header;
