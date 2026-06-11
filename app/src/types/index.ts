export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  price: number;
  oldPrice: number | null;
  discount: number | null;
  images: string[];
  specs: Record<string, string>;
  description: string;
  stock: number;
  rating: number;
  reviewCount: number;
  badges: BadgeType[];
  colors: ProductColor[];
  storageOptions: string[];
  cashback: number | null;
  monthlyPayment: number | null;
  isActive: boolean;
}

export type BadgeType = 'popular' | 'sale' | 'limited' | 'new' | 'credit0';

export interface ProductColor {
  name: string;
  hex: string;
  image: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  iconColor: string;
  parentId: string | null;
  subcategories: Subcategory[];
  filterGroups: FilterGroup[];
  sortOrder: number;
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

export interface FilterGroup {
  id: string;
  name: string;
  type: 'checkbox' | 'range' | 'select';
  options: string[] | RangeOptions;
}

export interface RangeOptions {
  min: number;
  max: number;
  step: number;
  unit: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  color: string | null;
  storage: string | null;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  discount: number;
  deliveryAddress: Address;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  color: string | null;
  storage: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  avatar: string | null;
  addresses: Address[];
  createdAt: string;
}

export interface Address {
  id: string;
  city: string;
  street: string;
  building: string;
  apartment: string;
  isDefault: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  helpful: number;
  createdAt: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface BlogPost {
  id: string;
  title: string;
  category: string;
  image: string;
  excerpt: string;
  date: string;
  slug: string;
}

export type SortOption = 'popular' | 'newest' | 'expensive' | 'cheap' | 'discount' | 'credit0';

export type ViewMode = 'grid' | 'list';
