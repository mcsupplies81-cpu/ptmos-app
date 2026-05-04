import { useEffect, useMemo } from 'react';
import { router } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, Share, StyleSheet, Text, View } from 'react-native';

import ScreenHeader from '@/components/ScreenHeader';
import Colors from '@/constants/Colors';
import { useAuthStore } from '@/stores/authStore';
import { useDoseLogStore } from '@/stores/doseLogStore';
import { useLifestyleStore } from '@/stores/lifestyleStore';
import { useProtocolStore } from '@/stores/protocolStore';
import { useSymptomStore } from '@/stores/symptomStore';

export default function WeeklySummaryScreen() {
  const user = useAuthStore((s) => s.user);
  const doseLogs = useDoseLogStore((s) => s.doseLogs);
  const fetchDoseLogs = useDoseLogStore((s) => s.fetchDoseLogs);
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

  const weekStart = last7Dates[0];
  const weekEnd = last7Dates[last7Dates.length - 1];
  const weekRange = `${new Date(weekStart).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${new Date(weekEnd).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
  const weekDateSet = useMemo(() => new Set(last7Dates), [last7Dates]);

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

  const thisWeekDoseLogs = useMemo(
    () => doseLogs.filter((l) => weekDateSet.has(l.logged_at.slice(0, 10))),
    [doseLogs, weekDateSet],
  );
  const totalDoses = thisWeekDoseLogs.length;
  const uniquePeptides = useMemo(
    () => new Set(thisWeekDoseLogs.map((l) => l.peptide_name).filter(Boolean)).size,
    [thisWeekDoseLogs],
  );

  const avgSleep = useMemo(() => {
    const vals = lifestyleLogs.slice(0, 7).map((l) => l.sleep_hours).filter((v): v is number => v != null);
    if (!vals.length) return null;
    return `${(vals.reduce((sum, v) => sum + v, 0) / vals.length).toFixed(1)}h`;
  }, [lifestyleLogs]);

  const avgWeight = useMemo(() => {
    const latestWithWeight = lifestyleLogs.find((l) => l.weight_lbs != null);
    if (!latestWithWeight?.weight_lbs) return null;
    return `${latestWithWeight.weight_lbs} lbs`;
  }, [lifestyleLogs]);

  const symptomsThisWeek = useMemo(
    () => symptomLogs.filter((l) => weekDateSet.has(l.logged_at.slice(0, 10))),
    [symptomLogs, weekDateSet],
  );
  const mostCommonSymptom = useMemo(() => {
    if (!symptomsThisWeek.length) return null;
    const counts = symptomsThisWeek.reduce<Record<string, number>>((acc, log) => {
      acc[log.symptom] = (acc[log.symptom] ?? 0) + 1;
      return acc;
    }, {});
    const [name] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return name;
  }, [symptomsThisWeek]);

  const bestDay = useMemo(() => {
    const counts = last7Dates.reduce<Record<string, number>>((acc, date) => {
      acc[date] = 0;
      return acc;
    }, {});
    thisWeekDoseLogs.forEach((log) => {
      const date = log.logged_at.slice(0, 10);
      counts[date] = (counts[date] ?? 0) + 1;
    });
    symptomsThisWeek.forEach((log) => {
      const date = log.logged_at.slice(0, 10);
      counts[date] = (counts[date] ?? 0) + 1;
    });
    lifestyleLogs
      .filter((l) => weekDateSet.has(l.date))
      .forEach((log) => {
        counts[log.date] = (counts[log.date] ?? 0) + 1;
      });
    const [bestDate] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return new Date(bestDate).toLocaleDateString(undefined, { weekday: 'long' });
  }, [last7Dates, lifestyleLogs, symptomsThisWeek, thisWeekDoseLogs, weekDateSet]);

  const summaryText = [
    `You logged doses on ${adherencePct}% of days this week${streakDays > 0 ? ` and built a ${streakDays}-day streak` : ''}.`,
    `${avgSleep ? `Average sleep was ${avgSleep}. ` : ''}${avgWeight ? `Your latest weight was ${avgWeight}.` : ''}`.trim(),
    symptomsThisWeek.length
      ? `You logged ${symptomsThisWeek.length} symptom${symptomsThisWeek.length > 1 ? 's' : ''}${mostCommonSymptom ? `, with ${mostCommonSymptom} being most common` : ''}.`
      : 'No symptoms were logged this week.',
    adherencePct < 50 ? 'Consider reviewing your schedule to improve adherence next week.' : 'Great momentum—keep building consistency next week.',
  ]
    .filter(Boolean)
    .join('\n\n');

  const handleShare = async () => {
    await Share.share({
      title: 'My PT-OS Weekly Summary',
      message: [
        'PT-OS Weekly Summary',
        `Adherence: ${adherencePct}%`,
        `Streak: ${streakDays} days`,
        `Total doses: ${totalDoses}`,
        avgSleep ? `Avg sleep: ${avgSleep}` : '',
        'Tracked with PT-OS',
      ]
        .filter(Boolean)
        .join('\n'),
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Weekly Summary" rightLabel="Share" onRightPress={handleShare} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View>
          <Text style={styles.sectionLabel}>WEEK OF</Text>
          <Text style={styles.rangeText}>{weekRange}</Text>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.heroPct}>{adherencePct}%</Text>
          <Text style={styles.heroSub}>adherence this week</Text>
          <Text style={styles.heroSub}>🔥 {streakDays} day streak</Text>
          <Text style={styles.heroMsg}>{adherencePct >= 70 ? 'Great week!' : 'Keep going!'}</Text>
        </View>

        <View style={styles.grid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>💉 Total Doses</Text>
            <Text style={styles.statValue}>{totalDoses}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>😴 Avg Sleep</Text>
            <Text style={styles.statValue}>{avgSleep ?? '—'}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>⚖️ Latest Weight</Text>
            <Text style={styles.statValue}>{avgWeight ?? '—'}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>🧪 Compounds</Text>
            <Text style={styles.statValue}>{uniquePeptides}</Text>
          </View>
        </View>

        <View style={styles.aiCard}>
          <Text style={styles.aiTitle}>AI SUMMARY</Text>
          <Text style={styles.aiBody}>{summaryText}</Text>
          <Text style={styles.bestDay}>Best day: {bestDay}</Text>
          <Text style={styles.aiFootnote}>Full AI insights coming soon</Text>
        </View>

        <Pressable style={styles.linkRow} onPress={() => router.push('/(tabs)/insights')}>
          <Text style={styles.linkText}>View Full Insights →</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 120, gap: 14 },
  sectionLabel: { fontSize: 10, fontWeight: '600', color: Colors.textSecondary, letterSpacing: 1.5 },
  rangeText: { fontSize: 22, fontWeight: '800', color: Colors.text, marginTop: 4 },
  heroCard: { backgroundColor: Colors.accent, borderRadius: 16, padding: 18 },
  heroPct: { color: 'white', fontSize: 46, fontWeight: '800' },
  heroSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 2 },
  heroMsg: { color: 'white', fontSize: 16, fontWeight: '700', marginTop: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { width: '48.5%', backgroundColor: Colors.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.border },
  statLabel: { color: Colors.textSecondary, fontSize: 13 },
  statValue: { color: Colors.text, fontSize: 20, fontWeight: '800', marginTop: 6 },
  aiCard: { backgroundColor: '#F0F9F4', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: Colors.accentLight },
  aiTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1.2, color: Colors.accent },
  aiBody: { fontSize: 14, color: Colors.text, lineHeight: 22, marginTop: 8 },
  bestDay: { marginTop: 8, color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  aiFootnote: { marginTop: 10, color: Colors.textSecondary, fontSize: 11 },
  linkRow: { paddingVertical: 8 },
  linkText: { fontSize: 15, fontWeight: '700', color: Colors.accent },
});
