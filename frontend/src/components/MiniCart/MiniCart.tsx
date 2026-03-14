import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Trash2, Plus, Minus, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import './MiniCart.css';

interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  color: string;
  size: string;
  quantity: number;
}

interface MiniCartProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock Cart Data
const mockCartItems: CartItem[] = [
  {
    id: 'cart-1',
    name: 'Áo Polo Nam Cotton Khử Mùi',
    price: 299000,
    originalPrice: 399000,
    image: 'https://media.coolmate.me/cdn-cgi/image/width=672,height=990,quality=85/uploads/February2025/11025595_24_copy_11.jpg',
    color: 'Đen',
    size: 'L',
    quantity: 1,
  },
  {
    id: 'cart-2',
    name: 'Quần Short Nam Vải Kaki',
    price: 249000,
    image: 'https://media.coolmate.me/cdn-cgi/image/width=672,height=990,quality=85/uploads/February2025/11025595_17_copy.jpg',
    color: 'Be',
    size: 'XL',
    quantity: 2,
  }
];

const MiniCart = ({ isOpen, onClose }: MiniCartProps) => {
  const [selectedItems, setSelectedItems] = useState<string[]>(mockCartItems.map(item => item.id));

  // Prevent background scrolling when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleToggleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedItems.length === mockCartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(mockCartItems.map(item => item.id));
    }
  };

  const selectedCartItems = mockCartItems.filter(item => selectedItems.includes(item.id));
  const totalAmount = selectedCartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalItems = mockCartItems.reduce((acc, item) => acc + item.quantity, 0);

  if (!isOpen && typeof document !== 'undefined') {
     // Optionally keep in DOM but hidden to allow animation out to finish. 
     // We will render null initially, but for CSS animations, we keep rendering it.
  }

  const content = (
    <div className="mini-cart-root">
      {/* Overlay */}
      <div 
        className={`mini-cart-overlay ${isOpen ? 'active' : ''}`} 
        onClick={onClose}
      />

      {/* Cart Drawer */}
      <div className={`mini-cart-drawer ${isOpen ? 'open' : ''}`}>
        
        {/* Header */}
        <div className="cart-header">
          <h2>Giỏ hàng <span>({totalItems})</span></h2>
          <button className="cart-close-btn" onClick={onClose} aria-label="Đóng giỏ hàng">
            <X size={24} />
          </button>
        </div>

        {/* Free Shipping Progress (Mock) */}
        <div className="cart-progress-bar">
          <p className="progress-text">Bạn đã được <strong>Miễn phí vận chuyển</strong></p>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: '100%' }}></div>
          </div>
        </div>

        {/* Cart Items */}
        <div className="cart-body">
          {mockCartItems.length === 0 ? (
            <div className="cart-empty">
              <p>Giỏ hàng của bạn đang trống.</p>
              <button className="btn-continue-shopping" onClick={onClose}>
                Tiếp tục mua hàng
              </button>
            </div>
          ) : (
            <>
              <div className="cart-select-all">
                <label className="custom-checkbox">
                  <input 
                    type="checkbox" 
                    checked={selectedItems.length === mockCartItems.length && mockCartItems.length > 0}
                    onChange={handleToggleSelectAll}
                  />
                  <span className="checkmark"><Check size={14} /></span>
                  Tất cả sản phẩm
                </label>
              </div>
              <div className="cart-items-list">
                {mockCartItems.map((item) => {
                  const isSelected = selectedItems.includes(item.id);
                  return (
                    <div key={item.id} className="cart-item">
                      <div className="cart-item-checkbox">
                        <label className="custom-checkbox">
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => handleToggleSelectItem(item.id)}
                          />
                          <span className="checkmark"><Check size={14} /></span>
                        </label>
                      </div>
                      <div className={`cart-item-image ${!isSelected ? 'dimmed' : ''}`}>
                        <img src={item.image} alt={item.name} />
                      </div>
                      <div className={`cart-item-info ${!isSelected ? 'dimmed' : ''}`}>
                        <div className="item-title-row">
                          <Link to={`/product/${item.id}`} className="item-name" onClick={onClose}>
                            {item.name}
                          </Link>
                          <button className="item-remove-btn" aria-label="Xóa sản phẩm">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="item-variant">
                          {item.color} / {item.size}
                        </div>
                        
                        <div className="item-price-row">
                          <div className="item-qty-control">
                            <button className="qty-btn"><Minus size={14}/></button>
                            <span className="qty-value">{item.quantity}</span>
                            <button className="qty-btn"><Plus size={14}/></button>
                          </div>
                          <div className="item-price-block">
                            <span className="item-price">{(item.price).toLocaleString('vi-VN')}đ</span>
                            {item.originalPrice && (
                              <span className="item-original-price">{(item.originalPrice).toLocaleString('vi-VN')}đ</span>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer actions */}
        <div className="cart-footer">
          <div className="cart-summary-row">
            <span className="summary-label">Tạm tính:</span>
            <span className="summary-value">{totalAmount.toLocaleString('vi-VN')}đ</span>
          </div>
          <p className="cart-footer-note">Đã bao gồm VAT. Phí vận chuyển và các mã giảm giá sẽ được tính toán ở bước Thanh toán.</p>
          <button className="btn-checkout" onClick={onClose} disabled={selectedItems.length === 0}>
            THANH TOÁN {selectedItems.length > 0 ? `(${selectedItems.length})` : ''}
          </button>
        </div>

      </div>
    </div>
  );

  if (typeof window === 'undefined') return null;
  return createPortal(content, document.body);
};

export default MiniCart;
