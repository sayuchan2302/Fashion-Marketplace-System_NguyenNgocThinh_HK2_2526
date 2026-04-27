import { Trash2 } from 'lucide-react';
import { VENDOR_COLOR_PRESETS, normalizeHexColor, resolveColorSwatch } from '../../../../utils/colorSwatch';
import { CUSTOM_COLOR_PRESET_VALUE } from '../../vendorProducts.constants';
import { resolveVariantColorHex, resolveVariantPresetValue } from '../../vendorProductsHelpers';
import type { VariantRowFormState } from '../../vendorProducts.types';

interface VendorProductVariantsSectionProps {
  variantRows: VariantRowFormState[];
  productBasePrice: number;
  productSalePrice: number;
  variantStockTotal: number;
  variantsError?: string;
  onAddVariantRow: () => void;
  onUpdateVariantRow: (key: string, mutate: (current: VariantRowFormState) => VariantRowFormState) => void;
  onRemoveVariantRow: (key: string) => void;
}

const VendorProductVariantsSection = ({
  variantRows,
  productBasePrice,
  productSalePrice,
  variantStockTotal,
  variantsError,
  onAddVariantRow,
  onUpdateVariantRow,
  onRemoveVariantRow,
}: VendorProductVariantsSectionProps) => (
  <section className="drawer-section">
    <div className="vendor-variant-builder-head">
      <div>
        <h4>Danh sách biến thể</h4>
      </div>
      <button type="button" className="admin-ghost-btn small" onClick={onAddVariantRow}>
        Thêm biến thể
      </button>
    </div>

    {variantsError && <small className="form-field-error">{variantsError}</small>}
    <div className="vendor-variant-table">
      <div className="vendor-variant-row vendor-variant-row-head">
        <div>Màu sắc</div>
        <div>Kích cỡ</div>
        <div>Số lượng</div>
        <div>Giá bán</div>
        <div>Hiển thị</div>
        <div />
      </div>

      {variantRows.map((row) => {
        const selectedColorPreset = resolveVariantPresetValue(row);
        const isCustomColor = selectedColorPreset === CUSTOM_COLOR_PRESET_VALUE;
        const resolvedColorHex = resolveVariantColorHex(row);

        return (
          <div key={row.key} className="vendor-variant-row">
            <div className="vendor-variant-color-cell">
              <select
                value={selectedColorPreset}
                onChange={(event) => {
                  const selected = event.target.value;
                  if (selected === CUSTOM_COLOR_PRESET_VALUE) {
                    onUpdateVariantRow(row.key, (current) => ({
                      ...current,
                      axis1: VENDOR_COLOR_PRESETS.some((item) => item.name === current.axis1) ? '' : current.axis1,
                      colorHex: normalizeHexColor(current.colorHex, '#111827'),
                    }));
                    return;
                  }

                  const preset = VENDOR_COLOR_PRESETS.find((item) => item.name === selected);
                  if (!preset) {
                    return;
                  }

                  onUpdateVariantRow(row.key, (current) => ({
                    ...current,
                    axis1: preset.name,
                    colorHex: preset.hex,
                  }));
                }}
              >
                <option value={CUSTOM_COLOR_PRESET_VALUE}>Chọn màu tự nhập</option>
                {VENDOR_COLOR_PRESETS.map((preset) => (
                  <option key={preset.name} value={preset.name}>{preset.name}</option>
                ))}
              </select>
              {isCustomColor ? (
                <div className="vendor-variant-color-custom">
                  <input
                    type="text"
                    placeholder="Tên màu (vd: New Classic Navy Blue)"
                    value={row.axis1}
                    onChange={(event) => onUpdateVariantRow(row.key, (current) => ({
                      ...current,
                      axis1: event.target.value,
                    }))}
                  />
                  <div className="vendor-variant-color-hex-row">
                    <input
                      type="color"
                      value={normalizeHexColor(row.colorHex, resolveColorSwatch(row.axis1, '#111827'))}
                      onChange={(event) => onUpdateVariantRow(row.key, (current) => ({
                        ...current,
                        colorHex: normalizeHexColor(event.target.value, '#111827'),
                      }))}
                      aria-label="Chọn mã màu"
                    />
                    <input
                      type="text"
                      placeholder="#000000"
                      value={normalizeHexColor(row.colorHex, resolveColorSwatch(row.axis1, '#111827'))}
                      onChange={(event) => onUpdateVariantRow(row.key, (current) => ({
                        ...current,
                        colorHex: normalizeHexColor(event.target.value, current.colorHex || '#111827'),
                      }))}
                    />
                  </div>
                </div>
              ) : (
                <div className="vendor-variant-color-preview">
                  <span className="vendor-variant-color-dot" style={{ backgroundColor: resolvedColorHex }} />
                  <input type="text" readOnly value={resolvedColorHex.toUpperCase()} />
                </div>
              )}
            </div>
            <div>
              <input
                type="text"
                placeholder="Ví dụ: M"
                value={row.axis2}
                onChange={(event) => onUpdateVariantRow(row.key, (current) => ({
                  ...current,
                  axis2: event.target.value,
                }))}
              />
            </div>
            <div>
              <input
                type="number"
                min={0}
                value={row.stockQuantity}
                onChange={(event) => onUpdateVariantRow(row.key, (current) => ({
                  ...current,
                  stockQuantity: Math.max(0, Number(event.target.value || 0)),
                }))}
              />
            </div>
            <div>
              <input
                type="number"
                min={0}
                step={1000}
                value={Math.max(0, (productSalePrice || productBasePrice) + row.priceAdjustment)}
                onChange={(event) => onUpdateVariantRow(row.key, (current) => ({
                  ...current,
                  priceAdjustment: Math.max(0, Number(event.target.value || 0)) - (productSalePrice || productBasePrice),
                }))}
              />
            </div>
            <div className="vendor-variant-active">
              <input
                type="checkbox"
                checked={row.isActive}
                onChange={(event) => onUpdateVariantRow(row.key, (current) => ({
                  ...current,
                  isActive: event.target.checked,
                }))}
              />
            </div>
            <div className="vendor-variant-actions">
              <button
                type="button"
                className="admin-icon-btn subtle danger-icon"
                title="Xóa dòng biến thể"
                onClick={() => onRemoveVariantRow(row.key)}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
    <p className="admin-muted small vendor-variant-total">
      Tổng kho: {variantStockTotal}
    </p>
  </section>
);

export default VendorProductVariantsSection;
