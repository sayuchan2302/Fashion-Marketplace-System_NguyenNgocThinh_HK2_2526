import type { Product } from '../types';

const PRODUCT_KEY = 'coolmate_products_v1';

export interface ProductFilter {
  query?: string;
  priceRanges?: string[];
  sizes?: string[];
  colors?: string[];
  sortBy?: 'newest' | 'bestseller' | 'price-asc' | 'price-desc' | 'discount';
  categoryId?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  { id: 'men', name: 'Thời Trang Nam', slug: 'men' },
  { id: 'women', name: 'Thời Trang Nữ', slug: 'women' },
  { id: 'sale', name: 'Sản Phẩm Khuyến Mãi', slug: 'sale' },
  { id: 'new', name: 'Sản Phẩm Mới', slug: 'new' },
  { id: 'accessories', name: 'Phụ Kiện', slug: 'accessories' },
];

const seedProducts: Product[] = [
  {
    id: 101,
    name: "Áo Polo Nam Cotton Khử Mùi",
    price: 359000,
    originalPrice: 450000,
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=672&h=990&q=80",
    badge: "NEW",
    colors: ["#000000", "#ffffff", "#1e3a8a"]
  },
  {
    id: 102,
    name: "Quần Jeans Nam Dáng Straight Tôn Dáng",
    price: 599000,
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=672&h=990&q=80",
    colors: ["#1e3a8a", "#6b7280"]
  },
  {
    id: 103,
    name: "Áo Sơ Mi Nam Vải Modal Thoáng Mát",
    price: 459000,
    originalPrice: 550000,
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=672&h=990&q=80",
    badge: "BEST SELLER"
  },
  {
    id: 104,
    name: "Áo Thun Nam Excool Co Giãn 4 Chiều",
    price: 129000,
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=672&h=990&q=80",
    colors: ["#000000", "#f3f4f6"]
  },
  {
    id: 105,
    name: "Quần Shorts Nam Thể Thao Co Giãn",
    price: 249000,
    originalPrice: 299000,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=672&h=990&q=80",
    colors: ["#000000", "#111827", "#4b5563"]
  },
  {
    id: 106,
    name: "Áo Khoác Gió Nam Chống Nước Nhẹ",
    price: 499000,
    originalPrice: 599000,
    image: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=672&h=990&q=80",
    colors: ["#000000", "#1e3a8a"]
  },
  {
    id: 107,
    name: "Tất Cổ Thấp Khử Mùi Hôi (Pack 3)",
    price: 99000,
    originalPrice: 150000,
    image: "https://images.unsplash.com/photo-1524503033411-c4c2b460ccb6?auto=format&fit=crop&w=672&h=990&q=80",
    badge: "SALE"
  },
  {
    id: 108,
    name: "Bộ Đồ Mặc Nhà Nam Cotton Thoáng",
    price: 399000,
    image: "https://images.unsplash.com/photo-1475180098004-ca77a66827be?auto=format&fit=crop&w=672&h=990&q=80",
    colors: ["#000000", "#4b5563"]
  },
  {
    id: 201,
    name: "Váy Liền Nữ Cổ Khuy Thanh Lịch",
    price: 499000,
    originalPrice: 650000,
    image: "https://images.unsplash.com/photo-1524504543470-0f085452bb3f?auto=format&fit=crop&w=672&h=990&q=80",
    badge: "HOT",
    colors: ["#ffffff", "#000000", "#fbcfe8"]
  },
  {
    id: 202,
    name: "Áo Kiểu Nữ Croptop Năng Động",
    price: 259000,
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=672&h=990&q=80",
    colors: ["#ffffff", "#000000", "#fbcfe8"]
  },
  {
    id: 203,
    name: "Quần Ống Suông Nữ Hack Dáng",
    price: 389000,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=672&h=990&q=80",
    colors: ["#374151", "#f3f4f6"]
  },
  {
    id: 204,
    name: "Áo Nỉ Hoodie Nữ Form Rộng",
    price: 399000,
    originalPrice: 450000,
    image: "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=672&h=990&q=80",
    colors: ["#d1d5db", "#000000"]
  },
  {
    id: 205,
    name: "Áo Khoác Blazer Nữ Tính",
    price: 699000,
    originalPrice: 899000,
    image: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=672&h=990&q=80",
    colors: ["#000000", "#fcd34d"]
  },
  {
    id: 206,
    name: "Chân Váy Chữ A Tôn Dáng",
    price: 299000,
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=672&h=990&q=80",
    colors: ["#000000", "#ffffff"]
  },
  {
    id: 207,
    name: "Quần Shorts Nữ Đi Biển Xinh Xắn",
    price: 199000,
    originalPrice: 250000,
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=672&h=990&q=80",
    colors: ["#6b7280", "#000000"]
  },
  {
    id: 208,
    name: "Áo Dây Cami Lụa Mát Mẻ",
    price: 159000,
    image: "https://images.unsplash.com/photo-1475180098004-ca77a66827be?auto=format&fit=crop&w=672&h=990&q=80",
    badge: "NEW",
    colors: ["#ffffff", "#fbcfe8"]
  },
];

