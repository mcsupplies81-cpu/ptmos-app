import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
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
      <Text style={styles.header}>Find Providers</Text>
      <TextInput value={search} onChangeText={setSearch} placeholder="Search providers" placeholderTextColor={Colors.textSecondary} style={styles.search} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>{tabs.map((tab) => <Pressable key={tab} style={[styles.tab, activeTab === tab && styles.activeTab]} onPress={() => setActiveTab(tab)}><Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text></Pressable>)}</ScrollView>
      {loading ? <ActivityIndicator color={Colors.accent} /> : <FlatList data={filtered} keyExtractor={(item) => item.id} ListEmptyComponent={<Text style={styles.empty}>No providers found</Text>} renderItem={({ item }) => <Pressable style={styles.card} onPress={() => router.push(`/providers/${item.id}`)}><View style={styles.cardRow}><View style={styles.avatar}><Text style={styles.avatarText}>{item.name.charAt(0)}</Text></View><View style={styles.middle}><Text style={styles.title}>{item.name}</Text><Text style={styles.subtitle}>{`${item.type} · ${item.location ?? 'Nationwide'}`}</Text><View style={styles.metaRow}>{item.rating !== null ? <Text style={styles.rating}>{`★ ${item.rating}`}</Text> : null}{item.is_online ? <View style={styles.onlineBadge}><Text style={styles.onlineText}>Online</Text></View> : null}</View></View><Text style={styles.chevron}>›</Text></View></Pressable>} />}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: Colors.background }, header: { fontSize: 28, fontWeight: '800', color: Colors.text, padding: 16, paddingBottom: 8 }, search: { marginHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.border, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: Colors.card, color: Colors.text }, tabs: { paddingHorizontal: 16, gap: 8, marginBottom: 12 }, tab: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border }, activeTab: { backgroundColor: Colors.accentLight, borderColor: Colors.accent }, tabText: { color: Colors.textSecondary, fontWeight: '600' }, activeTabText: { color: Colors.accent }, card: { backgroundColor: Colors.card, borderRadius: 14, padding: 14, marginBottom: 10, marginHorizontal: 16, borderWidth: 1, borderColor: Colors.border }, cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 }, avatar: { width: 52, height: 52, borderRadius: 14, backgroundColor: Colors.accentLight, alignItems: 'center', justifyContent: 'center' }, avatarText: { fontSize: 20, fontWeight: '700', color: Colors.accent }, middle: { flex: 1 }, title: { fontSize: 15, fontWeight: '600', color: Colors.text }, subtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 }, metaRow: { flexDirection: 'row', marginTop: 5, gap: 8, alignItems: 'center' }, rating: { color: Colors.warning, fontWeight: '600', fontSize: 13 }, onlineBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, backgroundColor: Colors.accentLight }, onlineText: { fontSize: 11, fontWeight: '600', color: Colors.accent }, chevron: { fontSize: 20, color: Colors.textSecondary }, empty: { color: Colors.textSecondary, textAlign: 'center', marginTop: 24 } })
