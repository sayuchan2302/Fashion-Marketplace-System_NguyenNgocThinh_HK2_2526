import './Admin.css';
import { Link } from 'react-router-dom';
import { Filter, Search, Truck } from 'lucide-react';
import AdminLayout from './AdminLayout';

const orders = [
  { code: 'ORD-10234', customer: 'Nguyễn Văn A', avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=0D8ABC&color=fff', total: '1.250.000 đ', pay: 'Đã thanh toán', ship: 'Đang giao', date: '2026-03-10 10:32' },
  { code: 'ORD-10233', customer: 'Trần Thu B', avatar: 'https://ui-avatars.com/api/?name=Tran+Thu+B&background=F59E0B&color=fff', total: '780.000 đ', pay: 'Chưa thanh toán', ship: 'Chưa giao', date: '2026-03-10 09:05' },
  { code: 'ORD-10232', customer: 'Lê Hữu C', avatar: 'https://ui-avatars.com/api/?name=Le+Huu+C&background=10B981&color=fff', total: '2.150.000 đ', pay: 'Đã thanh toán', ship: 'Đã giao', date: '2026-03-09 17:45' },
  { code: 'ORD-10231', customer: 'Phạm Hương', avatar: 'https://ui-avatars.com/api/?name=Pham+Huong&background=6366F1&color=fff', total: '560.000 đ', pay: 'Đang hoàn tiền', ship: 'Thất bại', date: '2026-03-09 16:12' },
];

const tone = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes('đã thanh toán') || s.includes('đã giao')) return 'success';
  if (s.includes('đang') || s.includes('chờ')) return 'pending';
  if (s.includes('thất bại') || s.includes('hoàn tiền')) return 'error';
  if (s.includes('chưa')) return 'neutral';
  return 'neutral';
};

const AdminOrders = () => {
  return (
    <AdminLayout 
      title="Đơn hàng"
      actions={
        <>
          <div className="admin-search">
            <Search size={16} />
            <input placeholder="Tìm mã đơn, khách hàng..." />
          </div>
          <button className="admin-ghost-btn"><Filter size={16} /> Bộ lọc</button>
        </>
      }
    >
      <section className="admin-panels">
        <div className="admin-panel">
          <div className="admin-panel-head">
            <h2>Danh sách đơn hàng</h2>
            <Link to="/admin">Tổng quan</Link>
          </div>
          <div className="admin-table" role="table" aria-label="Danh sách đơn hàng">
            <div className="admin-table-row admin-table-head wide" role="row">
              <div role="columnheader">Mã đơn</div>
              <div role="columnheader">Khách hàng</div>
              <div role="columnheader">Tổng tiền</div>
              <div role="columnheader">Thanh toán</div>
              <div role="columnheader">Vận chuyển</div>
              <div role="columnheader">Ngày đặt</div>
              <div role="columnheader">Hành động</div>
            </div>
            {orders.map(order => (
              <div className="admin-table-row wide" role="row" key={order.code}>
                <div role="cell" className="admin-bold">#{order.code}</div>
                <div role="cell">
                  <div className="admin-customer">
                    <img src={order.avatar} alt={order.customer} />
                    <span>{order.customer}</span>
                  </div>
                </div>
                <div role="cell">{order.total}</div>
                <div role="cell"><span className={`admin-pill ${tone(order.pay)}`}>{order.pay}</span></div>
                <div role="cell"><span className={`admin-pill ${tone(order.ship)}`}><Truck size={14} /> {order.ship}</span></div>
                <div role="cell" className="admin-muted">{order.date}</div>
                <div role="cell" className="admin-actions">
                  <Link to={`/account/orders/${order.code}`} className="admin-link">Xem</Link>
                  <button className="admin-ghost-btn" type="button">In hóa đơn</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AdminLayout>
  );
};

export default AdminOrders;
