import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  productIds: string[];
  toggle: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],

      toggle: (productId) => {
        set((state) => {
          const exists = state.productIds.includes(productId);
          if (exists) {
            return { productIds: state.productIds.filter(id => id !== productId) };
          }
          return { productIds: [...state.productIds, productId] };
        });
      },

      isInWishlist: (productId) => {
        return get().productIds.includes(productId);
      },

      clear: () => set({ productIds: [] }),
    }),
    {
      name: 'wishlist-storage',
    }
  )
);
