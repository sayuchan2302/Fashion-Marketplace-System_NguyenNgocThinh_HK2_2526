import { useCallback, useState } from 'react';
import { vendorProductService, type VendorProductRecord } from '../../services/vendorProductService';
import { getUiErrorMessage } from '../../utils/errorMessage';
import type { ToastType } from '../../contexts/ToastContext';
import type { DeleteConfirmState } from './vendorProducts.types';

interface UseVendorProductBulkActionsOptions {
  products: VendorProductRecord[];
  clearSelection: () => void;
  loadProducts: (options?: { silent?: boolean }) => Promise<void>;
  removeProductsOptimistically: (ids: string[]) => { removedCount: number; pageShifted: boolean };
  addToast: (message: string, tone?: ToastType) => void;
  pushToast: (message: string) => void;
}

export const useVendorProductBulkActions = ({
  products,
  clearSelection,
  loadProducts,
  removeProductsOptimistically,
  addToast,
  pushToast,
}: UseVendorProductBulkActionsOptions) => {
  const [working, setWorking] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState | null>(null);

  const applyVisibility = useCallback(async (ids: string[], visible: boolean) => {
    setWorking(true);
    try {
      await Promise.all(ids.map((id) => vendorProductService.setVisibility(id, visible)));
      clearSelection();
      pushToast(visible ? 'Đã mở hiển thị các sản phẩm đã chọn' : 'Đã ẩn các sản phẩm đã chọn');
      await loadProducts();
    } catch (error: unknown) {
      addToast(getUiErrorMessage(error, 'Không thể cập nhật trạng thái hiển thị'), 'error');
    } finally {
      setWorking(false);
    }
  }, [addToast, clearSelection, loadProducts, pushToast]);

  const requestDelete = useCallback((ids: string[]) => {
    const items = products.filter((product) => ids.includes(product.id));
    if (items.length === 0) {
      return;
    }

    setDeleteConfirm({
      ids,
      selectedItems: items.map((item) => item.name),
      title: ids.length > 1 ? 'Xóa các sản phẩm đã chọn' : 'Xóa sản phẩm',
      description:
        ids.length > 1
          ? 'Sản phẩm sẽ được đưa về trạng thái lưu trữ (soft delete) và ẩn khỏi storefront.'
          : 'Sản phẩm sẽ được đưa về trạng thái lưu trữ (soft delete).',
      confirmLabel: ids.length > 1 ? 'Xóa sản phẩm' : 'Xóa ngay',
    });
  }, [products]);

  const confirmDelete = useCallback(async () => {
    if (!deleteConfirm) {
      return;
    }

    setWorking(true);
    try {
      await Promise.all(deleteConfirm.ids.map((id) => vendorProductService.deleteProduct(id)));
      clearSelection();
      const { removedCount, pageShifted } = removeProductsOptimistically(deleteConfirm.ids);
      pushToast(deleteConfirm.ids.length > 1 ? 'Đã xóa các sản phẩm đã chọn' : 'Đã xóa sản phẩm');
      setDeleteConfirm(null);

      if (removedCount > 0 && !pageShifted) {
        void loadProducts({ silent: true });
      }
    } catch (error: unknown) {
      addToast(getUiErrorMessage(error, 'Không thể xóa sản phẩm'), 'error');
    } finally {
      setWorking(false);
    }
  }, [addToast, clearSelection, deleteConfirm, loadProducts, pushToast, removeProductsOptimistically]);

  return {
    working,
    deleteConfirm,
    setDeleteConfirm,
    applyVisibility,
    requestDelete,
    confirmDelete,
  };
};
