import { create } from 'zustand';
import type { Product, Category, Review } from '@/types';
import { productsApi, categoriesApi } from '@/lib/api';

interface ProductState {
  products: Product[];
  categories: Category[];
  loading: boolean;
  initialized: boolean;
  fetchAll: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  getRelatedProducts: (product: Product, limit?: number) => Product[];
  getReviewsByProduct: (productId: string) => Promise<Review[]>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  categories: [],
  loading: false,
  initialized: false,

  fetchAll: async () => {
    if (get().initialized) return;
    set({ loading: true });
    try {
      const [{ products }, categories] = await Promise.all([
        productsApi.list({ limit: '500' }),
        categoriesApi.list(),
      ]);
      set({ products, categories, initialized: true });
    } catch (e) {
      console.error('Failed to fetch products', e);
    } finally {
      set({ loading: false });
    }
  },

  fetchCategories: async () => {
    const categories = await categoriesApi.list();
    set({ categories });
  },

  getProductById: (id) => get().products.find(p => p.id === id),

  getRelatedProducts: (product, limit = 6) =>
    get().products
      .filter(p => p.id !== product.id && (p.category === product.category || p.brand === product.brand))
      .slice(0, limit),

  getReviewsByProduct: (productId) => productsApi.reviews(productId),

  updateProduct: async (id, data) => {
    const updated = await productsApi.update(id, data);
    set((s) => ({ products: s.products.map(p => p.id === id ? updated : p) }));
  },
}));