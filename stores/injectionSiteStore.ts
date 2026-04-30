import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface InjectionSiteLog {
  id: string;
  user_id: string;
  site: string;
  logged_at: string;
  notes: string | null;
  dose_log_id: string | null;
}

type AddInjectionSiteLog = Omit<InjectionSiteLog, 'id' | 'user_id'>;

interface InjectionSiteStore {
  logs: InjectionSiteLog[];
  loading: boolean;
  fetchLogs: (userId: string) => Promise<void>;
  addLog: (log: AddInjectionSiteLog, userId: string) => Promise<void>;
}

export const useInjectionSiteStore = create<InjectionSiteStore>((set, get) => ({
  logs: [],
  loading: false,
  fetchLogs: async (userId) => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('injection_site_logs')
      .select('*')
      .eq('user_id', userId)
      .order('logged_at', { ascending: false });
    set({ loading: false });
    if (error) throw error;
    set({ logs: (data ?? []) as InjectionSiteLog[] });
  },
  addLog: async (log, userId) => {
    const { data, error } = await supabase
      .from('injection_site_logs')
      .insert({ ...log, user_id: userId })
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) throw error;
    set({ logs: [data as InjectionSiteLog, ...get().logs] });
  },
}));
