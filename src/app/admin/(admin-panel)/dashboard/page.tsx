'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import styles from './Dashboard.module.css';

type ProductListResponse = {
  success?: boolean;
  products?: { id: number }[];
  message?: string;
};

type DashboardStats = {
  totalProducts: number;
  regularProducts: number;
  hotDeals: number;
  topRanking: number;
  lowStock: number;
};

type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PREPARING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELED'
  | 'REFUNDED';

type OrderSummary = {
  id: number;
  status: OrderStatus;
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: { message?: string };
};

type InventoryAlertResponse = {
  threshold: number;
  totalLowStock: number;
  items: Array<{
    id: number;
  }>;
};

const ORDER_STATUS_BOARD: Array<{ code: OrderStatus; label: string }> = [
  { code: 'PENDING', label: '팬딩' },
  { code: 'PAID', label: '결제완료' },
  { code: 'PREPARING', label: '상품준비중' },
  { code: 'SHIPPED', label: '배송시작' },
  { code: 'DELIVERED', label: '배송완료' },
  { code: 'CANCELED', label: '주문취소' },
  { code: 'REFUNDED', label: '환불' },
];

const QUICK_ACTIONS = [
  {
    title: '상품 등록',
    description: '새 상품을 즉시 등록합니다.',
    href: '/admin/products/upload',
  },
  {
    title: '일반 상품 관리',
    description: '재고/가격/노출 정보를 수정합니다.',
    href: '/admin/products/manage',
  },
  {
    title: '인기특가 관리',
    description: 'HOT DEAL 전용 상품을 관리합니다.',
    href: '/admin/hot-deals/manage',
  },
  {
    title: 'TOP 랭킹 관리',
    description: '랭킹 노출 상품을 빠르게 편집합니다.',
    href: '/admin/top-ranking/manage',
  },
];

const INITIAL_STATS: DashboardStats = {
  totalProducts: 0,
  regularProducts: 0,
  hotDeals: 0,
  topRanking: 0,
  lowStock: 0,
};

