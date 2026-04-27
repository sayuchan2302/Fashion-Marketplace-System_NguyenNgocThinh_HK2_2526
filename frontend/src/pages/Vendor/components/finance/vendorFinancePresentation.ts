import type { PayoutRequest, VendorWallet } from '../../../../services/walletService';

export const formatCurrency = (value: number) =>
  value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

export const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export const payoutStatusLabel: Record<PayoutRequest['status'], string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Đã từ chối',
};

export const payoutStatusTone = (status: PayoutRequest['status']) => {
  if (status === 'APPROVED') return 'success';
  if (status === 'REJECTED') return 'error';
  return 'pending';
};

export const buildWalletStatItems = (wallet: VendorWallet | null) => [
  {
    key: 'available',
    label: 'Số dư khả dụng',
    value: formatCurrency(wallet?.availableBalance || 0),
    sub: 'Có thể gửi yêu cầu rút tiền ngay',
    tone: 'success',
  },
  {
    key: 'frozen',
    label: 'Tiền tạm giữ',
    value: formatCurrency(wallet?.frozenBalance || 0),
    sub: 'Đang chờ hết thời gian giữ tiền',
    tone: 'warning',
  },
  {
    key: 'reserved',
    label: 'Chờ giải ngân',
    value: formatCurrency(wallet?.reservedBalance || 0),
    sub: 'Đã tạo phiếu rút tiền, chờ admin duyệt',
    tone: 'teal',
  },
  {
    key: 'total',
    label: 'Tổng số dư',
    value: formatCurrency(wallet?.totalBalance || 0),
    sub: 'Tổng tài sản hiện có trong ví shop',
    tone: '',
  },
];
