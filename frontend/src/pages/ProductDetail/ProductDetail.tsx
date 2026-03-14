import { useParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import ProductGallery from '../../components/ProductGallery/ProductGallery';
import ProductInfo from '../../components/ProductInfo/ProductInfo';
import ProductActions from '../../components/ProductActions/ProductActions';
import ProductDescription from '../../components/ProductDescription/ProductDescription';
import ProductSection from '../../components/ProductSection/ProductSection';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();

  // Mock product data for initial layout
  const mockProduct = {
    id: id || "101",
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

  const relatedProducts = [
    {
      id: 102,
      name: "Áo Thun Nam Thể Thao",
      price: 159000,
      image: "https://media.coolmate.me/cdn-cgi/image/width=672,height=990,quality=85/uploads/February2025/11025595_24_copy_11.jpg",
      colors: ['#000000', '#FFFFFF', '#000080']
    },
    {
      id: 103,
      name: "Quần Short Nam Màu Đen",
      price: 199000,
      image: "https://media.coolmate.me/cdn-cgi/image/width=672,height=990,quality=85/uploads/February2025/11025595_17_copy.jpg",
      colors: ['#000000']
    },
    {
      id: 104,
      name: "Ví Da Nam Cao Cấp",
      price: 349000,
      originalPrice: 450000,
      badge: "SALE",
      image: "https://media.coolmate.me/cdn-cgi/image/width=672,height=990,quality=85/uploads/February2025/11025595_21.jpg",
      colors: ['#8B4513', '#000000']
    },
    {
      id: 105,
      name: "Mũ Lưỡi Trai Logo",
      price: 99000,
      image: "https://media.coolmate.me/cdn-cgi/image/width=672,height=990,quality=85/uploads/February2025/11025595_31_copy_91.jpg",
      colors: ['#000080', '#000000', '#FF0000']
    }
  ];

  return (
    <div className="pdp-page">
      {/* Breadcrumbs */}
      <div className="breadcrumb-wrapper">
        <div className="container">
          <nav className="breadcrumbs">
            <Link to="/" className="breadcrumb-link">Trang Chủ</Link>
            <ChevronRight size={14} className="breadcrumb-separator" />
            <Link to={`/category/${mockProduct.categorySlug}`} className="breadcrumb-link">{mockProduct.category}</Link>
            <ChevronRight size={14} className="breadcrumb-separator" />
            <span className="breadcrumb-current">{mockProduct.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container pdp-container">
        
        {/* Above the Fold: 2 Columns */}
        <div className="pdp-top-section">
          {/* Left Column: Gallery */}
          <div className="pdp-gallery-col">
            <ProductGallery images={mockProduct.images} />
          </div>
          
          {/* Right Column: Info & Actions */}
          <div className="pdp-info-col">
            <ProductInfo product={mockProduct} />
            <ProductActions />
          </div>
        </div>

        {/* Below the Fold: Description Tabs & Related Products */}
        <div className="pdp-bottom-section">
           <ProductDescription />
           
           <div className="related-products-section">
             <ProductSection title="Sản Phẩm Bạn Có Thể Thích" products={relatedProducts} />
           </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetail;
