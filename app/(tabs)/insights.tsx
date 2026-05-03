import { useEffect, useMemo } from 'react';
import { router } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';

import ScreenHeader from '@/components/ScreenHeader';
import EmptyState from '@/components/EmptyState';
import Colors from '@/constants/Colors';
import { useAuthStore } from '@/stores/authStore';
import { useDoseLogStore } from '@/stores/doseLogStore';
import { useLifestyleStore } from '@/stores/lifestyleStore';
import { calcAdherence, useProtocolStore } from '@/stores/protocolStore';
import { useSymptomStore } from '@/stores/symptomStore';

const CIRC = 2 * Math.PI * 26;
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function InsightsScreen() {
  const user = useAuthStore((s) => s.user);
  const doseLogs = useDoseLogStore((s) => s.doseLogs);
  const fetchDoseLogs = useDoseLogStore((s) => s.fetchDoseLogs);
  const protocols = useProtocolStore((s) => s.protocols);
  const fetchProtocols = useProtocolStore((s) => s.fetchProtocols);
  const symptomLogs = useSymptomStore((s) => s.logs);
  const fetchSymptoms = useSymptomStore((s) => s.fetchLogs);
  const lifestyleLogs = useLifestyleStore((s) => s.logs);
  const fetchLifestyle = useLifestyleStore((s) => s.fetchLogs);

  useEffect(() => {
    if (user?.id) {
      fetchDoseLogs(user.id);
      fetchProtocols(user.id);
      fetchSymptoms(user.id);
      fetchLifestyle(user.id);
    }
  }, [fetchDoseLogs, fetchLifestyle, fetchProtocols, fetchSymptoms, user?.id]);

  const last7Dates = useMemo(
    () =>
      Array.from({ length: 7 })
        .map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d.toISOString().slice(0, 10);
        })
        .reverse(),
    [],
  );

  const loggedDates = useMemo(() => new Set(doseLogs.map((l) => l.logged_at.slice(0, 10))), [doseLogs]);

  const adherencePct = useMemo(
    () => Math.round((last7Dates.filter((d) => loggedDates.has(d)).length / 7) * 100),
    [last7Dates, loggedDates],
  );

  const streakDays = useMemo(() => {
    let streak = 0;
    const cursor = new Date();
    cursor.setDate(cursor.getDate() - 1);

    while (loggedDates.has(cursor.toISOString().slice(0, 10))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
  }, [loggedDates]);

  const activeProtocols = useMemo(
    () => protocols.filter((p) => p.status === 'active'),
    [protocols],
  );

  const recentSymptoms = useMemo(
    () =>
      symptomLogs
        .filter((l) => new Date(l.logged_at) > new Date(Date.now() - 7 * 86400000))
        .slice(0, 5),
    [symptomLogs],
  );

  const avgSleep = useMemo(() => {
    const sleepVals = lifestyleLogs.slice(0, 7).filter((l) => l.sleep_hours).map((l) => l.sleep_hours as number);
    if (!sleepVals.length) {
      return '—';
    }
    const avg = sleepVals.reduce((sum, v) => sum + v, 0) / sleepVals.length;
    return `${avg.toFixed(1)} hours`;
  }, [lifestyleLogs]);

  const avgWeight = useMemo(() => {
    const latestWithWeight = lifestyleLogs.find((l) => !!l.weight_lbs);
    if (!latestWithWeight?.weight_lbs) {
      return '—';
    }
    return `${latestWithWeight.weight_lbs} lbs`;
  }, [lifestyleLogs]);

  const summaryText = `You've taken doses on ${adherencePct}% of days this week${streakDays > 0 ? ` and are on a ${streakDays}-day streak` : ''}. ${recentSymptoms.length > 0 ? `You logged ${recentSymptoms.length} symptom${recentSymptoms.length > 1 ? 's' : ''} this week.` : 'No symptoms logged this week.'} ${avgSleep !== '—' ? `Average sleep was ${avgSleep}.` : ''}`;

  if (doseLogs.length === 0 && lifestyleLogs.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader />
        <EmptyState
          emoji="📊"
          title="No data yet"
          subtitle="Start logging doses, weight, and sleep to see your insights here."
          actionLabel="Log a Dose"
          onAction={() => router.push('/log/dose')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Insights</Text>
          <Text style={styles.subtitle}>Last 7 days</Text>
        </View>

        <View style={styles.adherenceCard}>
          <Text style={styles.sectionLabelOnAccent}>WEEKLY ADHERENCE</Text>
          <View style={styles.adherenceRow}>
            <View>
              <Text style={styles.adherencePct}>{adherencePct}%</Text>
              <Text style={styles.adherenceSub}>of doses taken</Text>
              <Text style={styles.streakText}>🔥 {streakDays} day streak</Text>
            </View>
            <Svg width={64} height={64}>
              <Circle cx={32} cy={32} r={26} stroke="rgba(255,255,255,0.2)" strokeWidth={5} fill="none" />
              <Circle
                cx={32}
                cy={32}
                r={26}
                stroke="white"
                strokeWidth={5}
                fill="none"
                strokeDasharray={CIRC}
                strokeDashoffset={CIRC * (1 - adherencePct / 100)}
                strokeLinecap="round"
                transform="rotate(-90 32 32)"
              />
            </Svg>
          </View>
        </View>
        <View style={styles.historyLinkWrap}>
          <Pressable style={styles.historyLinkCard} onPress={() => router.push('/insights/weekly-summary')}>
            <Text style={styles.historyLinkText}>📋 Weekly Summary</Text>
            <Text style={styles.historyLinkArrow}>Weekly Summary →</Text>
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>😴 Sleep</Text>
            <Text style={styles.statValue}>{avgSleep}</Text>
            <Text style={styles.statSub}>avg this week</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>⚖️ Weight</Text>
            <Text style={styles.statValue}>{avgWeight}</Text>
            <Text style={styles.statSub}>most recent</Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.sectionLabel}>DOSE HISTORY</Text>
          <View style={styles.barRow}>
            {last7Dates.map((date) => {
              const has = loggedDates.has(date);
              return (
                <View key={date} style={styles.barItem}>
                  <Rect width={28} height={has ? 48 : 8} rx={4} fill={has ? Colors.accent : Colors.border} />
                  <Text style={styles.barDay}>{DAY_LABELS[new Date(date).getDay()]}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>ACTIVE PROTOCOLS</Text>
          {activeProtocols.length === 0 ? (
            <Text style={styles.emptyText}>No active protocols</Text>
          ) : (
            activeProtocols.map((protocol) => (
              <View key={protocol.id} style={styles.protocolCard}>
                <View>
                  <Text style={styles.protocolName}>{protocol.name}</Text>
                  <Text style={styles.protocolMeta}>
                    {protocol.dose_amount} {protocol.dose_unit} · {protocol.frequency}
                  </Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{Math.round(calcAdherence(protocol, doseLogs))}%</Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>SYMPTOMS THIS WEEK</Text>
          {recentSymptoms.length === 0 ? (
            <Text style={styles.emptyText}>No symptoms logged this week 👍</Text>
          ) : (
            recentSymptoms.map((symptom) => {
              const severityColor = symptom.severity < 4 ? Colors.success : symptom.severity <= 6 ? Colors.warning : Colors.error;
              const symptomName = `${symptom.symptom_type[0].toUpperCase()}${symptom.symptom_type.slice(1)}`;
              return (
                <View key={symptom.id} style={styles.symptomRow}>
                  <Text style={styles.symptomType}>{symptomName}</Text>
                  <Text style={[styles.symptomSeverity, { color: severityColor }]}>{symptom.severity}/10</Text>
                </View>
              );
            })
          )}
        </View>


        <View style={styles.historyLinkWrap}>
          <Pressable style={styles.historyLinkCard} onPress={() => router.push('/log/history')}>
            <Text style={styles.historyLinkText}>📋 Dose History</Text>
            <Text style={styles.historyLinkArrow}>View Full History →</Text>
          </Pressable>
        </View>

        <View style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <Text style={styles.aiEmoji}>✨</Text>
            <Text style={styles.aiTitle}>AI Summary</Text>
          </View>
          <Text style={styles.aiBody}>{summaryText}</Text>
          <Text style={styles.aiFootnote}>Full AI analysis coming soon</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: 100 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  adherenceCard: { margin: 16, marginTop: 12, backgroundColor: Colors.accent, borderRadius: 16, padding: 18 },
  sectionLabelOnAccent: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.65)', letterSpacing: 1.5 },
  adherenceRow: { marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  adherencePct: { color: 'white', fontSize: 48, fontWeight: '800' },
  adherenceSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  streakText: { marginTop: 8, color: 'white', fontSize: 14, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 4 },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statLabel: { color: Colors.textSecondary, fontSize: 13 },
  statValue: { fontSize: 22, fontWeight: '800', color: Colors.text, marginTop: 6 },
  statSub: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  chartCard: {
    margin: 16,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  barRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 60 },
  barItem: { alignItems: 'center' },
  barDay: { fontSize: 10, color: Colors.textSecondary, marginTop: 4 },
  sectionBlock: { paddingHorizontal: 16, marginBottom: 4 },
  emptyText: { color: Colors.textSecondary, textAlign: 'center', paddingVertical: 12 },
  protocolCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  protocolName: { fontSize: 15, fontWeight: '600', color: Colors.text },
  protocolMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  badge: { backgroundColor: Colors.accentLight, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { color: Colors.accent, fontSize: 12, fontWeight: '700' },
  symptomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  symptomType: { fontSize: 14, color: Colors.text },
  symptomSeverity: { fontSize: 13, fontWeight: '700' },

  historyLinkWrap: { paddingHorizontal: 16, marginBottom: 4 },
  historyLinkCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  historyLinkText: { fontSize: 15, fontWeight: '600', color: Colors.text },
  historyLinkArrow: { fontSize: 13, fontWeight: '600', color: Colors.accent },
  aiCard: {
    margin: 16,
    backgroundColor: '#F0F9F4',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.accentLight,
  },
  aiHeader: { flexDirection: 'row', alignItems: 'center' },
  aiEmoji: { fontSize: 20 },
  aiTitle: { fontSize: 15, fontWeight: '700', color: Colors.accent, marginLeft: 8 },
  aiBody: { fontSize: 14, color: Colors.text, lineHeight: 22, marginTop: 8 },
  aiFootnote: { fontSize: 11, color: Colors.textSecondary, marginTop: 8 },
});
