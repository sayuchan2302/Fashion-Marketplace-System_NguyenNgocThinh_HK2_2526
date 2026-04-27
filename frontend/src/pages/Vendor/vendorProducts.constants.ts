import type { ProductTab, ProductFormState, VariantRowFormState, VendorProductStatusCounts } from './vendorProducts.types';

export const PAGE_SIZE = 8;
export const MAX_PRODUCT_IMAGES = 4;
export const MAX_PRODUCT_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const CUSTOM_COLOR_PRESET_VALUE = '__custom__';

export const DEFAULT_STATUS_COUNTS: VendorProductStatusCounts = {
  all: 0,
  active: 0,
  draft: 0,
  outOfStock: 0,
  lowStock: 0,
};

export const PRODUCT_TABS: Array<{ key: ProductTab; label: string }> = [
  { key: 'all', label: 'Tất cả' },
  { key: 'active', label: 'Đang bán' },
  { key: 'outOfStock', label: 'Hết hàng' },
  { key: 'draft', label: 'Ẩn / nháp' },
];

export const normalizeProductTab = (value: string | null): ProductTab => {
  if (value === 'active' || value === 'outOfStock' || value === 'draft') {
    return value;
  }
  return 'all';
};

export const createVariantRow = (): VariantRowFormState => ({
  key: `variant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  axis1: '',
  axis2: '',
  colorHex: '#111827',
  stockQuantity: 0,
  priceAdjustment: 0,
  isActive: true,
});

export const createEmptyProductForm = (): ProductFormState => ({
  parentCategoryId: '',
  name: '',
  categoryId: '',
  basePrice: 0,
  salePrice: 0,
  stock: 0,
  images: [],
  description: '',
  sizeAndFit: '',
  fabricAndCare: '',
  gender: '',
  fit: '',
  visible: true,
});
