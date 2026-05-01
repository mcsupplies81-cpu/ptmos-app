import { useMemo } from 'react'
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { openBrowserAsync } from 'expo-web-browser'

import ScreenHeader from '@/components/ScreenHeader'
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
      <ScreenHeader title={provider.name} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerArea}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{provider.name.charAt(0)}</Text></View>
          <Text style={styles.title}>{provider.name}</Text>
          <View style={styles.row}>
            <View style={styles.typeBadge}><Text style={styles.typeText}>{provider.type}</Text></View>
            {provider.rating !== null ? <Text style={styles.rating}>{`★ ${provider.rating}`}</Text> : null}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{provider.description}</Text>
        </View>

        {provider.services.length > 0 ? (
          <View style={styles.servicesSection}>
            <Text style={styles.sectionTitle}>Services</Text>
            {provider.services.map((s) => <View key={s} style={styles.serviceRow}><Text style={styles.check}>✓</Text><Text style={styles.serviceText}>{s}</Text></View>)}
          </View>
        ) : null}

        {provider.location ? <View style={styles.locationWrap}><Text style={styles.location}>{`📍 ${provider.location}`}</Text></View> : null}

        <View style={styles.ctaWrap}>
          <Pressable style={styles.button} onPress={onVisit}><Text style={styles.buttonText}>Visit Website  ›</Text></Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: Colors.background }, content: { paddingBottom: 40 }, headerArea: { padding: 20 }, avatar: { width: 80, height: 80, backgroundColor: Colors.accentLight, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }, avatarText: { fontSize: 36, fontWeight: '800', color: Colors.accent }, title: { fontSize: 24, fontWeight: '800', color: Colors.text }, row: { marginTop: 6, gap: 8, alignItems: 'center', flexDirection: 'row' }, typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: Colors.accentLight }, typeText: { fontSize: 13, fontWeight: '600', color: Colors.accent }, rating: { color: Colors.warning, fontWeight: '600' }, divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 20 }, section: { padding: 20 }, sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.text, marginBottom: 10 }, description: { fontSize: 15, color: Colors.text, lineHeight: 22 }, servicesSection: { paddingHorizontal: 20, paddingBottom: 8 }, serviceRow: { alignItems: 'center', gap: 10, marginBottom: 8, flexDirection: 'row' }, check: { color: Colors.accent, fontWeight: '700' }, serviceText: { fontSize: 14, color: Colors.text }, locationWrap: { paddingHorizontal: 20, paddingBottom: 16 }, location: { fontSize: 14, color: Colors.textSecondary }, ctaWrap: { padding: 20 }, button: { backgroundColor: Colors.accent, borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center' }, buttonText: { color: Colors.white, fontSize: 16, fontWeight: '700' }, text: { color: Colors.text } })
