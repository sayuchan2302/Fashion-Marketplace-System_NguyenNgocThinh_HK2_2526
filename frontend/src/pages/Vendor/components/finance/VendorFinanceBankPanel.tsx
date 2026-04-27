import { Building2, CircleCheck, Save } from 'lucide-react';
import type { VendorSettingsData } from '../../../../services/vendorPortalService';

type BankInfo = VendorSettingsData['bankInfo'];

interface VendorFinanceBankPanelProps {
  bankInfo: BankInfo;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  onFieldChange: (field: keyof BankInfo, value: string) => void;
  onSave: () => void;
}

const VendorFinanceBankPanel = ({
  bankInfo,
  isSaving,
  hasUnsavedChanges,
  onFieldChange,
  onSave,
}: VendorFinanceBankPanelProps) => {
  return (
    <div className="vendor-panel vendor-finance-bank-panel">
      <div className="vendor-panel-head">
        <div>
          <h2>Tài khoản nhận tiền</h2>
          <p className="vendor-finance-muted">
            Admin sẽ dùng thông tin này khi duyệt phiếu rút tiền của shop.
          </p>
        </div>
        <span className={`vendor-pill ${bankInfo.verified ? 'success' : 'neutral'}`}>
          <CircleCheck size={14} />
          {bankInfo.verified ? 'Đã xác minh' : 'Chưa xác minh'}
        </span>
      </div>

      <div className="vendor-form-grid vendor-finance-bank-grid">
        <div className="vendor-form-group full-width">
          <label htmlFor="vendor-bank-name">Ngân hàng</label>
          <input
            id="vendor-bank-name"
            className="vendor-form-input"
            value={bankInfo.bankName}
            onChange={(event) => onFieldChange('bankName', event.target.value)}
            placeholder="VD: Vietcombank"
          />
        </div>

        <div className="vendor-form-group">
          <label htmlFor="vendor-bank-account-number">Số tài khoản</label>
          <input
            id="vendor-bank-account-number"
            className="vendor-form-input"
            value={bankInfo.accountNumber}
            onChange={(event) => onFieldChange('accountNumber', event.target.value)}
            placeholder="Nhập số tài khoản"
          />
        </div>

        <div className="vendor-form-group">
          <label htmlFor="vendor-bank-account-holder">Chủ tài khoản</label>
          <input
            id="vendor-bank-account-holder"
            className="vendor-form-input"
            value={bankInfo.accountHolder}
            onChange={(event) => onFieldChange('accountHolder', event.target.value)}
            placeholder="Nhập họ tên chủ tài khoản"
          />
        </div>
      </div>

      <div className="vendor-finance-bank-summary">
        <div className="vendor-finance-summary-icon">
          <Building2 size={18} />
        </div>
        <div className="vendor-finance-summary-copy">
          <strong>{bankInfo.bankName || 'Chưa có ngân hàng nhận tiền'}</strong>
          <span>{bankInfo.accountNumber || 'Chưa có số tài khoản'}</span>
          <span>{bankInfo.accountHolder || 'Chưa có tên chủ tài khoản'}</span>
        </div>
      </div>

      <div className="vendor-form-actions">
        <button
          type="button"
          className="vendor-primary-btn"
          onClick={onSave}
          disabled={isSaving || !hasUnsavedChanges}
        >
          <Save size={16} />
          {isSaving ? 'Đang lưu tài khoản' : 'Lưu tài khoản nhận tiền'}
        </button>
      </div>
    </div>
  );
};

export default VendorFinanceBankPanel;
