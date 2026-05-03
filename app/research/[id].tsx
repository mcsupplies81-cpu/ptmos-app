import { useMemo } from 'react'
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'

import Colors from '@/constants/Colors'
import ScreenHeader from '@/components/ScreenHeader'
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

const getItemFindings = (item: ResearchItem) => {
  const possibleFindings = (item as ResearchItem & { key_findings?: string[] }).key_findings
  return Array.isArray(possibleFindings) ? possibleFindings : []
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
  const tags = getItemTags(item)
  const findings = getItemFindings(item)

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ScreenHeader title="Research Detail" rightLabel={isSaved ? '★ Saved' : '☆ Save'} onRightPress={toggleSaved} />

        <View style={styles.heroSection}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>{item.category}</Text>
          </View>
          <Text style={styles.heroTitle}>{item.name}</Text>
          {tags.length > 0 ? (
            <View style={styles.tagsRow}>
              {tags.map((tag) => (
                <View key={tag} style={styles.heroTagChip}>
                  <Text style={styles.heroTagText}>{tag}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.bodyText}>{item.summary}</Text>
        </View>

        {findings.length > 0 ? (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>Key Findings</Text>
            {findings.map((finding) => (
              <Text key={finding} style={styles.bodyText}>• {finding}</Text>
            ))}
          </View>
        ) : null}

        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>Research Areas</Text>
          <View style={styles.areasWrap}>
            {item.studied_for.map((area) => (
              <View key={area} style={styles.areaChip}>
                <Text style={styles.areaChipText}>{area}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerText}>⚠️ Educational only. Not medical advice.</Text>
        </View>

        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Back to Research</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: 40 },
  text: { color: Colors.text, margin: 20 },
  heroSection: {
    backgroundColor: Colors.accent,
    padding: 20,
    gap: 10,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.white,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  heroBadgeText: { color: Colors.accent, fontSize: 12, fontWeight: '700' },
  heroTitle: { color: Colors.white, fontSize: 22, fontWeight: '800' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  heroTagChip: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  heroTagText: { color: Colors.white, fontSize: 12, fontWeight: '600' },
  contentSection: { paddingHorizontal: 20, paddingTop: 18 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.text, marginBottom: 10 },
  bodyText: { fontSize: 15, color: Colors.text, lineHeight: 22, marginBottom: 8 },
  areasWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  areaChip: {
    backgroundColor: Colors.accentLight,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  areaChipText: { color: Colors.accent, fontSize: 12, fontWeight: '600' },
  disclaimerBox: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: '#F0F9F4',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  disclaimerText: { fontSize: 13, color: '#166534', fontWeight: '600' },
  backButton: {
    marginHorizontal: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  backButtonText: { color: Colors.accent, fontSize: 14, fontWeight: '700' },
})