function formatTimestamp(value: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('ko-KR');
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>(INITIAL_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [inventoryThreshold, setInventoryThreshold] = useState(5);
  const [orderStatusCounts, setOrderStatusCounts] = useState<
    Record<OrderStatus, number>
  >({
    PENDING: 0,
    PAID: 0,
    PREPARING: 0,
    SHIPPED: 0,
    DELIVERED: 0,
    CANCELED: 0,
    REFUNDED: 0,
  });

  const fetchDashboardStats = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const [allRes, regularRes, hotRes, topRes, ordersRes, inventoryRes] =
        await Promise.all([
          fetch('/api/products', {
            credentials: 'same-origin',
            cache: 'no-store',
          }),
          fetch('/api/products?badge=NONE', {
            credentials: 'same-origin',
            cache: 'no-store',
          }),
          fetch('/api/products?badge=HOT_DEAL', {
            credentials: 'same-origin',
            cache: 'no-store',
          }),
          fetch('/api/products?badge=TOP_RANKING', {
            credentials: 'same-origin',
            cache: 'no-store',
          }),
          fetch('/api/admin/orders', {
            credentials: 'same-origin',
            cache: 'no-store',
          }),
          fetch('/api/admin/inventory/alerts?threshold=5&limit=5', {
            credentials: 'same-origin',
            cache: 'no-store',
          }),
        ]);

      if (
        !allRes.ok ||
        !regularRes.ok ||
        !hotRes.ok ||
        !topRes.ok ||
        !ordersRes.ok ||
        !inventoryRes.ok
      ) {
        throw new Error('대시보드 통계 요청에 실패했습니다.');
      }

      const [allData, regularData, hotData, topData, ordersData, inventoryData] =
        (await Promise.all([
          allRes.json(),
          regularRes.json(),
          hotRes.json(),
          topRes.json(),
          ordersRes.json(),
          inventoryRes.json(),
        ])) as [
          ProductListResponse,
          ProductListResponse,
          ProductListResponse,
          ProductListResponse,
          ApiResponse<OrderSummary[]>,
          ApiResponse<InventoryAlertResponse>,
        ];

      const allProducts = Array.isArray(allData.products)
        ? allData.products
        : [];
      const regularProducts = Array.isArray(regularData.products)
        ? regularData.products
        : [];
      const hotProducts = Array.isArray(hotData.products)
        ? hotData.products
        : [];
      const topProducts = Array.isArray(topData.products)
        ? topData.products
        : [];
      const orders = Array.isArray(ordersData.data) ? ordersData.data : [];

      const lowStockCount = inventoryData.data?.totalLowStock ?? 0;
      const nextOrderStatusCounts: Record<OrderStatus, number> = {
        PENDING: 0,
        PAID: 0,
        PREPARING: 0,
        SHIPPED: 0,
        DELIVERED: 0,
        CANCELED: 0,
        REFUNDED: 0,
      };

      for (const order of orders) {
        if (order.status in nextOrderStatusCounts) {
          nextOrderStatusCounts[order.status] += 1;
        }
      }

      setStats({
        totalProducts: allProducts.length,
        regularProducts: regularProducts.length,
        hotDeals: hotProducts.length,
        topRanking: topProducts.length,
        lowStock: lowStockCount,
      });
      setInventoryThreshold(inventoryData.data?.threshold ?? 5);
      setOrderStatusCounts(nextOrderStatusCounts);
      setLastUpdatedAt(new Date().toISOString());
    } catch (error) {
      console.error('[AdminDashboard] 통계 로드 실패:', error);
      setErrorMessage('통계를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
      setStats(INITIAL_STATS);
      setOrderStatusCounts({
        PENDING: 0,
        PAID: 0,
        PREPARING: 0,
        SHIPPED: 0,
        DELIVERED: 0,
        CANCELED: 0,
        REFUNDED: 0,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboardStats();
  }, [fetchDashboardStats]);

  return (
    <section className={styles.dashboard}>
      <div className={styles.headerRow}>
        <div>
          <h2 className={styles.title}>대시보드 개요</h2>
          <p className={styles.subtitle}>
            핵심 지표와 작업 바로가기를 한 화면에서 확인합니다.
          </p>
        </div>
        <button
          type="button"
          className={styles.refreshButton}
          onClick={() => void fetchDashboardStats()}
          disabled={isLoading}
        >
          {isLoading ? '불러오는 중...' : '새로고침'}
        </button>
      </div>

      {errorMessage ? <p className={styles.errorBox}>{errorMessage}</p> : null}

      <div className={styles.statsGrid}>
        <article className={styles.statCard}>
          <p className={styles.statLabel}>전체 상품 등록</p>
          <p className={styles.statValue}>{stats.totalProducts}</p>
          <p className={styles.statHint}>등록된 전체 상품 합계</p>
        </article>
        <article className={styles.statCard}>
          <Link href="/admin/products/manage" className={styles.statLink}>
            <p className={styles.statLabel}>일반 상품</p>
            <p className={styles.statValue}>{stats.regularProducts}</p>
            <p className={styles.statHint}>
              badge=NONE 일반 상품 (클릭해서 관리)
            </p>
          </Link>
        </article>
        <article className={styles.statCard}>
          <Link href="/admin/hot-deals/manage" className={styles.statLink}>
            <p className={styles.statLabel}>인기특가</p>
            <p className={styles.statValue}>{stats.hotDeals}</p>
            <p className={styles.statHint}>
              HOT DEAL 뱃지 등록 상품 (클릭해서 관리)
            </p>
          </Link>
        </article>
        <article className={styles.statCard}>
          <Link href="/admin/top-ranking/manage" className={styles.statLink}>
            <p className={styles.statLabel}>TOP 랭킹</p>
            <p className={styles.statValue}>{stats.topRanking}</p>
            <p className={styles.statHint}>
              TOP RANKING 뱃지 등록 상품 (클릭해서 관리)
            </p>
          </Link>
        </article>
        <article className={styles.statCard}>
          <p className={styles.statLabel}>재고 주의</p>
          <Link href="/admin/inventory/alerts" className={styles.lowStockLink}>
            <p className={`${styles.statValue} ${styles.warnValue}`}>
              {stats.lowStock}
            </p>
            <p className={styles.statHint}>
              재고 {inventoryThreshold}개 이하 상품 수 (클릭해서 관리)
            </p>
          </Link>
        </article>
      </div>

      <article className={styles.panel}>
        <div className={styles.panelHeader}>
          <h3>주문현황판</h3>
          <span>주문 상태별 건수</span>
        </div>
        <div className={styles.orderBoardGrid}>
          {ORDER_STATUS_BOARD.map((item) => (
            <div key={item.code} className={styles.orderBoardItem}>
              <p className={styles.orderBoardCode}>{item.code}</p>
              <p className={styles.orderBoardLabel}>{item.label}</p>
              <p className={styles.orderBoardValue}>
                {orderStatusCounts[item.code]}
              </p>
            </div>
          ))}
        </div>
      </article>

      <div className={styles.bottomGrid}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>빠른 작업</h3>
            <span>자주 쓰는 메뉴</span>
          </div>
          <div className={styles.quickActions}>
            {QUICK_ACTIONS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={styles.quickActionItem}
              >
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </Link>
            ))}
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3>운영 상태</h3>
            <span>기본 점검 정보</span>
          </div>
          <ul className={styles.statusList}>
            <li>
              <span>마지막 통계 갱신</span>
              <strong>{formatTimestamp(lastUpdatedAt)}</strong>
            </li>
            <li>
              <span>관리자 인증 방식</span>
              <strong>HttpOnly 쿠키 세션</strong>
            </li>
            <li>
              <span>관리자 보호 상태</span>
              <strong>권한 검증 활성화</strong>
            </li>
          </ul>
        </article>
      </div>
    </section>
  );
};

export default AdminDashboard;
