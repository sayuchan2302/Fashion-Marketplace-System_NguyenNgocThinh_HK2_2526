import './Vendor.css';
import { Landmark, Wallet } from 'lucide-react';
import VendorLayout from './VendorLayout';
import { AdminStateBlock } from '../Admin/AdminStateBlocks';
import VendorFinanceBankPanel from './components/finance/VendorFinanceBankPanel';
import VendorPayoutRequestPanel from './components/finance/VendorPayoutRequestPanel';
import VendorPendingPayoutsPanel from './components/finance/VendorPendingPayoutsPanel';
import VendorPayoutHistoryPanel from './components/finance/VendorPayoutHistoryPanel';
import { useVendorFinance } from './useVendorFinance';

const VendorFinance = () => {
  const {
    amount,
    bankDraft,
    handleBankFieldChange,
    handleSaveBankInfo,
    handleSubmitPayout,
    hasUnsavedBankChanges,
    loading,
    loadError,
    payoutDisabledReason,
    payoutHistory,
    pendingPayouts,
    reload,
    savingBank,
    statItems,
    submittingPayout,
    wallet,
    setAmount,
  } = useVendorFinance();

  return (
    <VendorLayout
      title="Tài chính"
      breadcrumbs={['Kênh Người Bán', 'Tài chính']}
    >
      {loading ? (
        <section className="admin-panels single">
          <AdminStateBlock
            type="empty"
            title="Đang tải ví và lịch sử rút tiền"
            description="Hệ thống đang đồng bộ số dư, phiếu rút tiền và lịch sử giải ngân của shop."
          />
        </section>
      ) : loadError ? (
        <section className="admin-panels single">
          <AdminStateBlock
            type="error"
            title="Không tải được dữ liệu tài chính"
            description={loadError}
            actionLabel="Thử lại"
            onAction={reload}
          />
        </section>
      ) : (
        <>
          <section className="vendor-stats grid-4 vendor-finance-stats">
            {statItems.map((item) => (
              <article
                key={item.key}
                className={`vendor-stat-card ${item.tone || ''}`}
              >
                <div className="vendor-stat-header">
                  <p className="vendor-stat-label">{item.label}</p>
                  <div className="vendor-stat-icon">
                    {item.key === 'available' || item.key === 'reserved' ? <Landmark size={18} /> : <Wallet size={18} />}
                  </div>
                </div>
                <div className="vendor-stat-value">{item.value}</div>
                <div className="vendor-stat-sub">{item.sub}</div>
              </article>
            ))}
          </section>

          <section className="vendor-panels vendor-finance-top-grid">
            <VendorPayoutRequestPanel
              amount={amount}
              availableBalance={wallet?.availableBalance || 0}
              bankSummary={{
                bankName: bankDraft.bankName,
                accountNumber: bankDraft.accountNumber,
                accountHolder: bankDraft.accountHolder,
              }}
              disabledReason={payoutDisabledReason}
              isSubmitting={submittingPayout}
              onAmountChange={setAmount}
              onSubmit={handleSubmitPayout}
            />

            <VendorFinanceBankPanel
              bankInfo={bankDraft}
              isSaving={savingBank}
              hasUnsavedChanges={hasUnsavedBankChanges}
              onFieldChange={handleBankFieldChange}
              onSave={handleSaveBankInfo}
            />
          </section>

          <section className="admin-panels single vendor-finance-stack">
            <VendorPendingPayoutsPanel items={pendingPayouts} />
            <VendorPayoutHistoryPanel items={payoutHistory} />
          </section>
        </>
      )}
    </VendorLayout>
  );
};

export default VendorFinance;
