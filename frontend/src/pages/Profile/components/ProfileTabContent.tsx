import { Link } from 'react-router-dom';
import { Bell, Info, MapPin, MessageSquare, Package, Pencil, Star, Tag, Trash, Trash2 } from 'lucide-react';
import EmptyState from '../../../components/EmptyState/EmptyState';
import type { Address, Order } from '../../../types';
import { notificationService, type Notification } from '../../../services/notificationService';
import type { CustomerWalletVoucher } from '../../../services/customerVoucherService';
import type { Review as CustomerReview } from '../../../services/reviewService';

export type ProfileTabId = 'account' | 'orders' | 'vouchers' | 'addresses' | 'reviews' | 'notifications';

interface PendingProduct {
  productId: string;
  productName: string;
  productImage: string;
  orderId: string;
  orderCode?: string;
  variant: string;
}

interface UserSummary {
  name: string;
  phone: string;
  gender: string;
  dob: string;
  height: string;
  weight: string;
  email: string;
}

interface VoucherMeta {
  text: string;
  tone: 'used' | 'expired' | 'revoked' | 'available';
}

interface ProfileTabContentProps {
  activeTab: ProfileTabId;
  user: UserSummary;
  profileLoading: boolean;
  profileError: string | null;
  orderFilter: string;
  onOrderFilterChange: (nextFilter: string) => void;
  orders: Order[];
  ordersLoading: boolean;
  ordersError: string | null;
  orderStatusLabelMap: Record<string, string>;
  onOpenOrderDetail: (order: Order) => void;
  onRequestCancelOrder: (orderId: string) => void;
  vouchers: CustomerWalletVoucher[];
  pagedVouchers: CustomerWalletVoucher[];
  voucherPage: number;
  totalVoucherPages: number;
  vouchersPerPage: number;
  onVoucherPageChange: (updater: (current: number) => number) => void;
  getVoucherMeta: (voucher: CustomerWalletVoucher) => VoucherMeta;
  isMarketplaceVoucher: (voucher: CustomerWalletVoucher) => boolean;
  addressesLoading: boolean;
  addressesError: string | null;
  savedAddresses: Address[];
  onAddAddress: () => void;
  onEditAddress: (address: Address) => void;
  onRequestDeleteAddress: (addressId: string) => void;
  reviewFilter: 'pending' | 'completed';
  onReviewFilterChange: (nextFilter: 'pending' | 'completed') => void;
  pendingReviews: PendingProduct[];
  completedReviews: CustomerReview[];
  reviewsLoading: boolean;
  reviewsError: string | null;
  getOrderDisplayCode: (orderId: string, orderCode?: string) => string;
  onOpenReviewModal: (product: PendingProduct) => void;
  notifications: Notification[];
  displayedNotifications: Notification[];
  unreadCount: number;
  showAllNotifications: boolean;
  hasMoreNotifications: boolean;
  onShowAllNotifications: (show: boolean) => void;
  onMarkAllNotificationsRead: () => void;
  onNotificationClick: (notification: Notification) => void;
  onDeleteNotification: (notificationId: string) => void;
  onOpenAccountModal: () => void;
  onOpenPasswordModal: () => void;
}

const orderFilterOptions = ['Tất cả', 'Chờ xác nhận', 'Đang giao', 'Đã giao', 'Đã hủy'];

