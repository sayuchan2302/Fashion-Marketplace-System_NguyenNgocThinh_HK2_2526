import './Testimonials.css';
import { Star } from 'lucide-react';

const testimonialsData = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    product: "Áo Polo Nam Nam Khử Mùi",
    content: "Áo mặc rất mát, chất vải nhẹ và thấm hút mồ hôi tốt. Đường may chắc chắn. Giao hàng cực kỳ nhanh, đóng gói đẹp và cẩn thận.",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=1",
    date: "12/03/2026"
  },
  {
    id: 2,
    name: "Trần Thị B",
    product: "Quần Shorts Nữ Đi Biển",
    content: "Form quần đẹp, tôn dáng, mặc đi biển rất hợp. Vải không bị nhăn sau khi giặt. Sẽ ủng hộ shop thêm nhiều lần nữa.",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=2",
    date: "10/03/2026"
  },
  {
    id: 3,
    name: "Lê Minh C",
    product: "Áo Khoác Gió Nam Chống Nước",
    content: "Áo chống nước ô kê thật sự, mình đi mưa lất phất mà bên trong không bị ẩm tí nào. Thiết kế basic dễ phối đồ.",
    rating: 4,
    avatar: "https://i.pravatar.cc/150?u=3",
    date: "08/03/2026"
  },
  {
    id: 4,
    name: "Phạm D",
    product: "Chân Váy Chữ A Tôn Dáng",
    content: "Váy xịn lắm mọi người ơi. Vừa in eo luôn, lên dáng chuẩn như hình. Shop tư vấn cũng rất nhiệt tình.",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=4",
    date: "05/03/2026"
  }
];

const Testimonials = () => {
  return (
    <section className="testimonials">
      <div className="container">
        <div className="testimonials-header">
          <h2 className="testimonials-title">ĐÁNH GIÁ TỪ KHÁCH HÀNG</h2>
          <p className="testimonials-subtitle">Hơn 500,000+ khách hàng đã tin tưởng và đồng hành cùng chúng tôi</p>
        </div>
        
        <div className="testimonials-slider">
          <div className="testimonials-track">
            {testimonialsData.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <img src={review.avatar} alt={review.name} className="reviewer-avatar" />
                  <div className="reviewer-info">
                    <h4 className="reviewer-name">{review.name}</h4>
                    <div className="review-stars">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={14} 
                          fill={i < review.rating ? "#fcd34d" : "transparent"} 
                          color={i < review.rating ? "#fcd34d" : "#d1d5db"} 
                        />
                      ))}
                    </div>
                  </div>
                  <span className="review-date">{review.date}</span>
                </div>
                <div className="review-product">Mô tả: <strong>{review.product}</strong></div>
                <p className="review-content">"{review.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
