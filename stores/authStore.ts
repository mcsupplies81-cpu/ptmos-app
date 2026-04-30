import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';

type AuthState = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isPro: boolean;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setIsPro: (isPro: boolean) => void;
  signOut: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: true,
  isPro: false,
  setSession: (session) => set({ session, user: session?.user ?? null }),
  setLoading: (loading) => set({ loading }),
  setIsPro: (isPro) => set({ isPro }),
  signOut: () => set({ session: null, user: null, isPro: false }),
}));
