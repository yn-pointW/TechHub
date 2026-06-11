import { create } from 'zustand';
import type { Product, Order, User, Category, OrderStatus } from '@/types';
import { productsApi, ordersApi, categoriesApi, usersApi } from '@/lib/api';
import { useProductStore } from './useProductStore';

interface AdminState {
  products: Product[];
  orders: Order[];
  categories: Category[];
  users: User[];
  loading: boolean;
  productSearch: string;
  productCategoryFilter: string;
  orderStatusFilter: string;

  setProductSearch: (search: string) => void;
  setProductCategoryFilter: (category: string) => void;
  setOrderStatusFilter: (status: string) => void;

  fetchProducts: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchUsers: () => Promise<void>;

  addProduct: (product: Omit<Product, 'id'>) => Promise<Product>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;

  getFilteredProducts: () => Product[];
  getFilteredOrders: () => Order[];
  getDashboardStats: () => { totalOrders: number; revenue: number; totalUsers: number; totalProducts: number };
  getSalesByDay: () => { date: string; amount: number }[];
  getTopCategories: () => { name: string; sales: number }[];
}

export const useAdminStore = create<AdminState>((set, get) => ({
  products: [],
  orders: [],
  categories: [],
  users: [],
  loading: false,
  productSearch: '',
  productCategoryFilter: 'all',
  orderStatusFilter: 'all',

  setProductSearch: (search) => set({ productSearch: search }),
  setProductCategoryFilter: (category) => set({ productCategoryFilter: category }),
  setOrderStatusFilter: (status) => set({ orderStatusFilter: status }),

  fetchProducts: async () => {
    set({ loading: true });
    try {
      const { products } = await productsApi.list({ limit: '500' });
      set({ products });
      // Keep public product store in sync so Home/Catalog see admin edits immediately
      useProductStore.setState({ products });
    } catch (e) {
      console.error('Failed to fetch products', e);
    } finally {
      set({ loading: false });
    }
  },

  fetchOrders: async () => {
    set({ loading: true });
    try {
      const orders = await ordersApi.list();
      set({ orders });
    } catch (e) {
      console.error('Failed to fetch orders', e);
    } finally {
      set({ loading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const categories = await categoriesApi.list();
      set({ categories });
    } catch (e) {
      console.error('Failed to fetch categories', e);
    }
  },

  fetchUsers: async () => {
    try {
      const users = await usersApi.list();
      set({ users });
    } catch (e) {
      console.error('Failed to fetch users', e);
    }
  },

  addProduct: async (product) => {
    const newProduct = await productsApi.create(product);
    set((s) => ({ products: [...s.products, newProduct] }));
    useProductStore.setState((s) => ({ products: [...s.products, newProduct] }));
    return newProduct;
  },

  updateProduct: async (id, data) => {
    const updated = await productsApi.update(id, data);
    set((s) => ({ products: s.products.map(p => p.id === id ? updated : p) }));
    useProductStore.setState((s) => ({ products: s.products.map(p => p.id === id ? updated : p) }));
  },

  deleteProduct: async (id) => {
    await productsApi.delete(id);
    set((s) => ({ products: s.products.filter(p => p.id !== id) }));
    useProductStore.setState((s) => ({ products: s.products.filter(p => p.id !== id) }));
  },

  updateOrderStatus: async (orderId, status) => {
    const updated = await ordersApi.updateStatus(orderId, status);
    set((s) => ({ orders: s.orders.map(o => o.id === orderId ? updated : o) }));
  },

  getFilteredProducts: () => {
    const { products, productSearch, productCategoryFilter, categories } = get();
    const filterCat = categories.find(c => c.slug === productCategoryFilter);
    const subSlugs = new Set(filterCat?.subcategories.map(s => s.slug) ?? []);
    return products.filter(p => {
      const matchesSearch = !productSearch ||
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.brand.toLowerCase().includes(productSearch.toLowerCase());
      const matchesCategory =
        productCategoryFilter === 'all' ||
        p.category === productCategoryFilter ||
        subSlugs.has(p.category) ||
        subSlugs.has(p.subcategory) ||
        p.subcategory === productCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  },

  getFilteredOrders: () => {
    const { orders, orderStatusFilter } = get();
    if (orderStatusFilter === 'all') return orders;
    return orders.filter(o => o.status === orderStatusFilter);
  },

  getDashboardStats: () => {
    const { orders, products, users } = get();
    return {
      totalOrders: orders.length,
      revenue: orders.reduce((sum, o) => sum + o.total, 0),
      totalUsers: users.filter(u => u.role === 'user').length,
      totalProducts: products.length,
    };
  },

  getSalesByDay: () => {
    const { orders } = get();
    const salesMap: Record<string, number> = {};
    orders.forEach(o => {
      const date = o.createdAt.split('T')[0];
      salesMap[date] = (salesMap[date] || 0) + o.total;
    });
    return Object.entries(salesMap)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30);
  },

  getTopCategories: () => {
    const { orders, products, categories } = get();
    const categorySales: Record<string, number> = {};
    orders.forEach(o => {
      o.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const catName = categories.find(c => c.slug === product.category)?.name || product.category;
          categorySales[catName] = (categorySales[catName] || 0) + item.price * item.quantity;
        }
      });
    });
    return Object.entries(categorySales)
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  },
}));