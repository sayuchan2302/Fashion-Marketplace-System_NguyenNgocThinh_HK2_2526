import './CollectionsBanner.css';

const CollectionsBanner = () => {
  return (
    <section className="collections-banner">
      <div className="container">
        <div className="collections-header">
          <h2 className="collections-main-title">BỘ SƯU TẬP NỔI BẬT</h2>
          <p className="collections-subtitle">Phong cách kề bên, thời trang bất tận</p>
        </div>
        
        <div className="collections-grid">
          {/* Large Item (Left) */}
          <div className="collection-item large-item">
            <img 
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop" 
              alt="Summer Collection" 
              className="collection-img"
            />
            <div className="collection-overlay">
              <h3 className="collection-title">Xu Hướng Mùa Hè</h3>
              <p className="collection-desc">Khám phá ngay bộ sưu tập mát mẻ, năng động</p>
              <a href="#" className="collection-btn">Xem Chi Tiết</a>
            </div>
          </div>
          
          {/* Small Items (Right Column) */}
          <div className="collection-right-col">
            <div className="collection-item small-item">
              <img 
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop" 
                alt="Office Wear" 
                className="collection-img"
              />
              <div className="collection-overlay">
                <h3 className="collection-title">Công Sở Thanh Lịch</h3>
                <a href="#" className="collection-link">Khám phá</a>
              </div>
            </div>
            
            <div className="collection-item small-item">
              <img 
                src="https://images.unsplash.com/photo-1518002171953-a080ee817e1f?q=80&w=800&auto=format&fit=crop" 
                alt="Active Wear" 
                className="collection-img"
              />
              <div className="collection-overlay">
                <h3 className="collection-title">Thể Thao & Năng Động</h3>
                <a href="#" className="collection-link">Khám phá</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CollectionsBanner;
