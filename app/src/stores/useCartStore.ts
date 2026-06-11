import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/types';
import { useProductStore } from '@/stores/useProductStore';

interface CartState {
  items: CartItem[];
  // color param kept in signature for binary compat with persisted carts but always treated as null
  addItem: (productId: string, color?: string | null, storage?: string | null) => void;
  removeItem: (productId: string, color?: string | null, storage?: string | null) => void;
  updateQuantity: (productId: string, quantity: number, color?: string | null, storage?: string | null) => void;
  clearCart: () => void;
  totalCount: () => number;
  totalPrice: () => number;
  totalDiscount: () => number;
}

// Cart variants now keyed only by (productId, storage). Color is always null going forward.
const sameVariant = (a: CartItem, productId: string, storage: string | null | undefined) =>
  a.productId === productId && (a.storage ?? null) === (storage ?? null);

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (productId, _color, storage) => {
        set((state) => {
          const existing = state.items.find(item => sameVariant(item, productId, storage ?? null));
          if (existing) {
            return {
              items: state.items.map(item =>
                sameVariant(item, productId, storage ?? null)
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }
          return { items: [...state.items, { productId, quantity: 1, color: null, storage: storage || null }] };
        });
      },

      removeItem: (productId, _color = null, storage = null) => {
        set((state) => ({
          items: state.items.filter(item => !sameVariant(item, productId, storage)),
        }));
      },

      updateQuantity: (productId, quantity, _color = null, storage = null) => {
        if (quantity <= 0) {
          get().removeItem(productId, null, storage);
          return;
        }
        set((state) => ({
          items: state.items.map(item =>
            sameVariant(item, productId, storage) ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      totalCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      totalPrice: () => {
        const getProduct = useProductStore.getState().getProductById;
        return get().items.reduce((sum, item) => {
          const product = getProduct(item.productId);
          return sum + (product ? product.price * item.quantity : 0);
        }, 0);
      },

      totalDiscount: () => {
        const getProduct = useProductStore.getState().getProductById;
        return get().items.reduce((sum, item) => {
          const product = getProduct(item.productId);
          if (product && product.oldPrice) {
            return sum + (product.oldPrice - product.price) * item.quantity;
          }
          return sum;
        }, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
