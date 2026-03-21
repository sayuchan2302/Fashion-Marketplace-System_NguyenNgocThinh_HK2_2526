import { useState, useRef } from 'react';
import { X, Star, Camera } from 'lucide-react';
import { reviewService, type ReviewSubmission } from '../../services/reviewService';
import { useToast } from '../../contexts/ToastContext';
import './ReviewModal.css';

interface ProductInfo {
  productId: string;
  productName: string;
  productImage: string;
  orderId: string;
  variant?: string;
}

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductInfo;
  existingReview?: {
    id: string;
    rating: number;
    title: string;
    content: string;
  };
}

const ReviewModal = ({ isOpen, onClose, product, existingReview }: ReviewModalProps) => {
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState(existingReview?.title || '');
  const [content, setContent] = useState(existingReview?.content || '');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      addToast('Vui lòng chọn số sao đánh giá', 'error');
      return;
    }
    if (!content.trim()) {
      addToast('Vui lòng nhập nội dung đánh giá', 'error');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const submission: ReviewSubmission = {
        productId: product.productId,
        productName: product.productName,
        productImage: product.productImage,
        orderId: product.orderId,
        rating,
        title: title || undefined,
        content,
        images: images.length > 0 ? images : undefined,
      };

      reviewService.submitReview(submission);
      addToast(
        existingReview ? 'Cập nhật đánh giá thành công!' : 'Gửi đánh giá thành công!',
        'success'
      );
      setIsSubmitting(false);
      onClose();
    }, 800);
  };

  const handleStarClick = (star: number) => {
    setRating(star);
  };

  const handleStarHover = (star: number) => {
    setHoverRating(star);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (images.length >= 5) {
        addToast('Tối đa 5 hình ảnh', 'error');
        return;
      }

      if (!file.type.startsWith('image/')) {
        addToast('Chỉ chấp nhận file hình ảnh', 'error');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        addToast('Kích thước file không được vượt quá 5MB', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImages((prev) => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="review-modal-overlay" onClick={onClose}>
      <div className="review-modal" onClick={(e) => e.stopPropagation()}>
        <button className="review-modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="review-modal-header">
          <h3 className="review-modal-title">
            {existingReview ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá'}
          </h3>
        </div>

        <div className="review-modal-product">
          <img src={product.productImage} alt={product.productName} className="review-modal-product-img" />
          <div className="review-modal-product-info">
            <p className="review-modal-product-name">{product.productName}</p>
            {product.variant && (
              <p className="review-modal-product-variant">{product.variant}</p>
            )}
          </div>
        </div>

        <div className="review-modal-rating">
          <label className="review-modal-label">Đánh giá của bạn</label>
          <div className="review-stars-input">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`review-star-btn ${(hoverRating || rating) >= star ? 'active' : ''}`}
                onClick={() => handleStarClick(star)}
                onMouseEnter={() => handleStarHover(star)}
                onMouseLeave={handleStarLeave}
              >
                <Star size={32} fill={(hoverRating || rating) >= star ? '#f59e0b' : 'none'} stroke={(hoverRating || rating) >= star ? '#f59e0b' : '#d1d5db'} />
              </button>
            ))}
          </div>
          <p className="review-rating-text">
            {(hoverRating || rating) === 5 && 'Tuyệt vời!'}
            {(hoverRating || rating) === 4 && 'Rất tốt'}
            {(hoverRating || rating) === 3 && 'Bình thường'}
            {(hoverRating || rating) === 2 && 'Không hài lòng'}
            {(hoverRating || rating) === 1 && 'Rất kém'}
            {(hoverRating || rating) === 0 && 'Chọn số sao'}
          </p>
        </div>

        <div className="review-modal-form">
          <div className="review-form-group">
            <label className="review-modal-label">Tiêu đề (tùy chọn)</label>
            <input
              type="text"
              className="review-input"
              placeholder="VD: Sản phẩm rất tốt, giao hàng nhanh..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="review-form-group">
            <label className="review-modal-label">Nội dung đánh giá <span className="required">*</span></label>
            <textarea
              className="review-textarea"
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              maxLength={1000}
            />
            <span className="review-char-count">{content.length}/1000</span>
          </div>

          <div className="review-form-group">
            <label className="review-modal-label">Thêm hình ảnh (tùy chọn)</label>
            <div className="review-images-upload">
              {images.map((img, index) => (
                <div key={index} className="review-image-preview">
                  <img src={img} alt={`Upload ${index + 1}`} />
                  <button
                    type="button"
                    className="review-image-remove"
                    onClick={() => setImages(images.filter((_, i) => i !== index))}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <button 
                  type="button" 
                  className="review-image-add"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera size={24} />
                  <span>Thêm ảnh</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        </div>

        <div className="review-modal-actions">
          <button type="button" className="review-btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button
            type="button"
            className="review-btn-submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang gửi...' : existingReview ? 'Cập nhật' : 'Gửi đánh giá'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
