import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';
import { useProtocolStore } from '@/stores/protocolStore';
import { useAuthStore } from '@/stores/authStore';
import EmptyState from '@/components/EmptyState';

type Filter = 'All' | 'Active' | 'Paused' | 'Completed';

export default function ProtocolsScreen() {
  const user = useAuthStore((state) => state.user);
  const { protocols, loading, error, fetchProtocols } = useProtocolStore();
  const [filter, setFilter] = useState<Filter>('All');

  useEffect(() => {
    if (user?.id) fetchProtocols(user.id);
  }, [fetchProtocols, user?.id]);

  const filteredProtocols = useMemo(() => {
    return filter === 'All' ? protocols : protocols.filter((p) => p.status === filter.toLowerCase());
  }, [protocols, filter]);

  const handleRetry = () => {
    if (user?.id) {
      fetchProtocols(user.id);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.centerStateText}>Loading protocols...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerState}>
          <Text style={styles.errorTitle}>Unable to load protocols</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}
      >
        {(['All', 'Active', 'Paused', 'Completed'] as const).map((label) => {
          const selected = filter === label;

          return (
            <Pressable
              key={label}
              onPress={() => setFilter(label)}
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
          <EmptyState
            emoji="💊"
            title="No protocols found"
            subtitle={filter === 'Active' ? 'No active protocols. Create one to get started.' : 'No protocols match this filter yet.'}
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
  centerState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  centerStateText: { marginTop: 12, color: Colors.textSecondary, fontSize: 14 },
  errorTitle: { color: Colors.text, fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  errorMessage: { color: Colors.textSecondary, fontSize: 14, marginBottom: 16, textAlign: 'center' },
  retryButton: { backgroundColor: Colors.accent, borderRadius: 999, paddingHorizontal: 18, paddingVertical: 10 },
  retryButtonText: { color: Colors.white, fontSize: 14, fontWeight: '700' },
  chipsContainer: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  chip: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  chipSelected: { backgroundColor: Colors.accent, borderWidth: 1, borderColor: Colors.accent },
  chipUnselected: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  chipText: { fontWeight: '600', fontSize: 12 },
  chipTextSelected: { color: Colors.white },
  chipTextUnselected: { color: Colors.textSecondary },
  listContent: { padding: 16, gap: 10, paddingBottom: 120 },
  card: { backgroundColor: Colors.card, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: Colors.border },
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
