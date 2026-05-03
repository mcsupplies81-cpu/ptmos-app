import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    | 'unknown';
  payload: Record<string, string | number | null>;
  confidence: 'high' | 'medium' | 'low';
  displaySummary: string;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'confirmation' | 'success' | 'error';
  text: string;
  parsedIntent?: ParsedIntent;
  status?: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
};

type ChatStore = {
  messages: ChatMessage[];
  addMessage: (msg: Omit<ChatMessage, 'id' | 'createdAt'>) => void;
  updateMessageStatus: (id: string, status: 'confirmed' | 'cancelled') => void;
  clearMessages: () => void;
};

const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      messages: [],

      addMessage: (msg) => {
        const newMsg: ChatMessage = {
          ...msg,
          id: Math.random().toString(36).slice(2),
          createdAt: new Date().toISOString(),
        };
        const current = get().messages;
        const trimmed = current.length >= 100 ? current.slice(-99) : current;
        set({ messages: [...trimmed, newMsg] });
      },

      updateMessageStatus: (id, status) =>
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === id ? { ...m, status } : m,
          ),
        })),

      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: 'ptmos-chat-history',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ messages: state.messages }),
    },
  ),
);

export default useChatStore;
export type { ChatMessage, ParsedIntent };
