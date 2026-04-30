import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native'
import { router } from 'expo-router'

import { Copy } from '@/constants/Copy'
import Colors from '@/constants/Colors'
import { useAuthStore } from '@/stores/authStore'
import { ResearchItem, useResearchStore } from '@/stores/researchStore'

const tabs: Array<'All' | ResearchItem['category']> = ['All', 'Healing', 'Performance', 'Longevity', 'Other']

export default function ResearchScreen() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('All')
  const [search, setSearch] = useState('')
  const { user } = useAuthStore()
  const { items, loading, fetchItems, fetchSaved } = useResearchStore()

  useEffect(() => {
    fetchItems()
    if (user?.id) {
      fetchSaved(user.id)
    }
  }, [fetchItems, fetchSaved, user?.id])

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const tabMatch = activeTab === 'All' || item.category === activeTab
      const searchMatch = item.name.toLowerCase().includes(search.toLowerCase())
      return tabMatch && searchMatch
    })
  }, [activeTab, items, search])

  return (
    <SafeAreaView style={styles.container}>
      <TextInput value={search} onChangeText={setSearch} placeholder="Search research" style={styles.search} />
      <View style={styles.tabs}>{tabs.map((tab) => <Pressable key={tab} style={[styles.tab, activeTab === tab && styles.activeTab]} onPress={() => setActiveTab(tab)}><Text style={styles.tabText}>{tab}</Text></Pressable>)}</View>
      {loading ? <ActivityIndicator color={Colors.accent} /> : <FlatList data={filteredItems} keyExtractor={(item) => item.id} ListEmptyComponent={<Text style={styles.empty}>No items found</Text>} renderItem={({ item }) => <Pressable style={styles.card} onPress={() => router.push(`/research/${item.id}`)}><Text style={styles.title}>{item.name}</Text><Text style={styles.badge}>{item.category}</Text><Text style={styles.summary} numberOfLines={2}>{item.summary}</Text></Pressable>} />}
      <Text style={styles.disclaimer}>{Copy.researchDisclaimer}</Text>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: Colors.background, padding: 16 }, search: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, padding: 10, color: Colors.text, marginBottom: 12 }, tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }, tab: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: Colors.card }, activeTab: { backgroundColor: Colors.accent }, tabText: { color: Colors.text }, card: { backgroundColor: Colors.card, borderRadius: 12, padding: 12, marginBottom: 10 }, title: { color: Colors.text, fontWeight: '600', marginBottom: 6 }, badge: { alignSelf: 'flex-start', backgroundColor: Colors.accent, color: Colors.background, borderRadius: 999, overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 3, marginBottom: 8 }, summary: { color: Colors.textMuted }, empty: { color: Colors.textMuted, textAlign: 'center', marginTop: 24 }, disclaimer: { color: Colors.textMuted, marginTop: 8, fontSize: 12 } })
