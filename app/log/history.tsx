import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

import EmptyState from '@/components/EmptyState';
import Skeleton from '@/components/Skeleton';
import ScreenHeader from '@/components/ScreenHeader';
import Colors from '@/constants/Colors';
import { useAuthStore } from '@/stores/authStore';
import { useDoseLogStore } from '@/stores/doseLogStore';
import { supabase } from '@/lib/supabase';
import { ProGate } from '@/components/ProGate';

export default function DoseHistoryScreen() {
  const user = useAuthStore((s) => s.user);
  const doseLogs = useDoseLogStore((s) => s.doseLogs);
  const loading = useDoseLogStore((s) => s.loading);
  const fetchDoseLogs = useDoseLogStore((s) => s.fetchDoseLogs);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const handleDelete = async (id: string) => {
    await supabase.from('dose_logs').delete().eq('id', id);
    if (user?.id) await fetchDoseLogs(user.id);
  };

  const onPressRow = (id: string) => {
    Alert.alert('Dose Log', 'What would you like to do?', [
      { text: 'Delete', style: 'destructive', onPress: () => void handleDelete(id) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };
  const [selectedFilter, setSelectedFilter] = useState('All');

  useEffect(() => {
    if (user?.id) {
      fetchDoseLogs(user.id);
    }
  }, [fetchDoseLogs, user?.id]);

  const handleRefresh = useCallback(async () => {
    if (!user?.id) return;

    setRefreshing(true);
    try {
      await fetchDoseLogs(user.id);
    } finally {
      setRefreshing(false);
    }
  }, [fetchDoseLogs, user?.id]);

  const filterOptions = useMemo(() => {
    const names = Array.from(
      new Set(
        doseLogs
          .map((log) => log.peptide_name)
          .filter((name): name is string => Boolean(name && name.trim())),
      ),
    );

    return ['All', ...names];
  }, [doseLogs]);

  const filteredLogs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return [...doseLogs]
      .filter((log) => (selectedFilter === 'All' ? true : log.peptide_name === selectedFilter))
      .filter((log) => {
        if (!query) return true;
        return (log.peptide_name ?? '').toLowerCase().includes(query);
      })
      .sort((a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime());
  }, [doseLogs, searchQuery, selectedFilter]);

  return (
    <ProGate feature="Dose History">
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Dose History" />

      <TextInput
        style={styles.searchInput}
        placeholder="Search compounds..."
        placeholderTextColor={Colors.textSecondary}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View style={styles.chipsContainer}>
        {filterOptions.map((name) => {
          const selected = selectedFilter === name;

          return (
            <Pressable
              key={name}
              onPress={() => setSelectedFilter(name)}
              style={[styles.chip, selected ? styles.chipSelected : styles.chipUnselected]}
            >
              <Text style={[styles.chipText, selected ? styles.chipTextSelected : styles.chipTextUnselected]}>
                {name}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.listContent}>
          {Array.from({ length: 5 }).map((_, index) => (
            <DoseLogRowSkeleton key={index} />
          ))}
        </View>
      ) : (
      <FlatList
        data={filteredLogs}
        keyExtractor={(item) => item.id}
        style={{ flex: 1 }}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.accent} />}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => onPressRow(item.id)}>
            <View style={styles.rowTop}>
              <Text style={styles.peptideName}>{item.peptide_name ?? 'Unknown compound'}</Text>
              <Text style={styles.amount}>{item.amount} {item.unit}</Text>
            </View>

            {item.mood ? (
              <View style={styles.moodChip}>
                <Text style={styles.moodText}>{item.mood}</Text>
              </View>
            ) : null}

            <View style={styles.rowBottom}>
              <Text style={styles.metaText}>{item.injection_site ?? (item.protocol_id ? 'Protocol dose' : 'Manual dose')}</Text>
              <Text style={styles.metaText}>
                {new Date(item.logged_at).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <EmptyState
            emoji="💉"
            title="No doses logged"
            subtitle="Start logging doses to see your history here."
          />
        }
      />
      )}
    </SafeAreaView>
    </ProGate>
  );
}

function DoseLogRowSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.rowTop}>
        <Skeleton width="54%" height={18} borderRadius={8} />
        <Skeleton width={64} height={18} borderRadius={8} />
      </View>
      <View style={styles.rowBottom}>
        <Skeleton width="38%" height={14} borderRadius={7} />
        <Skeleton width="44%" height={14} borderRadius={7} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  searchInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    marginHorizontal: 16,
    marginBottom: 12,
    color: Colors.text,
  },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8, marginBottom: 8, flexShrink: 0 },
  chip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  chipSelected: { backgroundColor: Colors.accent, borderWidth: 1, borderColor: Colors.accent },
  chipUnselected: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  chipText: { fontSize: 12, fontWeight: '600' },
  chipTextSelected: { color: Colors.white },
  chipTextUnselected: { color: Colors.textSecondary },
  listContent: { padding: 16, gap: 8, paddingBottom: 100 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
  },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  peptideName: { fontSize: 15, fontWeight: '700', color: Colors.text, flex: 1, marginRight: 8 },
  amount: { fontSize: 15, fontWeight: '700', color: Colors.accent },
  moodChip: {
    backgroundColor: Colors.accentLight,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  moodText: { fontSize: 12, color: Colors.accent, fontWeight: '600' },
  rowBottom: { marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaText: { fontSize: 12, color: Colors.textSecondary },
});
