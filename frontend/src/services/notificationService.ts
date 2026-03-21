export type NotificationType = 'order' | 'promotion' | 'review' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  image?: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

const KEY = 'coolmate_notifications_v1';

const seedNotifications: Notification[] = [
  {
    id: 'notif_001',
    type: 'order',
    title: 'Đơn hàng đã được giao!',
    message: 'Đơn hàng #CM20260301 đã được giao thành công. Cảm ơn bạn đã mua sắm tại Coolmate!',
    link: '/order/CM20260301',
    read: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif_002',
    type: 'promotion',
    title: '🎉 Mã giảm giá 20% cho đơn hàng mới',
    message: 'Sử dụng mã SUMMER20 để được giảm 20% tối đa 100K cho đơn từ 300K. Hết hạn: 31/08/2026',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif_003',
    type: 'order',
    title: 'Đơn hàng đang được giao',
    message: 'Đơn hàng #CM20260312 đang trên đường đến bạn. Dự kiến giao trong ngày hôm nay.',
    link: '/order/CM20260312',
    read: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif_004',
    type: 'review',
    title: 'Cảm ơn bạn đã đánh giá!',
    message: 'Cảm ơn bạn đã chia sẻ trải nghiệm về Áo Thun Nam Cổ Tròn Cotton. Đánh giá của bạn giúp Coolmate cải thiện dịch vụ.',
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif_005',
    type: 'system',
    title: 'Chào mừng đến với Coolmate!',
    message: 'Cảm ơn bạn đã đăng ký tài khoản tại Coolmate. Khám phá ngay các sản phẩm thời trang chất lượng với giá tốt nhất!',
    read: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const load = (): Notification[] => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seedNotifications;
    const data: Notification[] = JSON.parse(raw);
    return data.length ? data : seedNotifications;
  } catch {
    return seedNotifications;
  }
};

const save = (notifications: Notification[]) => {
  localStorage.setItem(KEY, JSON.stringify(notifications));
};

export const notificationService = {
  getAll(): Notification[] {
    return load().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getUnread(): Notification[] {
    return this.getAll().filter(n => !n.read);
  },

  getUnreadCount(): number {
    return this.getUnread().length;
  },

  markAsRead(id: string): void {
    const data = load();
    const notification = data.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      save(data);
    }
  },

  markAllAsRead(): void {
    const data = load();
    data.forEach(n => { n.read = true; });
    save(data);
  },

  delete(id: string): void {
    const data = load().filter(n => n.id !== id);
    save(data);
  },

  deleteAll(): void {
    save([]);
  },

  add(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): Notification {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    const data = load();
    data.unshift(newNotification);
    save(data);
    return newNotification;
  },

  addOrderNotification(orderId: string, _status: string, message: string): Notification {
    return this.add({
      type: 'order',
      title: `Cập nhật đơn hàng #${orderId}`,
      message,
      link: `/order/${orderId}`,
    });
  },

  addPromotionNotification(title: string, message: string): Notification {
    return this.add({
      type: 'promotion',
      title,
      message,
    });
  },

  formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  },

  getNotificationIcon(type: NotificationType): string {
    switch (type) {
      case 'order': return '📦';
      case 'promotion': return '🎉';
      case 'review': return '⭐';
      case 'system': return '🔔';
      default: return '📌';
    }
  },
};
