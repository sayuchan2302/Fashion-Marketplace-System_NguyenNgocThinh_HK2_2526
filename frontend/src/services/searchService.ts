import { productService, type ProductFilter } from './productService';
import type { Product } from '../types';

export interface SearchOptions extends ProductFilter {
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  products: Product[];
  total: number;
  query: string;
}

const HISTORY_KEY = 'coolmate_search_history_v1';
const MAX_HISTORY = 10;
const MAX_SUGGESTIONS = 5;

export const POPULAR_KEYWORDS = [
  'Áo Polo',
  'Quần Jeans',
  'Áo Thun',
  'Hoodie',
  'Quần Short',
  'Áo Sơ Mi',
  'Blazer',
  'Váy',
];

const normalizeText = (text: string): string => {
  return text.toLowerCase().normalize('NFC').trim();
};

const persistHistory = (history: string[]) => {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // localStorage might be full
  }
};

export const searchService = {
  search(query: string, limit = MAX_SUGGESTIONS): Product[] {
    if (!query.trim()) return [];
    return productService.search(query, limit);
  },

  searchAdvanced(options: SearchOptions): SearchResult {
    const { query = '', limit, offset = 0, ...filters } = options;
    let products = productService.filter(filters);
    const total = products.length;
    
    if (limit !== undefined) {
      products = products.slice(offset, offset + limit);
    }
    
    return { products, total, query };
  },

  searchWithCount(options: SearchOptions): { products: Product[]; total: number } {
    const { limit, ...filters } = options;
    let products = productService.filter(filters);
    const total = products.length;
    
    if (limit !== undefined) {
      products = products.slice(0, limit);
    }
    
    return { products, total };
  },

  getPopularKeywords(): string[] {
    return [...POPULAR_KEYWORDS];
  },

  getRecentSearches(): string[] {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (!raw) return [];
      const history: string[] = JSON.parse(raw);
      return history.slice(0, MAX_HISTORY);
    } catch {
      return [];
    }
  },

  addToHistory(keyword: string): void {
    if (!keyword.trim()) return;
    const normalized = normalizeText(keyword);
    const history = this.getRecentSearches().filter(h => normalizeText(h) !== normalized);
    const updated = [keyword, ...history].slice(0, MAX_HISTORY);
    persistHistory(updated);
  },

  removeFromHistory(keyword: string): void {
    const normalized = normalizeText(keyword);
    const history = this.getRecentSearches().filter(h => normalizeText(h) !== normalized);
    persistHistory(history);
  },

  clearHistory(): void {
    persistHistory([]);
  },

  getSuggestions(query: string, limit = MAX_SUGGESTIONS): Product[] {
    if (!query.trim() || query.length < 2) return [];
    return this.search(query, limit);
  },
};
