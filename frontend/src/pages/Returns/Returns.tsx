import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardList, RotateCcw, ShieldCheck } from 'lucide-react';
import './Returns.css';

const Returns = () => (
  <main className="returns-page">
    <div className="returns-container">
      <section className="returns-entry">
        <div className="returns-entry-copy">
          <p className="returns-kicker">Đổi / trả hàng</p>
          <h1>Đổi/trả được xử lý trong chi tiết đơn hàng</h1>
          <p>
            Mỗi yêu cầu được gắn trực tiếp với đơn đã giao để sản phẩm, số lượng và mã đơn luôn chính xác.
          </p>
          <div className="returns-entry-actions">
            <Link to="/profile?tab=orders" className="returns-primary-link">
              Mở lịch sử đơn hàng <ArrowRight size={16} />
            </Link>
            <Link to="/policy/doi-tra" className="returns-secondary-link">
              Xem chính sách
            </Link>
          </div>
        </div>

        <div className="returns-entry-icon" aria-hidden="true">
          <RotateCcw size={34} />
        </div>
      </section>

      <section className="returns-steps" aria-label="Quy trình đổi trả">
        <article className="returns-step">
          <span className="returns-step-icon"><ClipboardList size={18} /></span>
          <div>
            <h2>Chọn đơn đã giao</h2>
            <p>Mở chi tiết đơn hàng và dùng nút Đổi / trả hàng ở khu vực thanh toán.</p>
          </div>
        </article>

        <article className="returns-step">
          <span className="returns-step-icon"><RotateCcw size={18} /></span>
          <div>
            <h2>Gửi yêu cầu trong drawer</h2>
            <p>Chọn sản phẩm, lý do, hình thức xử lý và ảnh minh chứng nếu cần.</p>
          </div>
        </article>

        <article className="returns-step">
          <span className="returns-step-icon"><ShieldCheck size={18} /></span>
          <div>
            <h2>Theo dõi xử lý</h2>
            <p>Yêu cầu được gửi tới người bán và cập nhật trong hệ thống hoàn trả.</p>
          </div>
        </article>
      </section>
    </div>
  </main>
);

export default Returns;
