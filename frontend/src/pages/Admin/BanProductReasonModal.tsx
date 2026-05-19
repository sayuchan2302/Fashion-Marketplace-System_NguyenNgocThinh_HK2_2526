import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import type { AdminModerationProduct } from './adminProductModerationService';
import './BanProductReasonModal.css';

type BanReasonType = 'FAKE_PRODUCT' | 'WRONG_INFO' | 'INAPPROPRIATE' | 'PROHIBITED' | 'OTHER';

const BAN_REASONS: Array<{ value: BanReasonType; label: string }> = [
  { value: 'FAKE_PRODUCT', label: 'Hàng giả, hàng nhái' },
  { value: 'WRONG_INFO', label: 'Thông tin sản phẩm sai lệch' },
  { value: 'INAPPROPRIATE', label: 'Nội dung không phù hợp/Phản cảm' },
  { value: 'PROHIBITED', label: 'Hàng cấm giao dịch' },
  { value: 'OTHER', label: 'Khác' },
];

interface BanProductReasonModalProps {
  open: boolean;
  product: AdminModerationProduct | null;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void> | void;
  loading?: boolean;
}

const BanProductReasonModal = ({ open, product, onClose, onConfirm, loading = false }: BanProductReasonModalProps) => {
  const [selectedReason, setSelectedReason] = useState<BanReasonType | ''>('');
  const [customReason, setCustomReason] = useState('');
  const [error, setError] = useState('');

  if (!open || !product) return null;

  const handleConfirm = async () => {
    if (!selectedReason) {
      setError('Vui lòng chọn lý do chặn sản phẩm.');
      return;
    }

    let finalReason = '';
    if (selectedReason === 'OTHER') {
      const normalized = customReason.trim();
      if (!normalized) {
        setError('Vui lòng nhập lý do tùy chỉnh khi chọn "Khác".');
        return;
      }
      finalReason = normalized;
    } else {
      const reasonLabel = BAN_REASONS.find((r) => r.value === selectedReason)?.label;
      finalReason = reasonLabel || selectedReason;
    }

    setError('');
    await onConfirm(finalReason);
    handleClose();
  };

  const handleClose = () => {
    setSelectedReason('');
    setCustomReason('');
    setError('');
    onClose();
  };

  return (
    <div className="ban-reason-modal-overlay" onClick={handleClose} role="dialog" aria-modal="true">
      <div className="ban-reason-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="ban-reason-modal-header">
          <h3>Chặn sản phẩm</h3>
          <button
            type="button"
            className="ban-reason-modal-close"
            onClick={handleClose}
            aria-label="Đóng"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        <div className="ban-reason-modal-body">
          <p className="ban-reason-modal-info">
            Bạn đang chặn sản phẩm <strong>{product.name}</strong>
          </p>

          <div className="ban-reason-modal-group">
            <label className="ban-reason-modal-label" htmlFor="reasonSelect">
              Chọn lý do <span className="ban-reason-modal-required">*</span>
            </label>
            <select
              id="reasonSelect"
              className="ban-reason-modal-select"
              value={selectedReason}
              onChange={(e) => {
                setSelectedReason(e.target.value as BanReasonType | '');
                setError('');
              }}
              disabled={loading}
            >
              <option value="">-- Chọn lý do --</option>
              {BAN_REASONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {selectedReason === 'OTHER' && (
            <div className="ban-reason-modal-group">
              <label className="ban-reason-modal-label" htmlFor="customReason">
                Nhập lý do tùy chỉnh <span className="ban-reason-modal-required">*</span>
              </label>
              <textarea
                id="customReason"
                className="ban-reason-modal-textarea"
                placeholder="Nhập lý do chi tiết để gửi thông báo cho vendor..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                rows={4}
                disabled={loading}
              />
            </div>
          )}

          {error && (
            <div className="ban-reason-modal-error">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="ban-reason-modal-footer">
          <button
            type="button"
            className="ban-reason-modal-btn-cancel"
            onClick={handleClose}
            disabled={loading}
          >
            Hủy
          </button>
          <button
            type="button"
            className="ban-reason-modal-btn-confirm"
            onClick={() => void handleConfirm()}
            disabled={loading || !selectedReason}
          >
            {loading ? 'Đang xử lý...' : 'Chặn sản phẩm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BanProductReasonModal;
