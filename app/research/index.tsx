import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import { Copy } from '@/constants/Copy';
import Colors from '@/constants/Colors';
import { useAuthStore } from '@/stores/authStore';
import { ResearchItem, useResearchStore } from '@/stores/researchStore';
import ScreenHeader from '@/components/ScreenHeader';

const TABS: Array<'All' | ResearchItem['category']> = ['All', 'Healing', 'Performance', 'Longevity', 'Other'];

export default function ResearchIndexScreen() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('All');
  const [search, setSearch] = useState('');
  const { user } = useAuthStore();
  const { items, loading, fetchItems, fetchSaved } = useResearchStore();

  useEffect(() => {
    fetchItems();
    if (user?.id) fetchSaved(user.id);
  }, [fetchItems, fetchSaved, user?.id]);

  const filtered = useMemo(
    () =>
      items.filter(
        (item) =>
          (activeTab === 'All' || item.category === activeTab) &&
          item.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [activeTab, items, search],
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Research Library" />
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search peptides..."
        placeholderTextColor={Colors.textSecondary}
        style={styles.search}
      />
      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <Pressable key={tab} onPress={() => setActiveTab(tab)} style={[styles.tab, activeTab === tab && styles.activeTab]}>
            <Text style={[styles.tabText, activeTab === tab && { color: Colors.white }]}>{tab}</Text>
          </Pressable>
        ))}
      </View>
      {loading ? (
        <ActivityIndicator color={Colors.accent} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={<Text style={styles.empty}>No items found.</Text>}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => router.push(`/research/${item.id}` as any)}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.category}</Text>
                  </View>
                </View>
                <Text style={{ color: Colors.textSecondary, fontSize: 20 }}>›</Text>
              </View>
            </Pressable>
          )}
          ListFooterComponent={<Text style={styles.disclaimer}>{Copy.researchDisclaimer}</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  search: { margin: 16, marginBottom: 0, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, padding: 10, color: Colors.text, backgroundColor: Colors.card },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 16, paddingBottom: 8 },
  tab: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  activeTab: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  tabText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  card: { backgroundColor: Colors.card, borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: Colors.border },
  avatar: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.accentLight, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: Colors.accent, fontWeight: '700', fontSize: 16 },
  cardTitle: { color: Colors.text, fontWeight: '600', fontSize: 15, marginBottom: 4 },
  badge: { alignSelf: 'flex-start', backgroundColor: Colors.accentLight, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { color: Colors.accent, fontSize: 11, fontWeight: '600' },
  empty: { color: Colors.textSecondary, textAlign: 'center', marginTop: 40 },
  disclaimer: { color: Colors.textSecondary, marginTop: 8, fontSize: 11, textAlign: 'center', paddingHorizontal: 8 },
});
