import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import ProductGallery from '../../components/ProductGallery/ProductGallery';
import ProductInfo from '../../components/ProductInfo/ProductInfo';
import ProductActions from '../../components/ProductActions/ProductActions';
import ProductDescription from '../../components/ProductDescription/ProductDescription';
import ProductSection from '../../components/ProductSection/ProductSection';
import ProductDetailSkeleton from '../../components/ProductDetailSkeleton/ProductDetailSkeleton';
import { productService } from '../../services/productService';
import { CLIENT_TEXT } from '../../utils/texts';
import './ProductDetail.css';

const t = CLIENT_TEXT.productDetail;

const mockProduct = {
  id: 101,
  name: "Áo Polo Nam Cotton Khử Mùi",
  category: "Thời Trang Nam",
  categorySlug: "men",
  images: [
    "https://media.coolmate.me/cdn-cgi/image/width=672,height=990,quality=85/uploads/February2025/11025595_24_copy_11.jpg",
    "https://media.coolmate.me/cdn-cgi/image/width=672,height=990,quality=85/uploads/February2025/11025595_31_copy_91.jpg",
    "https://media.coolmate.me/cdn-cgi/image/width=672,height=990,quality=85/uploads/February2025/11025595_21.jpg",
    "https://media.coolmate.me/cdn-cgi/image/width=672,height=990,quality=85/uploads/February2025/11025595_17_copy.jpg"
  ],
  price: 299000,
  originalPrice: 399000,
  rating: 4.9,
  sold: 12500,
  colors: [
    { name: 'Đen', hex: '#000000' },
    { name: 'Xanh Navy', hex: '#000080' },
    { name: 'Xám', hex: '#808080' },
    { name: 'Trắng', hex: '#FFFFFF' }
  ],
  sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL']
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const productId = id ? parseInt(id) : 101;
  const product = { ...mockProduct, id: productId };

  // Get related products from service
  const relatedProducts = useMemo(() => {
    return productService.getRelated(productId, 4);
  }, [productId]);

  // Selected variant state lifted up here so ProductActions can use it
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name ?? '');
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? '');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate API fetch delay
  useEffect(() => {
    // Scroll to top when PDP mounts or ID changes
    window.scrollTo(0, 0);
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [id]);

  if (isLoading) {
    return (
      <div className="pdp-page">
        <div className="container pdp-container">
          <ProductDetailSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="pdp-page">
      {/* Breadcrumbs */}
      <div className="breadcrumb-wrapper">
        <div className="container">
          <nav className="breadcrumbs">
            <Link to="/" className="breadcrumb-link">Trang Chủ</Link>
            <ChevronRight size={14} className="breadcrumb-separator" />
            <Link to={`/category/${product.categorySlug}`} className="breadcrumb-link">{product.category}</Link>
            <ChevronRight size={14} className="breadcrumb-separator" />
            <span className="breadcrumb-current">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container pdp-container">
        
        {/* Above the Fold: 2 Columns */}
        <div className="pdp-top-section">
          {/* Left Column: Gallery */}
          <div className="pdp-gallery-col">
            <ProductGallery images={product.images} />
          </div>
          
          {/* Right Column: Info & Actions */}
          <div className="pdp-info-col">
            <ProductInfo
              product={product}
              onVariantChange={(color, size) => {
                setSelectedColor(color);
                setSelectedSize(size);
              }}
            />
            <ProductActions
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                originalPrice: product.originalPrice,
                image: product.images[0],
              }}
              selectedColor={selectedColor}
              selectedSize={selectedSize}
            />
<div className="pd-size-help">
              <p className="pd-size-text">{t.sizeHelp.text}</p>
              <div className="pd-size-links">
                <Link to="/size-guide" className="pd-size-link">{t.sizeHelp.sizeGuide}</Link>
                <Link to="/contact" className="pd-size-link">{t.sizeHelp.consult}</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Below the Fold: Description Tabs & Related Products */}
        <div className="pdp-bottom-section">
           <ProductDescription />
           
           <div className="related-products-section">
             <ProductSection title={t.related} products={relatedProducts} />
           </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetail;
