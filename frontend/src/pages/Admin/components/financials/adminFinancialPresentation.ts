import type { VendorWallet } from '../../../../services/walletService';

export const PAGE_SIZE = 20;
export const STORE_REF_FALLBACK = 'chua-co-slug';

export const formatCurrency = (value: number) =>
  value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

export const toStoreRef = (record: Pick<VendorWallet, 'storeSlug'>) =>
  `@${record.storeSlug?.trim() || STORE_REF_FALLBACK}`;
