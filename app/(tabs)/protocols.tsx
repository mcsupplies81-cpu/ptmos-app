
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';
import { calcAdherence, useProtocolStore, type ProtocolStatus } from '@/stores/protocolStore';
import { useDoseLogStore } from '@/stores/doseLogStore';
import { useAuthStore } from '@/stores/authStore';
import EmptyState from '@/components/EmptyState';
import Skeleton from '@/components/Skeleton';
import { ProGate } from '@/components/ProGate';

type Filter = 'All' | 'Active' | 'Paused' | 'Completed';

const getStatusStyles = (status: ProtocolStatus) => {
  if (status === 'active') {
    return {
      accent: Colors.accent,
      badgeBackground: Colors.accentLight,
      badgeText: Colors.accent,
      label: 'ACTIVE',
    };
  }

  if (status === 'paused') {
    return {
      accent: Colors.warning,
      badgeBackground: '#FEF3C7',
      badgeText: Colors.warning,
      label: 'PAUSED',
    };
  }

  return {
    accent: Colors.border,
    badgeBackground: '#F3F4F6',
    badgeText: Colors.textSecondary,
    label: status === 'completed' ? 'COMPLETED' : status.toUpperCase(),
  };
};

const getAdherenceColor = (adherence: number) => {
  if (adherence >= 80) return Colors.accent;
  if (adherence >= 50) return Colors.warning;
  return Colors.error;
};

export default function ProtocolsScreen() {
  const user = useAuthStore((state) => state.user);
  const { protocols, loading, error, fetchProtocols } = useProtocolStore();
  const doseLogs = useDoseLogStore((state) => state.doseLogs);
  const [filter, setFilter] = useState<Filter>('All');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id) fetchProtocols(user.id);
  }, [fetchProtocols, user?.id]);

  const filteredProtocols = useMemo(() => {
    return filter === 'All' ? protocols : protocols.filter((p) => p.status === filter.toLowerCase());
  }, [protocols, filter]);

  const activeProtocolCount = useMemo(() => protocols.filter((p) => p.status === 'active').length, [protocols]);

  const handleRetry = () => {
    if (user?.id) {
      fetchProtocols(user.id);
    }
  };


  const handleRefresh = useCallback(async () => {
    if (!user?.id) return;

    setRefreshing(true);
    try {
      await fetchProtocols(user.id);
    } finally {
      setRefreshing(false);
    }
  }, [fetchProtocols, user?.id]);

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
    <ProGate feature="Protocols">
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Protocols</Text>
          <Text style={styles.headerSubtitle}>
            {activeProtocolCount} active protocol{activeProtocolCount === 1 ? '' : 's'}
          </Text>
        </View>

        <Pressable style={styles.addButton} onPress={() => router.push('/protocol/create')}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </Pressable>
      </View>

      <View style={styles.chipsContainer}>
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
      </View>

      {loading ? (
        <View style={styles.listContent}>
          {Array.from({ length: 3 }).map((_, index) => (
            <ProtocolRowSkeleton key={index} />
          ))}
        </View>
      ) : (
      <FlatList
        data={filteredProtocols}
        keyExtractor={(item) => item.id}
        style={{ flex: 1 }}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.accent} />}
        ListEmptyComponent={
          <EmptyState
            emoji="💊"
            title="No protocols found"
            subtitle={filter === 'Active' ? 'No active protocols. Create one to get started.' : 'No protocols match this filter yet.'}
            actionLabel="Create Protocol"
            onAction={() => router.push('/protocol/create')}
          />
        }
        renderItem={({ item }) => {
          const adherence = Math.max(0, Math.min(100, calcAdherence(item, doseLogs)));
          const statusStyles = getStatusStyles(item.status);

          return (
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
              <View style={[styles.accentBar, { backgroundColor: statusStyles.accent }]} />

              <View style={styles.cardContent}>
                <View style={styles.cardMain}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.meta}>{item.dose_amount} {item.dose_unit} · {item.frequency}</Text>
                  <Text style={styles.time}>Next dose {item.time_of_day}</Text>
                </View>

                <View style={styles.cardRight}>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyles.badgeBackground }]}>
                    <Text style={[styles.statusBadgeText, { color: statusStyles.badgeText }]}>{statusStyles.label}</Text>
                  </View>

                  <View style={[styles.adherenceBadge, { backgroundColor: getAdherenceColor(adherence) }]}>
                    <Text style={styles.adherenceText}>{adherence}%</Text>
                  </View>
                </View>
              </View>
            </Pressable>
          );
        }}
      />
      )}

      <Pressable style={styles.fab} onPress={() => router.push('/protocol/create')}><Text style={styles.fabText}>+</Text></Pressable>
    </SafeAreaView>
    </ProGate>
  );
}

function ProtocolRowSkeleton() {
  return (
    <View style={styles.card}>
      <View style={[styles.accentBar, styles.skeletonAccentBar]} />
      <View style={styles.cardContent}>
        <View style={styles.cardMainSkeleton}>
          <Skeleton width="58%" height={18} borderRadius={8} />
          <Skeleton width="72%" height={14} borderRadius={7} />
          <Skeleton width="44%" height={12} borderRadius={6} />
        </View>
        <View style={styles.cardRight}>
          <Skeleton width={72} height={22} borderRadius={999} />
          <Skeleton width={48} height={48} borderRadius={24} />
        </View>
      </View>
    </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
  },
  headerTitle: { color: Colors.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.4 },
  headerSubtitle: { marginTop: 4, color: Colors.textSecondary, fontSize: 13 },
  addButton: {
    backgroundColor: Colors.accent,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 9,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 3,
  },
  addButtonText: { color: Colors.white, fontSize: 13, fontWeight: '800' },
  chipsContainer: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 12, alignItems: 'center', flexShrink: 0 },
  chip: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  chipSelected: { backgroundColor: Colors.accent, borderWidth: 1, borderColor: Colors.accent },
  chipUnselected: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  chipText: { fontWeight: '600', fontSize: 12 },
  chipTextSelected: { color: Colors.white },
  chipTextUnselected: { color: Colors.textSecondary },
  listContent: { padding: 16, paddingTop: 4, gap: 12, paddingBottom: 120 },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  accentBar: { width: 4, height: '100%', borderRadius: 2, alignSelf: 'stretch' },
  skeletonAccentBar: { backgroundColor: Colors.border },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  cardMain: { flex: 1, paddingRight: 12 },
  cardMainSkeleton: { flex: 1, paddingRight: 12, gap: 8 },
  name: { fontSize: 16, fontWeight: '700', color: Colors.text },
  meta: { marginTop: 5, fontSize: 13, color: Colors.textSecondary },
  time: { marginTop: 5, fontSize: 12, color: Colors.textSecondary },
  cardRight: { alignItems: 'flex-end', justifyContent: 'space-between', minHeight: 76 },
  statusBadge: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4 },
  statusBadgeText: { fontWeight: '800', fontSize: 10, letterSpacing: 0.6 },
  adherenceBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 2,
  },
  adherenceText: { color: Colors.white, fontSize: 13, fontWeight: '800' },
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
