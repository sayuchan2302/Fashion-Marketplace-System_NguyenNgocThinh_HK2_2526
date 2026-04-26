import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';
import { Link, useParams } from 'react-router-dom';
import { BadgeCheck, ChevronLeft, Mail, MapPin, MessageCircle, Phone, ShoppingBag, Star, Users } from 'lucide-react';
import { storeService, type StoreProduct, type StoreProfile } from '../../services/storeService';
import { couponService, type Coupon } from '../../services/couponService';
import { customerVoucherService } from '../../services/customerVoucherService';
import { reviewService, type Review } from '../../services/reviewService';
import { storeFollowService } from '../../services/storeFollowService';
import { ApiError, hasBackendJwt } from '../../services/apiClient';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import {
  BrowseTabContent,
  CategoriesTabContent,
  ProductsTabContent,
  ReviewsTabContent,
  StorefrontTabPanel,
  type PaginationToken,
  type QuickAddItem,
} from './components/StoreProfileTabSections';
import './StoreProfile.css';

type StoreTab = 'browse' | 'products' | 'categories' | 'reviews';
type PanelHeightMap = Record<StoreTab, number>;
type IdleCapableWindow = Window & typeof globalThis & {
  requestIdleCallback?: (callback: IdleRequestCallback) => number;
  cancelIdleCallback?: (handle: number) => void;
};

const TAB_ITEMS: Array<{ id: StoreTab; label: string }> = [
  { id: 'browse', label: 'Dạo' },
  { id: 'products', label: 'Tất cả sản phẩm' },
  { id: 'categories', label: 'Danh mục' },
  { id: 'reviews', label: 'Đánh giá' },
];

const EMPTY_PANEL_HEIGHTS: PanelHeightMap = {
  browse: 0,
  products: 0,
  categories: 0,
  reviews: 0,
};

const PLACEHOLDER_BANNER =
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=600&fit=crop';
const PRODUCTS_PAGE_SIZE = 25;
const MAX_PRODUCT_SNAPSHOT_PAGES = 5;
const CATEGORY_PREFETCH_DELAY_MS = 180;

const formatPercent = (value?: number) => `${Math.max(0, Math.min(100, Math.round(Number(value || 0))))}%`;

const formatShortNumber = (value: number) => {
  const safe = Math.max(0, Number(value || 0));
  if (safe >= 1_000_000) return `${(safe / 1_000_000).toFixed(1)}M`;
  if (safe >= 1_000) return `${(safe / 1_000).toFixed(1)}K`;
  return safe.toLocaleString('vi-VN');
};

const loadAllStoreProducts = async (
  storeId: string,
  pageSize = 60,
  maxPages = MAX_PRODUCT_SNAPSHOT_PAGES,
): Promise<StoreProduct[]> => {
  const firstPage = await storeService.getStoreProducts(storeId, 1, pageSize);
  const totalPages = Math.max(1, Number(firstPage.totalPages || 1));
  const rows = [...(firstPage.products || [])];

  if (totalPages <= 1) return rows;

  const maxPagesToFetch = Math.min(totalPages, Math.max(1, Number(maxPages || 1)));
  const remainingCalls: Array<Promise<Awaited<ReturnType<typeof storeService.getStoreProducts>>>> = [];

  for (let page = 2; page <= maxPagesToFetch; page += 1) {
    remainingCalls.push(storeService.getStoreProducts(storeId, page, pageSize));
  }

  const settled = await Promise.allSettled(remainingCalls);
  for (const result of settled) {
    if (result.status === 'fulfilled') {
      rows.push(...(result.value.products || []));
    }
  }

  return rows;
};

const buildLoginRedirectTarget = () => {
  if (typeof window === 'undefined') return '/login';
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  return `/login?reason=${encodeURIComponent('auth-required')}&redirect=${encodeURIComponent(current)}`;
};

