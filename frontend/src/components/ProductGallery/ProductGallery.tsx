import { useState, memo } from 'react';
import './ProductGallery.css';

interface ProductGalleryProps {
  images: string[];
}

const ProductGallery = memo(({ images }: ProductGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) {
    return <div className="product-gallery-empty">No images available</div>;
  }

  return (
    <div className="product-gallery">
      {/* Thumbnails (Vertical on left, horizontal on mobile) */}
      <div className="gallery-thumbnails">
        {images.map((img, index) => (
          <button
            key={index}
            className={`thumbnail-btn ${index === activeIndex ? 'active' : ''}`}
            onClick={() => setActiveIndex(index)}
            aria-label={`View image ${index + 1}`}
          >
            <img src={img} alt={`Thumbnail ${index + 1}`} loading="lazy" decoding="async" />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="gallery-main-image">
        <img 
          src={images[activeIndex]} 
          alt="Product details" 
          className="main-image"
          loading="eager"
          decoding="async"
        />
      </div>
    </div>
  );
});

export default ProductGallery;
