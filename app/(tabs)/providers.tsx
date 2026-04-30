import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native'
import { router } from 'expo-router'

import Colors from '@/constants/Colors'
import { Provider, useProviderStore } from '@/stores/providerStore'

const tabs: Array<'All' | Provider['type']> = ['All', 'Telehealth', 'Clinics', 'Wellness']

export default function ProvidersScreen() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('All')
  const [search, setSearch] = useState('')
  const { providers, loading, fetchProviders } = useProviderStore()

  useEffect(() => { fetchProviders() }, [fetchProviders])

  const filtered = useMemo(() => providers.filter((provider) => (activeTab === 'All' || provider.type === activeTab) && provider.name.toLowerCase().includes(search.toLowerCase())), [activeTab, providers, search])

  return (
    <SafeAreaView style={styles.container}>
      <TextInput value={search} onChangeText={setSearch} placeholder="Search providers" style={styles.search} />
      <View style={styles.tabs}>{tabs.map((tab) => <Pressable key={tab} style={[styles.tab, activeTab === tab && styles.activeTab]} onPress={() => setActiveTab(tab)}><Text style={styles.tabText}>{tab}</Text></Pressable>)}</View>
      {loading ? <ActivityIndicator color={Colors.accent} /> : <FlatList data={filtered} keyExtractor={(item) => item.id} ListEmptyComponent={<Text style={styles.empty}>No providers found</Text>} renderItem={({ item }) => <Pressable style={styles.card} onPress={() => router.push(`/providers/${item.id}`)}><Text style={styles.title}>{item.name}</Text><Text style={styles.badge}>{item.type}</Text><Text style={styles.meta}>{item.is_online ? 'Online available' : 'In-person only'}</Text>{item.rating !== null ? <Text style={styles.meta}>Rating: {item.rating}</Text> : null}</Pressable>} />}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: Colors.background, padding: 16 }, search: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, padding: 10, color: Colors.text, marginBottom: 12 }, tabs: { flexDirection: 'row', gap: 8, marginBottom: 12 }, tab: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: Colors.card }, activeTab: { backgroundColor: Colors.accent }, tabText: { color: Colors.text }, card: { backgroundColor: Colors.card, borderRadius: 12, padding: 12, marginBottom: 10 }, title: { color: Colors.text, fontWeight: '600', marginBottom: 6 }, badge: { alignSelf: 'flex-start', backgroundColor: Colors.accent, color: Colors.background, borderRadius: 999, overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 3, marginBottom: 8 }, meta: { color: Colors.textMuted }, empty: { color: Colors.textMuted, textAlign: 'center', marginTop: 24 } })
