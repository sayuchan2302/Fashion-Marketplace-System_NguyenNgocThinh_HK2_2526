export interface FinancialSnapshot {
  gmv: number;
  commission: number;
  review: number;
  pendingPayoutTotal: number;
  pendingPayoutCount: number;
}

export type ConfirmState = {
  storeIds: string[];
  storeNames: string[];
};

export type AdminTab = 'wallets' | 'payouts';
