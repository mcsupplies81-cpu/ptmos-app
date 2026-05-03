import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface InventoryItem {
  id: string;
  user_id: string;
  peptide_name: string;
  concentration_mg_per_ml: number;
  volume_remaining_ml: number;
  expiry_date: string;
  notes: string | null;
}

type InsertInventoryItem = Omit<InventoryItem, 'id' | 'user_id'>;

interface InventoryStore {
  items: InventoryItem[];
  loading: boolean;
  error: string | null;
  fetchInventory: (userId: string) => Promise<void>;
  addVial: (vial: InsertInventoryItem, userId: string) => Promise<void>;
  updateVialVolume: (id: string, newVolume: number, userId: string) => Promise<void>;
  deleteVial: (id: string, userId: string) => Promise<void>;
}

export const useInventoryStore = create<InventoryStore>((set, get) => ({
  items: [],
  loading: false,
  error: null,
  fetchInventory: async (userId) => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('user_id', userId)
      .order('expiry_date', { ascending: true });
    if (error) {
      set({ error: error.message, loading: false });
      return;
    }
    set({ items: (data as InventoryItem[]) ?? [], loading: false });
  },
  addVial: async (vial, userId) => {
    const { data, error } = await supabase
      .from('inventory')
      .insert({ ...vial, user_id: userId })
      .select('*')
      .single();
    if (error) {
      set({ error: error.message });
      return;
    }
    set({ items: [data as InventoryItem, ...get().items] });
  },
  updateVialVolume: async (id, newVolume, userId) => {
    const { error } = await supabase
      .from('inventory_items')
      .update({ volume_remaining_ml: newVolume })
      .eq('id', id)
      .eq('user_id', userId);
    if (error) {
      set({ error: error.message });
      return;
    }
    await get().fetchInventory(userId);
  },
  deleteVial: async (id, userId) => {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) {
      set({ error: error.message });
      return;
    }
    await get().fetchInventory(userId);
  }
}));
