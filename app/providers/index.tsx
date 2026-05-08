import { useMemo, useState } from 'react';
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import Colors from '@/constants/Colors';
import { providers } from '@/constants/providers';
import type { DirectoryProvider, ProviderType } from '@/constants/providers';
import { ProGate } from '@/components/ProGate';

const FILTERS: Array<'All' | ProviderType> = ['All', 'Clinic', 'Med Spa', 'Online', 'Pharmacy'];

const typeColors: Record<ProviderType, { backgroundColor: string; color: string }> = {
  Clinic: { backgroundColor: '#DBEAFE', color: '#1D4ED8' },
  'Med Spa': { backgroundColor: '#FCE7F3', color: '#BE185D' },
  Online: { backgroundColor: Colors.accentLight, color: Colors.accent },
  Pharmacy: { backgroundColor: '#FEF3C7', color: '#B45309' },
};

const formatLocation = (provider: DirectoryProvider) => provider.location ?? 'Ships Nationwide';

export default function ProviderDirectoryScreen() {
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]>('All');
  const [search, setSearch] = useState('');

  const filteredProviders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return providers.filter((provider) => {
      const matchesFilter = activeFilter === 'All' || provider.type === activeFilter;
      const searchableLocation = formatLocation(provider).toLowerCase();
      const matchesSearch =
        query.length === 0 ||
        provider.name.toLowerCase().includes(query) ||
        searchableLocation.includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, search]);

  const renderProvider = ({ item }: { item: DirectoryProvider }) => {
    const badge = typeColors[item.type];

    return (
      <Pressable style={styles.card} onPress={() => router.push(`/providers/${item.id}` as never)}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleWrap}>
            <Text style={styles.providerName}>{item.name}</Text>
            {item.verified ? (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ Verified</Text>
              </View>
            ) : null}
          </View>
          <View style={[styles.typeBadge, { backgroundColor: badge.backgroundColor }]}>
            <Text style={[styles.typeBadgeText, { color: badge.color }]}>{item.type.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.location}>{formatLocation(item)}</Text>
        <Text style={styles.rating}>⭐ {item.rating.toFixed(1)} ({item.reviewCount} reviews)</Text>
        <Text style={styles.detailsLink}>View Details →</Text>
      </Pressable>
    );
  };

  return (
    <ProGate feature="Provider Directory">
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Provider Directory</Text>
            <View style={styles.memberBadge}>
              <Text style={styles.memberBadgeText}>PRO</Text>
            </View>
          </View>

          <View style={styles.searchWrap}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search name or location"
              placeholderTextColor={Colors.textSecondary}
              style={styles.searchInput}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.filters}>
            {FILTERS.map((filter) => {
              const selected = activeFilter === filter;
              return (
                <Pressable
                  key={filter}
                  onPress={() => setActiveFilter(filter)}
                  style={[styles.filterChip, selected && styles.filterChipActive]}
                >
                  <Text style={[styles.filterText, selected && styles.filterTextActive]}>{filter}</Text>
                </Pressable>
              );
            })}
          </View>

          <FlatList
            data={filteredProviders}
            keyExtractor={(item) => item.id}
            renderItem={renderProvider}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<Text style={styles.empty}>No providers match your search.</Text>}
          />
        </View>
      </SafeAreaView>
    </ProGate>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 18 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18 },
  title: { flex: 1, color: Colors.text, fontSize: 28, fontWeight: '800' },
  memberBadge: { backgroundColor: Colors.accentLight, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  memberBadgeText: { color: Colors.accent, fontSize: 10, fontWeight: '800', letterSpacing: 0.7 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  searchIcon: { color: Colors.textSecondary, fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, color: Colors.text, fontSize: 15, paddingVertical: 12 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  filterChip: { borderColor: Colors.border, borderWidth: 1, borderRadius: 999, paddingHorizontal: 13, paddingVertical: 8, backgroundColor: Colors.card },
  filterChipActive: { borderColor: Colors.accent, backgroundColor: Colors.accent },
  filterText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '700' },
  filterTextActive: { color: Colors.white },
  listContent: { paddingBottom: 36 },
  card: { backgroundColor: Colors.card, borderColor: Colors.border, borderWidth: 1, borderRadius: 18, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  cardTitleWrap: { flex: 1, gap: 8 },
  providerName: { color: Colors.text, fontWeight: '700', fontSize: 16 },
  typeBadge: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 },
  typeBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
  verifiedBadge: { alignSelf: 'flex-start', backgroundColor: Colors.card, borderColor: Colors.accentLight, borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  verifiedText: { color: Colors.success, fontSize: 11, fontWeight: '800' },
  location: { color: Colors.textSecondary, fontSize: 14, marginTop: 12 },
  rating: { color: Colors.text, fontSize: 14, fontWeight: '600', marginTop: 8 },
  detailsLink: { color: Colors.accent, fontSize: 14, fontWeight: '800', marginTop: 12 },
  empty: { color: Colors.textSecondary, textAlign: 'center', marginTop: 40 },
});
