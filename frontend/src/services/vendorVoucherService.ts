import { apiRequest } from './apiClient';

export type VendorVoucherStatus = 'running' | 'paused' | 'draft';
export type VendorVoucherStatusFilter = VendorVoucherStatus | 'all';
export type VendorVoucherDiscountType = 'percent' | 'fixed';

interface BackendVoucher {
  id: string;
  name?: string;
  code?: string;
  description?: string | null;
  discountType?: 'PERCENT' | 'FIXED';
  discountValue?: number;
  minOrderValue?: number;
  totalIssued?: number;
  usedCount?: number;
  status?: 'RUNNING' | 'PAUSED' | 'DRAFT';
  startDate?: string;
  endDate?: string;
}

interface BackendVoucherCounts {
  all?: number;
  running?: number;
  paused?: number;
  draft?: number;
}

interface BackendVoucherListResponse {
  items?: BackendVoucher[];
  totalElements?: number;
  totalPages?: number;
  page?: number;
  pageSize?: number;
  totalUsage?: number;
  counts?: BackendVoucherCounts;
}

interface BackendVoucherRequest {
  name: string;
  code: string;
  description?: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  minOrderValue: number;
  totalIssued: number;
  startDate: string;
  endDate: string;
  status: 'RUNNING' | 'PAUSED' | 'DRAFT';
}

export interface VendorVoucherRecord {
  id: string;
  name: string;
  code: string;
  description: string;
  discountType: VendorVoucherDiscountType;
  discountValue: number;
  minOrderValue: number;
  usedCount: number;
  totalIssued: number;
  status: VendorVoucherStatus;
  startDate: string;
  endDate: string;
}

export interface VendorVoucherUpsertInput {
  name: string;
  code: string;
  description?: string;
  discountType: VendorVoucherDiscountType;
  discountValue: number;
  minOrderValue: number;
  totalIssued: number;
  startDate: string;
  endDate: string;
  status: VendorVoucherStatus;
}

export interface VendorVoucherListResult {
  items: VendorVoucherRecord[];
  totalElements: number;
  totalPages: number;
  page: number;
  pageSize: number;
  totalUsage: number;
  counts: {
    all: number;
    running: number;
    paused: number;
    draft: number;
  };
}

const toVendorStatus = (status?: string): VendorVoucherStatus => {
  switch ((status || '').toUpperCase()) {
    case 'RUNNING':
      return 'running';
    case 'PAUSED':
      return 'paused';
    default:
      return 'draft';
  }
};

const toApiStatus = (status: VendorVoucherStatus): 'RUNNING' | 'PAUSED' | 'DRAFT' => {
  switch (status) {
    case 'running':
      return 'RUNNING';
    case 'paused':
      return 'PAUSED';
    default:
      return 'DRAFT';
  }
};

const toVendorDiscountType = (discountType?: string): VendorVoucherDiscountType =>
  (discountType || '').toUpperCase() === 'FIXED' ? 'fixed' : 'percent';

const toApiDiscountType = (
  discountType: VendorVoucherDiscountType,
): 'PERCENT' | 'FIXED' => (discountType === 'fixed' ? 'FIXED' : 'PERCENT');

const sanitizeDate = (value?: string) => (value ? value.slice(0, 10) : '');

const normalizeCode = (value: string) => value.trim().replace(/\s+/g, '').toUpperCase();

const toRecord = (voucher: BackendVoucher): VendorVoucherRecord => ({
  id: voucher.id,
  name: (voucher.name || '').trim(),
  code: normalizeCode(voucher.code || ''),
  description: (voucher.description || '').trim(),
  discountType: toVendorDiscountType(voucher.discountType),
  discountValue: Number(voucher.discountValue || 0),
  minOrderValue: Number(voucher.minOrderValue || 0),
  usedCount: Number(voucher.usedCount || 0),
  totalIssued: Number(voucher.totalIssued || 0),
  status: toVendorStatus(voucher.status),
  startDate: sanitizeDate(voucher.startDate),
  endDate: sanitizeDate(voucher.endDate),
});

const toRequestPayload = (input: VendorVoucherUpsertInput): BackendVoucherRequest => ({
  name: input.name.trim(),
  code: normalizeCode(input.code),
  description: input.description?.trim() || undefined,
  discountType: toApiDiscountType(input.discountType),
  discountValue: Math.max(0.01, Number(input.discountValue || 0)),
  minOrderValue: Math.max(0, Number(input.minOrderValue || 0)),
  totalIssued: Math.max(1, Math.round(Number(input.totalIssued || 0))),
  startDate: sanitizeDate(input.startDate),
  endDate: sanitizeDate(input.endDate),
  status: toApiStatus(input.status),
});

export const vendorVoucherService = {
  async list(params: {
    status?: VendorVoucherStatusFilter;
    keyword?: string;
    page?: number;
    size?: number;
  } = {}): Promise<VendorVoucherListResult> {
    const page = Math.max(1, Number(params.page || 1));
    const size = Math.max(1, Number(params.size || 10));

    const searchParams = new URLSearchParams();
    searchParams.set('page', String(page));
    searchParams.set('size', String(size));

    if (params.status && params.status !== 'all') {
      searchParams.set('status', toApiStatus(params.status));
    }

    const keyword = (params.keyword || '').trim();
    if (keyword) {
      searchParams.set('keyword', keyword);
    }

    const response = await apiRequest<BackendVoucherListResponse>(
      `/api/vouchers/my-store?${searchParams.toString()}`,
      {},
      { auth: true },
    );

    const items = (response.items || []).map(toRecord);
    const totalPages = Math.max(Number(response.totalPages || 1), 1);

    return {
      items,
      totalElements: Number(response.totalElements || items.length),
      totalPages,
      page: Math.min(Math.max(Number(response.page || page), 1), totalPages),
      pageSize: Math.max(Number(response.pageSize || size), 1),
      totalUsage: Number(response.totalUsage || 0),
      counts: {
        all: Number(response.counts?.all || 0),
        running: Number(response.counts?.running || 0),
        paused: Number(response.counts?.paused || 0),
        draft: Number(response.counts?.draft || 0),
      },
    };
  },

  async create(input: VendorVoucherUpsertInput): Promise<VendorVoucherRecord> {
    const created = await apiRequest<BackendVoucher>(
      '/api/vouchers/my-store',
      {
        method: 'POST',
        body: JSON.stringify(toRequestPayload(input)),
      },
      { auth: true },
    );

    return toRecord(created);
  },

  async update(id: string, input: VendorVoucherUpsertInput): Promise<VendorVoucherRecord> {
    const updated = await apiRequest<BackendVoucher>(
      `/api/vouchers/my-store/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(toRequestPayload(input)),
      },
      { auth: true },
    );

    return toRecord(updated);
  },

  async updateStatus(id: string, status: VendorVoucherStatus): Promise<VendorVoucherRecord> {
    const updated = await apiRequest<BackendVoucher>(
      `/api/vouchers/my-store/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status: toApiStatus(status) }),
      },
      { auth: true },
    );

    return toRecord(updated);
  },

  async delete(id: string): Promise<void> {
    await apiRequest<void>(
      `/api/vouchers/my-store/${id}`,
      {
        method: 'DELETE',
      },
      { auth: true },
    );
  },
};
