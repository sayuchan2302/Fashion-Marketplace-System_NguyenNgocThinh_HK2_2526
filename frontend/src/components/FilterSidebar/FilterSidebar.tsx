import './FilterSidebar.css';
import { Plus, Minus } from 'lucide-react';
import { useState } from 'react';
import { useFilter } from '../../contexts/FilterContext';

const FilterSidebar = () => {
  const { filters, updatePriceRange, updateSize, updateColor, resetFilters } = useFilter();

  // State for collapsible filter sections
  const [openSections, setOpenSections] = useState({
    price: true,
    size: true,
    color: true
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const priceRanges = [
    { id: 'under-200k', label: 'Dưới 200.000đ' },
    { id: 'from-200k-500k', label: '200.000đ - 500.000đ' },
    { id: 'over-500k', label: 'Trên 500.000đ' }
  ];

  const colorOptions = [
    { name: 'Đen', hex: '#000000' },
    { name: 'Trắng', hex: '#ffffff' },
    { name: 'Xám', hex: '#9ca3af' },
    { name: 'Xanh Navy', hex: '#1e3a8a' },
    { name: 'Đỏ', hex: '#ef4444' },
    { name: 'Be', hex: '#f5f5dc' }
  ];

  return (
    <div className="filter-sidebar">
      <div className="filter-header">
        <h3 className="filter-title">Bộ Lọc</h3>
        <button className="clear-filter-btn" onClick={resetFilters}>Xóa tất cả</button>
      </div>

      {/* Filter by Price */}
      <div className="filter-section">
        <div 
          className="filter-section-header" 
          onClick={() => toggleSection('price')}
        >
          <h4 className="filter-section-title">Khoảng Giá</h4>
          {openSections.price ? <Minus size={16} /> : <Plus size={16} />}
        </div>
        
        {openSections.price && (
          <div className="filter-section-content">
            {priceRanges.map(range => (
              <label key={range.id} className="filter-checkbox-label">
                <input 
                  type="checkbox" 
                  className="filter-checkbox"
                  checked={filters.priceRanges.includes(range.id)}
                  onChange={(e) => updatePriceRange(range.id, e.target.checked)}
                />
                <span>{range.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Filter by Size */}
      <div className="filter-section">
        <div 
          className="filter-section-header" 
          onClick={() => toggleSection('size')}
        >
          <h4 className="filter-section-title">Kích Cỡ</h4>
          {openSections.size ? <Minus size={16} /> : <Plus size={16} />}
        </div>
        
        {openSections.size && (
          <div className="filter-section-content">
            <div className="size-grid">
              {['S', 'M', 'L', 'XL', '2XL', '3XL'].map(size => (
                <button 
                  key={size} 
                  className={`size-btn ${filters.sizes.includes(size) ? 'selected' : ''}`}
                  onClick={() => updateSize(size, !filters.sizes.includes(size))}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filter by Color */}
      <div className="filter-section">
        <div 
          className="filter-section-header" 
          onClick={() => toggleSection('color')}
        >
          <h4 className="filter-section-title">Màu Sắc</h4>
          {openSections.color ? <Minus size={16} /> : <Plus size={16} />}
        </div>
        
        {openSections.color && (
          <div className="filter-section-content">
            <div className="color-grid">
              {colorOptions.map(color => (
                <button 
                  key={color.name} 
                  className={`color-btn ${filters.colors.includes(color.name) ? 'selected' : ''}`}
                  style={{ 
                    backgroundColor: color.hex,
                    borderColor: filters.colors.includes(color.name) ? '#2b56e6' : 'transparent'
                  }}
                  onClick={() => updateColor(color.name, !filters.colors.includes(color.name))}
                  aria-label={color.name}
                  title={color.name}
                ></button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterSidebar;
