import {
  getColorPresetByName,
  normalizeHexColor,
  resolveColorSwatch,
} from '../../utils/colorSwatch';
import type {
  ProductFormErrors,
  ProductStatusTone,
  VariantRowFormState,
  VendorProductVariantSaveShape,
} from './vendorProducts.types';
import { CUSTOM_COLOR_PRESET_VALUE } from './vendorProducts.constants';
import type { VendorProductStatus } from '../../services/vendorProductService';

export const getVendorProductStatusLabel = (status: VendorProductStatus) => {
  const map: Record<VendorProductStatus, string> = {
    active: 'Đang bán',
    low: 'Sắp hết hàng',
    out: 'Hết hàng',
    draft: 'Ẩn / nháp',
  };
  return map[status];
};

export const getVendorProductStatusTone = (status: VendorProductStatus): ProductStatusTone => {
  const map: Record<VendorProductStatus, ProductStatusTone> = {
    active: 'success',
    low: 'pending',
    out: 'error',
    draft: 'neutral',
  };
  return map[status];
};

export const normalizeVariantAxis = (value: string) => {
  const normalized = (value || '').trim();
  return normalized || 'Default';
};

export const normalizeVariantText = (value: string) => (value || '').trim();

export const resolveVariantPresetValue = (row: VariantRowFormState) => {
  if (!row.axis1.trim()) {
    return CUSTOM_COLOR_PRESET_VALUE;
  }
  const presetByName = getColorPresetByName(row.axis1);
  return presetByName?.name || CUSTOM_COLOR_PRESET_VALUE;
};

export const resolveVariantColorHex = (row: VariantRowFormState) => {
  const byHex = normalizeHexColor(row.colorHex, '');
  if (byHex) {
    return byHex;
  }
  return resolveColorSwatch(row.axis1, '#d1d5db');
};

export const buildVariantKey = (axis1: string, axis2: string) =>
  `${normalizeVariantAxis(axis1)}__${normalizeVariantAxis(axis2)}`.toLowerCase();

export const formPriceFromVariant = (basePrice: number, adjustment: number) =>
  Math.max(0, Number(basePrice || 0) + Number(adjustment || 0));

export const normalizeVariantRowsForSave = (rows: VariantRowFormState[]): VendorProductVariantSaveShape[] =>
  rows.map((row) => ({
    color: normalizeVariantText(row.axis1),
    colorHex: normalizeHexColor(row.colorHex, resolveColorSwatch(row.axis1, '#111827')),
    size: normalizeVariantText(row.axis2),
    stockQuantity: Math.max(0, Number(row.stockQuantity || 0)),
    priceAdjustment: Number(row.priceAdjustment || 0),
    isActive: row.isActive !== false,
  }));

export const validateVendorProductForm = (
  form: {
    name: string;
    categoryId: string;
    images: string[];
  },
  normalizedVariants: VendorProductVariantSaveShape[],
): ProductFormErrors => {
  const errors: ProductFormErrors = {};
  if (!form.name.trim()) errors.name = 'Tên sản phẩm không được để trống.';
  if (!form.categoryId) errors.categoryId = 'Vui lòng chọn danh mục sản phẩm.';
  if (!form.images.length) errors.image = 'Vui lòng tải lên ít nhất 1 ảnh sản phẩm.';
  if (normalizedVariants.length === 0) {
    errors.variants = 'Vui lòng nhập Màu sắc/Kích cỡ để tạo ít nhất một biến thể.';
  }

  if (normalizedVariants.length > 0) {
    const seenVariantKeys = new Set<string>();
    for (const variant of normalizedVariants) {
      if (!variant.color || !variant.size) {
        errors.variants = 'Vui lòng nhập đủ Màu sắc và Kích cỡ cho từng biến thể.';
        break;
      }
      const variantMatrixKey = buildVariantKey(variant.color, variant.size);
      if (seenVariantKeys.has(variantMatrixKey)) {
        errors.variants = `Biến thể bị trùng Màu sắc/Kích cỡ: ${variant.color} / ${variant.size}`;
        break;
      }
      seenVariantKeys.add(variantMatrixKey);
      if (variant.stockQuantity < 0) {
        errors.variants = 'Tồn kho biến thể không được âm.';
        break;
      }
    }
  }

  return errors;
};
