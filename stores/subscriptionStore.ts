import { create } from 'zustand';
import { getCustomerInfo, isPro as checkIsPro } from '@/lib/purchases';

// Set to true to bypass paywall during development/testing
const DEV_FORCE_PRO = __DEV__ && (process.env.EXPO_PUBLIC_FORCE_PRO === 'true');

type SubscriptionStore = {
  isPro: boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
  setIsPro: (val: boolean) => void;
};

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
  isPro: DEV_FORCE_PRO,
  isLoading: !DEV_FORCE_PRO,

  setIsPro: (isPro) => set({ isPro }),

  refresh: async () => {
    if (DEV_FORCE_PRO) return;
    set({ isLoading: true });
    const info = await getCustomerInfo();
    set({ isPro: checkIsPro(info), isLoading: false });
  },
}));
