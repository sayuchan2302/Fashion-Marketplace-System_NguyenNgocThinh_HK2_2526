import type { VendorProductCategory } from '../../../../services/vendorProductService';
import type { ProductFormState } from '../../vendorProducts.types';

interface VendorProductCategorySectionProps {
  form: ProductFormState;
  parentCategories: VendorProductCategory[];
  childCategories: VendorProductCategory[];
  leafCategories: VendorProductCategory[];
  categoryError?: string;
  onParentCategoryChange: (parentCategoryId: string) => void;
  onCategoryChange: (categoryId: string) => void;
}

const VendorProductCategorySection = ({
  form,
  parentCategories,
  childCategories,
  leafCategories,
  categoryError,
  onParentCategoryChange,
  onCategoryChange,
}: VendorProductCategorySectionProps) => (
  <div className="form-field full vendor-product-category-block">
    <span>Danh mục sản phẩm</span>
    <div className="vendor-product-category-grid">
      <label className="form-field">
        <span>Danh mục cha</span>
        <select
          value={form.parentCategoryId}
          onChange={(event) => onParentCategoryChange(event.target.value)}
        >
          <option value="">Chọn danh mục cha</option>
          {parentCategories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </label>

      <label className="form-field">
        <span>Danh mục con</span>
        <select
          value={form.categoryId}
          onChange={(event) => onCategoryChange(event.target.value)}
          disabled={!form.parentCategoryId}
        >
          <option value="">{form.parentCategoryId ? 'Chọn danh mục con' : 'Chọn danh mục cha trước'}</option>
          {childCategories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </label>
    </div>
    {leafCategories.length === 0 && (
      <small className="admin-muted">Chưa có danh mục. Vui lòng nhờ admin tạo danh mục trước khi đăng sản phẩm.</small>
    )}
    {categoryError && <small className="form-field-error">{categoryError}</small>}
  </div>
);

export default VendorProductCategorySection;
