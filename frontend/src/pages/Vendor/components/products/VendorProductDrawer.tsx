import type { ChangeEvent, RefObject } from 'react';
import { X } from 'lucide-react';
import Drawer from '../../../../components/Drawer/Drawer';
import { MAX_PRODUCT_IMAGES } from '../../vendorProducts.constants';
import type { ProductFormErrors, ProductFormState, VariantRowFormState } from '../../vendorProducts.types';
import type { VendorProductCategory } from '../../../../services/vendorProductService';
import VendorProductBasicsSection from './VendorProductBasicsSection';
import VendorProductCategorySection from './VendorProductCategorySection';
import VendorProductImageSection from './VendorProductImageSection';
import VendorProductVariantsSection from './VendorProductVariantsSection';
import VendorProductDescriptionSection from './VendorProductDescriptionSection';

interface VendorProductDrawerProps {
  open: boolean;
  form: ProductFormState;
  formErrors: ProductFormErrors;
  parentCategories: VendorProductCategory[];
  childCategories: VendorProductCategory[];
  leafCategories: VendorProductCategory[];
  variantRows: VariantRowFormState[];
  variantStockTotal: number;
  saving: boolean;
  imageUploading: boolean;
  productImageInputRef: RefObject<HTMLInputElement | null>;
  onClose: () => void;
  onFormChange: (patch: Partial<ProductFormState>) => void;
  onParentCategoryChange: (parentCategoryId: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onOpenProductImagePicker: () => void;
  onProductImagesSelected: (event: ChangeEvent<HTMLInputElement>) => Promise<void> | void;
  onRemoveProductImage: (index: number) => void;
  onSetPrimaryProductImage: (index: number) => void;
  onAddVariantRow: () => void;
  onUpdateVariantRow: (key: string, mutate: (current: VariantRowFormState) => VariantRowFormState) => void;
  onRemoveVariantRow: (key: string) => void;
  onSave: () => Promise<void> | void;
}

const VendorProductDrawer = ({
  open,
  form,
  formErrors,
  parentCategories,
  childCategories,
  leafCategories,
  variantRows,
  variantStockTotal,
  saving,
  imageUploading,
  productImageInputRef,
  onClose,
  onFormChange,
  onParentCategoryChange,
  onCategoryChange,
  onOpenProductImagePicker,
  onProductImagesSelected,
  onRemoveProductImage,
  onSetPrimaryProductImage,
  onAddVariantRow,
  onUpdateVariantRow,
  onRemoveVariantRow,
  onSave,
}: VendorProductDrawerProps) => (
  <Drawer open={open} onClose={onClose} className="vendor-product-drawer">
    <div className="drawer-header vendor-product-drawer-header">
      <div>
        <p className="drawer-eyebrow">{form.id ? 'Chỉnh sửa sản phẩm' : 'Tạo sản phẩm mới'}</p>
        <h3>{form.name || 'Sản phẩm mới'}</h3>
      </div>
      <button className="admin-icon-btn" onClick={onClose} aria-label="Đóng biểu mẫu sản phẩm">
        <X size={16} />
      </button>
    </div>

    <div className="drawer-body">
      <section className="drawer-section">
        <h4>Thông tin sản phẩm</h4>
        <div className="form-grid">
          <VendorProductBasicsSection form={form} nameError={formErrors.name} onFormChange={onFormChange} />
          <VendorProductCategorySection
            form={form}
            parentCategories={parentCategories}
            childCategories={childCategories}
            leafCategories={leafCategories}
            categoryError={formErrors.categoryId}
            onParentCategoryChange={onParentCategoryChange}
            onCategoryChange={onCategoryChange}
          />
          <VendorProductImageSection
            productName={form.name}
            images={form.images}
            imageUploading={imageUploading}
            imageError={formErrors.image}
            maxImages={MAX_PRODUCT_IMAGES}
            productImageInputRef={productImageInputRef}
            onOpenPicker={onOpenProductImagePicker}
            onImagesSelected={onProductImagesSelected}
            onSetPrimary={onSetPrimaryProductImage}
            onRemoveImage={onRemoveProductImage}
          />
        </div>
      </section>

      <VendorProductVariantsSection
        variantRows={variantRows}
        productBasePrice={form.basePrice}
        productSalePrice={form.salePrice}
        variantStockTotal={variantStockTotal}
        variantsError={formErrors.variants}
        onAddVariantRow={onAddVariantRow}
        onUpdateVariantRow={onUpdateVariantRow}
        onRemoveVariantRow={onRemoveVariantRow}
      />

      <VendorProductDescriptionSection form={form} onFormChange={onFormChange} />
    </div>

    <div className="drawer-footer">
      <button className="admin-ghost-btn" onClick={onClose} disabled={saving}>Hủy</button>
      <button
        className="admin-primary-btn vendor-admin-primary"
        onClick={() => void onSave()}
        disabled={saving || leafCategories.length === 0}
      >
        {saving ? 'Đang lưu...' : form.id ? 'Lưu cập nhật' : 'Tạo sản phẩm'}
      </button>
    </div>
  </Drawer>
);

export default VendorProductDrawer;
