import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface LifestyleLog {
  id: string;
  user_id: string;
  date: string;
  weight_lbs: number | null;
  water_oz: number | null;
  calories: number | null;
  protein_g: number | null;
  sleep_hours: number | null;
  steps: number | null;
  workout_notes: string | null;
  mood: number | null;
  energy: number | null;
  meal_notes: string | null;
}

type UpsertLifestyleLog = Omit<LifestyleLog, 'id' | 'user_id'>;

interface LifestyleStore {
  logs: LifestyleLog[];
  loading: boolean;
  fetchLogs: (userId: string) => Promise<void>;
  upsertLog: (log: UpsertLifestyleLog, userId: string) => Promise<void>;
}

export const useLifestyleStore = create<LifestyleStore>((set, get) => ({
  logs: [],
  loading: false,
  fetchLogs: async (userId) => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('lifestyle_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    set({ loading: false });
    if (error) throw error;
    set({ logs: (data ?? []) as LifestyleLog[] });
  },
  upsertLog: async (log, userId) => {
    const { data, error } = await supabase
      .from('lifestyle_logs')
      .upsert({ ...log, user_id: userId }, { onConflict: 'user_id,date' })
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) throw error;

    const existing = get().logs.find((entry) => entry.date === log.date);
    if (existing) {
      set({ logs: get().logs.map((entry) => (entry.date === log.date ? (data as LifestyleLog) : entry)) });
      return;
    }
    set({ logs: [data as LifestyleLog, ...get().logs] });
  },
}));
