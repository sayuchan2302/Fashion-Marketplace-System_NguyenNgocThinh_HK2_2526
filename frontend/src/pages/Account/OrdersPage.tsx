import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Account.css';
import { orderService } from '../../services/orderService';
import type { Order } from '../../types';
import Skeleton from '../../components/Skeleton/Skeleton';

const statusText: Record<Order['status'], string> = {
  pending: 'Chờ xác nhận',
  processing: 'Đang xử lý',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã huỷ',
  refunded: 'Đã hoàn tiền',
};

const OrdersPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const orders = orderService.list();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="account-page">
      <div className="account-container">
        <div className="account-header">
          <h1 className="account-title">Đơn hàng của tôi</h1>
        </div>
        <p className="account-subtitle">Xem lịch sử đặt hàng và theo dõi trạng thái.</p>

        <div className="order-list">
          {isLoading ? (
            <>
              {[1, 2, 3].map(i => (
                <div key={i} className="order-card order-loading">
                  <Skeleton type="text" width={100} height={24} />
                  <Skeleton type="text" width="60%" />
                  <Skeleton type="text" width="40%" />
                  <Skeleton type="text" width="30%" />
                </div>
              ))}
            </>
          ) : (
            orders.length === 0 ? (
              <div className="account-meta">Chưa có đơn hàng nào.</div>
            ) : (
              orders.map(order => (
                <div className="order-card" key={order.id}>
                  <div className="order-status">
                    <span className="status-pill">{statusText[order.status]}</span>
                  </div>
                  <div><strong>Mã đơn:</strong> {order.id}</div>
                  <div><strong>Ngày đặt:</strong> {new Date(order.createdAt).toLocaleString('vi-VN')}</div>
                  <div><strong>Tổng tiền:</strong> {order.total.toLocaleString('vi-VN')}đ</div>
                  <div className="order-items-small">{order.items.length} sản phẩm</div>
                  <Link to={`/account/orders/${order.id}`} className="btn-secondary" style={{ textAlign: 'center' }}>Xem chi tiết</Link>
                </div>
              ))
            )
)}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
