import type { ChangeEvent, RefObject } from 'react';
import Drawer from '../../../../components/Drawer/Drawer';
import {
  PanelDrawerFooter,
  PanelDrawerHeader,
  PanelDrawerSection,
} from '../../../../components/Panel/PanelPrimitives';
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
  readOnly?: boolean;
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
  readOnly = false,
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
    <PanelDrawerHeader
      eyebrow={readOnly ? 'Xem sản phẩm bị chặn' : form.id ? 'Chỉnh sửa sản phẩm' : 'Tạo sản phẩm mới'}
      title={form.name || 'Sản phẩm mới'}
      subtitle={readOnly ? 'Sản phẩm đang bị quản trị viên chặn nên người bán chỉ có thể xem thông tin.' : 'Thông tin hiển thị, danh mục, ảnh và biến thể bán hàng của SKU.'}
      onClose={onClose}
      closeLabel="Đóng biểu mẫu sản phẩm"
    />

    <div className="drawer-body">
      {readOnly && form.status === 'banned' ? (
        <div className="vendor-product-blocked-alert" role="status">
          <strong>Sản phẩm đã bị chặn bởi quản trị viên</strong>
          <p>{form.moderationReason || 'Chưa có lý do cụ thể. Vui lòng liên hệ hỗ trợ để được kiểm tra.'}</p>
        </div>
      ) : null}

      <PanelDrawerSection title="Thông tin sản phẩm">
        <div className="form-grid">
          <VendorProductBasicsSection form={form} nameError={formErrors.name} readOnly={readOnly} onFormChange={onFormChange} />
          <VendorProductCategorySection
            form={form}
            parentCategories={parentCategories}
            childCategories={childCategories}
            leafCategories={leafCategories}
            categoryError={formErrors.categoryId}
            readOnly={readOnly}
            onParentCategoryChange={onParentCategoryChange}
            onCategoryChange={onCategoryChange}
          />
          <VendorProductImageSection
            productName={form.name}
            images={form.images}
            imageUploading={imageUploading}
            imageError={formErrors.image}
            maxImages={MAX_PRODUCT_IMAGES}
            readOnly={readOnly}
            productImageInputRef={productImageInputRef}
            onOpenPicker={onOpenProductImagePicker}
            onImagesSelected={onProductImagesSelected}
            onSetPrimary={onSetPrimaryProductImage}
            onRemoveImage={onRemoveProductImage}
          />
        </div>
      </PanelDrawerSection>

      <VendorProductVariantsSection
        variantRows={variantRows}
        productBasePrice={form.basePrice}
        productSalePrice={form.salePrice}
        variantStockTotal={variantStockTotal}
        variantsError={formErrors.variants}
        readOnly={readOnly}
        onAddVariantRow={onAddVariantRow}
        onUpdateVariantRow={onUpdateVariantRow}
        onRemoveVariantRow={onRemoveVariantRow}
      />

      <VendorProductDescriptionSection form={form} readOnly={readOnly} onFormChange={onFormChange} />
    </div>

    <PanelDrawerFooter>
      <button className="admin-ghost-btn" onClick={onClose} disabled={saving}>{readOnly ? 'Đóng' : 'Hủy'}</button>
      {!readOnly ? (
        <button
          className="admin-primary-btn vendor-admin-primary"
          onClick={() => void onSave()}
          disabled={saving || leafCategories.length === 0}
        >
          {saving ? 'Đang lưu...' : form.id ? 'Lưu cập nhật' : 'Tạo sản phẩm'}
        </button>
      ) : null}
    </PanelDrawerFooter>
  </Drawer>
);

export default VendorProductDrawer;
