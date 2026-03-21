import { useState, useEffect, useMemo } from 'react';
import './ProductGrid.css';
import ProductCard from '../ProductCard/ProductCard';
import ProductCardSkeleton from '../ProductCardSkeleton/ProductCardSkeleton';
import { useFilter } from '../../contexts/FilterContext';
import { productService } from '../../services/productService';
import { CLIENT_TEXT } from '../../utils/texts';
import type { Product } from '../../types';

const t = CLIENT_TEXT.filter;
const tListing = CLIENT_TEXT.productListing;

interface ProductGridProps {
  customResults?: Product[];
}

const ProductGrid = ({ customResults }: ProductGridProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const { filters, updateSortBy } = useFilter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredProducts = useMemo(() => {
    let results = customResults || productService.list();

    if (!customResults) {
      if (filters.priceRanges.length > 0) {
        results = results.filter(product => {
          return filters.priceRanges.some(range => {
            if (range === 'under-200k') return product.price < 200000;
            if (range === 'from-200k-500k') return product.price >= 200000 && product.price <= 500000;
            if (range === 'over-500k') return product.price > 500000;
            return false;
          });
        });
      }

      if (filters.colors.length > 0) {
        const colorMap: Record<string, string> = {
          'Đen': '#000000',
          'Trắng': '#ffffff',
          'Xám': '#9ca3af',
          'Xanh Navy': '#1e3a8a',
          'Đỏ': '#ef4444',
          'Be': '#f5f5dc'
        };
        results = results.filter(product => {
          return product.colors && product.colors.some(colorHex =>
            filters.colors.some(selectedColor =>
              (colorMap[selectedColor] || '').toLowerCase() === colorHex.toLowerCase()
            )
          );
        });
      }
    }

    switch (filters.sortBy) {
      case 'price-asc':
        results = [...results].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        results = [...results].sort((a, b) => b.price - a.price);
        break;
      case 'discount':
        results = [...results].sort((a, b) => {
          const discountA = a.originalPrice ? ((a.originalPrice - a.price) / a.originalPrice) * 100 : 0;
          const discountB = b.originalPrice ? ((b.originalPrice - b.price) / b.originalPrice) * 100 : 0;
          return discountB - discountA;
        });
        break;
    }

    return results;
  }, [filters, customResults]);

  const totalProducts = customResults ? filteredProducts.length : productService.list().length;

  return (
    <div className="product-grid-container">
      <div className="plp-toolbar">
        <div className="toolbar-left">
          <span className="results-count">
            {tListing.showing} 1 - {filteredProducts.length} {tListing.of} {totalProducts} {tListing.products}
          </span>
        </div>
        <div className="toolbar-right">
          <label htmlFor="sort-select" className="sort-label">{t.sort.label}:</label>
          <select
            id="sort-select"
            className="sort-select"
            value={filters.sortBy}
            onChange={(e) => updateSortBy(e.target.value)}
          >
            <option value="newest">{t.sort.newest}</option>
            <option value="bestseller">{t.sort.bestseller}</option>
            <option value="price-asc">{t.sort.priceAsc}</option>
            <option value="price-desc">{t.sort.priceDesc}</option>
            <option value="discount">{t.sort.discount}</option>
          </select>
        </div>
      </div>

      <div className="plp-grid">
        {isLoading
          ? Array.from({ length: 8 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))
          : filteredProducts.length > 0
          ? filteredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))
          : (
              <div className="no-products">
                <p>{tListing.noProducts}</p>
              </div>
            )}
      </div>

      <div className="plp-pagination">
        <button className="pagination-btn disabled">{tListing.prevPage}</button>
        <div className="pagination-numbers">
          <button className="page-number active">1</button>
          <button className="page-number">2</button>
          <button className="page-number">3</button>
          <span className="page-dots">...</span>
          <button className="page-number">10</button>
        </div>
        <button className="pagination-btn">{tListing.nextPage}</button>
      </div>
    </div>
  );
};

export default ProductGrid;
