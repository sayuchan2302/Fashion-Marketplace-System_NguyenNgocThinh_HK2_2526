import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { getUiErrorMessage } from '../../utils/errorMessage';
import { storeService } from '../../services/storeService';
import { walletService, type PayoutRequest, type VendorWallet } from '../../services/walletService';
import {
  vendorPortalService,
  type VendorSettingsData,
} from '../../services/vendorPortalService';
import { buildWalletStatItems } from './components/finance/vendorFinancePresentation';
import {
  DEFAULT_VENDOR_FINANCE_SETTINGS,
  sortPayoutsByCreatedAtDesc,
} from './vendorFinanceDefaults';

type BankInfo = VendorSettingsData['bankInfo'];

const buildNextBankInfo = (settings: VendorSettingsData) => settings.bankInfo;

export const useVendorFinance = () => {
  const { addToast } = useToast();
  const [wallet, setWallet] = useState<VendorWallet | null>(null);
  const [settings, setSettings] = useState<VendorSettingsData>(DEFAULT_VENDOR_FINANCE_SETTINGS);
  const [bankDraft, setBankDraft] = useState<BankInfo>(DEFAULT_VENDOR_FINANCE_SETTINGS.bankInfo);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [savingBank, setSavingBank] = useState(false);
  const [submittingPayout, setSubmittingPayout] = useState(false);

  const loadFinance = useCallback(async () => {
    setLoading(true);
    try {
      setLoadError('');
      const [walletData, payoutPage, nextSettings] = await Promise.all([
        walletService.getMyWallet(),
        walletService.getMyPayouts(1, 100),
        vendorPortalService.getSettings(),
      ]);

      setWallet(walletData);
      setPayouts(sortPayoutsByCreatedAtDesc(payoutPage.content || []));
      setSettings(nextSettings);
      setBankDraft(buildNextBankInfo(nextSettings));
    } catch (err: unknown) {
      const message = getUiErrorMessage(err, 'Không tải được dữ liệu tài chính gian hàng');
      setLoadError(message);
      setWallet(null);
      setPayouts([]);
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    void loadFinance();
  }, [loadFinance, reloadKey]);

  const pendingPayouts = useMemo(
    () => payouts.filter((item) => item.status === 'PENDING'),
    [payouts],
  );
  const payoutHistory = useMemo(
    () => payouts.filter((item) => item.status !== 'PENDING'),
    [payouts],
  );
  const statItems = useMemo(() => buildWalletStatItems(wallet), [wallet]);

  const hasUnsavedBankChanges = useMemo(
    () =>
      bankDraft.bankName.trim() !== settings.bankInfo.bankName.trim() ||
      bankDraft.accountNumber.trim() !== settings.bankInfo.accountNumber.trim() ||
      bankDraft.accountHolder.trim() !== settings.bankInfo.accountHolder.trim(),
    [bankDraft, settings.bankInfo],
  );

  const hasBankInfo = Boolean(
    bankDraft.bankName.trim() &&
      bankDraft.accountNumber.trim() &&
      bankDraft.accountHolder.trim(),
  );

  const payoutDisabledReason = useMemo(() => {
    if (!hasBankInfo) {
      return 'Hãy lưu tài khoản nhận tiền trước khi gửi yêu cầu rút tiền.';
    }
    if (hasUnsavedBankChanges) {
      return 'Bạn đang chỉnh sửa tài khoản nhận tiền. Hãy lưu trước khi gửi phiếu rút tiền.';
    }
    if ((wallet?.availableBalance || 0) <= 0) {
      return 'Ví hiện không có số dư khả dụng để rút.';
    }
    if (pendingPayouts.length > 0) {
      return 'Shop đang có phiếu rút tiền chờ admin duyệt. Vui lòng đợi xử lý xong trước khi gửi thêm.';
    }
    return '';
  }, [hasBankInfo, hasUnsavedBankChanges, pendingPayouts.length, wallet?.availableBalance]);

  const handleBankFieldChange = useCallback((field: keyof BankInfo, value: string) => {
    setBankDraft((current) => ({
      ...current,
      [field]: value,
    }));
  }, []);

  const handleSaveBankInfo = useCallback(async () => {
    if (!hasBankInfo) {
      addToast('Vui lòng nhập đủ ngân hàng, số tài khoản và chủ tài khoản.', 'error');
      return;
    }

    try {
      setSavingBank(true);
      const nextStore = await storeService.updateMyStore({
        bankName: bankDraft.bankName.trim(),
        bankAccountNumber: bankDraft.accountNumber.trim(),
        bankAccountHolder: bankDraft.accountHolder.trim(),
      });
      const nextBankInfo: BankInfo = {
        bankName: nextStore.bankName || '',
        accountNumber: nextStore.bankAccountNumber || '',
        accountHolder: nextStore.bankAccountHolder || '',
        verified: Boolean(nextStore.bankVerified),
      };
      setSettings((current) => ({
        ...current,
        bankInfo: nextBankInfo,
      }));
      setBankDraft(nextBankInfo);
      addToast('Đã lưu tài khoản nhận tiền.', 'success');
    } catch (err: unknown) {
      addToast(getUiErrorMessage(err, 'Không thể lưu tài khoản nhận tiền'), 'error');
    } finally {
      setSavingBank(false);
    }
  }, [addToast, bankDraft, hasBankInfo]);

  const handleSubmitPayout = useCallback(async () => {
    const numericAmount = Number(amount.replace(/[^\d]/g, ''));
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      addToast('Số tiền rút phải lớn hơn 0.', 'error');
      return;
    }

    if ((wallet?.availableBalance || 0) < numericAmount) {
      addToast('Số tiền vượt quá số dư khả dụng hiện tại.', 'error');
      return;
    }

    if (payoutDisabledReason) {
      addToast(payoutDisabledReason, 'info');
      return;
    }

    try {
      setSubmittingPayout(true);
      await walletService.createPayoutRequest({
        amount: numericAmount,
        bankAccountName: bankDraft.accountHolder.trim(),
        bankAccountNumber: bankDraft.accountNumber.trim(),
        bankName: bankDraft.bankName.trim(),
      });
      setAmount('');
      addToast('Đã gửi phiếu rút tiền. Admin sẽ duyệt trong mục tài chính.', 'success');
      setReloadKey((current) => current + 1);
    } catch (err: unknown) {
      addToast(getUiErrorMessage(err, 'Không thể gửi yêu cầu rút tiền'), 'error');
    } finally {
      setSubmittingPayout(false);
    }
  }, [addToast, amount, bankDraft, payoutDisabledReason, wallet?.availableBalance]);

  const reload = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  return {
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
  };
};
