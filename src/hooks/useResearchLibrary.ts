import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { ResearchItem, ResearchCategory } from '../types/models';

export async function fetchResearchItems(search = '', category: ResearchCategory | 'All' = 'All') {
  const { data } = await supabase.from('research_items').select();
  const items = (data as ResearchItem[]) ?? [];
  return items.filter((item) => {
    const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || item.category === category;
    return matchesSearch && matchesCategory;
  });
}

export async function setSavedResearch(research_item_id: string, saved: boolean) {
  const userId = useAuthStore.getState().user?.id;
  if (!userId) return;

  if (saved) {
    await supabase.from('saved_research').upsert({ user_id: userId, research_item_id });
    return;
  }

  await supabase.from('saved_research').delete().eq('user_id', userId).eq('research_item_id', research_item_id);
}
