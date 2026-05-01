import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface InjectionSite {
  id: string;
  user_id: string;
  site_name: string;
  last_used_at: string;
  total_uses: number;
}

interface InjectionSiteStore {
  sites: InjectionSite[];
  loading: boolean;
  error: string | null;
  fetchSites: (userId: string) => Promise<void>;
  markSiteUsed: (siteName: string, userId: string) => Promise<void>;
}

export const useInjectionSiteStore = create<InjectionSiteStore>((set, get) => ({
  sites: [],
  loading: false,
  error: null,
  fetchSites: async (userId) => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('injection_sites')
      .select('*')
      .eq('user_id', userId)
      .order('site_name', { ascending: true });

    if (error) {
      set({ loading: false, error: error.message });
      return;
    }

    set({ sites: (data as InjectionSite[]) ?? [], loading: false });
  },
  markSiteUsed: async (siteName, userId) => {
    const current = get().sites.find((site) => site.site_name === siteName);
    const { data, error } = await supabase
      .from('injection_sites')
      .upsert(
        {
          user_id: userId,
          site_name: siteName,
          last_used_at: new Date().toISOString(),
          total_uses: (current?.total_uses ?? 0) + 1,
        },
        { onConflict: 'user_id,site_name' },
      )
      .select('*')
      .single();

    if (error) {
      set({ error: error.message });
      return;
    }

    const next = get().sites.filter((site) => site.site_name !== siteName);
    set({ sites: [...next, data as InjectionSite] });
  },
}));