const buildPaginationTokens = (page: number, totalPages: number): PaginationToken[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (page <= 3) {
    return [1, 2, 3, 4, 'ellipsis-right', totalPages];
  }

  if (page >= totalPages - 2) {
    return [1, 'ellipsis-left', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, 'ellipsis-left', page - 1, page, page + 1, 'ellipsis-right', totalPages];
};

const StoreProfilePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [store, setStore] = useState<StoreProfile | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<StoreProduct[]>([]);
  const [productPageItems, setProductPageItems] = useState<StoreProduct[]>([]);
  const [productPage, setProductPage] = useState(1);
  const [productTotal, setProductTotal] = useState(0);
  const [productTotalPages, setProductTotalPages] = useState(1);
  const [productPageLoading, setProductPageLoading] = useState(false);
  const [categoryProducts, setCategoryProducts] = useState<StoreProduct[] | null>(null);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [vouchers, setVouchers] = useState<Coupon[]>([]);
  const [claimedVoucherIds, setClaimedVoucherIds] = useState<Set<string>>(() => new Set<string>());
  const [claimingVoucherId, setClaimingVoucherId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followSubmitting, setFollowSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StoreTab>('browse');
  const [isTabPending, startTabTransition] = useTransition();
  const [panelHeights, setPanelHeights] = useState<PanelHeightMap>(EMPTY_PANEL_HEIGHTS);
  const [stageMinHeight, setStageMinHeight] = useState(0);
  const storeRequestRef = useRef(0);
  const paginationRequestRef = useRef(0);
  const categoryRequestRef = useRef(0);
  const categoryFetchInFlightRef = useRef(false);
  const idleCategoryPrefetchRef = useRef<number | null>(null);
  const panelNodesRef = useRef<Record<StoreTab, HTMLDivElement | null>>({
    browse: null,
    products: null,
    categories: null,
    reviews: null,
  });

  const { addToCart } = useCart();
  const { addToast } = useToast();

  const setPanelNode = useCallback((tab: StoreTab, node: HTMLDivElement | null) => {
    panelNodesRef.current[tab] = node;
  }, []);

  const resetStorefrontUiState = useCallback(() => {
    setActiveTab('browse');
    setProductPage(1);
    setProductTotal(0);
    setProductTotalPages(1);
    setProductPageLoading(false);
    setFeaturedProducts([]);
    setProductPageItems([]);
    setCategoryProducts(null);
    setCategoryLoading(false);
    setClaimedVoucherIds(new Set<string>());
    setClaimingVoucherId(null);
    setPanelHeights(EMPTY_PANEL_HEIGHTS);
    setStageMinHeight(0);
    setLoading(true);
  }, []);

  const applyStoreUnavailableState = useCallback(() => {
    setVouchers([]);
    setClaimedVoucherIds(new Set<string>());
    setReviews([]);
    setFollowerCount(0);
    setIsFollowing(false);
  }, []);

  const handleQuickAdd = useCallback((item: QuickAddItem) => {
    addToCart({
      id: String(item.id),
      backendProductId: item.backendId,
      backendVariantId: undefined,
      name: item.name,
      price: item.price,
      originalPrice: item.originalPrice,
      image: item.image,
      color: 'Mặc định',
      size: 'F',
      storeId: item.storeId || 'default-store',
      storeName: item.storeName || 'Cửa hàng',
      isOfficialStore: item.isOfficialStore || false,
    });
  }, [addToCart]);

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;
    const requestId = storeRequestRef.current + 1;
    storeRequestRef.current = requestId;
    paginationRequestRef.current += 1;
    categoryRequestRef.current += 1;
    categoryFetchInFlightRef.current = false;

    if (idleCategoryPrefetchRef.current !== null && typeof window !== 'undefined') {
      const idleWindow = window as IdleCapableWindow;
      if (typeof idleWindow.cancelIdleCallback === 'function') {
        idleWindow.cancelIdleCallback(idleCategoryPrefetchRef.current);
      } else {
        window.clearTimeout(idleCategoryPrefetchRef.current);
      }
      idleCategoryPrefetchRef.current = null;
    }

    const isCurrentRequest = () => !cancelled && storeRequestRef.current === requestId;

    const fetchData = async () => {
      resetStorefrontUiState();

      try {
        const storeRow = await storeService.getStoreBySlug(slug);
        if (!isCurrentRequest()) return;

        setStore(storeRow);
        if (!storeRow) {
          applyStoreUnavailableState();
          return;
        }

        const claimedVoucherPromise = hasBackendJwt()
          ? customerVoucherService.getClaimedVoucherIdsByStore(storeRow.id).catch(() => new Set<string>())
          : Promise.resolve(new Set<string>());

        const [initialProductPage, couponRes, reviewRes, followerRes, claimedVoucherSet] = await Promise.all([
          storeService.getStoreProducts(storeRow.id, 1, PRODUCTS_PAGE_SIZE),
          couponService.getAvailableCoupons([storeRow.id]).catch(() => [] as Coupon[]),
          reviewService.getReviewsByStore(storeRow.id).catch(() => [] as Review[]),
          storeFollowService.getFollowerCount(storeRow.id).catch(() => ({
            storeId: storeRow.id,
            followerCount: 0,
            followedByCurrentUser: false,
          })),
          claimedVoucherPromise,
        ]);
        if (!isCurrentRequest()) return;

        setFeaturedProducts(initialProductPage.products || []);
        setProductPageItems(initialProductPage.products || []);
        setProductPage(Math.max(Number(initialProductPage.page || 1), 1));
        setProductTotal(Math.max(Number(initialProductPage.total || 0), 0));
        setProductTotalPages(Math.max(Number(initialProductPage.totalPages || 1), 1));
        setVouchers(couponRes || []);
        setClaimedVoucherIds(new Set(claimedVoucherSet));
        setReviews(reviewRes || []);
        setFollowerCount(Math.max(0, Number(followerRes.followerCount || 0)));
        setIsFollowing(Boolean(followerRes.followedByCurrentUser));

        if (hasBackendJwt()) {
          try {
            const followStatus = await storeFollowService.getFollowStatus(storeRow.id);
            if (!isCurrentRequest()) return;
            setFollowerCount(Math.max(0, Number(followStatus.followerCount || 0)));
            setIsFollowing(Boolean(followStatus.followedByCurrentUser));
          } catch {
            // ignore follow status fetch errors for unauthenticated/degraded state
          }
        }
      } finally {
        if (isCurrentRequest()) {
          setLoading(false);
        }
      }
    };

    void fetchData();

    return () => {
      cancelled = true;
    };
  }, [applyStoreUnavailableState, resetStorefrontUiState, slug]);

  const ensureCategorySnapshot = useCallback(async () => {
    if (!store?.id || categoryProducts !== null || categoryFetchInFlightRef.current) return;

    const storeId = store.id;
    const storeRequestId = storeRequestRef.current;
    const requestId = categoryRequestRef.current + 1;
    categoryRequestRef.current = requestId;
    categoryFetchInFlightRef.current = true;
    setCategoryLoading(true);

    try {
      const rows = await loadAllStoreProducts(storeId, 60);
      if (storeRequestRef.current !== storeRequestId || categoryRequestRef.current !== requestId) return;
      setCategoryProducts(rows || []);
    } catch {
      if (storeRequestRef.current === storeRequestId && categoryRequestRef.current === requestId) {
        setCategoryProducts([]);
      }
    } finally {
      if (storeRequestRef.current === storeRequestId && categoryRequestRef.current === requestId) {
        categoryFetchInFlightRef.current = false;
        setCategoryLoading(false);
      }
    }
  }, [categoryProducts, store?.id]);

  useEffect(() => {
    if (loading || !store?.id || categoryProducts !== null) return;

    const idleWindow = window as IdleCapableWindow;
    const triggerPrefetch = () => {
      idleCategoryPrefetchRef.current = null;
      void ensureCategorySnapshot();
    };

    if (typeof idleWindow.requestIdleCallback === 'function') {
      idleCategoryPrefetchRef.current = idleWindow.requestIdleCallback(() => {
        triggerPrefetch();
      });
    } else {
      idleCategoryPrefetchRef.current = window.setTimeout(triggerPrefetch, CATEGORY_PREFETCH_DELAY_MS);
    }

    return () => {
      if (idleCategoryPrefetchRef.current === null) return;
      if (typeof idleWindow.cancelIdleCallback === 'function') {
        idleWindow.cancelIdleCallback(idleCategoryPrefetchRef.current);
      } else {
        window.clearTimeout(idleCategoryPrefetchRef.current);
      }
      idleCategoryPrefetchRef.current = null;
    };
  }, [categoryProducts, ensureCategorySnapshot, loading, store?.id]);

  useEffect(() => {
    if (activeTab !== 'categories' || categoryProducts !== null || categoryLoading) return;
    void ensureCategorySnapshot();
  }, [activeTab, categoryLoading, categoryProducts, ensureCategorySnapshot]);

  useLayoutEffect(() => {
    if (loading || typeof ResizeObserver === 'undefined') return;

    const updateHeight = (tab: StoreTab, nextHeight: number) => {
      const normalizedHeight = Math.max(0, nextHeight);
      setPanelHeights((prev) => (prev[tab] === normalizedHeight ? prev : { ...prev, [tab]: normalizedHeight }));
    };

    for (const tab of TAB_ITEMS.map((item) => item.id)) {
      const node = panelNodesRef.current[tab];
      if (!node) continue;
      updateHeight(tab, Math.ceil(node.getBoundingClientRect().height));
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const tab = TAB_ITEMS.find((item) => panelNodesRef.current[item.id] === entry.target)?.id;
        if (!tab) continue;
        updateHeight(tab, Math.ceil(entry.contentRect.height));
      }
    });

    for (const tab of TAB_ITEMS.map((item) => item.id)) {
      const node = panelNodesRef.current[tab];
      if (node) {
        observer.observe(node);
      }
    }

    return () => {
      observer.disconnect();
    };
  }, [loading, store?.id]);

  useLayoutEffect(() => {
    setStageMinHeight(Math.max(0, panelHeights[activeTab] || 0));
  }, [activeTab, panelHeights]);

  const handleClaimVoucher = useCallback(async (voucher: Coupon) => {
    const voucherId = String(voucher.id || '').trim();
    if (!voucherId) {
      return;
    }

    if (!hasBackendJwt()) {
      if (typeof window !== 'undefined') {
        window.location.href = buildLoginRedirectTarget();
      }
      return;
    }

    if (claimedVoucherIds.has(voucherId) || claimingVoucherId === voucherId) {
      return;
    }

    setClaimingVoucherId(voucherId);
    try {
      await customerVoucherService.claimVoucher(voucherId);
      setClaimedVoucherIds((current) => {
        const next = new Set(current);
        next.add(voucherId);
        return next;
      });
      addToast(`Đã nhận voucher ${voucher.code}`, 'success');
    } catch (error) {
      const message = error instanceof ApiError
        ? error.message
        : (error instanceof Error ? error.message : 'Không thể nhận voucher lúc này.');
      addToast(message || 'Không thể nhận voucher lúc này.', 'error');
    } finally {
      setClaimingVoucherId((current) => (current === voucherId ? null : current));
    }
  }, [addToast, claimedVoucherIds, claimingVoucherId]);

  const handleToggleFollow = async () => {
    if (!store || followSubmitting) return;

    if (!hasBackendJwt()) {
      if (typeof window !== 'undefined') {
        window.location.href = buildLoginRedirectTarget();
      }
      return;
    }

    setFollowSubmitting(true);
    try {
      const shouldSyncWalletVoucher = !isFollowing;
      const response = isFollowing
        ? await storeFollowService.unfollow(store.id)
        : await storeFollowService.follow(store.id);

      setFollowerCount(Math.max(0, Number(response.followerCount || 0)));
      setIsFollowing(Boolean(response.followedByCurrentUser));

      if (shouldSyncWalletVoucher) {
        try {
          const claimedIds = await customerVoucherService.getClaimedVoucherIdsByStore(store.id);
          setClaimedVoucherIds(claimedIds);
        } catch {
          // ignore wallet sync failure after follow
        }
      }
    } finally {
      setFollowSubmitting(false);
    }
  };

  const handleTabChange = (tab: StoreTab) => {
    if (tab === activeTab) return;
    startTabTransition(() => {
      setActiveTab(tab);
    });
  };

  const handleProductPageChange = useCallback(async (nextPage: number) => {
    if (!store?.id || productPageLoading || nextPage === productPage) return;

    const storeId = store.id;
    const storeRequestId = storeRequestRef.current;
    const requestId = paginationRequestRef.current + 1;
    paginationRequestRef.current = requestId;

    setProductPageLoading(true);
    try {
      const response = await storeService.getStoreProducts(storeId, nextPage, PRODUCTS_PAGE_SIZE);
      if (storeRequestRef.current !== storeRequestId || paginationRequestRef.current !== requestId) return;
      setProductPageItems(response.products || []);
      setProductPage(Math.max(Number(response.page || nextPage), 1));
      setProductTotal(Math.max(Number(response.total || 0), 0));
      setProductTotalPages(Math.max(Number(response.totalPages || 1), 1));
    } catch {
      // keep current page data if pagination request fails
    } finally {
      if (storeRequestRef.current === storeRequestId && paginationRequestRef.current === requestId) {
        setProductPageLoading(false);
      }
    }
  }, [productPage, productPageLoading, store?.id]);

  const onlineLabel = store?.status === 'ACTIVE' ? 'Đang online' : 'Tạm offline';

  const topSellingProducts = useMemo(
    () => [...featuredProducts].sort((a, b) => Number(b.soldCount || 0) - Number(a.soldCount || 0)).slice(0, 8),
    [featuredProducts],
  );

  const groupedByCategory = useMemo(() => {
    const groups = new Map<string, StoreProduct[]>();
    for (const product of categoryProducts || []) {
      const key = product.categoryName || 'Danh mục khác';
      const bucket = groups.get(key) || [];
      bucket.push(product);
      groups.set(key, bucket);
    }
    return Array.from(groups.entries()).map(([name, rows]) => ({ name, rows }));
  }, [categoryProducts]);

  const paginationTokens = useMemo(
    () => buildPaginationTokens(productPage, productTotalPages),
    [productPage, productTotalPages],
  );

  if (loading) {
    return (
      <div className="storefront-state-page">
        <div className="storefront-loader" />
        <p>Đang tải thông tin cửa hàng...</p>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="storefront-state-page">
        <div className="storefront-not-found">
          <h2>Cửa hàng không tồn tại</h2>
          <p>Liên kết có thể đã hết hiệu lực hoặc cửa hàng chưa được công khai.</p>
          <Link to="/" className="storefront-primary-btn">
            <ChevronLeft size={16} />
            Quay về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="storefront-page">
      <div className="storefront-shell">
        <section className="storefront-summary-wrap">
          <div className="storefront-summary">
            <div className="storefront-summary-main">
              <div className="storefront-brand">
                {store.logo ? (
                  <img src={store.logo} alt={store.name} className="storefront-logo" />
                ) : (
                  <div className="storefront-logo-placeholder">{store.name.charAt(0).toUpperCase()}</div>
                )}
                <div className="storefront-brand-text">
                  <div className="storefront-brand-title">
                    <h1>{store.name}</h1>
                    {store.isOfficial ? (
                      <span className="storefront-badge">
                        <BadgeCheck size={14} />
                        Mall
                      </span>
                    ) : null}
                    <span
                      className={`storefront-status ${
                        store.status === 'ACTIVE' ? 'storefront-status-active' : 'storefront-status-offline'
                      }`}
                    >
                      <span className="storefront-status-dot" />
                      {onlineLabel}
                    </span>
                  </div>
                  <p className="storefront-description">
                    {store.description || 'Cửa hàng đối tác chính thức trên marketplace.'}
                  </p>
                  {store.contactEmail || store.phone || store.address ? (
                    <div className="storefront-public-contact">
                      {store.contactEmail ? (
                        <span>
                          <Mail size={13} />
                          {store.contactEmail}
                        </span>
                      ) : null}
                      {store.phone ? (
                        <span>
                          <Phone size={13} />
                          {store.phone}
                        </span>
                      ) : null}
                      {store.address ? (
                        <span>
                          <MapPin size={13} />
                          {store.address}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                  <div className="storefront-actions">
                    <button
                      type="button"
                      className={`storefront-primary-btn ${isFollowing ? 'storefront-primary-btn-muted' : ''}`}
                      onClick={handleToggleFollow}
                      disabled={followSubmitting}
                    >
                      {followSubmitting ? 'Đang xử lý...' : isFollowing ? 'Đã theo dõi' : 'Theo dõi'}
                    </button>
                    <button
                      type="button"
                      className="storefront-secondary-btn storefront-secondary-btn-disabled"
                      disabled
                      title="Tính năng chat sẽ được cập nhật sau"
                    >
                      <MessageCircle size={16} />
                      Chat (Sắp ra mắt)
                    </button>
                  </div>
                </div>
              </div>

              <div className="storefront-metrics">
                <article className="storefront-metric-card">
                  <p>
                    <Star size={14} />
                    Rating
                  </p>
                  <strong>{store.rating.toFixed(1)}</strong>
                </article>
                <article className="storefront-metric-card">
                  <p>
                    <MessageCircle size={14} />
                    Tỷ lệ phản hồi
                  </p>
                  <strong>{formatPercent(store.responseRate)}</strong>
                </article>
                <article className="storefront-metric-card">
                  <p>
                    <Users size={14} />
                    Người theo dõi
                  </p>
                  <strong>{formatShortNumber(followerCount)}</strong>
                </article>
                <article className="storefront-metric-card">
                  <p>
                    <ShoppingBag size={14} />
                    Đơn hàng
                  </p>
                  <strong>{formatShortNumber(Number(store.totalOrders || 0))}</strong>
                </article>
              </div>
            </div>

            <div className="storefront-tabs">
              {TAB_ITEMS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`storefront-tab ${activeTab === tab.id ? 'storefront-tab-active' : ''} ${isTabPending ? 'is-pending' : ''}`}
                  onClick={() => handleTabChange(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </section>
        <section className="storefront-section">
          <div
            className="storefront-tab-stage"
            style={stageMinHeight > 0 ? { minHeight: `${stageMinHeight}px` } : undefined}
          >
            <StorefrontTabPanel active={activeTab === 'browse'} panelRef={(node) => setPanelNode('browse', node)}>
              <BrowseTabContent
                vouchers={vouchers}
                isAuthenticated={hasBackendJwt()}
                claimedVoucherIds={claimedVoucherIds}
                claimingVoucherId={claimingVoucherId}
                onClaimVoucher={handleClaimVoucher}
                storeName={store.name}
                bannerUrl={store.banner || PLACEHOLDER_BANNER}
                topSellingProducts={topSellingProducts}
                onQuickAdd={handleQuickAdd}
              />
            </StorefrontTabPanel>

            <StorefrontTabPanel active={activeTab === 'products'} panelRef={(node) => setPanelNode('products', node)}>
              <ProductsTabContent
                productTotal={productTotal}
                productPage={productPage}
                productTotalPages={productTotalPages}
                productPageItems={productPageItems}
                productPageLoading={productPageLoading}
                paginationTokens={paginationTokens}
                storeName={store.name}
                onQuickAdd={handleQuickAdd}
                onPageChange={(nextPage) => {
                  void handleProductPageChange(nextPage);
                }}
              />
            </StorefrontTabPanel>

            <StorefrontTabPanel active={activeTab === 'categories'} panelRef={(node) => setPanelNode('categories', node)}>
              <CategoriesTabContent
                categoryLoading={categoryLoading}
                groupedByCategory={groupedByCategory}
              />
            </StorefrontTabPanel>

            <StorefrontTabPanel active={activeTab === 'reviews'} panelRef={(node) => setPanelNode('reviews', node)}>
              <ReviewsTabContent reviews={reviews} />
            </StorefrontTabPanel>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StoreProfilePage;
