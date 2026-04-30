import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { Provider } from '../types/models';

const UTM = 'utm_source=ptmos&utm_medium=app&utm_campaign=provider_directory';

export async function fetchProviders(search = '', type: Provider['type'] | 'All' = 'All') {
  const { data } = await supabase.from('providers').select();
  const providers = (data as Provider[]) ?? [];
  return providers
    .filter((provider) => {
      const matchesSearch = !search || provider.name.toLowerCase().includes(search.toLowerCase());
      const matchesType = type === 'All' || provider.type === type;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
}

export async function visitProviderWebsite(outbound_url: string, source_screen: string) {
  const userId = useAuthStore.getState().user?.id;
  const separator = outbound_url.includes('?') ? '&' : '?';
  const urlWithUtm = `${outbound_url}${separator}${UTM}`;

  await supabase.from('referral_clicks').insert({
    user_id: userId,
    outbound_url,
    source_screen,
    utm_params: UTM,
  });

  // Replace with WebBrowser.openBrowserAsync(urlWithUtm)
  return urlWithUtm;
}