const colorHexMatch = (colorName: string, productColorHex: string): boolean => {
  const colorMap: Record<string, string> = {
    'Đen': '#000000',
    'Trắng': '#ffffff',
    'Xám': '#9ca3af',
    'Xanh Navy': '#1e3a8a',
    'Đỏ': '#ef4444',
    'Be': '#f5f5dc'
  };
  return (colorMap[colorName] || '').toLowerCase() === productColorHex.toLowerCase();
};

export const productService = {
  list(): Product[] {
    try {
      const raw = localStorage.getItem(PRODUCT_KEY);
      if (!raw) return seedProducts;
      const data: Product[] = JSON.parse(raw);
      return data.length ? data : seedProducts;
    } catch {
      return seedProducts;
    }
  },

  getById(id: number | string): Product | null {
    const products = this.list();
    return products.find(p => p.id === Number(id)) || null;
  },

  filter(filter: ProductFilter): Product[] {
    let results = [...this.list()];

    if (filter.query?.trim()) {
      const normalizedQuery = filter.query.toLowerCase().normalize('NFC').trim();
      const words = normalizedQuery.split(/\s+/).filter(w => w.length >= 2);
      
      if (words.length > 0) {
        results = results.filter(product => {
          const searchableText = [
            product.name,
            product.name.toLowerCase(),
            product.badge || '',
          ].join(' ').normalize('NFC');
          
          return words.every(word => searchableText.includes(word));
        });
      }
    }

    if (filter.categoryId !== undefined) {
      const catMap: Record<string, number[]> = {
        'men': [101, 102, 103, 104, 105, 106, 107, 108],
        'women': [201, 202, 203, 204, 205, 206, 207, 208],
      };
      const categoryIds = catMap[filter.categoryId];
      if (categoryIds) {
        results = results.filter(p => categoryIds.includes(p.id));
      }
    }

    if (filter.priceRanges?.length) {
      results = results.filter(product => {
        return filter.priceRanges!.some(range => {
          if (range === 'under-200k') return product.price < 200000;
          if (range === 'from-200k-500k') return product.price >= 200000 && product.price <= 500000;
          if (range === 'over-500k') return product.price > 500000;
          return false;
        });
      });
    }

    if (filter.colors?.length) {
      results = results.filter(product => {
        return product.colors && product.colors.length > 0 && 
          filter.colors!.some(selectedColor => {
            return product.colors!.some(productColor => 
              colorHexMatch(selectedColor, productColor)
            );
          });
      });
    }

    switch (filter.sortBy) {
      case 'bestseller':
        break;
      case 'price-asc':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'discount':
        results.sort((a, b) => {
          const discountA = a.originalPrice ? ((a.originalPrice - a.price) / a.originalPrice) * 100 : 0;
          const discountB = b.originalPrice ? ((b.originalPrice - b.price) / b.originalPrice) * 100 : 0;
          return discountB - discountA;
        });
        break;
      case 'newest':
      default:
        break;
    }

    return results;
  },

  getRelated(productId: number, limit = 4): Product[] {
    const products = this.list();
    return products.filter(p => p.id !== productId).slice(0, limit);
  },

  getByCategory(categoryId: string): Product[] {
    return this.filter({ categoryId });
  },

  getOnSale(): Product[] {
    return this.list().filter(p => p.originalPrice !== undefined);
  },

  getNewArrivals(): Product[] {
    return this.list().filter(p => p.badge === 'NEW');
  },

  getCategoryName(categoryId: string): string {
    const category = PRODUCT_CATEGORIES.find(c => c.id === categoryId || c.slug === categoryId);
    return category?.name || 'Tất Cả Sản Phẩm';
  },

  search(query: string, limit?: number): Product[] {
    if (!query.trim()) return [];
    const normalizedQuery = query.toLowerCase().normalize('NFC').trim();
    const words = normalizedQuery.split(/\s+/).filter(w => w.length >= 2);
    
    let results = this.list();
    
    if (words.length > 0) {
      results = results.filter(product => {
        const searchableText = [
          product.name,
          product.name.toLowerCase(),
          product.badge || '',
        ].join(' ').normalize('NFC');
        
        return words.every(word => searchableText.includes(word));
      });
    }
    
    if (limit !== undefined && limit > 0) {
      results = results.slice(0, limit);
    }
    
    return results;
  },

  getTotalCount(filter?: ProductFilter): number {
    return this.filter(filter || {}).length;
  },
};