const OrderTab = ({
  orderFilter,
  onOrderFilterChange,
  orders,
  ordersLoading,
  ordersError,
  orderStatusLabelMap,
  onOpenOrderDetail,
  onRequestCancelOrder,
}: Pick<ProfileTabContentProps,
  | 'orderFilter'
  | 'onOrderFilterChange'
  | 'orders'
  | 'ordersLoading'
  | 'ordersError'
  | 'orderStatusLabelMap'
  | 'onOpenOrderDetail'
  | 'onRequestCancelOrder'
>) => {
  const statusMap: Record<string, string> = {
    'Tất cả': 'all',
    'Chờ xác nhận': 'pending',
    'Đang giao': 'shipping',
    'Đã giao': 'delivered',
    'Đã hủy': 'cancelled',
  };

  const filteredOrders = orderFilter === 'Tất cả'
    ? orders
    : orders.filter((order) => order.status === statusMap[orderFilter]);

  return (
    <div className="tab-pane">
      <div className="profile-content-header">
        <h2 className="profile-content-title">Lịch sử đơn hàng</h2>
      </div>

      <div className="order-filter-tabs">
        {orderFilterOptions.map((status) => (
          <button
            key={status}
            className={`order-filter-btn ${orderFilter === status ? 'active' : ''}`}
            onClick={() => onOrderFilterChange(status)}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="order-list">
        {ordersLoading ? (
          <div className="account-meta">Đang tải đơn hàng...</div>
        ) : ordersError ? (
          <div className="account-meta">{ordersError}</div>
        ) : filteredOrders.length === 0 ? (
          <EmptyState
            icon={<Package size={80} strokeWidth={1} />}
            title="Bạn chưa có đơn hàng nào"
            description="Hãy trải nghiệm các sản phẩm của Coolmate để bắt đầu hành trình mua sắm của bạn!"
            actionText="Mua sắm ngay"
            actionLink="/"
          />
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div className="order-card-meta">
                  <button
                    className="order-id-link"
                    onClick={() => onOpenOrderDetail(order)}
                  >
                    Mã đơn: #{order.code || order.id}
                  </button>
                  <span className="order-date">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <span className={`order-status-badge status-${order.status}`}>
                  {orderStatusLabelMap[order.status] ?? order.status}
                </span>
              </div>
              <div className="order-card-items">
                {order.items.slice(0, 2).map((item, idx) => (
                  <div key={idx} className="order-item">
                    <Link to={`/product/${encodeURIComponent(item.id)}`} className="order-item-img">
                      <img src={item.image} alt={item.name} />
                    </Link>
                    <div className="order-item-info">
                      <p className="order-item-name">{item.name}</p>
                      {item.color && <p className="order-item-variant">Màu: {item.color}</p>}
                      {item.size && <p className="order-item-variant">Size: {item.size}</p>}
                      <p className="order-item-qty">x{item.quantity}</p>
                    </div>
                    <span className="order-item-price">{item.price.toLocaleString('vi-VN')}đ</span>
                  </div>
                ))}
                {order.items.length > 2 && (
                  <p className="order-more-items">+{order.items.length - 2} sản phẩm khác</p>
                )}
              </div>
              <div className="order-card-footer">
                <div className="order-total">
                  <span>Tổng cộng:</span>
                  <span className="order-total-price">{order.total.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="order-actions">
                  {order.status === 'pending' && (
                    <button
                      className="order-action-btn order-btn-danger"
                      onClick={() => onRequestCancelOrder(order.id)}
                    >
                      Hủy đơn hàng
                    </button>
                  )}
                  <button
                    className="order-action-btn order-btn-outline"
                    onClick={() => onOpenOrderDetail(order)}
                  >
                    Xem chi tiết
                  </button>
                  {order.status === 'delivered' && (
                    <button className="order-action-btn order-btn-primary">Đánh giá</button>
                  )}
                  {order.status === 'shipping' && (
                    <button className="order-action-btn order-btn-primary">Theo dõi đơn</button>
                  )}
                  {order.status === 'cancelled' && (
                    <button className="order-action-btn order-btn-outline">Mua lại</button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const AccountTab = ({
  user,
  profileLoading,
  profileError,
  onOpenAccountModal,
  onOpenPasswordModal,
}: Pick<ProfileTabContentProps,
  | 'user'
  | 'profileLoading'
  | 'profileError'
  | 'onOpenAccountModal'
  | 'onOpenPasswordModal'
>) => (
  <div className="tab-pane">
    <div className="profile-content-header mb-6">
      <h2 className="profile-content-title">Thông tin tài khoản</h2>
    </div>
    {profileLoading ? <p className="account-meta">Đang tải hồ sơ tài khoản...</p> : null}
    {profileError ? <p className="account-meta">{profileError}</p> : null}

    <div className="account-info-form">
      <div className="info-group">
        <div className="info-row">
          <span className="info-label text-gray-500">Họ và tên</span>
          <span className="info-value font-medium">{user.name}</span>
        </div>
        <div className="info-row">
          <span className="info-label text-gray-500">Số điện thoại</span>
          <span className="info-value font-medium">{user.phone}</span>
        </div>
        <div className="info-row">
          <span className="info-label text-gray-500">Giới tính</span>
          <span className="info-value font-medium">{user.gender}</span>
        </div>
        <div className="info-row">
          <span className="info-label text-gray-500">Ngày sinh</span>
          <span className="info-value font-medium">{user.dob}</span>
        </div>
        <div className="info-row">
          <span className="info-label text-gray-500">Chiều cao</span>
          <span className="info-value font-medium">{user.height}</span>
        </div>
        <div className="info-row">
          <span className="info-label text-gray-500">Cân nặng</span>
          <span className="info-value font-medium">{user.weight}</span>
        </div>

        <button className="profile-btn-outline mt-8" onClick={onOpenAccountModal}>
          CẬP NHẬT
        </button>
      </div>

      <div className="info-group mt-10">
        <div className="profile-content-header mb-6">
          <h3 className="profile-content-title" style={{ color: '#000000' }}>Thông tin đăng nhập</h3>
        </div>
        <div className="info-row">
          <span className="info-label text-gray-500">Email</span>
          <span className="info-value font-medium">{user.email}</span>
        </div>
        <div className="info-row">
          <span className="info-label text-gray-500">Mật khẩu</span>
          <span className="info-value font-medium">••••••••••••••••</span>
        </div>

        <button className="profile-btn-outline mt-8" onClick={onOpenPasswordModal}>
          CẬP NHẬT
        </button>
      </div>
    </div>
  </div>
);

const VouchersTab = ({
  vouchers,
  pagedVouchers,
  voucherPage,
  totalVoucherPages,
  vouchersPerPage,
  onVoucherPageChange,
  getVoucherMeta,
  isMarketplaceVoucher,
}: Pick<ProfileTabContentProps,
  | 'vouchers'
  | 'pagedVouchers'
  | 'voucherPage'
  | 'totalVoucherPages'
  | 'vouchersPerPage'
  | 'onVoucherPageChange'
  | 'getVoucherMeta'
  | 'isMarketplaceVoucher'
>) => (
  <div className="tab-pane">
    <div className="profile-content-header">
      <h2 className="profile-content-title">Ví voucher của tôi</h2>
    </div>
    <div className={`voucher-list ${vouchers.length === 0 ? 'voucher-list-empty' : ''}`}>
      {vouchers.length === 0 ? (
        <EmptyState
          icon={<Tag size={80} strokeWidth={1} />}
          title="Ví voucher trống"
          description="Săn ngay những mã giảm giá hấp dẫn để mua sắm tiết kiệm hơn tại Coolmate."
          actionText="Săn Voucher"
          actionLink="/"
        />
      ) : (
        pagedVouchers.map((voucher, index) => {
          const voucherMeta = getVoucherMeta(voucher);
          const isMarketplaceOwner = isMarketplaceVoucher(voucher);
          const ownerLabel = isMarketplaceOwner ? 'Toàn sàn' : (voucher.storeName || 'Nhà bán hàng');
          return (
            <div
              key={voucher.customerVoucherId || `${voucher.code}-${voucher.storeId ?? 'global'}-${voucher.expiresAt ?? 'na'}-${(voucherPage - 1) * vouchersPerPage + index}`}
              className="voucher-card"
            >
              <span className={`voucher-owner-badge ${isMarketplaceOwner ? 'marketplace' : 'vendor'}`}>
                {ownerLabel}
              </span>
              <div className="voucher-stripe"></div>
              <div className="voucher-body">
                <div className="voucher-top">
                  <span className="voucher-code">{voucher.code}</span>
                  <span className={`voucher-remain voucher-remain-${voucherMeta.tone}`}>{voucherMeta.text}</span>
                </div>
                <p className="voucher-desc">{voucher.description}</p>
                <div className="voucher-bottom">
                  <span className="voucher-expiry">HSD: {new Date(voucher.expiresAt).toLocaleDateString('vi-VN')}</span>
                  <button className="voucher-condition-btn">Điều kiện</button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
    {vouchers.length > vouchersPerPage ? (
      <div className="voucher-pagination">
        <span className="voucher-pagination-meta">
          Hiển thị {(voucherPage - 1) * vouchersPerPage + 1}-{Math.min(voucherPage * vouchersPerPage, vouchers.length)} trên {vouchers.length} voucher
        </span>
        <div className="voucher-pagination-actions">
          <button
            type="button"
            className="voucher-page-btn"
            onClick={() => onVoucherPageChange((current) => Math.max(1, current - 1))}
            disabled={voucherPage === 1}
          >
            Trước
          </button>
          <span className="voucher-page-indicator">
            {voucherPage}/{totalVoucherPages}
          </span>
          <button
            type="button"
            className="voucher-page-btn"
            onClick={() => onVoucherPageChange((current) => Math.min(totalVoucherPages, current + 1))}
            disabled={voucherPage === totalVoucherPages}
          >
            Sau
          </button>
        </div>
      </div>
    ) : null}
  </div>
);

const AddressesTab = ({
  addressesLoading,
  addressesError,
  savedAddresses,
  onAddAddress,
  onEditAddress,
  onRequestDeleteAddress,
}: Pick<ProfileTabContentProps,
  | 'addressesLoading'
  | 'addressesError'
  | 'savedAddresses'
  | 'onAddAddress'
  | 'onEditAddress'
  | 'onRequestDeleteAddress'
>) => (
  <div className="tab-pane">
    <div className="address-header">
      <h2 className="profile-content-title">Địa chỉ của tôi</h2>
      <button className="address-add-btn" onClick={onAddAddress}>
        <span>+</span> THÊM ĐỊA CHỈ MỚI
      </button>
    </div>

    <div className="address-book-content">
      {addressesLoading ? <p className="account-meta">Đang tải danh sách địa chỉ...</p> : null}
      {addressesError ? <p className="account-meta">{addressesError}</p> : null}

      {!addressesLoading && savedAddresses.length === 0 ? (
        <EmptyState
          icon={<MapPin size={80} strokeWidth={1} />}
          title="Sổ địa chỉ trống"
          description="Bạn chưa có địa chỉ nào được lưu. Thêm địa chỉ để quá trình đặt hàng nhanh chóng hơn."
        />
      ) : !addressesLoading ? (
        <div className="address-list">
          {savedAddresses.map((addr) => (
            <div key={addr.id} className="address-card">
              <div className="address-card-info">
                <div className="address-card-top">
                  <span className="address-card-name">{addr.fullName}</span>
                  <span className="address-card-divider">|</span>
                  <span className="address-card-phone">{addr.phone}</span>
                  {addr.isDefault && <span className="address-default-badge">Mặc định</span>}
                </div>
                <p className="address-card-detail">{addr.detail}</p>
                <p className="address-card-region">{addr.ward}, {addr.district}, {addr.province}</p>
              </div>
              <div className="address-card-actions">
                <button
                  className="address-card-edit"
                  onClick={() => onEditAddress(addr)}
                  aria-label="Chỉnh sửa địa chỉ"
                >
                  <Pencil size={16} />
                </button>
                <button
                  className="address-card-delete"
                  onClick={() => onRequestDeleteAddress(addr.id)}
                  aria-label="Xóa địa chỉ"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  </div>
);

const ReviewsTab = ({
  reviewFilter,
  onReviewFilterChange,
  pendingReviews,
  completedReviews,
  reviewsLoading,
  reviewsError,
  getOrderDisplayCode,
  onOpenReviewModal,
}: Pick<ProfileTabContentProps,
  | 'reviewFilter'
  | 'onReviewFilterChange'
  | 'pendingReviews'
  | 'completedReviews'
  | 'reviewsLoading'
  | 'reviewsError'
  | 'getOrderDisplayCode'
  | 'onOpenReviewModal'
>) => (
  <div className="tab-pane">
    <div className="profile-content-header">
      <h2 className="profile-content-title">Đánh giá & Phản hồi</h2>
    </div>

    <div className="order-filter-tabs">
      <button
        className={`order-filter-btn ${reviewFilter === 'pending' ? 'active' : ''}`}
        onClick={() => onReviewFilterChange('pending')}
      >
        Chờ đánh giá ({pendingReviews.length})
      </button>
      <button
        className={`order-filter-btn ${reviewFilter === 'completed' ? 'active' : ''}`}
        onClick={() => onReviewFilterChange('completed')}
      >
        Đã đánh giá ({completedReviews.length})
      </button>
    </div>

    {reviewsLoading ? (
      <div className="review-empty">
        <p>Đang tải danh sách đánh giá...</p>
      </div>
    ) : null}

    {!reviewsLoading && reviewsError ? (
      <div className="review-empty-state">
        <EmptyState
          icon={<MessageSquare size={80} strokeWidth={1} />}
          title="Không thể tải đánh giá"
          description={reviewsError}
        />
      </div>
    ) : null}

    {reviewFilter === 'pending' && (
      <div className="review-section">
        {!reviewsLoading && !reviewsError && pendingReviews.length > 0 ? (
          <div className="review-pending-list">
            {pendingReviews.map((product) => (
              <div key={product.productId} className="review-pending-card">
                <div className="review-pending-product">
                  <Link to={`/product/${encodeURIComponent(product.productId)}`} className="review-product-img">
                    <img src={product.productImage} alt={product.productName} />
                  </Link>
                  <div className="review-product-info">
                    <p className="review-product-name">{product.productName}</p>
                    <p className="review-product-variant">{product.variant}</p>
                    <p className="review-product-order">Đơn hàng: #{getOrderDisplayCode(product.orderId, product.orderCode)}</p>
                  </div>
                </div>
                <button
                  className="review-write-btn"
                  onClick={() => onOpenReviewModal(product)}
                >
                  Viết đánh giá
                </button>
              </div>
            ))}
          </div>
        ) : !reviewsLoading && !reviewsError ? (
          <div className="review-empty-state">
            <MessageSquare className="review-empty-icon" size={26} strokeWidth={1.8} />
            <p>Không có sản phẩm nào chờ đánh giá</p>
          </div>
        ) : null}
      </div>
    )}

    {reviewFilter === 'completed' && (
      <div className="review-section">
        {!reviewsLoading && !reviewsError && completedReviews.length > 0 ? (
          <div className="review-completed-list">
            {completedReviews.map((review) => (
              <div key={review.id} className="review-completed-card">
                <div className="review-completed-header">
                  <div className="review-pending-product">
                    <Link to={`/product/${encodeURIComponent(review.productId)}`} className="review-product-img">
                      <img
                        src={review.productImage || 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=80&h=80&fit=crop'}
                        alt={review.productName}
                      />
                    </Link>
                    <div className="review-product-info">
                      <p className="review-product-name">{review.productName}</p>
                      <p className="review-product-variant">Đơn hàng: #{getOrderDisplayCode(review.orderId, review.orderCode)}</p>
                    </div>
                  </div>
                  <span className="review-date">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="review-stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={`review-star ${i < review.rating ? 'filled' : ''}`}>★</span>
                  ))}
                </div>
                <p className="review-text">{review.content}</p>
                {review.shopReply ? (
                  <div className="review-reply">
                    <div className="review-reply-header">
                      <span className="review-reply-badge">Phản hồi từ shop</span>
                    </div>
                    <p className="review-reply-text">{review.shopReply.content}</p>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : !reviewsLoading && !reviewsError ? (
          <div className="review-empty-state">
            <Star className="review-empty-icon" size={26} strokeWidth={1.8} />
            <p>Bạn chưa có đánh giá nào</p>
          </div>
        ) : null}
      </div>
    )}
  </div>
);

const NotificationsTab = ({
  notifications,
  displayedNotifications,
  unreadCount,
  showAllNotifications,
  hasMoreNotifications,
  onShowAllNotifications,
  onMarkAllNotificationsRead,
  onNotificationClick,
  onDeleteNotification,
}: Pick<ProfileTabContentProps,
  | 'notifications'
  | 'displayedNotifications'
  | 'unreadCount'
  | 'showAllNotifications'
  | 'hasMoreNotifications'
  | 'onShowAllNotifications'
  | 'onMarkAllNotificationsRead'
  | 'onNotificationClick'
  | 'onDeleteNotification'
>) => (
  <div className="tab-pane">
    <div className="profile-content-header notify-header">
      <h2 className="profile-content-title">Thông báo</h2>
      {notifications.length > 0 && (
        <button
          className="mark-all-read-text-btn"
          onClick={onMarkAllNotificationsRead}
          disabled={unreadCount === 0}
        >
          Đánh dấu tất cả đã đọc
        </button>
      )}
    </div>

    {notifications.length === 0 ? (
      <div className="notifications-empty">
        <Bell size={64} strokeWidth={1} />
        <p>Không có thông báo nào</p>
      </div>
    ) : (
      <div className="notifications-list">
        {displayedNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`notification-card ${!notification.read ? 'unread' : ''}`}
            onClick={() => onNotificationClick(notification)}
          >
            <div className={`notification-icon notification-icon-${notification.type}`}>
              {notification.type === 'order' && <Package size={20} />}
              {notification.type === 'promotion' && <Tag size={20} />}
              {notification.type === 'review' && <Star size={20} />}
              {notification.type === 'system' && <Info size={20} />}
            </div>
            <div className="notification-content">
              <p className="notification-title">
                {notification.title}
                <span className="notification-time">
                  {notificationService.formatTimeAgo(notification.createdAt)}
                </span>
              </p>
              <p className="notification-message">{notification.message}</p>
            </div>
            <button
              className="notification-delete"
              onClick={(event) => {
                event.stopPropagation();
                onDeleteNotification(notification.id);
              }}
              aria-label="Xóa thông báo"
            >
              <Trash size={16} aria-hidden="true" />
            </button>
            {!notification.read && <span className="notification-dot" />}
          </div>
        ))}

        {!showAllNotifications && hasMoreNotifications && (
          <div className="notifications-show-all-wrap">
            <button
              type="button"
              className="notifications-show-all-btn"
              onClick={() => onShowAllNotifications(true)}
            >
              Xem tất cả
            </button>
          </div>
        )}
      </div>
    )}
  </div>
);

const ProfileTabContent = (props: ProfileTabContentProps) => {
  const {
    activeTab,
    user,
    profileLoading,
    profileError,
    orderFilter,
    onOrderFilterChange,
    orders,
    ordersLoading,
    ordersError,
    orderStatusLabelMap,
    onOpenOrderDetail,
    onRequestCancelOrder,
    vouchers,
    pagedVouchers,
    voucherPage,
    totalVoucherPages,
    vouchersPerPage,
    onVoucherPageChange,
    getVoucherMeta,
    isMarketplaceVoucher,
    addressesLoading,
    addressesError,
    savedAddresses,
    onAddAddress,
    onEditAddress,
    onRequestDeleteAddress,
    reviewFilter,
    onReviewFilterChange,
    pendingReviews,
    completedReviews,
    reviewsLoading,
    reviewsError,
    getOrderDisplayCode,
    onOpenReviewModal,
    notifications,
    displayedNotifications,
    unreadCount,
    showAllNotifications,
    hasMoreNotifications,
    onShowAllNotifications,
    onMarkAllNotificationsRead,
    onNotificationClick,
    onDeleteNotification,
    onOpenAccountModal,
    onOpenPasswordModal,
  } = props;

  switch (activeTab) {
    case 'account':
      return (
        <AccountTab
          user={user}
          profileLoading={profileLoading}
          profileError={profileError}
          onOpenAccountModal={onOpenAccountModal}
          onOpenPasswordModal={onOpenPasswordModal}
        />
      );
    case 'orders':
      return (
        <OrderTab
          orderFilter={orderFilter}
          onOrderFilterChange={onOrderFilterChange}
          orders={orders}
          ordersLoading={ordersLoading}
          ordersError={ordersError}
          orderStatusLabelMap={orderStatusLabelMap}
          onOpenOrderDetail={onOpenOrderDetail}
          onRequestCancelOrder={onRequestCancelOrder}
        />
      );
    case 'vouchers':
      return (
        <VouchersTab
          vouchers={vouchers}
          pagedVouchers={pagedVouchers}
          voucherPage={voucherPage}
          totalVoucherPages={totalVoucherPages}
          vouchersPerPage={vouchersPerPage}
          onVoucherPageChange={onVoucherPageChange}
          getVoucherMeta={getVoucherMeta}
          isMarketplaceVoucher={isMarketplaceVoucher}
        />
      );
    case 'addresses':
      return (
        <AddressesTab
          addressesLoading={addressesLoading}
          addressesError={addressesError}
          savedAddresses={savedAddresses}
          onAddAddress={onAddAddress}
          onEditAddress={onEditAddress}
          onRequestDeleteAddress={onRequestDeleteAddress}
        />
      );
    case 'reviews':
      return (
        <ReviewsTab
          reviewFilter={reviewFilter}
          onReviewFilterChange={onReviewFilterChange}
          pendingReviews={pendingReviews}
          completedReviews={completedReviews}
          reviewsLoading={reviewsLoading}
          reviewsError={reviewsError}
          getOrderDisplayCode={getOrderDisplayCode}
          onOpenReviewModal={onOpenReviewModal}
        />
      );
    case 'notifications':
      return (
        <NotificationsTab
          notifications={notifications}
          displayedNotifications={displayedNotifications}
          unreadCount={unreadCount}
          showAllNotifications={showAllNotifications}
          hasMoreNotifications={hasMoreNotifications}
          onShowAllNotifications={onShowAllNotifications}
          onMarkAllNotificationsRead={onMarkAllNotificationsRead}
          onNotificationClick={onNotificationClick}
          onDeleteNotification={onDeleteNotification}
        />
      );
    default:
      return null;
  }
};

export default ProfileTabContent;
