import { create } from 'zustand';

import { supabase } from '@/lib/supabase';

export interface Insight {
  id: string;
  type: string;
  title: string;
  body: string;
  generated_at: string;
}

interface InsightState {
  insights: Insight[];
  loading: boolean;
  error: string | null;
  fetchInsights: (userId: string) => Promise<void>;
}

export const useInsightStore = create<InsightState>((set) => ({
  insights: [],
  loading: false,
  error: null,
  fetchInsights: async (userId: string) => {
    set({ loading: true, error: null });

    const { data, error } = await supabase
      .from('insights')
      .select('id, type, title, body, generated_at')
      .eq('user_id', userId)
      .order('generated_at', { ascending: false });

    if (error) {
      set({ error: error.message, loading: false });
      return;
    }

    set({ insights: data ?? [], loading: false, error: null });
  },
}));
