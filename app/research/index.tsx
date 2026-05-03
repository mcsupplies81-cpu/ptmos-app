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

import ScreenHeader from '@/components/ScreenHeader'
import { Copy } from '@/constants/Copy'
import Colors from '@/constants/Colors'
import { useAuthStore } from '@/stores/authStore'
import { ResearchItem, useResearchStore } from '@/stores/researchStore'

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Healing: { bg: '#D1FAE5', text: '#065F46' },
  Performance: { bg: '#DBEAFE', text: '#1E40AF' },
  Longevity: { bg: '#EDE9FE', text: '#5B21B6' },
  Other: { bg: '#F3F4F6', text: '#374151' },
}

const getItemTags = (item: ResearchItem) => {
  const possibleTags = (item as ResearchItem & { tags?: string[] }).tags
  return Array.isArray(possibleTags) ? possibleTags : []
}

export default function ResearchIndexScreen() {
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [search, setSearch] = useState('')
  const { user } = useAuthStore()
  const { items, loading, fetchItems, fetchSaved } = useResearchStore()

  useEffect(() => {
    fetchItems()
    if (user?.id) {
      fetchSaved(user.id)
    }
  }, [fetchItems, fetchSaved, user?.id])

  const categories = useMemo(() => {
    return ['All', ...new Set(items.map((item) => item.category))]
  }, [items])

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return items.filter((item) => {
      const categoryMatch = activeCategory === 'All' || item.category === activeCategory
      const tags = getItemTags(item)
      const tagMatch = tags.some((tag) => tag.toLowerCase().includes(normalizedSearch))
      const titleMatch = item.name.toLowerCase().includes(normalizedSearch)
      const searchMatch = normalizedSearch.length === 0 || titleMatch || tagMatch
      return categoryMatch && searchMatch
    })
  }, [activeCategory, items, search])

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Research Library" />

      <View style={styles.searchContainer}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by title or tags"
          placeholderTextColor={Colors.textSecondary}
          style={styles.searchInput}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContent}>
        {categories.map((category) => (
          <Pressable
            key={category}
            style={[styles.tab, activeCategory === category && styles.activeTab]}
            onPress={() => setActiveCategory(category)}>
            <Text style={[styles.tabText, activeCategory === category ? styles.activeTabText : styles.inactiveTabText]}>
              {category}
            </Text>
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
            const abstractText = item.summary?.trim() ?? ''
            const shortText = abstractText.length > 80 ? `${abstractText.slice(0, 80)}…` : abstractText

            return (
              <Pressable style={styles.card} onPress={() => router.push(`/research/${item.id}`)}>
                <View style={[styles.categoryBadge, { backgroundColor: categoryColor.bg }]}>
                  <Text style={[styles.categoryBadgeText, { color: categoryColor.text }]}>{item.category}</Text>
                </View>
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.summary}>{shortText}</Text>
                <Text style={styles.readMore}>Read more →</Text>
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
  searchContainer: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 6,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  searchInput: {
    color: Colors.text,
    fontSize: 14,
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
  categoryBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, marginBottom: 10 },
  categoryBadgeText: { fontSize: 11, fontWeight: '700' },
  title: { fontSize: 16, fontWeight: '700', color: Colors.text },
  summary: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  readMore: { color: Colors.accent, fontSize: 13, fontWeight: '600', marginTop: 8 },
  empty: { color: Colors.textSecondary, textAlign: 'center', marginTop: 24 },
  disclaimer: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 16, paddingBottom: 24 },
})
