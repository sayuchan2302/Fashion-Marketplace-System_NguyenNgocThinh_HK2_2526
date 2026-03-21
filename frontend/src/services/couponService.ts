export interface Coupon {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  maxDiscount?: number;
  minOrderValue?: number;
  expiresAt: string;
  description: string;
  remaining: number;
}

export interface CouponValidationResult {
  valid: boolean;
  coupon?: Coupon;
  discount: number;
  error?: string;
}

const AVAILABLE_COUPONS: Coupon[] = [
  {
    code: 'WELCOMEJ7BMF6',
    type: 'percent',
    value: 15,
    maxDiscount: 50000,
    minOrderValue: 0,
    expiresAt: '2026-04-12',
    description: 'Giảm 15% tối đa 50k cho đơn bất kỳ',
    remaining: 1,
  },
  {
    code: 'NHNS153',
    type: 'percent',
    value: 15.3,
    maxDiscount: 200000,
    minOrderValue: 0,
    expiresAt: '2026-05-01',
    description: 'Giảm 15.3% tối đa 200k',
    remaining: 21,
  },
  {
    code: 'FREESHIP',
    type: 'fixed',
    value: 30000,
    minOrderValue: 0,
    expiresAt: '2026-12-31',
    description: 'Miễn phí vận chuyển',
    remaining: 999,
  },
  {
    code: 'COOLMATE100',
    type: 'fixed',
    value: 100000,
    minOrderValue: 500000,
    expiresAt: '2026-06-30',
    description: 'Giảm 100K cho đơn từ 500K',
    remaining: 50,
  },
  {
    code: 'SUMMER20',
    type: 'percent',
    value: 20,
    maxDiscount: 100000,
    minOrderValue: 300000,
    expiresAt: '2026-08-31',
    description: 'Giảm 20% tối đa 100K cho đơn từ 300K',
    remaining: 100,
  },
];

const isExpired = (expiresAt: string): boolean => {
  const now = new Date();
  const expiry = new Date(expiresAt);
  return now > expiry;
};

const isValid = (coupon: Coupon): boolean => {
  if (isExpired(coupon.expiresAt)) return false;
  if (coupon.remaining <= 0) return false;
  return true;
};

export const couponService = {
  getAvailableCoupons(): Coupon[] {
    return AVAILABLE_COUPONS.filter(c => c.remaining > 0 && !isExpired(c.expiresAt));
  },

  validate(code: string, orderValue: number): CouponValidationResult {
    const normalizedCode = code.trim().toUpperCase();
    const coupon = AVAILABLE_COUPONS.find(
      c => c.code.toUpperCase() === normalizedCode
    );

    if (!coupon) {
      return { valid: false, discount: 0, error: 'Mã giảm giá không tồn tại' };
    }

    if (!isValid(coupon)) {
      if (isExpired(coupon.expiresAt)) {
        return { valid: false, discount: 0, error: 'Mã giảm giá đã hết hạn' };
      }
      if (coupon.remaining <= 0) {
        return { valid: false, discount: 0, error: 'Mã giảm giá đã hết lượt sử dụng' };
      }
    }

    if (coupon.minOrderValue && orderValue < coupon.minOrderValue) {
      return {
        valid: false,
        discount: 0,
        error: `Đơn hàng tối thiểu ${coupon.minOrderValue.toLocaleString('vi-VN')}đ để sử dụng mã này`,
      };
    }

    let discount = 0;
    if (coupon.type === 'percent') {
      discount = Math.floor(orderValue * (coupon.value / 100));
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = coupon.value;
    }

    return { valid: true, coupon, discount };
  },

  calculateDiscount(coupon: Coupon, orderValue: number): number {
    let discount = 0;
    if (coupon.type === 'percent') {
      discount = Math.floor(orderValue * (coupon.value / 100));
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = Math.min(coupon.value, orderValue);
    }
    return discount;
  },
};
