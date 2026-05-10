import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const ONBOARDING_COMPLETE_KEY = 'ptos:onboarding_complete';

type OnboardingState = {
  completed: boolean;
  loaded: boolean;
  complete: () => Promise<void>;
  reset: () => Promise<void>;
  load: () => Promise<void>;
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  completed: false,
  loaded: false,
  complete: async () => {
    await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    set({ completed: true, loaded: true });
  },
  reset: async () => {
    await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY);
    set({ completed: false, loaded: true });
  },
  load: async () => {
    const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
    set({ completed: value === 'true', loaded: true });
  },
}));
