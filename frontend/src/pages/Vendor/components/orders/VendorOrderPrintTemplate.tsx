import React from 'react';
import { Barcode } from './Barcode';
import { type VendorOrderDetailData } from '../../../../services/vendorPortalService';
import { formatCurrency } from '../../../../services/commissionService';
import { toDisplayOrderCode } from '../../../../utils/displayCode';
import { formatVendorOrderDate } from '../../vendorOrderPresentation';

interface VendorOrderPrintTemplateProps {
    order: VendorOrderDetailData;
    printRef?: React.RefObject<HTMLDivElement | null>;
}

export const VendorOrderPrintTemplate: React.FC<VendorOrderPrintTemplateProps> = ({
    order,
    printRef
}) => {
    const displayCode = toDisplayOrderCode(order.code || order.id);
    const formattedDate = formatVendorOrderDate(order.createdAt, true);
    const fullAddress = [
        order.shippingAddress.address,
        order.shippingAddress.ward,
        order.shippingAddress.district,
        order.shippingAddress.city
    ].filter(Boolean).join(', ');

    const isCOD = order.paymentMethod === 'COD';

    return (
        <div
            className="vendor-print-page-wrapper"
            ref={printRef as React.LegacyRef<HTMLDivElement>}
        >
            <div className="print-header">
                <div className="print-shop-info">
                    <h3 className="print-shop-name">Phố Mặc</h3>
                    <p className="print-shop-sub">Kênh người bán - Phiếu giao hàng</p>
                </div>
                <div className="print-order-label">
                    <Barcode value={displayCode} height={30} showText={true} />
                </div>
            </div>

            <div className="print-divider" />

            <table className="print-info-table">
                <tbody>
                    <tr>
                        <td className="w-50">
                            <span className="print-label">NGƯỜI GỬI:</span>
                            <strong className="print-value">Fashion Store Web (Shop Partner)</strong>
                            <span className="print-sub-value">Kho trung chuyển Fashion Hub</span>
                        </td>
                        <td className="w-50 separator-left">
                            <span className="print-label">NGƯỜI NHẬN:</span>
                            <strong className="print-value">{order.shippingAddress.fullName}</strong>
                            <span className="print-value-phone">SĐT: {order.shippingAddress.phone}</span>
                            <span className="print-sub-value">Đ/C: {fullAddress}</span>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div className="print-divider" />

            <div className="print-package-details">
                <h4 className="print-section-title">DANH SÁCH CHI TIẾT SẢN PHẨM</h4>
                <table className="print-items-table">
                    <thead>
                        <tr>
                            <th className="text-left">Tên sản phẩm / SKU</th>
                            <th className="text-center w-12">SL</th>
                            <th className="text-right w-25">Đơn giá</th>
                            <th className="text-right w-25">Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map((item, index) => (
                            <tr key={item.id || index}>
                                <td>
                                    <div className="print-item-name">{item.name}</div>
                                    <div className="print-item-sku">SKU: <strong>{item.sku}</strong> {item.variant ? `(${item.variant})` : ''}</div>
                                </td>
                                <td className="text-center"><strong>{item.quantity}</strong></td>
                                <td className="text-right">{formatCurrency(item.price)}</td>
                                <td className="text-right">{formatCurrency(item.price * item.quantity)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="print-summary-section">
                <div className="print-summary-left">
                    {order.note && (
                        <div className="print-note-box">
                            <span>Ghi chú của khách:</span>
                            <p className="print-note-text">"{order.note}"</p>
                        </div>
                    )}
                    <div className="print-carrier-info">
                        <span>Đơn vị vận chuyển:</span>
                        <strong>{order.carrier || 'Standard Delivery'}</strong>
                        {order.trackingNumber && (
                            <div className="print-tracking-wrap">
                                <span>Mã vận đơn:</span>
                                <span className="print-monospace-bold">{order.trackingNumber}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="print-summary-right">
                    <div className="print-payment-summary">
                        <div className="print-receipt-row">
                            <span>Tạm tính hàng:</span>
                            <span>{formatCurrency(order.subtotal)}</span>
                        </div>
                        <div className="print-receipt-row">
                            <span>Phí vận chuyển:</span>
                            <span>{order.shippingFee === 0 ? '0 đ' : formatCurrency(order.shippingFee)}</span>
                        </div>
                        {order.discount > 0 && (
                            <div className="print-receipt-row italic">
                                <span>Voucher giảm giá:</span>
                                <span>-{formatCurrency(order.discount)}</span>
                            </div>
                        )}
                        <div className="print-receipt-divider" />
                        <div className="print-receipt-row is-cod-row">
                            <span>HÌNH THỨC TT:</span>
                            <strong className="print-color-badge">{order.paymentMethod}</strong>
                        </div>
                        <div className={`print-money-due ${isCOD ? 'theme-cod-alert' : 'theme-paid-alert'}`}>
                            <span className="text-upper">{isCOD ? 'Phải thu COD:' : 'Khách đã thanh toán:'}</span>
                            <h3 className="print-due-amount">{formatCurrency(isCOD ? order.total : 0)}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="print-divider" />

            <div className="print-footer-signatures">
                <div className="print-sig-col">
                    <span className="sig-title">Chữ ký người nhận</span>
                    <span className="sig-desc">(Xác nhận hàng nguyên vẹn)</span>
                    <div className="sig-place-holder" />
                </div>
                <div className="print-sig-col">
                    <span className="sig-title">Chữ ký nhân viên đóng gói</span>
                    <span className="sig-desc">Ngày in: {formattedDate}</span>
                    <div className="sig-place-holder" />
                </div>
            </div>
        </div>
    );
};
