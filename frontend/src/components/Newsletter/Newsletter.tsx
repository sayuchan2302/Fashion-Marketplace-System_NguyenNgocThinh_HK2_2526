import './Newsletter.css';

const Newsletter = () => {
  return (
    <section className="newsletter">
      <div className="container">
        <div className="newsletter-content">
          <div className="newsletter-text">
            <h3 className="newsletter-title">Đăng ký nhận tin</h3>
            <p className="newsletter-desc">
              Nhận ngay voucher giảm giá 10% cho đơn hàng đầu tiên và thông tin về các bộ sưu tập mới nhất.
            </p>
          </div>
          <div className="newsletter-form">
            <form onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Nhập email của bạn..." 
                className="newsletter-input"
                required 
              />
              <button type="submit" className="newsletter-submit">
                Đăng Ký
              </button>
            </form>
            <p className="newsletter-commitment">
              * Chúng tôi cam kết không spam email của bạn.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
