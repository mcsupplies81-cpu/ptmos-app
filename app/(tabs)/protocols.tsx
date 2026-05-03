import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, FlatList, Pressable, StyleSheet, Text, View, ScrollView } from 'react-native';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';
import useProtocolStore from '@/stores/protocolStore';
import { useAuthStore } from '@/stores/authStore';
import ScreenHeader from '@/components/ScreenHeader';

type Filter = 'all' | 'active' | 'completed';

export default function ProtocolsScreen() {
  const user = useAuthStore((state) => state.user);
  const protocols = useProtocolStore((state) => state.protocols);
  const fetchProtocols = useProtocolStore((state) => state.fetchProtocols);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    if (user?.id) fetchProtocols(user.id);
  }, [fetchProtocols, user?.id]);

  const filteredProtocols = useMemo(() => {
    if (filter === 'all') return protocols;
    return protocols.filter((p) => p.status === filter);
  }, [protocols, filter]);

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Protocols" hideBack={true} rightLabel="+ New" onRightPress={() => router.push('/protocol/create')} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}
      >
        {(['All', 'Active', 'Completed'] as const).map((label) => {
          const value = label.toLowerCase() as Filter;
          const selected = filter === value;

          return (
            <Pressable
              key={label}
              onPress={() => setFilter(value)}
              style={[styles.chip, selected ? styles.chipSelected : styles.chipUnselected]}
            >
              <Text style={[styles.chipText, selected ? styles.chipTextSelected : styles.chipTextUnselected]}>{label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <FlatList
        data={filteredProtocols}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>💊</Text>
            <Text style={styles.emptyTitle}>No protocols yet</Text>
            <Text style={styles.emptySubtitle}>Tap + New to create your first protocol</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: '/log/protocol-detail', params: { protocolId: item.id } })}
            style={styles.card}
          >
            <View style={styles.rowTop}>
              <View style={styles.cardMain}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>{item.dose_amount} {item.dose_unit} · {item.frequency}</Text>
                <Text style={styles.time}>⏰ {item.time_of_day}</Text>
              </View>

              <View style={[styles.badge, item.status === 'active' ? styles.badgeActive : item.status === 'completed' ? styles.badgeCompleted : styles.badgePaused]}>
                <Text style={[styles.badgeText, item.status === 'active' ? styles.badgeTextActive : item.status === 'completed' ? styles.badgeTextCompleted : styles.badgeTextPaused]}>
                  {item.status === 'active' ? 'Active' : item.status === 'completed' ? 'Done' : 'Paused'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.rowBottom}>
              <Text style={styles.detailHint}>Tap to view details</Text>
              <Text style={styles.chevron}>›</Text>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  chipsContainer: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  chip: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 },
  chipSelected: { backgroundColor: Colors.accent },
  chipUnselected: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  chipText: { fontWeight: '700' },
  chipTextSelected: { color: Colors.white },
  chipTextUnselected: { color: Colors.textSecondary },
  listContent: { padding: 16, gap: 10, paddingBottom: 40 },
  emptyWrap: { marginTop: 60, alignItems: 'center' },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: { marginTop: 12, fontSize: 18, fontWeight: '700', color: Colors.text },
  emptySubtitle: { marginTop: 6, fontSize: 14, color: Colors.textSecondary },
  card: { backgroundColor: Colors.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: Colors.border },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardMain: { flex: 1, paddingRight: 8 },
  name: { fontSize: 16, fontWeight: '700', color: Colors.text },
  meta: { marginTop: 3, fontSize: 13, color: Colors.textSecondary },
  time: { marginTop: 2, fontSize: 12, color: Colors.textSecondary },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontWeight: '700', fontSize: 12 },
  badgeActive: { backgroundColor: Colors.accentLight },
  badgeTextActive: { color: Colors.accent },
  badgeCompleted: { backgroundColor: '#F3F4F6' },
  badgeTextCompleted: { color: '#6B7280' },
  badgePaused: { backgroundColor: '#FEF3C7' },
  badgeTextPaused: { color: '#D97706' },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 12 },
  rowBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailHint: { fontSize: 12, color: Colors.textSecondary },
  chevron: { fontSize: 18, color: Colors.textSecondary },
});
