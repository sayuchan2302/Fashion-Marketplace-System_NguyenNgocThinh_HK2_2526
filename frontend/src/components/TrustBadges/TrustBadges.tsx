import './TrustBadges.css';
import { Truck, RefreshCcw, HeadphonesIcon, ShieldCheck } from 'lucide-react';

const TrustBadges = () => {
  const badges = [
    {
      icon: <Truck size={32} strokeWidth={1.5} />,
      title: "Vận chuyển nhanh chóng",
      desc: "Miễn phí đơn từ 200k"
    },
    {
      icon: <RefreshCcw size={32} strokeWidth={1.5} />,
      title: "Đổi trả dễ dàng",
      desc: "Trong vòng 60 ngày"
    },
    {
      icon: <HeadphonesIcon size={32} strokeWidth={1.5} />,
      title: "Hỗ trợ 24/7",
      desc: "Luôn luôn lắng nghe"
    },
    {
      icon: <ShieldCheck size={32} strokeWidth={1.5} />,
      title: "Thanh toán an toàn",
      desc: "Bảo mật tuyệt đối"
    }
  ];

  return (
    <section className="trust-badges">
      <div className="container">
        <div className="badges-grid">
          {badges.map((badge, index) => (
            <div key={index} className="badge-item">
              <div className="badge-icon">{badge.icon}</div>
              <h4 className="badge-title">{badge.title}</h4>
              <p className="badge-desc">{badge.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
