import { create } from 'zustand';

export type ProtocolStatus = 'active' | 'paused' | 'completed' | 'archived';
export type Frequency = 'Daily' | 'Weekly' | 'Specific Days';

export interface Protocol {
  id: string;
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
  setProtocols: (protocols: Protocol[]) => void;
  upsertProtocol: (protocol: Protocol) => void;
}

export const useProtocolStore = create<ProtocolState>((set) => ({
  protocols: [],
  loading: false,
  error: null,
  setProtocols: (protocols) => set({ protocols }),
  upsertProtocol: (protocol) =>
    set((state) => {
      const idx = state.protocols.findIndex((p) => p.id === protocol.id);
      if (idx === -1) return { protocols: [protocol, ...state.protocols] };
      const next = [...state.protocols];
      next[idx] = protocol;
      return { protocols: next };
    }),
}));
