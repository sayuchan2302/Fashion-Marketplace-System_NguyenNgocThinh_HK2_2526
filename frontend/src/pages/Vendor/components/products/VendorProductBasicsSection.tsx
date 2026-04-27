import type { ProductFormState } from '../../vendorProducts.types';

interface VendorProductBasicsSectionProps {
  form: ProductFormState;
  nameError?: string;
  onFormChange: (patch: Partial<ProductFormState>) => void;
}

const VendorProductBasicsSection = ({
  form,
  nameError,
  onFormChange,
}: VendorProductBasicsSectionProps) => (
  <>
    <label className="form-field full">
      <span>Tên sản phẩm</span>
      <input value={form.name} onChange={(event) => onFormChange({ name: event.target.value })} />
      {nameError && <small className="form-field-error">{nameError}</small>}
    </label>

    <div className="form-field full vendor-product-category-block">
      <div className="vendor-product-category-grid">
        <label className="form-field">
          <span>Giá gốc</span>
          <input type="number" min={0} value={form.basePrice} onChange={(event) => onFormChange({ basePrice: Math.max(0, Number(event.target.value)) })} />
        </label>
        <label className="form-field">
          <span>Giá khuyến mãi (Tùy chọn)</span>
          <input type="number" min={0} value={form.salePrice} onChange={(event) => onFormChange({ salePrice: Math.max(0, Number(event.target.value)) })} />
        </label>
      </div>
    </div>

    <div className="form-field full vendor-product-category-block">
      <div className="vendor-product-category-grid">
        <label className="form-field">
          <span>Giới tính</span>
          <select value={form.gender} onChange={(event) => onFormChange({ gender: event.target.value })}>
            <option value="">Chưa phân loại</option>
            <option value="MALE">Nam</option>
            <option value="FEMALE">Nữ</option>
            <option value="UNISEX">Unisex</option>
          </select>
        </label>
        <label className="form-field">
          <span>Kiểu dáng (Fit)</span>
          <select value={form.fit || ''} onChange={(event) => onFormChange({ fit: event.target.value })}>
            <option value="">Chưa phân loại</option>
            <option value="Regular Fit">Regular Fit</option>
            <option value="Slim Fit">Slim Fit</option>
            <option value="Oversize">Oversize</option>
            <option value="Loose Fit">Loose Fit</option>
          </select>
        </label>
      </div>
    </div>
  </>
);

export default VendorProductBasicsSection;
