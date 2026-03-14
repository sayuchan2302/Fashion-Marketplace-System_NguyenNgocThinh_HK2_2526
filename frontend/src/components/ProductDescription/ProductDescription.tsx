import { useState } from 'react';
import './ProductDescription.css';

const ProductDescription = () => {
  const [activeTab, setActiveTab] = useState('features');

  return (
    <div className="product-description-container">
      {/* Tabs Header */}
      <div className="desc-tabs-header">
        <button 
          className={`desc-tab-btn ${activeTab === 'features' ? 'active' : ''}`}
          onClick={() => setActiveTab('features')}
        >
          Đặc điểm nổi bật
        </button>
        <button 
          className={`desc-tab-btn ${activeTab === 'material' ? 'active' : ''}`}
          onClick={() => setActiveTab('material')}
        >
          Chất liệu
        </button>
        <button 
          className={`desc-tab-btn ${activeTab === 'care' ? 'active' : ''}`}
          onClick={() => setActiveTab('care')}
        >
          Hướng dẫn bảo quản
        </button>
        <button 
          className={`desc-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          Đánh giá (120)
        </button>
      </div>

      {/* Tabs Content */}
      <div className="desc-tabs-content">
        {activeTab === 'features' && (
          <div className="tab-pane active">
            <h3>Đặc điểm nổi bật của Áo Polo Nam Cotton Khử Mùi</h3>
            <ul className="feature-list">
              <li>Chất liệu 100% Cotton Compact mềm mại, thấm hút cực tốt</li>
              <li>Công nghệ xử lý vải HeiQ Viroblock khử mùi hôi hiệu quả</li>
              <li>Sợi vải chống nhăn tự nhiên, giữ form áo đứng dáng</li>
              <li>Phần cổ dệt bo gân phối viền gân nổi bật, nam tính</li>
              <li>Form Regular Fit suông nhẹ, thoải mái cho mọi hoạt động</li>
            </ul>
            <div className="feature-images">
              <img src="https://media.coolmate.me/cdn-cgi/image/width=672,height=990,quality=85/uploads/February2025/11025595_31_copy_91.jpg" alt="Đặc điểm áo polo" loading="lazy" />
            </div>
            <p className="tab-text">
              Một chiếc áo Polo cơ bản nhưng được nâng cấp toàn diện từ chất liệu đến từng đường kim mũi chỉ. Thích hợp để mặc đi làm, đi chơi, hay những buổi cà phê dạo phố cuối tuần.
            </p>
          </div>
        )}

        {activeTab === 'material' && (
          <div className="tab-pane active">
            <h3>Chất liệu Cotton Compact cao cấp</h3>
            <p className="tab-text">
              Cotton Compact là quy trình dệt hiện đại giúp sợi bông dài hơn, dai hơn và mượt hơn so với cotton thông thường. Nó giúp giải quyết triệt để tình trạng đổ lông hay co rút sau nhiều lần giặt.
            </p>
            <div className="material-stats">
              <div className="stat-item">
                <span className="stat-percentage">100%</span>
                <span className="stat-label">Cotton Compact</span>
              </div>
              <div className="stat-item">
                <span className="stat-percentage">99%</span>
                <span className="stat-label">Kháng khuẩn bề mặt</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'care' && (
          <div className="tab-pane active">
            <h3>Hướng dẫn bảo quản</h3>
            <ul className="feature-list">
              <li>Giặt máy ở nhiệt độ thường, lộn trái áo khi giặt</li>
              <li>Không sử dụng chất tẩy rửa mạnh</li>
              <li>Phơi trong bóng râm, tránh ánh nắng trực tiếp</li>
              <li>Sấy khô ở nhiệt độ thấp</li>
              <li>Ủi ở nhiệt độ thấp (&lt; 110 độ C)</li>
            </ul>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="tab-pane active">
            <div className="reviews-summary">
              <div className="rating-overview">
                <span className="rating-big">4.9</span>
                <span className="rating-out-of">/ 5</span>
              </div>
              <p className="rating-text">120 đánh giá từ người mua</p>
            </div>
            
            <div className="reviews-list">
              <div className="review-item">
                <div className="review-header">
                  <span className="reviewer-name">Nguyễn Văn A</span>
                  <span className="review-date">10/03/2026</span>
                </div>
                <div className="review-stars">⭐⭐⭐⭐⭐</div>
                <p className="review-content">Áo mặc rất mát, form chuẩn. Giao hàng nhanh. Sẽ ủng hộ shop tiếp.</p>
              </div>
              
              <div className="review-item">
                <div className="review-header">
                  <span className="reviewer-name">Trần Thị B</span>
                  <span className="review-date">05/03/2026</span>
                </div>
                <div className="review-stars">⭐⭐⭐⭐⭐</div>
                <p className="review-content">Chất vải xịn, khử mùi thật sự hiệu quả. Chấm 10 điểm cho Coolmate.</p>
              </div>
              
              <div className="review-item">
                <div className="review-header">
                  <span className="reviewer-name">Lê Hoàng C</span>
                  <span className="review-date">01/03/2026</span>
                </div>
                <div className="review-stars">⭐⭐⭐⭐</div>
                <p className="review-content">Sản phẩm tốt nhưng màu xanh navy ở ngoài nhìn tối hơn trên ảnh một xíu.</p>
              </div>
            </div>
            
            <button className="view-more-reviews-btn">Xem tất cả đánh giá</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDescription;
