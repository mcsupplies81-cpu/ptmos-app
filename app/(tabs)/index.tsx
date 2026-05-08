import * as Haptics from 'expo-haptics';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import Colors from '@/constants/Colors';
import { useAuthStore } from '@/stores/authStore';
import { useDoseLogStore } from '@/stores/doseLogStore';
import { useLifestyleStore } from '@/stores/lifestyleStore';
import { useProfileStore } from '@/stores/profileStore';
import { useProtocolStore, type Protocol } from '@/stores/protocolStore';

const RING_SIZE = 88;
const RING_RADIUS = 38;
const RING_STROKE = 6;
const NEXT_RING_SIZE = 88;
const NEXT_RING_RADIUS = 36;
const NEXT_RING_STROKE = 5;
const MINUTES_IN_DAY = 24 * 60;
const WATER_GOAL_OZ = 128;
const DARK_FOREST = '#1B3A2F';

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

function ProgressRing({
  size,
  radius,
  strokeWidth,
  progress,
  trackColor,
  progressColor,
}: {
  size: number;
  radius: number;
  strokeWidth: number;
  progress: number;
  trackColor: string;
  progressColor: string;
}) {
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - clamp01(progress));

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={trackColor}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={progressColor}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={strokeDashoffset}
        originX={size / 2}
        originY={size / 2}
        rotation="-90"
      />
    </Svg>
  );
}

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
  const addDoseLog = useDoseLogStore((s) => s.addDoseLog);

  const { logs: lifestyleLogs, fetchLogs } = useLifestyleStore();

  // Re-fetch every time the tab comes into focus so metrics always show latest data
  useFocusEffect(
    useCallback(() => {
      if (!user?.id) return;
      void fetchProfile(user.id);
      void fetchProtocols(user.id);
      void fetchDoseLogs(user.id);
      void fetchLogs(user.id);
    }, [fetchDoseLogs, fetchLogs, fetchProfile, fetchProtocols, user?.id]),
  );

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

  const dosesLoggedToday = useMemo(
    () =>
      activeProtocols.filter((p) => loggedTodayByProtocol.has(p.id) || loggedTodayByName.has(p.name.toLowerCase()))
        .length,
    [activeProtocols, loggedTodayByProtocol, loggedTodayByName],
  );
  const totalActive = activeProtocols.length;
  const progressPct = totalActive > 0 ? Math.round((dosesLoggedToday / totalActive) * 100) : 0;
  const progressRatio = totalActive > 0 ? dosesLoggedToday / totalActive : 0;

  const nextDose = useMemo(() => {
    // Separate: unlogged protocols due today (overdue or upcoming)
    const todayTargets = activeProtocols
      .filter((p) => !loggedTodayByProtocol.has(p.id) && !loggedTodayByName.has(p.name.toLowerCase()))
      .map((p) => {
        const parsed = parseTime(p.time_of_day);
        if (!parsed) return null;
        const scheduled = new Date();
        scheduled.setHours(parsed.h, parsed.m, 0, 0);
        const deltaMin = Math.floor((scheduled.getTime() - Date.now()) / 60000);
        return { protocol: p, scheduled, deltaMin, overdue: deltaMin < 0 };
      })
      .filter((c): c is NonNullable<typeof c> => Boolean(c))
      .sort((a, b) => a.deltaMin - b.deltaMin);

    // Show overdue first, then soonest upcoming
    const overdue = todayTargets.filter((c) => c.overdue);
    if (overdue.length > 0) return overdue[0];
    if (todayTargets.length > 0) return todayTargets[0];
    return null;
  }, [activeProtocols, loggedTodayByProtocol, loggedTodayByName]);

  const todayLifestyle = useMemo(() => lifestyleLogs.find((l) => l.date === todayKey), [lifestyleLogs, todayKey]);
  const previousWeightLog = useMemo(
    () => lifestyleLogs.find((l) => l.date !== todayKey && l.weight_lbs != null),
    [lifestyleLogs, todayKey],
  );
  const weightDelta =
    todayLifestyle?.weight_lbs != null && previousWeightLog?.weight_lbs != null
      ? todayLifestyle.weight_lbs - previousWeightLog.weight_lbs
      : null;
  const waterPct = todayLifestyle?.water_oz != null ? clamp01(todayLifestyle.water_oz / WATER_GOAL_OZ) : 0;
  const nextDoseRemainingMin = nextDose ? Math.max(0, nextDose.deltaMin) : 0;
  const nextDoseRemainingHours = Math.floor(nextDoseRemainingMin / 60);
  const nextDoseRemainingMinutes = nextDoseRemainingMin % 60;
  const nextDoseProgress = nextDose ? clamp01(nextDose.deltaMin / MINUTES_IN_DAY) : 0;
  const nextDoseSubtitle = nextDose
    ? ((nextDose.protocol as Protocol & { compound_description?: string | null }).compound_description?.trim() ||
      `${nextDose.protocol.dose_amount} ${nextDose.protocol.dose_unit}`)
    : '';

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

  // One-tap quick log: logs with protocol defaults, no form needed
  const handleQuickLog = useCallback(async (protocol: Protocol) => {
    if (!user?.id) return;
    await addDoseLog(
      {
        protocol_id: protocol.id,
        peptide_name: protocol.name,
        amount: protocol.dose_amount,
        unit: protocol.dose_unit as 'mcg' | 'mg' | 'IU' | 'mL',
        logged_at: new Date().toISOString(),
        injection_site: null,
        mood: null,
        notes: null,
      },
      user.id,
    );
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [addDoseLog, user?.id]);

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

        <View style={styles.progressCard}>
          <View style={styles.progressCopy}>
            <Text style={styles.progressValue}>{dosesLoggedToday} / {totalActive}</Text>
            <Text style={styles.progressLabel}>doses completed</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
            </View>
          </View>
          <View style={styles.progressRingWrap}>
            <ProgressRing
              size={RING_SIZE}
              radius={RING_RADIUS}
              strokeWidth={RING_STROKE}
              progress={progressRatio}
              trackColor="rgba(45, 106, 79, 0.16)"
              progressColor={Colors.accent}
            />
            <View style={styles.progressRingCenter}>
              <Text style={styles.progressRingPct}>{progressPct}%</Text>
              <Text style={styles.progressRingLabel}>on track</Text>
            </View>
          </View>
        </View>

        <View style={styles.quickRow}>
          <Pressable style={styles.quickChip} onPress={() => router.push('/log/dose')}><View style={styles.quickIcon}><Text style={styles.quickEmoji}>💉</Text></View><Text style={styles.quickLabel}>Log Dose</Text></Pressable>
          <Pressable style={styles.quickChip} onPress={() => router.push('/(tabs)/protocols')}><View style={styles.quickIcon}><Text style={styles.quickEmoji}>🗓</Text></View><Text style={styles.quickLabel}>Protocols</Text></Pressable>
          <Pressable style={styles.quickChip} onPress={() => router.push('/more/inventory')}><View style={styles.quickIcon}><Text style={styles.quickEmoji}>📦</Text></View><Text style={styles.quickLabel}>Inventory</Text></Pressable>
          <Pressable style={styles.quickChip} onPress={() => router.push('/log/lifestyle')}><View style={styles.quickIcon}><Text style={styles.quickEmoji}>🌿</Text></View><Text style={styles.quickLabel}>Lifestyle</Text></Pressable>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>TODAY'S STACK</Text>
          <Pressable onPress={() => router.push('/(tabs)/protocols')}><Text style={styles.link}>Edit</Text></Pressable>
        </View>
        <View style={styles.card}>
          {activeProtocols.length === 0 ? <Text style={styles.empty}>No active protocols — tap + to add one</Text> : activeProtocols.map((p, idx) => {
            const logged = loggedTodayByProtocol.has(p.id) || loggedTodayByName.has(p.name.toLowerCase());
            return (
              <View key={p.id} style={[styles.protocolRow, idx === activeProtocols.length - 1 && styles.lastRow]}>
                {/* Tap circle = instant quick-log with protocol defaults */}
                <Pressable
                  style={[styles.statusCircle, logged ? styles.statusCircleDone : styles.statusCircleOpen]}
                  onPress={!logged ? () => handleQuickLog(p) : undefined}
                  hitSlop={8}
                >
                  {logged ? <Text style={styles.statusCheck}>✓</Text> : null}
                </Pressable>
                <View style={styles.rowMain}>
                  <Text style={styles.name}>{p.name}</Text>
                  <Text style={styles.sub}>{p.dose_amount} {p.dose_unit}</Text>
                </View>
                <View style={styles.rowRight}>
                  <Text style={styles.sub}>{p.time_of_day}</Text>
                  <Pressable
                    style={[styles.logPill, logged ? styles.loggedPill : styles.unloggedPill]}
                    onPress={!logged ? () => router.push({
                      pathname: '/log/dose',
                      params: {
                        protocolId: p.id,
                        prefillName: p.name,
                        prefillAmount: String(p.dose_amount),
                        prefillUnit: p.dose_unit,
                      },
                    }) : undefined}
                  >
                    <Text style={[styles.logPillText, logged ? styles.loggedPillText : styles.unloggedPillText]}>
                      {logged ? 'Logged' : 'Log'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
          <Pressable style={styles.scheduleLinkRow} onPress={() => router.push('/(tabs)/protocols')}>
            <Text style={styles.scheduleLinkText}>View full schedule ›</Text>
          </Pressable>
        </View>

        <View style={styles.nextDoseCard}>
          <Text style={styles.nextDoseLabel}>NEXT DOSE</Text>
          {nextDose ? (
            <>
              <View style={styles.nextDoseMainRow}>
                <View style={styles.nextDoseCopy}>
                  <Text style={styles.nextDoseName}>{nextDose.protocol.name}</Text>
                  <Text style={styles.nextDoseSub}>{nextDoseSubtitle}</Text>
                  <View style={styles.nextDoseDetailRow}>
                    <Text style={styles.nextDoseDetail}>⏰ {nextDose.protocol.time_of_day} · Today</Text>
                    <Text style={styles.nextDoseDetail}>💧 {nextDose.protocol.dose_amount} {nextDose.protocol.dose_unit} · Sub-Q</Text>
                  </View>
                </View>
                <View style={styles.nextRingWrap}>
                  <ProgressRing
                    size={NEXT_RING_SIZE}
                    radius={NEXT_RING_RADIUS}
                    strokeWidth={NEXT_RING_STROKE}
                    progress={nextDoseProgress}
                    trackColor="rgba(255, 255, 255, 0.2)"
                    progressColor={Colors.white}
                  />
                  <View style={styles.nextRingCenter}>
                    <Text style={styles.nextRingTime}>{nextDoseRemainingHours}h {nextDoseRemainingMinutes}m</Text>
                    <Text style={styles.nextRingLabel}>remaining</Text>
                  </View>
                </View>
              </View>
              <Pressable style={styles.logButton} onPress={() => router.push({
                pathname: '/log/dose',
                params: {
                  protocolId: nextDose.protocol.id,
                  prefillName: nextDose.protocol.name,
                  prefillAmount: String(nextDose.protocol.dose_amount),
                  prefillUnit: nextDose.protocol.dose_unit,
                },
              })}>
                <Text style={styles.logButtonText}>Log Dose</Text>
              </Pressable>
            </>
          ) : (
            <Text style={styles.nextEmpty}>All caught up for today 🎉</Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>KEY METRICS</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricsGridRow}>
            <Pressable style={styles.metricCard} onPress={() => router.push('/log/lifestyle')}>
              <Text style={styles.metricEmoji}>⚖️</Text>
              <Text style={styles.metricValue}>{todayLifestyle?.weight_lbs != null ? `${todayLifestyle.weight_lbs} lbs` : '—'}</Text>
              <Text style={styles.metricLabel}>Weight</Text>
              {weightDelta != null ? (
                <Text style={styles.metricSub}>{weightDelta > 0 ? '+' : ''}{weightDelta.toFixed(1)} lbs</Text>
              ) : null}
            </Pressable>
            <Pressable style={styles.metricCard} onPress={() => router.push('/log/lifestyle')}>
              <Text style={styles.metricEmoji}>💧</Text>
              <Text style={styles.metricValue}>{todayLifestyle?.water_oz != null ? `${todayLifestyle.water_oz} oz` : '—'}</Text>
              <Text style={styles.metricLabel}>of {WATER_GOAL_OZ} oz</Text>
              <View style={styles.metricProgressTrack}>
                <View style={[styles.metricProgressFill, { width: `${Math.round(waterPct * 100)}%` }]} />
              </View>
            </Pressable>
          </View>
          <View style={styles.metricsGridRow}>
            <Pressable style={styles.metricCard} onPress={() => router.push('/log/lifestyle')}>
              <Text style={styles.metricEmoji}>😴</Text>
              <Text style={styles.metricValue}>{todayLifestyle?.sleep_hours != null ? `${todayLifestyle.sleep_hours}h` : '—'}</Text>
              <Text style={styles.metricLabel}>Sleep</Text>
            </Pressable>
            <Pressable style={styles.metricCard} onPress={() => router.push('/(tabs)/insights')}>
              <Text style={styles.metricEmoji}>📊</Text>
              <Text style={styles.metricValue}>{adherencePct}%</Text>
              <Text style={styles.metricLabel}>vs last week</Text>
            </Pressable>
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
  askArrow: { color: Colors.white, fontSize: 17, fontWeight: '700' },
  progressCard: { backgroundColor: Colors.accentLight, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14 },
  progressCopy: { flex: 1, gap: 4 },
  progressValue: { color: Colors.text, fontSize: 30, fontWeight: '800' },
  progressLabel: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  progressTrack: { marginTop: 10, height: 8, borderRadius: 999, backgroundColor: 'rgba(45, 106, 79, 0.16)', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999, backgroundColor: Colors.accent },
  progressRingWrap: { width: RING_SIZE, height: RING_SIZE, alignItems: 'center', justifyContent: 'center' },
  progressRingCenter: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  progressRingPct: { color: Colors.text, fontSize: 18, fontWeight: '800' },
  progressRingLabel: { color: Colors.textSecondary, fontSize: 11, fontWeight: '700' },
  quickRow: { flexDirection: 'row', gap: 10 },
  quickChip: { flex: 1, backgroundColor: Colors.card, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, paddingVertical: 10, paddingHorizontal: 8, alignItems: 'center', gap: 8 },
  quickIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  quickEmoji: { fontSize: 17, textAlign: 'center' },
  quickLabel: { fontSize: 13, color: Colors.text, textAlign: 'center' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: Colors.textSecondary },
  link: { color: Colors.accent, fontSize: 13, fontWeight: '600' },
  card: { backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 16 },
  protocolRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 10 },
  statusCircle: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  statusCircleDone: { backgroundColor: Colors.accent },
  statusCircleOpen: { borderWidth: 1.5, borderColor: Colors.accent, backgroundColor: 'transparent' },
  statusCheck: { color: Colors.white, fontWeight: '800', fontSize: 12 },
  rowMain: { flex: 1 },
  rowRight: { alignItems: 'flex-end', gap: 6 },
  name: { color: Colors.text, fontWeight: '700', fontSize: 15 },
  sub: { color: Colors.textSecondary, fontSize: 13 },
  logPill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  loggedPill: { backgroundColor: Colors.accent },
  unloggedPill: { backgroundColor: Colors.border },
  logPillText: { fontSize: 12, fontWeight: '700' },
  loggedPillText: { color: Colors.white },
  unloggedPillText: { color: Colors.textSecondary },
  scheduleLinkRow: { marginTop: 10, paddingTop: 14, borderTopWidth: 1, borderTopColor: Colors.border, alignItems: 'center' },
  scheduleLinkText: { color: Colors.accent, fontSize: 14, fontWeight: '700' },
  nextDoseCard: { backgroundColor: DARK_FOREST, borderRadius: 20, padding: 20, gap: 16 },
  nextDoseLabel: { color: 'rgba(255, 255, 255, 0.6)', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  nextDoseMainRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  nextDoseCopy: { flex: 1, gap: 7 },
  nextDoseName: { fontSize: 24, fontWeight: '800', color: Colors.white },
  nextDoseSub: { color: 'rgba(255, 255, 255, 0.78)', fontSize: 14, fontWeight: '600' },
  nextDoseDetailRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', columnGap: 10, rowGap: 4 },
  nextDoseDetail: { color: 'rgba(255, 255, 255, 0.86)', fontSize: 13, fontWeight: '600' },
  nextRingWrap: { width: NEXT_RING_SIZE, height: NEXT_RING_SIZE, alignItems: 'center', justifyContent: 'center' },
  nextRingCenter: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  nextRingTime: { color: Colors.white, fontSize: 13, fontWeight: '800' },
  nextRingLabel: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 10, fontWeight: '700' },
  nextEmpty: { color: Colors.white, fontSize: 16, fontWeight: '700', textAlign: 'center', paddingVertical: 28 },
  logButton: { backgroundColor: Colors.white, borderRadius: 12, height: 44, alignItems: 'center', justifyContent: 'center' },
  logButtonText: { color: DARK_FOREST, fontSize: 15, fontWeight: '800' },
  metricsGrid: { gap: 10 },
  metricsGridRow: { flexDirection: 'row', gap: 10 },
  metricCard: { flex: 1, minHeight: 112, backgroundColor: Colors.card, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, padding: 14, justifyContent: 'space-between' },
  metricEmoji: { fontSize: 20 },
  metricValue: { color: Colors.text, fontSize: 22, fontWeight: '800' },
  metricLabel: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  metricSub: { color: Colors.accent, fontSize: 12, fontWeight: '700' },
  metricProgressTrack: { height: 7, borderRadius: 999, backgroundColor: Colors.border, overflow: 'hidden' },
  metricProgressFill: { height: '100%', borderRadius: 999, backgroundColor: Colors.accent },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  activityDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.accent },
  lastRow: { borderBottomWidth: 0 },
  empty: { color: Colors.textSecondary, textAlign: 'center', paddingVertical: 12, fontSize: 15 },
});
