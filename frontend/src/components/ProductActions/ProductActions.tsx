import { useState } from 'react';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import './ProductActions.css';

const ProductActions = () => {
  const [quantity, setQuantity] = useState(1);

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    if (quantity < 10) {
      setQuantity(quantity + 1);
    }
  };

  return (
    <div className="product-actions-container">
      {/* Quantity Selector */}
      <div className="quantity-wrapper">
        <button 
          className="qty-btn" 
          onClick={decreaseQuantity}
          aria-label="Decrease quantity"
          disabled={quantity <= 1}
        >
          <Minus size={16} />
        </button>
        <input 
          type="number" 
          className="qty-input" 
          value={quantity} 
          readOnly 
        />
        <button 
          className="qty-btn" 
          onClick={increaseQuantity}
          aria-label="Increase quantity"
          disabled={quantity >= 10}
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="btn-add-to-cart">
          <ShoppingCart size={20} />
          THÊM VÀO GIỎ
        </button>
        <button className="btn-buy-now">
          MUA NGAY
        </button>
      </div>

      {/* Trust Badges Minimal */}
      <ul className="action-trust-list">
        <li>Đổi trả cực dễ chỉ cần số điện thoại</li>
        <li>60 ngày đổi trả vì bất kỳ lý do gì</li>
        <li>Hotline 1900.27.27.37 hỗ trợ từ 8h30 - 22h mỗi ngày</li>
      </ul>
    </div>
  );
};

export default ProductActions;
