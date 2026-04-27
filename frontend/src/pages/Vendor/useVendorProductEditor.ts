import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { vendorProductService, type VendorProductCategory, type VendorProductRecord } from '../../services/vendorProductService';
import type { ToastType } from '../../contexts/ToastContext';
import { getUiErrorMessage } from '../../utils/errorMessage';
import { VENDOR_COLOR_PRESETS, getColorPresetByName, normalizeHexColor, resolveColorSwatch } from '../../utils/colorSwatch';
import {
  createEmptyProductForm,
  createVariantRow,
  CUSTOM_COLOR_PRESET_VALUE,
  MAX_PRODUCT_IMAGES,
  MAX_PRODUCT_IMAGE_SIZE_BYTES,
} from './vendorProducts.constants';
import {
  buildVariantKey,
  formPriceFromVariant,
  normalizeVariantRowsForSave,
  validateVendorProductForm,
} from './vendorProductsHelpers';
import type { ProductFormErrors, ProductFormState, VariantRowFormState } from './vendorProducts.types';

interface UseVendorProductEditorOptions {
  products: VendorProductRecord[];
  showDrawer: boolean;
  setShowDrawer: (open: boolean) => void;
  addToast: (message: string, tone?: ToastType) => void;
  pushToast: (message: string) => void;
  loadProducts: () => Promise<void>;
}

