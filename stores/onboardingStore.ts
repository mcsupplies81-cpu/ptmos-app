import { create } from 'zustand';

type OnboardingState = {
  name: string;
  goals: string[];
  experience: string;
  setName: (name: string) => void;
  setGoals: (goals: string[]) => void;
  setExperience: (experience: string) => void;
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  name: '',
  goals: [],
  experience: '',
  setName: (name) => set({ name }),
  setGoals: (goals) => set({ goals }),
  setExperience: (experience) => set({ experience }),
}));
