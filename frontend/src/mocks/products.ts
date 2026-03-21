export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  badge?: string;
  colors?: string[];
}

export const mensFashion: Product[] = [
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
  }
];

export const productDetailRelated: Product[] = [
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

export interface ReturnItem {
  id: string;
  name: string;
  variant: string;
  price: number;
  image: string;
  selected: boolean;
}

export const returnItems: ReturnItem[] = [
  {
    id: 'i1',
    name: 'Áo Polo Nam Cotton Khử Mùi',
    variant: 'Màu: Đen | Size: L',
    price: 359000,
    image: 'https://media.coolmate.me/cdn-cgi/image/width=320,height=470,quality=85/uploads/February2025/11025595_24_copy_11.jpg',
    selected: true,
  },
  {
    id: 'i2',
    name: 'Quần Jeans Slim Fit',
    variant: 'Màu: Xanh đậm | Size: 32',
    price: 459000,
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=320&h=430&fit=crop',
    selected: false,
  },
];

export interface TrackingStep {
  label: string;
  time: string;
  description?: string;
  status: 'done' | 'current' | 'upcoming';
}

export interface MockOrder {
  id: string;
  phone: string;
  customer: string;
  address: string;
  eta: string;
  status: 'delivered' | 'shipping' | 'processing' | 'pending' | 'cancelled';
  steps: TrackingStep[];
}

export const mockOrders: MockOrder[] = [
  {
    id: 'CM20260301',
    phone: '0382253049',
    customer: 'Ngọc Thịnh Nguyễn',
    address: 'JJJV+Q7F, Quốc lộ 37, Hùng Sơn, Đại Từ, Thái Nguyên',
    eta: 'Dự kiến giao: 14/03/2026',
    status: 'shipping',
    steps: [
      { label: 'Tiếp nhận', time: '10/03/2026 10:12', status: 'done' },
      { label: 'Đang chuẩn bị hàng', time: '10/03/2026 16:00', status: 'done' },
      { label: 'Đang giao', time: '11/03/2026 08:10', description: 'Đang vận chuyển tới bưu cục đích', status: 'current' },
      { label: 'Giao thành công', time: '--', status: 'upcoming' },
    ],
  },
  {
    id: 'CM20260228',
    phone: '0912345678',
    customer: 'Anh Minh',
    address: '12 Nguyễn Trãi, Hà Nội',
    eta: 'Đã giao: 02/03/2026',
    status: 'delivered',
    steps: [
      { label: 'Tiếp nhận', time: '28/02/2026 09:12', status: 'done' },
      { label: 'Đang chuẩn bị hàng', time: '28/02/2026 13:00', status: 'done' },
      { label: 'Đang giao', time: '01/03/2026 08:15', status: 'done' },
      { label: 'Giao thành công', time: '02/03/2026 11:25', status: 'done' },
    ],
  },
];

export const womensFashion: Product[] = [
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
  }
];
