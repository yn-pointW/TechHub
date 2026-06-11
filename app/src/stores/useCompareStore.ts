import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useToastStore } from './useToastStore';
import i18n from '@/i18n';

interface CompareState {
  productIds: string[];
  toggle: (productId: string) => void;
  isInCompare: (productId: string) => boolean;
  clear: () => void;
  removeProduct: (productId: string) => void;
}

const MAX_COMPARE = 4;

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      productIds: [],

      toggle: (productId) => {
        set((state) => {
          const exists = state.productIds.includes(productId);
          if (exists) {
            return { productIds: state.productIds.filter(id => id !== productId) };
          }
          if (state.productIds.length >= MAX_COMPARE) {
            useToastStore.getState().addToast('error', i18n.t('product.compare_max'));
            return state;
          }
          return { productIds: [...state.productIds, productId] };
        });
      },

      isInCompare: (productId) => {
        return get().productIds.includes(productId);
      },

      clear: () => set({ productIds: [] }),

      removeProduct: (productId) => {
        set((state) => ({
          productIds: state.productIds.filter(id => id !== productId),
        }));
      },
    }),
    {
      name: 'compare-storage',
    }
  )
);
