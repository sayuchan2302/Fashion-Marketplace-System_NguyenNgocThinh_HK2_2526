export interface Review {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  orderId: string;
  rating: number;
  title?: string;
  content: string;
  images?: string[];
  createdAt: string;
  updatedAt?: string;
  helpful: number;
  shopReply?: {
    content: string;
    createdAt: string;
  };
}

export interface ReviewSubmission {
  productId: string;
  productName?: string;
  productImage?: string;
  orderId: string;
  rating: number;
  title?: string;
  content: string;
  images?: string[];
}

const KEY = 'coolmate_reviews_v1';

const seedReviews: Review[] = [
  {
    id: 'rev_001',
    productId: '101',
    productName: 'Áo Polo Nam Cotton Khử Mùi',
    productImage: 'https://images.unsplash.com/photo-1625910513413-5fc4e5e40687?w=120&h=120&fit=crop',
    orderId: 'DH123456',
    rating: 5,
    title: 'Sản phẩm tuyệt vời!',
    content: 'Chất lượng vải rất tốt, mặc thoáng mát, không bị phai màu sau nhiều lần giặt. Giao hàng nhanh, đóng gói cẩn thận.',
    createdAt: '2026-03-15T10:30:00Z',
    helpful: 24,
    shopReply: {
      content: 'Cảm ơn bạn đã tin tưởng và đánh giá tích cực! Coolmate luôn cố gắng mang đến sản phẩm tốt nhất cho khách hàng.',
      createdAt: '2026-03-15T14:00:00Z',
    },
  },
];

const load = (): Review[] => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seedReviews;
    const data: Review[] = JSON.parse(raw);
    return data.length ? data : seedReviews;
  } catch {
    return seedReviews;
  }
};

const save = (reviews: Review[]) => {
  localStorage.setItem(KEY, JSON.stringify(reviews));
};

export const reviewService = {
  getReviews(): Review[] {
    return load();
  },

  getReviewsByOrder(orderId: string): Review[] {
    return load().filter(r => r.orderId === orderId);
  },

  getReviewsByProduct(productId: string): Review[] {
    return load().filter(r => r.productId === productId);
  },

  getAverageRating(productId: string): number {
    const reviews = this.getReviewsByProduct(productId);
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  },

  submitReview(submission: ReviewSubmission): Review {
    const newReview: Review = {
      id: `rev_${Date.now()}`,
      productId: submission.productId,
      productName: submission.productName || 'Sản phẩm',
      productImage: submission.productImage || '',
      orderId: submission.orderId,
      rating: submission.rating,
      title: submission.title,
      content: submission.content,
      images: submission.images,
      createdAt: new Date().toISOString(),
      helpful: 0,
    };
    
    const data = load();
    const existingIndex = data.findIndex(
      r => r.productId === submission.productId && r.orderId === submission.orderId
    );
    
    if (existingIndex >= 0) {
      data[existingIndex] = { ...data[existingIndex], ...newReview, updatedAt: new Date().toISOString() };
    } else {
      data.push(newReview);
    }
    
    save(data);
    return newReview;
  },

  updateReview(reviewId: string, updates: Partial<Review>): Review | null {
    const data = load();
    const index = data.findIndex(r => r.id === reviewId);
    if (index === -1) return null;
    
    data[index] = { ...data[index], ...updates, updatedAt: new Date().toISOString() };
    save(data);
    return data[index];
  },

  deleteReview(reviewId: string): boolean {
    const data = load();
    const index = data.findIndex(r => r.id === reviewId);
    if (index === -1) return false;
    
    data.splice(index, 1);
    save(data);
    return true;
  },

  markHelpful(reviewId: string): boolean {
    const data = load();
    const review = data.find(r => r.id === reviewId);
    if (!review) return false;
    
    review.helpful += 1;
    save(data);
    return true;
  },

  hasReviewed(productId: string, orderId: string): boolean {
    return load().some(r => r.productId === productId && r.orderId === orderId);
  },
};
