'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CartIcon, LanguageIcon, UserIcon } from '../common/icons';
import SearchBar from '../common/SearchBar';
import styles from './Header.module.css';
import MegaMenu from './MegaMenu';

const Header: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const dropdownRef = useRef<HTMLButtonElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const mobileLangRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const { t, i18n } = useTranslation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    width: number;
    opacity: number;
  }>({ left: 0, width: 0, opacity: 0 });
  const tabsNavRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const LANGUAGES = [
    { code: 'ko', label: 'Korean' },
    { code: 'jp', label: 'Japanese' },
    { code: 'en', label: 'English' },
    { code: 'cn', label: 'Chinese' },
    { code: 'vn', label: 'Vietnamese' },
    { code: 'th', label: 'Thai' },
    { code: 'id', label: 'Indonesian' },
  ];

  const handleChangeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsLangOpen(false);
  };

  useEffect(() => {
    const tokenExists =
      typeof window !== 'undefined' ? !!localStorage.getItem('userId') : false;
    const timeoutId = setTimeout(() => {
      if (isLoggedIn !== tokenExists) {
        setIsLoggedIn(tokenExists);
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [pathname, isLoggedIn]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => null);
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    window.location.href = '/login';
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
        document.documentElement.style.setProperty('--header-height', '50px');
      } else {
        setIsScrolled(false);
        document.documentElement.style.setProperty('--header-height', '240px');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const onResize = () => {
      setIsMobileView(window.innerWidth <= 659);
    };

    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const clickedButton = dropdownRef.current?.contains(event.target as Node);
      const clickedMenu = megaMenuRef.current?.contains(event.target as Node);
      const clickedLangDesktop = langRef.current?.contains(
        event.target as Node,
      );
      const clickedLangMobile = mobileLangRef.current?.contains(
        event.target as Node,
      );

      if (!clickedButton && !clickedMenu) {
        setIsDropdownOpen(false);
      }
      if (!clickedLangDesktop && !clickedLangMobile) {
        setIsLangOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const updateIndicator = (index: number) => {
    const target = tabRefs.current[index];
    const nav = tabsNavRef.current;
    if (target && nav) {
      const navRect = nav.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      setIndicatorStyle({
        left: targetRect.left - navRect.left,
        width: targetRect.width,
        opacity: 1,
      });
    }
  };

  useEffect(() => {
    const currentPath = pathname as string;
    let activeIdx = -1;
    if (currentPath === '/products' || currentPath === '/') activeIdx = 0;
    else if (currentPath === '/globe') activeIdx = 2;

    setTimeout(() => {
      if (activeIdx !== -1) {
        updateIndicator(activeIdx);
      } else {
        setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
      }
    }, 100);
  }, [pathname]);

  const isHeaderScrolled = isScrolled || pathname !== '/';
  const showHeaderTabs = !isScrolled && pathname === '/';

  const UtilsMenu = (
    <div className={styles.headerUtils}>
      <div className={styles.langSwitcher} ref={langRef}>
        <button
          className={`${styles.iconButton} ${styles.langButton}`}
          onClick={() => setIsLangOpen((prev) => !prev)}
          id="language-selector"
        >
          <LanguageIcon size={24} color="currentColor" />
          <span className={`${styles.langCurrent} ${styles.utilsText}`}>
            {t('header.utils.languageValue', 'Language')}
          </span>
        </button>

        {isLangOpen && (
          <ul className={styles.langDropdown}>
            {LANGUAGES.map((lang) => (
              <li key={lang.code}>
                <button
                  className={`${styles.langOption} ${i18n.language === lang.code ? styles.active : ''}`}
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
        href="/cart"
        className={`${styles.iconButton} ${styles.headerCart}`}
      >
        <CartIcon size={24} color="currentColor" />
        <span className={styles.utilsText}>
          {t('header.utils.cart', 'Cart')}
        </span>
      </Link>
      {isLoggedIn ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link href="/mypage" className={styles.iconButton}>
            <UserIcon size={24} color="currentColor" />
            <span className={styles.utilsText}>My Page</span>
          </Link>
          <button className={styles.signupButton} onClick={handleLogout}>
            Log out
          </button>
        </div>
      ) : (
        <>
          <Link
            href="/login"
            className={`${styles.iconButton} ${styles.login}`}
          >
            <UserIcon size={24} color="currentColor" />
            <span className={styles.utilsText}>
              {t('header.utils.login', 'Log in')}
            </span>
          </Link>

          <Link
            href="/signup"
            className={`${styles.signupButton} ${styles.iconButton}`}
          >
            <UserIcon size={24} color="white" />
            <span className={styles.utilsText}>
              {t('header.utils.signup', 'Sign up')}
            </span>
          </Link>
        </>
      )}
    </div>
  );

  const MobileUtilityBar = (
    <div className={styles.mobileUtilityBar}>
      <div className={styles.mobileUtilityInner}>
        <div className={styles.mobileLangSwitcher} ref={mobileLangRef}>
          <button
            className={styles.mobileQuickButton}
            onClick={() => setIsLangOpen((prev) => !prev)}
            type="button"
          >
            {t('header.mobile.language', 'Language')}
          </button>
          {isLangOpen && (
            <ul className={styles.mobileLangDropdown}>
              {LANGUAGES.map((lang) => (
                <li key={lang.code}>
                  <button
                    className={`${styles.langOption} ${i18n.language === lang.code ? styles.active : ''}`}
                    onClick={() => handleChangeLanguage(lang.code)}
                  >
                    {lang.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Link href="/products" className={styles.mobileQuickLink}>
          {t('header.mobile.category', 'Category')}
        </Link>
        <Link href="/cart" className={styles.mobileQuickLink}>
          {t('header.mobile.cart', 'Cart')}
        </Link>

        {isLoggedIn ? (
          <button
            className={styles.mobileQuickButton}
            type="button"
            onClick={handleLogout}
          >
            {t('header.mobile.logout', 'Log out')}
          </button>
        ) : (
          <>
            <Link href="/login" className={styles.mobileQuickLink}>
              {t('header.mobile.login', 'Log in')}
            </Link>
            <Link href="/signup" className={styles.mobileQuickLink}>
              {t('header.mobile.signup', 'Sign up')}
            </Link>
          </>
        )}
      </div>
    </div>
  );

  return (
    <header
      ref={headerRef}
      className={`${styles.header} ${isHeaderScrolled ? styles.scrolled : ''}`}
    >
      {MobileUtilityBar}
      <div className={styles.headerTop}>
        <div className={styles.headerContainer}>
          <div className={styles.headerLogo}>
            <Link href="/">
              <Image
                src="/logo.png"
                alt="RISE AUTOPARTS"
                width={280}
                height={45}
                priority
                style={{ objectFit: 'contain' }}
              />
              <span>Rise Autoparts</span>
            </Link>
          </div>

          {(isHeaderScrolled || isMobileView) && <SearchBar isCompact />}
          {UtilsMenu}
        </div>
      </div>

      <div className={styles.headerNav}>
        <div className={styles.headerContainer}>
          <nav className={styles.navLeft}>
            <div className={styles.navItemWrapper}>
              <button
                ref={dropdownRef}
                className={`${styles.navItem} ${styles.categories}`}
                onClick={() => setIsDropdownOpen((prev) => !prev)}
              >
                <span className={styles.hamburgerIcon}>☰</span>
                {t('header.nav.allCategories', 'All Categories')}
              </button>
            </div>
            <Link href="/products?badge=HOT_DEAL" className={styles.navItem}>
              {t('header.nav.featuredSelection', 'Hot Deals')}
            </Link>
            <Link href="/products?badge=TOP_RANKING" className={styles.navItem}>
              {t('header.nav.topranking', 'Top Ranking')}
            </Link>
          </nav>

          <nav className={styles.navRight}>
            <Link href="/brands" className={styles.navItem}>
              {t('header.nav.brands', 'Brands')}
            </Link>
            <Link href="/inquiry" className={styles.navItem}>
              {t('header.nav.inquiry', 'Contact')}
            </Link>
            <Link href="/about" className={styles.navItem}>
              {t('header.nav.about', 'About Us')}
            </Link>
            <Link href="/notices" className={styles.navItem}>
              {t('header.nav.notices', 'Notices')}
            </Link>
          </nav>
        </div>

        {isDropdownOpen && (
          <MegaMenu
            ref={megaMenuRef}
            onClose={() => setIsDropdownOpen(false)}
          />
        )}
      </div>

      {showHeaderTabs && (
        <div className={styles.headerTabs}>
          <div className={`${styles.headerContainer} ${styles.third}`}>
            <nav className={styles.tabsNav} ref={tabsNavRef}>
              <Link
                href="/products"
                ref={(el) => {
                  tabRefs.current[0] = el;
                }}
                className={`${styles.tabItem} ${
                  (pathname as string) === '/products' ||
                  (pathname as string) === '/'
                    ? styles.active
                    : ''
                }`}
                onMouseEnter={() => updateIndicator(0)}
                onMouseLeave={() => {
                  const currentPath = pathname as string;
                  if (currentPath !== '/products' && currentPath !== '/') {
                    updateIndicator(currentPath === '/globe' ? 2 : -1);
                  } else {
                    updateIndicator(0);
                  }
                }}
              >
                <span className={styles.tabLabel}>
                  {t('header.tabs.products', 'Products')}
                </span>
              </Link>
              <Link
                href="/manufacturers"
                ref={(el) => {
                  tabRefs.current[1] = el;
                }}
                className={styles.tabItem}
                onMouseEnter={() => updateIndicator(1)}
              >
                <span className={styles.tabLabel}>
                  {t('header.tabs.manufacturers', 'Manufacturers')}
                </span>
              </Link>
              <Link
                href="/globe"
                ref={(el) => {
                  tabRefs.current[2] = el;
                }}
                className={`${styles.tabItem} ${
                  (pathname as string) === '/globe' ? styles.active : ''
                }`}
                onMouseEnter={() => updateIndicator(2)}
                onMouseLeave={() => {
                  const currentPath = pathname as string;
                  if (currentPath !== '/') {
                    updateIndicator(
                      currentPath === '/products' || currentPath === '/'
                        ? 0
                        : -1,
                    );
                  } else {
                    updateIndicator(2);
                  }
                }}
              >
                <span className={styles.tabBadge}></span>
                <span className={styles.tabLabel}>
                  {t('header.tabs.worldwide', 'Global')}
                </span>
              </Link>
              <div
                className={styles.tabIndicator}
                style={{
                  left: `${indicatorStyle.left}px`,
                  width: `${indicatorStyle.width}px`,
                  opacity: indicatorStyle.opacity,
                }}
              />
            </nav>
          </div>
          {!isMobileView && <SearchBar />}
        </div>
      )}
    </header>
  );
};

export default Header;
