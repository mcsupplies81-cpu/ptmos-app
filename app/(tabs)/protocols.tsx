import React, { useEffect, useMemo, useState } from 'react';
import { Alert, SafeAreaView, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';
import { useProtocolStore } from '@/stores/protocolStore';
import { useAuthStore } from '@/stores/authStore';
import EmptyState from '@/components/EmptyState';
import LoadingScreen from '@/components/LoadingScreen';

type Filter = 'all' | 'active' | 'completed';

export default function ProtocolsScreen() {
  const user = useAuthStore((state) => state.user);
  const { protocols, fetchProtocols } = useProtocolStore();
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    if (user?.id) fetchProtocols(user.id);
  }, [fetchProtocols, user?.id]);

  const filteredProtocols = useMemo(() => {
    if (filter === 'all') return protocols;
    return protocols.filter((p) => p.status === filter);
  }, [protocols, filter]);

  if (protocols.length === 0 && filter === 'all') {
    return <LoadingScreen message="Loading protocols..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.chipsContainer}>
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
      </View>

      <FlatList
        data={filteredProtocols}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            emoji="💊"
            title="No protocols found"
            subtitle={filter === 'active' ? 'No active protocols. Create one to get started.' : 'No completed protocols yet.'}
            actionLabel="Create Protocol"
            onAction={() => router.push('/protocol/create')}
          />
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: '/log/protocol-detail', params: { protocolId: item.id } })}
            onLongPress={() =>
              Alert.alert('Protocol Options', item.name, [
                { text: 'Edit', onPress: () => router.push({ pathname: '/protocol/edit', params: { protocolId: item.id } }) },
                { text: 'View Details', onPress: () => router.push({ pathname: '/log/protocol-detail', params: { protocolId: item.id } }) },
                { text: 'Cancel', style: 'cancel' },
              ])
            }
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

      <Pressable style={styles.fab} onPress={() => router.push('/protocol/create')}><Text style={styles.fabText}>+</Text></Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  chipsContainer: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  chip: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  chipSelected: { backgroundColor: Colors.accent },
  chipUnselected: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  chipText: { fontWeight: '700', fontSize: 12 },
  chipTextSelected: { color: Colors.white },
  chipTextUnselected: { color: Colors.textSecondary },
  listContent: { padding: 16, gap: 10, paddingBottom: 120 },
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
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 32, fontWeight: '300' },
});
