import { create } from 'zustand';

export type ParsedIntent = {
  intent:
    | 'log_dose'
    | 'log_symptom'
    | 'log_weight'
    | 'log_sleep'
    | 'log_lifestyle'
    | 'update_inventory'
    | 'ask_adherence'
    | 'ask_last_dose'
    | 'ask_next_dose'
    | 'ask_inventory'
    | 'reconstitute'
    | 'unknown';
  payload: Record<string, string | number | null>;
  confidence: 'high' | 'medium' | 'low';
  displaySummary: string;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'confirmation' | 'success' | 'error' | 'reconstitution';
  text: string;
  parsedIntent?: ParsedIntent;
  status?: 'pending' | 'confirmed' | 'cancelled';
  reconstitutionResult?: {
    vialMg: number;
    waterMl: number;
    concentrationMgPerMl: number;
    concentrationMcgPerMl: number;
    doseTable: Array<{ mcg: number; ml: string }>;
    peptide: string | null;
  };
  createdAt: string;
};

type ChatStore = {
  messages: ChatMessage[];
  addMessage: (msg: Omit<ChatMessage, 'id' | 'createdAt'>) => void;
  updateMessageStatus: (id: string, status: 'confirmed' | 'cancelled') => void;
  clearMessages: () => void;
};

const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  addMessage: (msg) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...msg,
          id: Math.random().toString(36).slice(2),
          createdAt: new Date().toISOString(),
        },
      ],
    })),
  updateMessageStatus: (id, status) =>
    set((state) => ({
      messages: state.messages.map((message) =>
        message.id === id ? { ...message, status } : message,
      ),
    })),
  clearMessages: () => set({ messages: [] }),
}));

export default useChatStore;
