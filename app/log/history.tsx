import { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import Colors from '@/constants/Colors';
import ScreenHeader from '@/components/ScreenHeader';
import { useDoseLogStore } from '@/stores/doseLogStore';
import { useAuthStore } from '@/stores/authStore';

export default function DoseHistoryScreen() {
  const user = useAuthStore((s) => s.user);
  const doseLogs = useDoseLogStore((s) => s.doseLogs);
  const fetchDoseLogs = useDoseLogStore((s) => s.fetchDoseLogs);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user?.id) fetchDoseLogs(user.id);
  }, [fetchDoseLogs, user?.id]);

  const filteredLogs = useMemo(
    () =>
      [...doseLogs]
        .sort((a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime())
        .filter((log) => {
          if (!search.trim()) return true;
          const q = search.toLowerCase();
          return (log.peptide_name ?? '').toLowerCase().includes(q);
        }),
    [doseLogs, search],
  );

  const groupedLogs = useMemo(() => {
    const groups: { date: string; logs: typeof filteredLogs }[] = [];
    for (const log of filteredLogs) {
      const date = log.logged_at.slice(0, 10);
      const existing = groups.find((g) => g.date === date);
      if (existing) existing.logs.push(log);
      else groups.push({ date, logs: [log] });
    }
    return groups;
  }, [filteredLogs]);

  const formatDateHeader = (dateText: string) => {
    const target = new Date(`${dateText}T00:00:00`);
    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayDate = new Date(todayDate);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);

    if (target.getTime() === todayDate.getTime()) return 'Today';
    if (target.getTime() === yesterdayDate.getTime()) return 'Yesterday';

    return target.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Dose History" />

      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by peptide..."
          placeholderTextColor={Colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statChip}>
          <Text style={styles.statText}>{doseLogs.length} total doses</Text>
        </View>
        <View style={styles.statChip}>
          <Text style={styles.statText}>{new Set(doseLogs.map((l) => l.peptide_name)).size} compounds</Text>
        </View>
      </View>

      <FlatList
        data={groupedLogs}
        keyExtractor={(item) => item.date}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View>
            <View style={styles.dateHeaderWrap}>
              <Text style={styles.dateHeader}>{formatDateHeader(item.date)}</Text>
            </View>
            {item.logs.map((log, index) => {
              const isFirst = index === 0;
              const isLast = index === item.logs.length - 1;

              return (
                <Pressable
                  key={log.id}
                  style={[
                    styles.logRow,
                    isFirst && styles.logRowFirst,
                    isLast && styles.logRowLast,
                  ]}
                >
                  <View style={styles.iconCircle}>
                    <Text style={styles.iconText}>💉</Text>
                  </View>

                  <View style={styles.logMain}>
                    <Text style={styles.logTitle}>{log.peptide_name ?? 'Dose'}</Text>
                    <Text style={styles.logMeta}>
                      {log.amount} {log.unit}
                      {log.injection_site ? ` · ${log.injection_site}` : ''}
                    </Text>
                  </View>

                  <Text style={styles.logTime}>
                    {new Date(log.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>💉</Text>
            <Text style={styles.emptyText}>No doses logged yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  searchWrap: { margin: 16, marginBottom: 8 },
  searchInput: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text,
  },
  statsRow: { paddingHorizontal: 16, marginBottom: 12, flexDirection: 'row', gap: 10 },
  statChip: {
    flex: 1,
    backgroundColor: Colors.accentLight,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  statText: { fontSize: 13, fontWeight: '700', color: Colors.accent },
  listContent: { paddingBottom: 40 },
  dateHeaderWrap: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 6 },
  dateHeader: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.5 },
  logRow: {
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginBottom: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logRowFirst: { borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  logRowLast: { borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: { fontSize: 16 },
  logMain: { flex: 1 },
  logTitle: { fontSize: 15, fontWeight: '600', color: Colors.text },
  logMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  logTime: { fontSize: 12, color: Colors.textSecondary },
  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 30, marginBottom: 8 },
  emptyText: { color: Colors.textSecondary, fontSize: 14 },
});
