import { useMemo } from 'react'
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'

import Copy from '@/constants/Copy'
import Colors from '@/constants/Colors'
import { ScreenHeader } from '@/components/ScreenHeader'
import { useAuthStore } from '@/stores/authStore'
import { useResearchStore } from '@/stores/researchStore'

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Healing: { bg: '#D1FAE5', text: '#065F46' },
  Performance: { bg: '#DBEAFE', text: '#1E40AF' },
  Longevity: { bg: '#EDE9FE', text: '#5B21B6' },
  Other: { bg: '#F3F4F6', text: '#374151' },
}

export default function ResearchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { user } = useAuthStore()
  const { items, savedIds, saveItem, unsaveItem } = useResearchStore()

  const item = useMemo(() => items.find((entry) => entry.id === id), [id, items])
  const isSaved = !!id && savedIds.includes(id)

  if (!item) return <SafeAreaView style={styles.container}><Text style={styles.text}>Research item not found</Text></SafeAreaView>

  const toggleSaved = async () => {
    if (!user?.id) return
    if (isSaved) await unsaveItem(item.id, user.id)
    else await saveItem(item.id, user.id)
  }

  const categoryColor = CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.Other

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ScreenHeader title={item.name} rightLabel={isSaved ? '★ Saved' : '☆ Save'} onRightPress={toggleSaved} />

        <View style={styles.headerArea}>
          <Text style={styles.title}>{item.name}</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.categoryBadge, { backgroundColor: categoryColor.bg }]}>
              <Text style={[styles.categoryBadgeText, { color: categoryColor.text }]}>{item.category}</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{item.research_status}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.overview}>{item.summary}</Text>
        </View>

        <View style={styles.areasSection}>
          <Text style={styles.sectionTitle}>Research Areas</Text>
          {item.studied_for.map((area) => (
            <View key={area} style={styles.areaRow}>
              <View style={styles.dot} />
              <Text style={styles.areaText}>{area}</Text>
            </View>
          ))}
        </View>

        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerTitle}>⚠️  Disclaimer</Text>
          <Text style={styles.disclaimerText}>{Copy.researchDisclaimer}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: 40 },
  headerArea: { padding: 20, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.text, marginBottom: 12 },
  text: { color: Colors.text, marginBottom: 10 },
  badgeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  categoryBadgeText: { fontSize: 12, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: '#F3F4F6' },
  statusText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 20 },
  section: { padding: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.text, marginBottom: 10 },
  overview: { fontSize: 15, color: Colors.text, lineHeight: 22 },
  areasSection: { paddingHorizontal: 20, paddingBottom: 20 },
  areaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.accent },
  areaText: { fontSize: 14, color: Colors.text },
  disclaimerBox: {
    margin: 20,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  disclaimerTitle: { fontWeight: '700', color: '#92400E', fontSize: 13, marginBottom: 6 },
  disclaimerText: { fontSize: 12, color: '#92400E', lineHeight: 18 },
})
