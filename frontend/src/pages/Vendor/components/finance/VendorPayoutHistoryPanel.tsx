import { WalletCards } from 'lucide-react';
import type { PayoutRequest } from '../../../../services/walletService';
import {
  formatCurrency,
  formatDateTime,
  payoutStatusLabel,
  payoutStatusTone,
} from './vendorFinancePresentation';

interface VendorPayoutHistoryPanelProps {
  items: PayoutRequest[];
}

const VendorPayoutHistoryPanel = ({ items }: VendorPayoutHistoryPanelProps) => {
  return (
    <div className="vendor-panel">
      <div className="vendor-panel-head">
        <div>
          <h2>Lịch sử rút tiền</h2>
          <p className="vendor-finance-muted">
            Theo dõi toàn bộ các yêu cầu rút tiền đã được duyệt hoặc từ chối.
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="vendor-state-block">
          <div className="vendor-state-icon">
            <WalletCards size={18} />
          </div>
          <h3>Chưa có lịch sử rút tiền</h3>
          <p>Phiếu đã duyệt hoặc từ chối sẽ xuất hiện tại đây.</p>
        </div>
      ) : (
        <div className="vendor-table" role="table" aria-label="Lịch sử rút tiền">
          <div className="vendor-table-row finance-history vendor-table-head" role="row">
            <div role="columnheader">Mã phiếu</div>
            <div role="columnheader">Ngày gửi</div>
            <div role="columnheader">Số tiền</div>
            <div role="columnheader">Ngân hàng</div>
            <div role="columnheader">Trạng thái</div>
            <div role="columnheader">Ghi chú admin</div>
          </div>

          {items.map((item) => (
            <div key={item.id} className="vendor-table-row finance-history" role="row">
              <div role="cell" className="admin-mono">{item.id.slice(0, 8).toUpperCase()}</div>
              <div role="cell">{formatDateTime(item.createdAt)}</div>
              <div role="cell" className="vendor-finance-money">{formatCurrency(item.amount)}</div>
              <div role="cell">
                <div className="vendor-finance-bank-cell">
                  <strong>{item.bankName}</strong>
                  <span>{item.bankAccountNumber}</span>
                </div>
              </div>
              <div role="cell">
                <span className={`vendor-pill ${payoutStatusTone(item.status)}`}>
                  {payoutStatusLabel[item.status]}
                </span>
              </div>
              <div role="cell" className="vendor-finance-admin-note">
                {item.adminNote?.trim() || '—'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorPayoutHistoryPanel;
