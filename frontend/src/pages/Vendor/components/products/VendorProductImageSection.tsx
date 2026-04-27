import type { ChangeEvent, RefObject } from 'react';
import { Trash2, Upload } from 'lucide-react';

interface VendorProductImageSectionProps {
  productName: string;
  images: string[];
  imageUploading: boolean;
  imageError?: string;
  maxImages: number;
  productImageInputRef: RefObject<HTMLInputElement | null>;
  onOpenPicker: () => void;
  onImagesSelected: (event: ChangeEvent<HTMLInputElement>) => Promise<void> | void;
  onSetPrimary: (index: number) => void;
  onRemoveImage: (index: number) => void;
}

const VendorProductImageSection = ({
  productName,
  images,
  imageUploading,
  imageError,
  maxImages,
  productImageInputRef,
  onOpenPicker,
  onImagesSelected,
  onSetPrimary,
  onRemoveImage,
}: VendorProductImageSectionProps) => (
  <>
    <div className="form-field full vendor-product-image-upload-block">
      <span>Ảnh sản phẩm</span>
      <div className="vendor-product-image-upload-head">
        <button
          type="button"
          className="admin-ghost-btn small vendor-product-upload-btn"
          onClick={onOpenPicker}
          disabled={imageUploading || images.length >= maxImages}
        >
          <Upload size={14} />
          <span>
            {imageUploading
              ? 'Đang tải ảnh...'
              : images.length >= maxImages
                ? `Đã đủ ${maxImages} ảnh`
                : 'Tải ảnh từ máy'}
          </span>
        </button>
        <small className="admin-muted">
          Tối đa {maxImages} ảnh, mỗi ảnh không quá 5MB.
        </small>
      </div>
      <input
        ref={productImageInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
        multiple
        hidden
        onChange={(event) => void onImagesSelected(event)}
      />
      {imageError && <small className="form-field-error">{imageError}</small>}
    </div>

    <div className="form-field full vendor-product-image-preview">
      <span>Xem trước ảnh</span>
      {images.length > 0 ? (
        <div className="vendor-product-image-grid">
          {images.map((imageUrl, index) => (
            <div key={`${imageUrl}-${index}`} className="vendor-product-image-item">
              <img src={imageUrl} alt={`${productName || 'Sản phẩm'} - ảnh ${index + 1}`} />
              <div className="vendor-product-image-actions">
                {index === 0 ? (
                  <span className="vendor-product-image-primary">Ảnh chính</span>
                ) : (
                  <button
                    type="button"
                    className="vendor-product-image-link"
                    onClick={() => onSetPrimary(index)}
                  >
                    Đặt ảnh chính
                  </button>
                )}
                <button
                  type="button"
                  className="admin-icon-btn subtle danger-icon"
                  aria-label="Xóa ảnh"
                  onClick={() => onRemoveImage(index)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="vendor-product-image-preview-card">
          <p className="admin-muted small">Chưa có ảnh. Hãy tải ảnh từ máy để hiển thị sản phẩm.</p>
        </div>
      )}
    </div>
  </>
);

export default VendorProductImageSection;
