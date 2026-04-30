import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export type SymptomType =
  | 'fatigue'
  | 'headache'
  | 'nausea'
  | 'appetite_change'
  | 'sleep_quality'
  | 'anxiety'
  | 'soreness'
  | 'inflammation'
  | 'bloating'
  | 'mood'
  | 'libido'
  | 'hunger'
  | 'injection_site_irritation'
  | 'digestion'
  | 'energy';

export interface SymptomLog {
  id: string;
  user_id: string;
  type: SymptomType;
  severity: number;
  notes: string | null;
  logged_at: string;
  dose_log_id: string | null;
}

type AddSymptomLog = Omit<SymptomLog, 'id' | 'user_id'>;

interface SymptomStore {
  logs: SymptomLog[];
  loading: boolean;
  fetchLogs: (userId: string) => Promise<void>;
  addLog: (log: AddSymptomLog, userId: string) => Promise<void>;
}

export const useSymptomStore = create<SymptomStore>((set, get) => ({
  logs: [],
  loading: false,
  fetchLogs: async (userId) => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('symptom_logs')
      .select('*')
      .eq('user_id', userId)
      .order('logged_at', { ascending: false });
    set({ loading: false });
    if (error) throw error;
    set({ logs: (data ?? []) as SymptomLog[] });
  },
  addLog: async (log, userId) => {
    const { data, error } = await supabase
      .from('symptom_logs')
      .insert({ ...log, user_id: userId })
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) throw error;
    set({ logs: [data as SymptomLog, ...get().logs] });
  },
}));
