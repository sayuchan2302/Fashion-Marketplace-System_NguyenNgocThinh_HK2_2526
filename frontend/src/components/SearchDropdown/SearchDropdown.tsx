import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Clock, X, TrendingUp } from 'lucide-react';
import './SearchDropdown.css';

// Mock products for search suggestions
const SEARCH_PRODUCTS = [
  { id: '101', name: 'Áo Polo Nam Cotton Khử Mùi', price: 359000, image: 'https://media.coolmate.me/cdn-cgi/image/width=672,height=990,quality=85/uploads/February2025/11025595_24_copy_11.jpg' },
  { id: '102', name: 'Quần Jeans Nam Dáng Straight', price: 599000, image: 'https://media.coolmate.me/cdn-cgi/image/width=672,height=990,quality=85/uploads/February2025/11025595_31_copy_91.jpg' },
  { id: '103', name: 'Áo Sơ Mi Nam Vải Modal', price: 459000, image: 'https://media.coolmate.me/cdn-cgi/image/width=672,height=990,quality=85/uploads/February2025/11025595_21.jpg' },
  { id: '104', name: 'Áo Thun Nam Excool Co Giãn', price: 129000, image: 'https://media.coolmate.me/cdn-cgi/image/width=672,height=990,quality=85/uploads/February2025/11025595_17_copy.jpg' },
  { id: '105', name: 'Quần Shorts Nam Thể Thao', price: 249000, image: 'https://media.coolmate.me/cdn-cgi/image/width=672,height=990,quality=85/uploads/November2024/24CMCW.AT012.2_72.jpg' },
  { id: '106', name: 'Áo Khoác Gió Nam Chống Nước', price: 499000, image: 'https://media.coolmate.me/cdn-cgi/image/width=672,height=990,quality=85/uploads/November2024/24CMCW.QT003.1_65.jpg' },
  { id: '107', name: 'Áo Hoodie Basic Nam', price: 399000, image: 'https://media.coolmate.me/cdn-cgi/image/width=672,height=990,quality=85/uploads/November2024/24CMCW.AT012.2_72.jpg' },
];

const POPULAR_KEYWORDS = ['Áo thun', 'Polo', 'Quần jeans', 'Hoodie', 'Sale', 'Quần short'];
const HISTORY_KEY = 'search_history_v1';

interface SearchDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  inputValue: string;
  onSearch: (query: string) => void;
}

const SearchDropdown = ({ isOpen, onClose, inputValue, onSearch }: SearchDropdownProps) => {
  const [history, setHistory] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    } catch { return []; }
  });
  const dropRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, onClose]);

  const suggestions = inputValue.trim()
    ? SEARCH_PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(inputValue.toLowerCase())
      ).slice(0, 5)
    : [];

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  const removeHistoryItem = (item: string) => {
    const updated = history.filter(h => h !== item);
    setHistory(updated);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  };

  if (!isOpen) return null;

  return (
    <div className="search-dropdown" ref={dropRef}>
      {/* If typing → show suggestions */}
      {inputValue.trim() ? (
        <div className="sd-suggestions">
          {suggestions.length > 0 ? (
            <>
              <p className="sd-section-title">Gợi ý sản phẩm</p>
              {suggestions.map(product => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="sd-suggestion-item"
                  onClick={onClose}
                >
                  <img src={product.image} alt={product.name} className="sd-suggestion-img" />
                  <div className="sd-suggestion-info">
                    <span className="sd-suggestion-name">{product.name}</span>
                    <span className="sd-suggestion-price">
                      {product.price.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </Link>
              ))}
              <button
                className="sd-view-all"
                onClick={() => { onSearch(inputValue); onClose(); }}
              >
                <Search size={14} /> Xem tất cả kết quả cho "{inputValue}"
              </button>
            </>
          ) : (
            <p className="sd-no-results">Không tìm thấy sản phẩm phù hợp</p>
          )}
        </div>
      ) : (
        /* If NOT typing → show history + popular */
        <div className="sd-default">
          {history.length > 0 && (
            <div className="sd-history-section">
              <div className="sd-section-header">
                <p className="sd-section-title"><Clock size={14} /> Tìm kiếm gần đây</p>
                <button className="sd-clear-all" onClick={clearHistory}>Xoá tất cả</button>
              </div>
              <div className="sd-history-list">
                {history.slice(0, 5).map(item => (
                  <div key={item} className="sd-history-item">
                    <button className="sd-history-text" onClick={() => onSearch(item)}>
                      <Clock size={14} /> {item}
                    </button>
                    <button className="sd-history-remove" onClick={() => removeHistoryItem(item)}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="sd-popular-section">
            <p className="sd-section-title"><TrendingUp size={14} /> Từ khoá phổ biến</p>
            <div className="sd-popular-chips">
              {POPULAR_KEYWORDS.map(kw => (
                <button key={kw} className="sd-popular-chip" onClick={() => onSearch(kw)}>
                  {kw}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { HISTORY_KEY };
export default SearchDropdown;
