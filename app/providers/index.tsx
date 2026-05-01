import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import Colors from '@/constants/Colors';
import { Provider, useProviderStore } from '@/stores/providerStore';
import ScreenHeader from '@/components/ScreenHeader';

const TABS: Array<'All' | Provider['type']> = ['All', 'Telehealth', 'Clinics', 'Wellness'];

export default function ProvidersIndexScreen() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('All');
  const [search, setSearch] = useState('');
  const { providers, loading, fetchProviders } = useProviderStore();

  useEffect(() => { fetchProviders(); }, [fetchProviders]);

  const filtered = useMemo(
    () =>
      providers.filter(
        (p) =>
          (activeTab === 'All' || p.type === activeTab) &&
          p.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [activeTab, providers, search],
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Find Providers" />
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search providers..."
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
          ListEmptyComponent={<Text style={styles.empty}>No providers found.</Text>}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => router.push(`/providers/${item.id}` as any)}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardSub}>{item.type} · {item.location ?? 'Nationwide'}</Text>
                  {item.rating !== null && (
                    <Text style={styles.rating}>★ {item.rating}</Text>
                  )}
                </View>
                <Text style={{ color: Colors.textSecondary, fontSize: 20 }}>›</Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  search: { margin: 16, marginBottom: 0, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, padding: 10, color: Colors.text, backgroundColor: Colors.card },
  tabs: { flexDirection: 'row', gap: 8, padding: 16, paddingBottom: 8 },
  tab: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  activeTab: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  tabText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  card: { backgroundColor: Colors.card, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: Colors.border },
  avatar: { width: 48, height: 48, borderRadius: 14, backgroundColor: Colors.accentLight, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: Colors.accent, fontWeight: '700', fontSize: 18 },
  cardTitle: { color: Colors.text, fontWeight: '600', fontSize: 15 },
  cardSub: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  rating: { color: Colors.warning, fontSize: 13, fontWeight: '600', marginTop: 3 },
  empty: { color: Colors.textSecondary, textAlign: 'center', marginTop: 40 },
});
