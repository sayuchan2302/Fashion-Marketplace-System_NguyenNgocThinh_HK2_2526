import type { VendorOrderLifecycleStatus } from '../../services/vendorPortalService';

type VendorStatusTone = 'pending' | 'teal' | 'success' | 'error' | 'neutral';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  processing: 'Đang xử lý',
  shipped: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
  canceled: 'Đã hủy',
  shipping: 'Đang giao',
  completed: 'Đã giao',
  done: 'Đã giao',
};

const STATUS_TONES: Record<string, VendorStatusTone> = {
  pending: 'pending',
  confirmed: 'teal',
  processing: 'teal',
  shipped: 'teal',
  delivered: 'success',
  done: 'success',
  cancelled: 'error',
  canceled: 'error',
};

export const getVendorOrderStatusLabel = (status: VendorOrderLifecycleStatus | string) => STATUS_LABELS[status] || status;

export const getVendorOrderStatusTone = (status: VendorOrderLifecycleStatus | string): VendorStatusTone =>
  STATUS_TONES[status] || 'neutral';

export const formatVendorOrderDate = (dateStr: string, withTime = false) => {
  const date = new Date(dateStr);

  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
};
