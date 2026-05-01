import { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { router } from 'expo-router'

import { Copy } from '@/constants/Copy'
import Colors from '@/constants/Colors'
import { useAuthStore } from '@/stores/authStore'
import { ResearchItem, useResearchStore } from '@/stores/researchStore'

const tabs: Array<'All' | ResearchItem['category']> = ['All', 'Healing', 'Performance', 'Longevity', 'Other']

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Healing: { bg: '#D1FAE5', text: '#065F46' },
  Performance: { bg: '#DBEAFE', text: '#1E40AF' },
  Longevity: { bg: '#EDE9FE', text: '#5B21B6' },
  Other: { bg: '#F3F4F6', text: '#374151' },
}

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
      <Text style={styles.header}>Research Library</Text>
      <TextInput value={search} onChangeText={setSearch} placeholder="Search research" style={styles.search} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContent}>
        {tabs.map((tab) => (
          <Pressable key={tab} style={[styles.tab, activeTab === tab && styles.activeTab]} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, activeTab === tab ? styles.activeTabText : styles.inactiveTabText]}>{tab}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color={Colors.accent} />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.empty}>No items found</Text>}
          ListFooterComponent={<Text style={styles.disclaimer}>{Copy.researchDisclaimer}</Text>}
          renderItem={({ item }) => {
            const categoryColor = CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.Other
            return (
              <Pressable style={styles.card} onPress={() => router.push(`/research/${item.id}`)}>
                <View style={styles.cardRow}>
                  <View style={[styles.avatar, { backgroundColor: categoryColor.bg }]}>
                    <Text style={[styles.avatarText, { color: categoryColor.text }]}>{item.name.charAt(0)}</Text>
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={styles.title}>{item.name}</Text>
                    <View style={styles.metaRow}>
                      <View style={[styles.categoryBadge, { backgroundColor: categoryColor.bg }]}>
                        <Text style={[styles.categoryBadgeText, { color: categoryColor.text }]}>{item.category}</Text>
                      </View>
                    </View>
                    <Text style={styles.summary} numberOfLines={2}>{item.summary}</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </View>
              </Pressable>
            )
          }}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { fontSize: 28, fontWeight: '800', color: Colors.text, padding: 16, paddingBottom: 8 },
  search: {
    margin: 16,
    marginTop: 0,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 10,
    color: Colors.text,
    backgroundColor: Colors.card,
  },
  tabsContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  tab: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  activeTab: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  tabText: { fontSize: 13 },
  activeTabText: { color: Colors.white, fontWeight: '700' },
  inactiveTabText: { color: Colors.textSecondary, fontWeight: '600' },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '700' },
  cardBody: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600', color: Colors.text },
  metaRow: { flexDirection: 'row', gap: 6, marginTop: 5, flexWrap: 'wrap' },
  categoryBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  categoryBadgeText: { fontSize: 11, fontWeight: '600' },
  summary: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  chevron: { fontSize: 20, color: Colors.textSecondary },
  empty: { color: Colors.textSecondary, textAlign: 'center', marginTop: 24 },
  disclaimer: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 16, paddingBottom: 24 },
})
