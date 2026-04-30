import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface InventoryItem {
  id: string;
  user_id: string;
  peptide_name: string;
  vial_amount: number;
  unit: string;
  reconstitution_amount_ml: number | null;
  concentration: number | null;
  date_received: string;
  expiration_date: string;
  date_reconstituted: string | null;
  storage_notes: string | null;
  protocol_id: string | null;
  remaining_amount: number | null;
}

type AddInventoryItem = Omit<InventoryItem, 'id' | 'user_id'>;
type UpdateInventoryItem = Partial<Omit<InventoryItem, 'id' | 'user_id'>>;

interface InventoryStore {
  items: InventoryItem[];
  loading: boolean;
  fetchInventory: (userId: string) => Promise<void>;
  addItem: (item: AddInventoryItem, userId: string) => Promise<void>;
  updateItem: (id: string, updates: UpdateInventoryItem, userId: string) => Promise<void>;
  deleteItem: (id: string, userId: string) => Promise<void>;
}

export const useInventoryStore = create<InventoryStore>((set, get) => ({
  items: [],
  loading: false,
  fetchInventory: async (userId) => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('user_id', userId)
      .order('expiration_date', { ascending: true });
    set({ loading: false });
    if (error) throw error;
    set({ items: (data ?? []) as InventoryItem[] });
  },
  addItem: async (item, userId) => {
    const { data, error } = await supabase
      .from('inventory')
      .insert({ ...item, user_id: userId })
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) throw error;
    set({ items: [data as InventoryItem, ...get().items] });
  },
  updateItem: async (id, updates, userId) => {
    const { data, error } = await supabase
      .from('inventory')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .single();
    if (error) throw error;
    set({ items: get().items.map((item) => (item.id === id ? (data as InventoryItem) : item)) });
  },
  deleteItem: async (id, userId) => {
    const { error } = await supabase.from('inventory').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
    set({ items: get().items.filter((item) => item.id !== id) });
  },
}));
