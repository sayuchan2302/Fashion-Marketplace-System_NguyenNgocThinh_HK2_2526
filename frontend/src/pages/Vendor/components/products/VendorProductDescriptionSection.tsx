import type { ProductFormState } from '../../vendorProducts.types';

interface VendorProductDescriptionSectionProps {
  form: ProductFormState;
  onFormChange: (patch: Partial<ProductFormState>) => void;
}

const VendorProductDescriptionSection = ({
  form,
  onFormChange,
}: VendorProductDescriptionSectionProps) => (
  <section className="drawer-section">
    <h4>Mô tả sản phẩm</h4>
    <label className="form-field full">
      <span>Mô tả chi tiết</span>
      <textarea
        rows={5}
        value={form.description}
        onChange={(event) => onFormChange({ description: event.target.value })}
        placeholder="Mô tả chất liệu, form dáng, điểm nổi bật và lưu ý sử dụng để khách dễ quyết định mua hàng."
      />
    </label>

    <div className="vendor-product-category-grid">
      <label className="form-field">
        <span>Kích cỡ & kiểu dáng</span>
        <textarea
          rows={4}
          value={form.sizeAndFit}
          onChange={(event) => onFormChange({ sizeAndFit: event.target.value })}
          placeholder="Ví dụ: Form regular fit, tay dài, phù hợp cao 1m60-1m80."
        />
      </label>
      <label className="form-field">
        <span>Chất liệu & hướng dẫn bảo quản</span>
        <textarea
          rows={4}
          value={form.fabricAndCare}
          onChange={(event) => onFormChange({ fabricAndCare: event.target.value })}
          placeholder="Ví dụ: 100% cotton. Giặt mát, không tẩy, ủi nhiệt độ thấp."
        />
      </label>
    </div>
  </section>
);

export default VendorProductDescriptionSection;
