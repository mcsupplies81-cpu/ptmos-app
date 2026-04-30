import { create } from 'zustand'

import { supabase } from '@/lib/supabase'

export interface ResearchItem {
  id: string
  name: string
  category: 'Healing' | 'Performance' | 'Longevity' | 'Other'
  summary: string
  research_status: 'Early' | 'Moderate' | 'Strong' | 'Mixed'
  studied_for: string[]
}

export interface SavedResearch {
  id: string
  user_id: string
  research_item_id: string
  notes: string | null
}

interface ResearchState {
  items: ResearchItem[]
  savedIds: string[]
  loading: boolean
  error: string | null
  fetchItems: () => Promise<void>
  fetchSaved: (userId: string) => Promise<void>
  saveItem: (researchItemId: string, userId: string) => Promise<void>
  unsaveItem: (researchItemId: string, userId: string) => Promise<void>
}

export const useResearchStore = create<ResearchState>((set, get) => ({
  items: [],
  savedIds: [],
  loading: false,
  error: null,
  fetchItems: async () => {
    set({ loading: true, error: null })
    const { data, error } = await supabase.from('research_items').select('*')

    if (error) {
      set({ loading: false, error: error.message })
      return
    }

    set({ items: (data ?? []) as ResearchItem[], loading: false })
  },
  fetchSaved: async (userId) => {
    set({ loading: true, error: null })
    const { data, error } = await supabase
      .from('saved_research')
      .select('research_item_id')
      .eq('user_id', userId)

    if (error) {
      set({ loading: false, error: error.message })
      return
    }

    const savedIds = (data ?? []).map((item: { research_item_id: string }) => item.research_item_id)
    set({ savedIds, loading: false })
  },
  saveItem: async (researchItemId, userId) => {
    set({ error: null })
    const { error } = await supabase.from('saved_research').upsert({
      user_id: userId,
      research_item_id: researchItemId,
    })

    if (error) {
      set({ error: error.message })
      return
    }

    const current = get().savedIds
    if (!current.includes(researchItemId)) {
      set({ savedIds: [...current, researchItemId] })
    }
  },
  unsaveItem: async (researchItemId, userId) => {
    set({ error: null })
    const { error } = await supabase
      .from('saved_research')
      .delete()
      .eq('user_id', userId)
      .eq('research_item_id', researchItemId)

    if (error) {
      set({ error: error.message })
      return
    }

    set({ savedIds: get().savedIds.filter((id) => id !== researchItemId) })
  },
}))
