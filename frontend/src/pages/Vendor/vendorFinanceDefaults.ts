import type { PayoutRequest } from '../../services/walletService';
import type { VendorSettingsData } from '../../services/vendorPortalService';

export const DEFAULT_VENDOR_FINANCE_SETTINGS: VendorSettingsData = {
  storeInfo: {
    name: '',
    slug: '',
    description: '',
    logo: '',
    banner: '',
    contactEmail: '',
    phone: '',
    address: '',
  },
  bankInfo: {
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    verified: false,
  },
  notifications: {
    newOrder: true,
    orderStatusChange: true,
    lowStock: true,
    payoutComplete: true,
    promotions: false,
  },
  shipping: {
    ghn: true,
    ghtk: true,
    express: false,
    warehouseAddress: '',
    warehouseContact: '',
    warehousePhone: '',
  },
};

export const sortPayoutsByCreatedAtDesc = (items: PayoutRequest[]) =>
  [...items].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
