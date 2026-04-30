import { create } from 'zustand'

import { supabase } from '@/lib/supabase'

export interface Provider {
  id: string
  name: string
  type: 'Telehealth' | 'Clinics' | 'Wellness'
  description: string
  services: string[]
  is_featured: boolean
  is_online: boolean
  location: string | null
  rating: number | null
  outbound_url: string
}

interface ProviderState {
  providers: Provider[]
  loading: boolean
  error: string | null
  fetchProviders: () => Promise<void>
  logReferralClick: (outboundUrl: string, sourceScreen: string, userId: string) => Promise<void>
}

export const useProviderStore = create<ProviderState>((set) => ({
  providers: [],
  loading: false,
  error: null,
  fetchProviders: async () => {
    set({ loading: true, error: null })
    const { data, error } = await supabase.from('providers').select('*').order('is_featured', { ascending: false })

    if (error) {
      set({ loading: false, error: error.message })
      return
    }

    set({ providers: (data ?? []) as Provider[], loading: false })
  },
  logReferralClick: async (outboundUrl, sourceScreen, userId) => {
    const { error } = await supabase.from('referral_clicks').insert({
      user_id: userId,
      outbound_url: outboundUrl,
      source_screen: sourceScreen,
      utm_params: 'utm_source=ptmos&utm_medium=app&utm_campaign=provider_directory',
    })

    if (error) {
      set({ error: error.message })
    }
  },
}))
