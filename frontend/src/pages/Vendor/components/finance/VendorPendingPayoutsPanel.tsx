import { ReceiptText } from 'lucide-react';
import type { PayoutRequest } from '../../../../services/walletService';
import {
  formatCurrency,
  formatDateTime,
  payoutStatusLabel,
  payoutStatusTone,
} from './vendorFinancePresentation';

interface VendorPendingPayoutsPanelProps {
  items: PayoutRequest[];
}

const VendorPendingPayoutsPanel = ({ items }: VendorPendingPayoutsPanelProps) => {
  return (
    <div className="vendor-panel">
      <div className="vendor-panel-head">
        <div>
          <h2>Phiếu rút tiền đang chờ</h2>
          <p className="vendor-finance-muted">
            Đây là các phiếu đang được giữ trong ví chờ admin xử lý.
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="vendor-state-block">
          <div className="vendor-state-icon">
            <ReceiptText size={18} />
          </div>
          <h3>Chưa có phiếu rút tiền chờ duyệt</h3>
          <p>Khi shop gửi yêu cầu rút tiền, phiếu chờ sẽ xuất hiện tại đây.</p>
        </div>
      ) : (
        <div className="vendor-finance-pending-list">
          {items.map((item) => (
            <article key={item.id} className="vendor-finance-pending-card">
              <div className="vendor-finance-pending-head">
                <div>
                  <strong>Phiếu {item.id.slice(0, 8).toUpperCase()}</strong>
                  <span>{formatDateTime(item.createdAt)}</span>
                </div>
                <span className={`vendor-pill ${payoutStatusTone(item.status)}`}>
                  {payoutStatusLabel[item.status]}
                </span>
              </div>

              <div className="vendor-finance-pending-meta">
                <div>
                  <span>Số tiền</span>
                  <strong>{formatCurrency(item.amount)}</strong>
                </div>
                <div>
                  <span>Ngân hàng nhận</span>
                  <strong>{item.bankName}</strong>
                </div>
              </div>

              <div className="vendor-finance-pending-footer">
                <span>{item.bankAccountNumber}</span>
                <span>{item.bankAccountName}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorPendingPayoutsPanel;
