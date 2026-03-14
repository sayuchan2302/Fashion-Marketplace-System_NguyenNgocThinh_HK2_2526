import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import FilterSidebar from '../../components/FilterSidebar/FilterSidebar';
import ProductGrid from '../../components/ProductGrid/ProductGrid';
import './ProductListing.css';

const ProductListing = () => {
  const { id } = useParams<{ id: string }>();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  
  // Mapper for category names in breadcrumbs/titles
  const categoryNames: Record<string, string> = {
    'sale': 'Sản Phẩm Khuyến Mãi',
    'new': 'Sản Phẩm Mới',
    'men': 'Thời Trang Nam',
    'women': 'Thời Trang Nữ',
    'accessories': 'Phụ Kiện'
  };
  
  const currentCategoryName = id && categoryNames[id] ? categoryNames[id] : 'Tất Cả Sản Phẩm';

  return (
    <div className="plp-page">
      {/* Breadcrumbs */}
      <div className="breadcrumb-wrapper">
        <div className="container">
          <nav className="breadcrumbs">
            <Link to="/" className="breadcrumb-link">Trang Chủ</Link>
            <ChevronRight size={14} className="breadcrumb-separator" />
            <span className="breadcrumb-current">{currentCategoryName}</span>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container plp-container">
        {/* Page Title & Count */}
        <div className="plp-header">
          <h1 className="plp-title">{currentCategoryName}</h1>
          <span className="plp-count">(120 sản phẩm)</span>
        </div>
        
        <div className="plp-layout">
          {/* Mobile Filter Toggle Button */}
          <button 
            className="mobile-filter-btn"
            onClick={() => setIsMobileFilterOpen(true)}
          >
            <SlidersHorizontal size={18} />
            Bộ lọc
          </button>

          {/* Left Column: Filter Sidebar */}
          <aside className={`plp-sidebar ${isMobileFilterOpen ? 'is-open' : ''}`}>
            <div className="mobile-filter-header">
              <h3>Bộ lọc</h3>
              <button 
                className="close-filter-btn"
                onClick={() => setIsMobileFilterOpen(false)}
              >
                <X size={24} />
              </button>
            </div>
            <div className="sidebar-content">
              <FilterSidebar />
            </div>
          </aside>
          
          {/* Overlay when sidebar is open on mobile */}
          {isMobileFilterOpen && (
            <div 
              className="filter-overlay"
              onClick={() => setIsMobileFilterOpen(false)}
            ></div>
          )}

          {/* Right Column: Main Content */}
          <main className="plp-main">
            <ProductGrid />
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductListing;
