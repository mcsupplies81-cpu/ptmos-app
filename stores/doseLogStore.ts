import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface DoseLog {
  id: string;
  user_id?: string;
  protocol_id: string | null;
  peptide_name: string | null;
  amount: number;
  unit: 'mg' | 'mcg' | 'IU' | 'mL';
  logged_at: string;
  injection_site: string | null;
  notes: string | null;
  mood: string | null;
}

interface DoseLogState {
  doseLogs: DoseLog[];
  loading: boolean;
  error: string | null;
  fetchDoseLogs: (userId: string) => Promise<void>;
  addDoseLog: (log: Omit<DoseLog, 'id' | 'user_id'>, userId: string) => Promise<void>;
}

export const useDoseLogStore = create<DoseLogState>((set) => ({
  doseLogs: [],
  loading: false,
  error: null,

  fetchDoseLogs: async (userId) => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('dose_logs')
      .select('*')
      .eq('user_id', userId)
      .order('logged_at', { ascending: false })
      .limit(100);
    if (error) { set({ error: error.message, loading: false }); return; }
    set({ doseLogs: (data as DoseLog[]) ?? [], loading: false });
  },

  addDoseLog: async (log, userId) => {
    const payload = { ...log, user_id: userId };
    const { data, error } = await supabase
      .from('dose_logs')
      .insert(payload)
      .select()
      .single();
    if (error) { set({ error: error.message }); return; }
    set((state) => ({ doseLogs: [data as DoseLog, ...state.doseLogs] }));
  },
}));
