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
        <View style={styles.headerSection}>
          <View style={styles.headerTopRow}>
            <Text style={styles.brandLabel}>PT-OS</Text>
            <Pressable style={styles.avatarButton} onPress={() => router.push('/settings')}>
              <Text style={styles.avatarText}>
                {(profile?.full_name ?? '')
                  .split(' ')
                  .map((part) => part[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join('')
                  .toUpperCase() || 'U'}
              </Text>
            </Pressable>
          </View>
          <Text style={styles.greetingLine}>{`${greeting},`}</Text>
          <Text style={styles.nameLine}>{firstName || 'there'}</Text>
          <Text style={styles.date}>{todayDate}</Text>
        </View>

        <Pressable style={styles.askCard} onPress={() => router.push('/(tabs)/chat')}>
          <View style={styles.askLeft}>
            <Text style={styles.askEmoji}>💬</Text>
            <View>
              <Text style={styles.askTitle}>Ask PT-OS anything...</Text>
              <Text style={styles.askSub}>Your peptide & protocol assistant</Text>
            </View>
          </View>
          <View style={styles.askArrowCircle}><Text style={styles.askArrow}>→</Text></View>
        </Pressable>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
          <Pressable style={styles.quickChip} onPress={() => router.push('/log/dose')}><View style={styles.quickIcon}><Text>💉</Text></View><Text style={styles.quickLabel}>Log Dose</Text></Pressable>
          <Pressable style={styles.quickChip} onPress={() => router.push('/(tabs)/protocols')}><View style={styles.quickIcon}><Text>🗓</Text></View><Text style={styles.quickLabel}>Protocols</Text></Pressable>
          <Pressable style={styles.quickChip} onPress={() => router.push('/more/inventory')}><View style={styles.quickIcon}><Text>📦</Text></View><Text style={styles.quickLabel}>Inventory</Text></Pressable>
          <Pressable style={styles.quickChip} onPress={() => router.push('/log/lifestyle')}><View style={styles.quickIcon}><Text>🌿</Text></View><Text style={styles.quickLabel}>Lifestyle</Text></Pressable>
        </ScrollView>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>TODAY'S STACK</Text>
          <Pressable onPress={() => router.push('/(tabs)/protocols')}><Text style={styles.link}>Edit</Text></Pressable>
        </View>
        <View style={styles.card}>
          {activeProtocols.length === 0 ? <Text style={styles.empty}>No active protocols — tap + to add one</Text> : activeProtocols.map((p, idx) => {
            const logged = loggedTodayByProtocol.has(p.id) || loggedTodayByName.has(p.name.toLowerCase());
            return (
              <View key={p.id} style={[styles.protocolRow, idx === activeProtocols.length - 1 && styles.lastRow]}>
                <View style={[styles.statusCircle, logged ? styles.statusCircleDone : styles.statusCircleOpen]}>
                  {logged ? <Text style={styles.statusCheck}>✓</Text> : null}
                </View>
                <View style={styles.rowMain}>
                  <Text style={styles.name}>{p.name}</Text>
                  <Text style={styles.sub}>{p.dose_amount} {p.dose_unit}</Text>
                </View>
                <View style={styles.rowRight}>
                  <Text style={styles.sub}>{p.time_of_day}</Text>
                  {!logged && (
                    <Pressable style={styles.logPill} onPress={() => router.push('/log/dose')}>
                      <Text style={styles.logPillText}>Log Now</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.nextDoseCard}>
          <Text style={styles.sectionTitle}>NEXT DOSE</Text>
          {nextDose ? (
            <>
              <Text style={styles.nextDoseName}>{nextDose.protocol.name}</Text>
              <Text style={styles.sub}>{nextDose.protocol.dose_amount} {nextDose.protocol.dose_unit}</Text>
              <View style={styles.nextDoseFooter}>
                <Text style={styles.countdown}>{countdown}</Text>
                <Pressable style={styles.logButton} onPress={() => router.push('/log/dose')}>
                  <Text style={styles.logButtonText}>Log Dose</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <Text style={styles.nextEmpty}>All caught up for today 🎉</Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>KEY METRICS</Text>
        <View style={styles.metricsGrid}>
          <Pressable style={styles.metricCard} onPress={() => router.push('/log/lifestyle')}>
            <Text style={styles.metricTop}>⚖️ Weight</Text>
            <Text style={styles.metricValue}>{todayLifestyle?.weight_lbs != null ? `${todayLifestyle.weight_lbs}` : '—'}</Text>
            <Text style={styles.metricMeta}>lbs</Text>
          </Pressable>
          <Pressable style={styles.metricCard} onPress={() => router.push('/log/lifestyle')}>
            <Text style={styles.metricTop}>💧 Water</Text>
            <Text style={styles.metricValue}>{todayLifestyle?.water_oz != null ? `${todayLifestyle.water_oz} oz` : '—'}</Text>
            <Text style={styles.metricMeta}>today</Text>
          </Pressable>
          <Pressable style={styles.metricCard} onPress={() => router.push('/log/lifestyle')}>
            <Text style={styles.metricTop}>😴 Sleep</Text>
            <Text style={styles.metricValue}>{todayLifestyle?.sleep_hours != null ? `${todayLifestyle.sleep_hours}h` : '—'}</Text>
            <Text style={styles.metricMeta}>last night</Text>
          </Pressable>
          <View style={styles.metricCard}>
            <Text style={styles.metricTop}>📊 Adherence</Text>
            <Text style={styles.metricValue}>{adherencePct}%</Text>
            <Text style={styles.metricMeta}>7-day</Text>
          </View>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>
          <Pressable onPress={() => router.push('/log/history')}><Text style={styles.link}>View All</Text></Pressable>
        </View>
        <View style={styles.card}>
          {recentActivity.length === 0 ? <Text style={styles.empty}>No doses logged yet</Text> : recentActivity.map((d, idx) => (
            <View key={d.id} style={[styles.activityRow, idx === recentActivity.length - 1 && styles.lastRow]}>
              <View style={styles.activityDot} />
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
  content: { padding: 16, paddingBottom: 100, gap: 14, backgroundColor: Colors.background },
  headerSection: { paddingVertical: 4, gap: 4 },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandLabel: { fontSize: 12, letterSpacing: 1.4, fontWeight: '700', color: Colors.textSecondary },
  avatarButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: Colors.text, fontSize: 13, fontWeight: '700' },
  greetingLine: { fontSize: 30, fontWeight: '700', color: Colors.text },
  nameLine: { fontSize: 34, fontWeight: '800', color: Colors.text },
  date: { marginTop: 2, color: Colors.textSecondary, fontSize: 13 },
  askCard: { backgroundColor: Colors.accentLight, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  askLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  askEmoji: { fontSize: 20 },
  askTitle: { fontSize: 17, color: Colors.text, fontWeight: '700' },
  askSub: { color: Colors.textSecondary, fontSize: 13 },
  askArrowCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  askArrow: { color: '#fff', fontSize: 17, fontWeight: '700' },
  quickRow: { gap: 10, paddingRight: 8 },
  quickChip: { width: 78, backgroundColor: Colors.card, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, paddingVertical: 10, paddingHorizontal: 8, alignItems: 'center', gap: 8 },
  quickIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 13, color: Colors.text, textAlign: 'center' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: Colors.textSecondary },
  link: { color: Colors.accent, fontSize: 13, fontWeight: '600' },
  card: { backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 16 },
  protocolRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 10 },
  statusCircle: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  statusCircleDone: { backgroundColor: Colors.accent },
  statusCircleOpen: { borderWidth: 1.5, borderColor: Colors.accent, backgroundColor: 'transparent' },
  statusCheck: { color: '#fff', fontWeight: '800', fontSize: 12 },
  rowMain: { flex: 1 },
  rowRight: { alignItems: 'flex-end', gap: 6 },
  name: { color: Colors.text, fontWeight: '700', fontSize: 15 },
  sub: { color: Colors.textSecondary, fontSize: 13 },
  logPill: { backgroundColor: Colors.accentLight, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  logPillText: { color: Colors.accent, fontSize: 12, fontWeight: '700' },
  nextDoseCard: { backgroundColor: '#E8F6EC', borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 16, gap: 6 },
  nextDoseName: { fontSize: 24, fontWeight: '800', color: Colors.text },
  nextDoseFooter: { marginTop: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nextEmpty: { color: Colors.text, fontSize: 15 },
  countdown: { color: Colors.accent, fontWeight: '700', fontSize: 15 },
  logButton: { backgroundColor: Colors.accent, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  logButtonText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  metricCard: { width: '48%', backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 12, minHeight: 118, justifyContent: 'space-between' },
  metricTop: { color: Colors.text, fontSize: 15, fontWeight: '600' },
  metricValue: { color: Colors.text, fontSize: 24, fontWeight: '800' },
  metricMeta: { color: Colors.textSecondary, fontSize: 13 },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  activityDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.accent },
  lastRow: { borderBottomWidth: 0 },
  empty: { color: Colors.textSecondary, textAlign: 'center', paddingVertical: 12, fontSize: 15 },
});
