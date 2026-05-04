import { router } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import Colors from '@/constants/Colors';
import { useAuthStore } from '@/stores/authStore';
import { useDoseLogStore } from '@/stores/doseLogStore';
import { useLifestyleStore } from '@/stores/lifestyleStore';
import { useProfileStore } from '@/stores/profileStore';
import { useProtocolStore } from '@/stores/protocolStore';

const parseTime = (timeOfDay: string) => {
  const [h, m] = timeOfDay.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return { h, m };
};

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile);
  const fetchProfile = useProfileStore((s) => s.fetchProfile);

  const protocols = useProtocolStore((s) => s.protocols);
  const fetchProtocols = useProtocolStore((s) => s.fetchProtocols);

  const doseLogs = useDoseLogStore((s) => s.doseLogs);
  const fetchDoseLogs = useDoseLogStore((s) => s.fetchDoseLogs);

  const { logs: lifestyleLogs, fetchLogs } = useLifestyleStore();

  useEffect(() => {
    if (!user?.id) return;
    void fetchProfile(user.id);
    void fetchProtocols(user.id);
    void fetchDoseLogs(user.id);
    void fetchLogs(user.id);
  }, [fetchDoseLogs, fetchLogs, fetchProfile, fetchProtocols, user?.id]);

  const now = new Date();
  const todayKey = now.toISOString().slice(0, 10);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const firstName = useMemo(() => profile?.full_name?.trim().split(' ')[0] ?? '', [profile?.full_name]);
  const todayDate = useMemo(
    () =>
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }),
    [],
  );

  const activeProtocols = useMemo(() => protocols.filter((p) => p.status === 'active'), [protocols]);
  const todayLogs = useMemo(() => doseLogs.filter((d) => d.logged_at.slice(0, 10) === todayKey), [doseLogs, todayKey]);

  const loggedTodayByProtocol = useMemo(
    () =>
      new Set(
        todayLogs
          .map((d) => d.protocol_id)
          .filter((id): id is string => Boolean(id)),
      ),
    [todayLogs],
  );

  const loggedTodayByName = useMemo(
    () => new Set(todayLogs.map((d) => (d.peptide_name ?? '').toLowerCase())),
    [todayLogs],
  );

  const nextDose = useMemo(() => {
    const candidates = activeProtocols
      .map((p) => {
        const parsed = parseTime(p.time_of_day);
        if (!parsed) return null;
        const scheduled = new Date();
        scheduled.setHours(parsed.h, parsed.m, 0, 0);
        if (scheduled.getTime() < Date.now()) {
          scheduled.setDate(scheduled.getDate() + 1);
        }
        const deltaMin = Math.floor((scheduled.getTime() - Date.now()) / 60000);
        return { protocol: p, scheduled, deltaMin };
      })
      .filter((c): c is { protocol: (typeof activeProtocols)[number]; scheduled: Date; deltaMin: number } => Boolean(c))
      .sort((a, b) => a.deltaMin - b.deltaMin);

    return candidates[0] ?? null;
  }, [activeProtocols]);

  const countdown = useMemo(() => {
    if (!nextDose) return '—';
    if (nextDose.deltaMin <= 0) return 'Due now';
    const h = Math.floor(nextDose.deltaMin / 60);
    const m = nextDose.deltaMin % 60;
    if (h <= 0) return `in ${m}m`;
    return `in ${h}h ${m}m`;
  }, [nextDose]);

  const todayLifestyle = useMemo(() => lifestyleLogs.find((l) => l.date === todayKey), [lifestyleLogs, todayKey]);

  const adherencePct = useMemo(() => {
    const last7 = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().slice(0, 10);
    });
    const loggedDays = new Set(doseLogs.map((d) => d.logged_at.slice(0, 10)));
    const hits = last7.filter((d) => loggedDays.has(d)).length;
    return Math.round((hits / 7) * 100);
  }, [doseLogs]);

  const streakDays = useMemo(() => {
    const loggedDays = new Set(doseLogs.map((d) => d.logged_at.slice(0, 10)));
    let streak = 0;
    const cursor = new Date();
    cursor.setDate(cursor.getDate() - 1);
    while (loggedDays.has(cursor.toISOString().slice(0, 10))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }, [doseLogs]);

  const recentActivity = useMemo(() => doseLogs.slice(0, 5), [doseLogs]);

  const relativeTime = (iso: string) => {
    const delta = Date.now() - new Date(iso).getTime();
    const hours = Math.floor(delta / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <Text style={styles.greeting}>{firstName ? `${greeting}, ${firstName}` : greeting}</Text>
          <Text style={styles.date}>{todayDate}</Text>
        </View>

        <Pressable style={styles.card} onPress={() => router.push('/(tabs)/chat')}>
          <Text style={styles.askTitle}>💬 Ask PT-OS anything...</Text>
          <Text style={styles.askSub}>Log dose · weight · water · symptom</Text>
        </Pressable>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          <Pressable style={styles.chip} onPress={() => router.push('/log/dose')}><Text style={styles.chipText}>Log Dose</Text></Pressable>
          <Pressable style={styles.chip} onPress={() => router.push('/log/lifestyle')}><Text style={styles.chipText}>Log Weight</Text></Pressable>
          <Pressable style={styles.chip} onPress={() => router.push('/log/lifestyle')}><Text style={styles.chipText}>Log Water</Text></Pressable>
          <Pressable style={styles.chip} onPress={() => router.push('/(tabs)/chat?prompt=Add%20Protocol')}><Text style={styles.chipText}>Add Protocol</Text></Pressable>
        </ScrollView>

        <Text style={styles.sectionTitle}>TODAY'S STACK</Text>
        <View style={styles.card}>
          {activeProtocols.length === 0 ? <Text style={styles.empty}>No active protocols. Tap + to add one.</Text> : activeProtocols.map((p) => {
            const logged = loggedTodayByProtocol.has(p.id) || loggedTodayByName.has(p.name.toLowerCase());
            return (
              <View key={p.id} style={styles.row}>
                <Text style={styles.status}>{logged ? '✓' : '○'}</Text>
                <View style={styles.rowMain}>
                  <Text style={styles.name}>{p.name}</Text>
                  <Text style={styles.sub}>{p.dose_amount} {p.dose_unit}</Text>
                </View>
                <View style={styles.rowRight}>
                  <Text style={styles.sub}>{p.time_of_day}</Text>
                  {!logged && (
                    <Pressable style={styles.logButton} onPress={() => router.push('/log/dose')}>
                      <Text style={styles.logButtonText}>Log Now</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.nextDoseCard}>
          <Text style={styles.sectionTitle}>NEXT DOSE</Text>
          <Text style={styles.name}>{nextDose?.protocol.name ?? 'No upcoming dose'}</Text>
          <Text style={styles.sub}>{nextDose ? `${nextDose.protocol.dose_amount} ${nextDose.protocol.dose_unit}` : '—'}</Text>
          <Text style={styles.countdown}>{countdown}</Text>
          <Pressable style={styles.logButton} onPress={() => router.push('/log/dose')}>
            <Text style={styles.logButtonText}>Log Now</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>KEY METRICS</Text>
        <View style={styles.grid}>
          <Pressable style={styles.metricCard} onPress={() => router.push('/log/lifestyle')}><Text style={styles.metricLabel}>⚖️ Weight</Text><Text style={styles.metricValue}>{todayLifestyle?.weight_lbs != null ? `${todayLifestyle.weight_lbs} lbs` : '—'}</Text></Pressable>
          <Pressable style={styles.metricCard} onPress={() => router.push('/log/lifestyle')}><Text style={styles.metricLabel}>💧 Water</Text><Text style={styles.metricValue}>{todayLifestyle?.water_oz != null ? `${todayLifestyle.water_oz} oz` : '—'}</Text></Pressable>
          <View style={styles.metricCard}><Text style={styles.metricLabel}>📊 7-Day Adherence</Text><Text style={styles.metricValue}>{adherencePct}%</Text></View>
          <View style={styles.metricCard}><Text style={styles.metricLabel}>🔥 Streak</Text><Text style={styles.metricValue}>{streakDays} days</Text></View>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>
          <Pressable onPress={() => router.push('/log/history')}><Text style={styles.viewAll}>View all</Text></Pressable>
        </View>
        <View style={styles.card}>
          {recentActivity.length === 0 ? <Text style={styles.empty}>No doses logged yet.</Text> : recentActivity.map((d) => (
            <View key={d.id} style={styles.row}>
              <View style={styles.rowMain}>
                <Text style={styles.name}>{d.peptide_name ?? 'Dose'}</Text>
                <Text style={styles.sub}>{d.amount} {d.unit}</Text>
              </View>
              <Text style={styles.sub}>{relativeTime(d.logged_at)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 100, gap: 12 },
  headerCard: { backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 16 },
  greeting: { fontSize: 26, fontWeight: '700', color: Colors.text },
  date: { marginTop: 4, color: Colors.textSecondary },
  card: { backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 14, gap: 10 },
  askTitle: { fontSize: 16, color: Colors.text, fontWeight: '600' },
  askSub: { color: Colors.textSecondary, fontSize: 13 },
  chipsRow: { gap: 8 },
  chip: { backgroundColor: Colors.card, borderRadius: 999, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 12, paddingVertical: 8 },
  chipText: { color: Colors.text, fontSize: 13 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Colors.border },
  status: { width: 20, color: '#16A34A', fontSize: 16, fontWeight: '700' },
  rowMain: { flex: 1 },
  rowRight: { alignItems: 'flex-end', gap: 4 },
  name: { color: Colors.text, fontWeight: '700', fontSize: 15 },
  sub: { color: Colors.textSecondary, fontSize: 13 },
  logButton: { backgroundColor: Colors.accent, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  logButtonText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  nextDoseCard: { backgroundColor: '#E8F6EC', borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 14, gap: 6 },
  countdown: { color: '#166534', fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metricCard: { width: '48%', backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 12, minHeight: 80 },
  metricLabel: { color: Colors.textSecondary, fontSize: 12 },
  metricValue: { marginTop: 6, color: Colors.text, fontSize: 18, fontWeight: '700' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  viewAll: { color: Colors.accent, fontWeight: '600', fontSize: 13 },
  empty: { color: Colors.textSecondary, textAlign: 'center', paddingVertical: 10 },
});
