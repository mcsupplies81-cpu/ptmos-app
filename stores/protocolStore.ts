import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export type ProtocolStatus = 'active' | 'paused' | 'completed' | 'archived';
export type Frequency = 'Daily' | 'Weekly' | 'Specific Days';

export interface Protocol {
  id: string;
  user_id?: string;
  name: string;
  dose_amount: number;
  dose_unit: 'mg' | 'mcg' | 'IU' | 'mL';
  frequency: Frequency;
  days_of_week: number[];
  time_of_day: string;
  start_date: string;
  end_date: string | null;
  notes: string | null;
  status: ProtocolStatus;
}

interface ProtocolState {
  protocols: Protocol[];
  loading: boolean;
  error: string | null;
  fetchProtocols: (userId: string) => Promise<void>;
  upsertProtocol: (protocol: Omit<Protocol, 'id' | 'user_id'> & { id?: string }, userId: string) => Promise<void>;
  deleteProtocol: (id: string) => Promise<void>;
}

export const useProtocolStore = create<ProtocolState>((set, get) => ({
  protocols: [],
  loading: false,
  error: null,

  fetchProtocols: async (userId) => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('protocols')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) { set({ error: error.message, loading: false }); return; }
    set({ protocols: (data as Protocol[]) ?? [], loading: false });
  },

  upsertProtocol: async (protocol, userId) => {
    const payload = { ...protocol, user_id: userId };
    const { data, error } = await supabase
      .from('protocols')
      .upsert(payload)
      .select()
      .single();
    if (error) { set({ error: error.message }); return; }
    const saved = data as Protocol;
    set((state) => {
      const idx = state.protocols.findIndex((p) => p.id === saved.id);
      if (idx === -1) return { protocols: [saved, ...state.protocols] };
      const next = [...state.protocols];
      next[idx] = saved;
      return { protocols: next };
    });
  },

  deleteProtocol: async (id) => {
    const { error } = await supabase.from('protocols').delete().eq('id', id);
    if (error) { set({ error: error.message }); return; }
    set((state) => ({ protocols: state.protocols.filter((p) => p.id !== id) }));
  },
}));
