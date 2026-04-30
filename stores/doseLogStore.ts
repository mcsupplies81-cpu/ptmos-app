import { create } from 'zustand';

export interface DoseLog {
  id: string;
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
  setDoseLogs: (doseLogs: DoseLog[]) => void;
  addDoseLog: (doseLog: DoseLog) => void;
}

export const useDoseLogStore = create<DoseLogState>((set) => ({
  doseLogs: [],
  loading: false,
  error: null,
  setDoseLogs: (doseLogs) => set({ doseLogs }),
  addDoseLog: (doseLog) => set((state) => ({ doseLogs: [doseLog, ...state.doseLogs] })),
}));
