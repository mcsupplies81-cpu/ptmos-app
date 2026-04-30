import { useMemo } from 'react'
import { Pressable, SafeAreaView, StyleSheet, Text } from 'react-native'
import { useLocalSearchParams } from 'expo-router'

import { Copy } from '@/constants/Copy'
import Colors from '@/constants/Colors'
import { useAuthStore } from '@/stores/authStore'
import { useResearchStore } from '@/stores/researchStore'

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

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.badge}>{item.category}</Text>
      <Text style={styles.text}>Research status: {item.research_status}</Text>
      <Text style={styles.text}>Studied for: {item.studied_for.join(', ')}</Text>
      <Text style={styles.text}>{item.summary}</Text>
      <Pressable style={styles.button} onPress={toggleSaved}><Text style={styles.buttonText}>{isSaved ? 'Unsave' : 'Save'}</Text></Pressable>
      <Text style={styles.disclaimer}>{Copy.researchDisclaimer}</Text>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: Colors.background, padding: 16 }, title: { color: Colors.text, fontSize: 24, fontWeight: '700' }, badge: { marginVertical: 10, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: Colors.accent, color: Colors.background }, text: { color: Colors.text, marginBottom: 10 }, button: { marginTop: 8, backgroundColor: Colors.accent, borderRadius: 10, padding: 12, alignItems: 'center' }, buttonText: { color: Colors.background, fontWeight: '600' }, disclaimer: { color: Colors.textMuted, marginTop: 16, fontSize: 12 } })
