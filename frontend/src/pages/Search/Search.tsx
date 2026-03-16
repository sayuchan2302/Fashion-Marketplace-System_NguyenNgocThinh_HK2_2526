import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ChevronRight, Clock, Trash2, X } from 'lucide-react';
import FilterSidebar from '../../components/FilterSidebar/FilterSidebar';
import ProductGrid from '../../components/ProductGrid/ProductGrid';
import { HISTORY_KEY } from '../../components/SearchDropdown/SearchDropdown';
import './Search.css';



const POPULAR_KEYWORDS = ['Áo thun', 'Polo', 'Quần jeans', 'Hoodie', 'Sale', 'Quần short'];

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [history, setHistory] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    } catch { return []; }
  });

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  const removeHistoryItem = (e: React.MouseEvent, item: string) => {
    e.stopPropagation();
    const updated = history.filter(h => h !== item);
    setHistory(updated);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  };



  return (
    <div className="search-page">
      {/* Breadcrumb - always visible or only for results? Let's show it always for consistency */}
      <div className="breadcrumb-wrapper">
        <div className="container">
          <nav className="breadcrumbs">
            <Link to="/" className="breadcrumb-link">Trang chủ</Link>
            <ChevronRight size={14} className="breadcrumb-separator" />
            <span className="breadcrumb-current">Tìm kiếm</span>
          </nav>
        </div>
      </div>

      <div className="search-page-container container">
        {/* Popular & History (Landing State) */}
        {!query && (
          <div className="search-landing">
            {history.length > 0 && (
              <div className="search-history-section">
                <div className="search-section-header">
                  <h3 className="search-section-title">
                    <Clock size={16} /> Tìm kiếm gần đây
                  </h3>
                  <button className="search-clear-btn" onClick={clearHistory}>Xoá tất cả</button>
                </div>
                <div className="search-history-list">
                  {history.map(item => (
                    <div key={item} className="search-history-item" onClick={() => setSearchParams({ q: item })}>
                      <span className="search-history-text">{item}</span>
                      <button className="search-history-del" onClick={(e) => removeHistoryItem(e, item)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="search-popular">
              <h3 className="search-section-title">
                <SlidersHorizontal size={16} /> Từ khoá phổ biến
              </h3>
              <div className="search-keywords">
                {POPULAR_KEYWORDS.map(kw => (
                  <button key={kw} className="search-keyword-chip" onClick={() => setSearchParams({ q: kw })}>
                    {kw}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PLP Results Layout (Active Search State) */}
        {query && (
          <div className="search-results-section">
            <div className="plp-header">
              <h1 className="plp-title">Kết quả cho: "{query}"</h1>
              <span className="plp-count">(120 kết quả)</span>
            </div>

            <div className="plp-layout">
              {/* Mobile Filter Toggle */}
              <button 
                className="mobile-filter-btn"
                onClick={() => setIsMobileFilterOpen(true)}
              >
                <SlidersHorizontal size={18} />
                Bộ lọc
              </button>

              {/* Sidebar */}
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

              {/* Overlay */}
              {isMobileFilterOpen && (
                <div 
                  className="filter-overlay"
                  onClick={() => setIsMobileFilterOpen(false)}
                ></div>
              )}

              {/* Main Grid */}
              <main className="plp-main">
                {/* Note: In a real app, query would be passed to ProductGrid to filter products */}
                <ProductGrid />
              </main>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