export const useVendorProductEditor = ({
  products,
  showDrawer,
  setShowDrawer,
  addToast,
  pushToast,
  loadProducts,
}: UseVendorProductEditorOptions) => {
  const [categories, setCategories] = useState<VendorProductCategory[]>([]);
  const [productForm, setProductForm] = useState<ProductFormState>(createEmptyProductForm());
  const [formErrors, setFormErrors] = useState<ProductFormErrors>({});
  const [variantRows, setVariantRows] = useState<VariantRowFormState[]>([]);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const productImageInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let active = true;
    const loadCategories = async () => {
      const rows = await vendorProductService.getCategories();
      if (!active) {
        return;
      }
      setCategories(rows);
    };
    void loadCategories();
    return () => {
      active = false;
    };
  }, []);

  const categoryById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );

  const leafCategories = useMemo(
    () => categories.filter((category) => category.leaf),
    [categories],
  );

  const resolveRootCategoryId = useCallback((categoryId: string) => {
    let current = categoryById.get(categoryId);
    if (!current) {
      return '';
    }

    const visited = new Set<string>();
    while (current.parentId && !visited.has(current.parentId)) {
      visited.add(current.parentId);
      const parent = categoryById.get(current.parentId);
      if (!parent) {
        break;
      }
      current = parent;
    }

    return current.id;
  }, [categoryById]);

  const parentCategories = useMemo(() => {
    const rootIds = new Set(
      leafCategories
        .map((category) => resolveRootCategoryId(category.id))
        .filter((id) => Boolean(id)),
    );

    return categories
      .filter((category) => !category.parentId && rootIds.has(category.id))
      .sort((left, right) => left.name.localeCompare(right.name, 'vi'));
  }, [categories, leafCategories, resolveRootCategoryId]);

  const childCategories = useMemo(() => {
    if (!productForm.parentCategoryId) {
      return [];
    }

    return leafCategories
      .filter((category) => resolveRootCategoryId(category.id) === productForm.parentCategoryId)
      .sort((left, right) => left.label.localeCompare(right.label, 'vi'));
  }, [leafCategories, productForm.parentCategoryId, resolveRootCategoryId]);

  const variantStockTotal = useMemo(
    () => variantRows.reduce((sum, row) => sum + Math.max(0, Number(row.stockQuantity || 0)), 0),
    [variantRows],
  );

  useEffect(() => {
    if (!showDrawer || !productForm.categoryId || productForm.parentCategoryId) {
      return;
    }

    const resolvedParentId = resolveRootCategoryId(productForm.categoryId);
    if (!resolvedParentId) {
      return;
    }

    setProductForm((current) => {
      if (!current.categoryId || current.parentCategoryId) {
        return current;
      }
      return { ...current, parentCategoryId: resolvedParentId };
    });
  }, [productForm.categoryId, productForm.parentCategoryId, resolveRootCategoryId, showDrawer]);

  useEffect(() => {
    if (!showDrawer || variantRows.length === 0) {
      return;
    }

    setProductForm((current) => (current.stock === variantStockTotal
      ? current
      : { ...current, stock: variantStockTotal }));
  }, [showDrawer, variantRows.length, variantStockTotal]);

  const updateProductForm = useCallback((patch: Partial<ProductFormState>) => {
    setProductForm((current) => ({ ...current, ...patch }));
  }, []);

  const openCreateDrawer = useCallback(() => {
    const nextParentId = parentCategories.length === 1 ? parentCategories[0].id : '';
    setProductForm({
      ...createEmptyProductForm(),
      parentCategoryId: nextParentId,
    });
    setVariantRows([createVariantRow()]);
    setFormErrors({});
    setShowDrawer(true);
  }, [parentCategories, setShowDrawer]);

  const openEditDrawer = useCallback((id: string) => {
    const current = products.find((product) => product.id === id);
    if (!current) {
      return;
    }

    setProductForm({
      id: current.id,
      slug: current.slug,
      parentCategoryId: current.categoryId ? resolveRootCategoryId(current.categoryId) : '',
      name: current.name,
      categoryId: current.categoryId || '',
      basePrice: current.basePrice ?? current.price ?? 0,
      salePrice: current.salePrice ?? 0,
      stock: current.stock,
      sizeAndFit: current.sizeAndFit || current.highlights || '',
      fabricAndCare: current.fabricAndCare || current.careInstructions || current.material || '',
      gender: current.gender || '',
      fit: current.fit || '',
      images: current.images && current.images.length > 0 ? [...current.images] : (current.image ? [current.image] : []),
      description: current.description,
      visible: current.visible,
    });

    const usedKeys = new Set<string>();
    const rows = (current.variants || []).map((variant, index) => {
      const axis1 = (variant.color || '').trim();
      const axis2 = (variant.size || '').trim();
      const baseKey = buildVariantKey(axis1, axis2);
      let key = baseKey;
      while (usedKeys.has(key)) {
        key = `${baseKey}__${index}`;
      }
      usedKeys.add(key);
      return {
        key,
        axis1,
        axis2,
        colorHex: normalizeHexColor(variant.colorHex || '', resolveColorSwatch(axis1, '#111827')),
        stockQuantity: Math.max(0, Number(variant.stockQuantity || 0)),
        priceAdjustment: Number(variant.priceAdjustment || 0),
        isActive: variant.isActive !== false,
      } satisfies VariantRowFormState;
    });

    setVariantRows(rows.length > 0 ? rows : [createVariantRow()]);
    setFormErrors({});
    setShowDrawer(true);
  }, [products, resolveRootCategoryId, setShowDrawer]);

  const closeDrawer = useCallback(() => {
    setShowDrawer(false);
  }, [setShowDrawer]);

  const openProductImagePicker = useCallback(() => {
    if (imageUploading) {
      return;
    }
    productImageInputRef.current?.click();
  }, [imageUploading]);

  const removeProductImage = useCallback((index: number) => {
    setProductForm((current) => ({
      ...current,
      images: current.images.filter((_, imageIndex) => imageIndex !== index),
    }));
  }, []);

  const setPrimaryProductImage = useCallback((index: number) => {
    setProductForm((current) => {
      if (index <= 0 || index >= current.images.length) {
        return current;
      }

      const nextImages = [...current.images];
      const [selectedImage] = nextImages.splice(index, 1);
      nextImages.unshift(selectedImage);
      return {
        ...current,
        images: nextImages,
      };
    });
  }, []);

  const handleProductImagesSelected = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (files.length === 0) {
      return;
    }

    const remainingSlots = MAX_PRODUCT_IMAGES - productForm.images.length;
    if (remainingSlots <= 0) {
      addToast(`Chỉ được tối đa ${MAX_PRODUCT_IMAGES} ảnh cho mỗi sản phẩm.`, 'info');
      return;
    }

    const selectedFiles = files.slice(0, remainingSlots);
    const tooLarge = selectedFiles.find((file) => file.size > MAX_PRODUCT_IMAGE_SIZE_BYTES);
    if (tooLarge) {
      addToast('Ảnh vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn.', 'error');
      return;
    }

    try {
      setImageUploading(true);
      const uploadedUrls = await Promise.all(
        selectedFiles.map((file) => vendorProductService.uploadProductImage(file)),
      );
      setProductForm((current) => ({
        ...current,
        images: Array.from(new Set([...current.images, ...uploadedUrls])).slice(0, MAX_PRODUCT_IMAGES),
      }));
      setFormErrors((current) => {
        if (!current.image) {
          return current;
        }
        const nextErrors = { ...current };
        delete nextErrors.image;
        return nextErrors;
      });
      addToast('Đã tải ảnh sản phẩm lên thành công.', 'success');
    } catch (error: unknown) {
      addToast(getUiErrorMessage(error, 'Không thể tải ảnh sản phẩm lên'), 'error');
    } finally {
      setImageUploading(false);
    }
  }, [addToast, productForm.images.length]);

  const addVariantRow = useCallback(() => {
    setVariantRows((current) => [...current, createVariantRow()]);
    setFormErrors((current) => {
      if (!current.variants) {
        return current;
      }
      const nextErrors = { ...current };
      delete nextErrors.variants;
      return nextErrors;
    });
  }, []);

  const updateVariantRow = useCallback((key: string, mutate: (current: VariantRowFormState) => VariantRowFormState) => {
    setVariantRows((current) => current.map((row) => (row.key === key ? mutate(row) : row)));
  }, []);

  const removeVariantRow = useCallback((key: string) => {
    setVariantRows((current) => {
      const nextRows = current.filter((row) => row.key !== key);
      return nextRows.length > 0 ? nextRows : [createVariantRow()];
    });
  }, []);

  const saveProduct = useCallback(async () => {
    let normalizedVariants = normalizeVariantRowsForSave(variantRows).filter((variant) => (
      variant.color || variant.size || variant.stockQuantity > 0 || variant.priceAdjustment !== 0
    ));

    const referencePrice = productForm.salePrice || productForm.basePrice;
    const normalizedVariantPrices = normalizedVariants.map((variant) =>
      formPriceFromVariant(referencePrice, variant.priceAdjustment));
    const variantDrivenStock = normalizedVariants.reduce(
      (sum, variant) => sum + Math.max(0, Number(variant.stockQuantity || 0)),
      0,
    );
    const variantDrivenBasePrice = normalizedVariantPrices.length > 0
      ? Math.max(0, normalizedVariantPrices[0])
      : (productForm.salePrice || productForm.basePrice);

    if (normalizedVariants.length > 0) {
      normalizedVariants = normalizedVariants.map((variant, index) => ({
        ...variant,
        priceAdjustment: Math.max(0, normalizedVariantPrices[index]) - variantDrivenBasePrice,
      }));
    }

    const normalizedForm: ProductFormState = {
      ...productForm,
      name: productForm.name.trim(),
      description: productForm.description.trim(),
      sizeAndFit: productForm.sizeAndFit.trim(),
      fabricAndCare: productForm.fabricAndCare.trim(),
      gender: productForm.gender,
      fit: productForm.fit,
      images: productForm.images
        .map((image) => image.trim())
        .filter((image) => Boolean(image))
        .slice(0, MAX_PRODUCT_IMAGES),
      basePrice: productForm.basePrice,
      salePrice: productForm.salePrice,
      stock: normalizedVariants.length > 0 ? variantDrivenStock : productForm.stock,
    };

    const errors = validateVendorProductForm(normalizedForm, normalizedVariants);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setSaving(true);
    try {
      if (normalizedForm.id) {
        await vendorProductService.updateProduct(normalizedForm.id, {
          name: normalizedForm.name,
          slug: normalizedForm.slug,
          categoryId: normalizedForm.categoryId || undefined,
          price: normalizedForm.basePrice,
          salePrice: normalizedForm.salePrice,
          stock: normalizedForm.stock,
          images: normalizedForm.images,
          description: normalizedForm.description,
          sizeAndFit: normalizedForm.sizeAndFit,
          fabricAndCare: normalizedForm.fabricAndCare,
          gender: normalizedForm.gender,
          fit: normalizedForm.fit,
          visible: normalizedForm.visible,
          variants: normalizedVariants.length > 0 ? normalizedVariants : undefined,
        });
        pushToast('Đã cập nhật sản phẩm thành công');
      } else {
        await vendorProductService.createProduct({
          name: normalizedForm.name,
          categoryId: normalizedForm.categoryId || undefined,
          price: normalizedForm.basePrice,
          salePrice: normalizedForm.salePrice,
          stock: normalizedForm.stock,
          images: normalizedForm.images,
          description: normalizedForm.description,
          sizeAndFit: normalizedForm.sizeAndFit,
          fabricAndCare: normalizedForm.fabricAndCare,
          gender: normalizedForm.gender,
          fit: normalizedForm.fit,
          visible: normalizedForm.visible,
          variants: normalizedVariants.length > 0 ? normalizedVariants : undefined,
        });
        pushToast('Đã tạo sản phẩm mới cho gian hàng');
      }

      setShowDrawer(false);
      await loadProducts();
    } catch (error: unknown) {
      addToast(getUiErrorMessage(error, 'Không thể lưu sản phẩm'), 'error');
    } finally {
      setSaving(false);
    }
  }, [addToast, loadProducts, productForm, pushToast, setShowDrawer, variantRows]);

  return {
    categories,
    leafCategories,
    parentCategories,
    childCategories,
    productForm,
    formErrors,
    variantRows,
    variantStockTotal,
    saving,
    imageUploading,
    productImageInputRef,
    updateProductForm,
    setFormErrors,
    openCreateDrawer,
    openEditDrawer,
    closeDrawer,
    openProductImagePicker,
    removeProductImage,
    setPrimaryProductImage,
    handleProductImagesSelected,
    addVariantRow,
    updateVariantRow,
    removeVariantRow,
    saveProduct,
    colorPresets: VENDOR_COLOR_PRESETS,
    customColorPresetValue: CUSTOM_COLOR_PRESET_VALUE,
    getColorPresetByName,
    normalizeHexColor,
    resolveColorSwatch,
  };
};
