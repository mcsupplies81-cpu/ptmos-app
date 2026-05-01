import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export type Profile = {
  id: string;
  full_name: string | null;
  disclaimer_accepted: boolean;
  disclaimer_accepted_at: string | null;
};

type ProfileState = {
  profile: Profile | null | undefined; // undefined = not yet fetched
  loading: boolean;
  fetchProfile: (userId: string) => Promise<void>;
  setProfile: (profile: Profile | null) => void;
};

export const useProfileStore = create<ProfileState>((set) => ({
  profile: undefined, // undefined means "not fetched yet"
  loading: false,
  setProfile: (profile) => set({ profile }),
  fetchProfile: async (userId) => {
    set({ loading: true });
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, disclaimer_accepted, disclaimer_accepted_at')
      .eq('id', userId)
      .maybeSingle();
    set({ profile: (data as Profile | null) ?? null, loading: false });
  },
}));
