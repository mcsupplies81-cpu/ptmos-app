import { useMemo } from 'react'
import { Pressable, SafeAreaView, StyleSheet, Text } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { openBrowserAsync } from 'expo-web-browser'

import Colors from '@/constants/Colors'
import { useAuthStore } from '@/stores/authStore'
import { useProviderStore } from '@/stores/providerStore'

export default function ProviderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { user } = useAuthStore()
  const { providers, logReferralClick } = useProviderStore()

  const provider = useMemo(() => providers.find((entry) => entry.id === id), [id, providers])

  if (!provider) return <SafeAreaView style={styles.container}><Text style={styles.text}>Provider not found</Text></SafeAreaView>

  const onVisit = async () => {
    if (!user?.id) return
    await logReferralClick(provider.outbound_url, 'provider_detail', user.id)
    await openBrowserAsync(`${provider.outbound_url}?utm_source=ptmos&utm_medium=app&utm_campaign=provider_directory`)
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{provider.name}</Text>
      <Text style={styles.badge}>{provider.type}</Text>
      <Text style={styles.text}>{provider.description}</Text>
      <Text style={styles.text}>Services: {provider.services.join(', ')}</Text>
      <Text style={styles.text}>Online: {provider.is_online ? 'Yes' : 'No'}</Text>
      <Text style={styles.text}>Location: {provider.location ?? 'N/A'}</Text>
      <Text style={styles.text}>Rating: {provider.rating ?? 'N/A'}</Text>
      <Pressable style={styles.button} onPress={onVisit}><Text style={styles.buttonText}>Visit Website</Text></Pressable>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: Colors.background, padding: 16 }, title: { color: Colors.text, fontSize: 24, fontWeight: '700' }, badge: { marginVertical: 10, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: Colors.accent, color: Colors.background }, text: { color: Colors.text, marginBottom: 10 }, button: { marginTop: 8, backgroundColor: Colors.accent, borderRadius: 10, padding: 12, alignItems: 'center' }, buttonText: { color: Colors.background, fontWeight: '600' } })
