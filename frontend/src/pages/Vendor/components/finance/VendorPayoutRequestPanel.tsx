import { Landmark, SendHorizonal } from 'lucide-react';
import { formatCurrency } from './vendorFinancePresentation';

interface VendorPayoutRequestPanelProps {
  amount: string;
  availableBalance: number;
  bankSummary: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  disabledReason: string;
  isSubmitting: boolean;
  onAmountChange: (value: string) => void;
  onSubmit: () => void;
}

const VendorPayoutRequestPanel = ({
  amount,
  availableBalance,
  bankSummary,
  disabledReason,
  isSubmitting,
  onAmountChange,
  onSubmit,
}: VendorPayoutRequestPanelProps) => {
  const hasBankInfo = Boolean(
    bankSummary.bankName.trim() &&
      bankSummary.accountNumber.trim() &&
      bankSummary.accountHolder.trim(),
  );

  return (
    <div className="vendor-panel vendor-finance-request-panel">
      <div className="vendor-panel-head">
        <div>
          <h2>Yêu cầu rút tiền</h2>
          <p className="vendor-finance-muted">
            Shop gửi phiếu rút tiền, admin sẽ kiểm tra và duyệt trực tiếp trong mục tài chính.
          </p>
        </div>
      </div>

      <div className="vendor-finance-request-balance">
        <span>Số dư đang có thể rút</span>
        <strong>{formatCurrency(availableBalance)}</strong>
      </div>

      <div className="vendor-form-group full-width">
        <label htmlFor="vendor-payout-amount">Số tiền muốn rút</label>
        <input
          id="vendor-payout-amount"
          className="vendor-form-input"
          inputMode="numeric"
          value={amount}
          onChange={(event) => onAmountChange(event.target.value)}
          placeholder="Ví dụ: 500000"
        />
        <span className="vendor-form-hint">
          Chỉ được rút tối đa bằng số dư khả dụng và tối thiểu lớn hơn 0.
        </span>
      </div>

      <div className="vendor-finance-request-destination">
        <div className="vendor-finance-summary-icon">
          <Landmark size={18} />
        </div>
        <div className="vendor-finance-summary-copy">
          <strong>{hasBankInfo ? bankSummary.bankName : 'Chưa có tài khoản nhận tiền'}</strong>
          <span>{hasBankInfo ? bankSummary.accountNumber : 'Hãy lưu tài khoản nhận tiền trước khi gửi phiếu rút tiền.'}</span>
          <span>{hasBankInfo ? bankSummary.accountHolder : 'Admin sẽ dùng thông tin đã lưu để duyệt yêu cầu rút tiền.'}</span>
        </div>
      </div>

      {disabledReason ? (
        <div className="vendor-finance-alert warning">
          {disabledReason}
        </div>
      ) : null}

      <div className="vendor-form-actions">
        <button
          type="button"
          className="vendor-primary-btn"
          onClick={onSubmit}
          disabled={Boolean(disabledReason) || isSubmitting}
        >
          <SendHorizonal size={16} />
          {isSubmitting ? 'Đang gửi phiếu rút tiền' : 'Gửi yêu cầu rút tiền'}
        </button>
      </div>
    </div>
  );
};

export default VendorPayoutRequestPanel;
