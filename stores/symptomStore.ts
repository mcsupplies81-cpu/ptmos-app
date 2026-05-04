import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface SymptomLog {
  id: string;
  user_id: string;
  symptom: string;
  severity: number;
  notes: string | null;
  logged_at: string;
}

type InsertSymptomLog = Omit<SymptomLog, 'id' | 'user_id'>;

interface SymptomStore {
  logs: SymptomLog[];
  loading: boolean;
  error: string | null;
  fetchLogs: (userId: string) => Promise<void>;
  addLog: (log: InsertSymptomLog, userId: string) => Promise<void>;
}

export const useSymptomStore = create<SymptomStore>((set, get) => ({
  logs: [],
  loading: false,
  error: null,
  fetchLogs: async (userId) => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('symptom_logs')
      .select('*')
      .eq('user_id', userId)
      .order('logged_at', { ascending: false });
    if (error) {
      set({ error: error.message, loading: false });
      return;
    }
    set({ logs: (data as SymptomLog[]) ?? [], loading: false });
  },
  addLog: async (log, userId) => {
    const payload = { ...log, user_id: userId };
    const { data, error } = await supabase.from('symptom_logs').insert(payload).select('*').single();
    if (error) {
      set({ error: error.message });
      return;
    }
    set({ logs: [data as SymptomLog, ...get().logs] });
  },
}));
