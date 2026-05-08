import { create } from 'zustand';
import { getCustomerInfo, isPro as checkIsPro } from '@/lib/purchases';

type SubscriptionStore = {
  isPro: boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
  setIsPro: (val: boolean) => void;
};

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
  isPro: false,
  isLoading: true,

  setIsPro: (isPro) => set({ isPro }),

  refresh: async () => {
    set({ isLoading: true });
    const info = await getCustomerInfo();
    set({ isPro: checkIsPro(info), isLoading: false });
  },
}));
