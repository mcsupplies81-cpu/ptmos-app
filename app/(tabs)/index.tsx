import { useEffect, useMemo } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import Colors from '@/constants/Colors';
import { useAuthStore } from '@/stores/authStore';
import { useDoseLogStore } from '@/stores/doseLogStore';
import { useProfileStore } from '@/stores/profileStore';
import { useProtocolStore } from '@/stores/protocolStore';

export default function DashboardScreen() {
  const user = useAuthStore((state) => state.user);
  const profile = useProfileStore((state) => state.profile);

  const doseLogs = useDoseLogStore((state) => state.doseLogs);
  const fetchDoseLogs = useDoseLogStore((state) => state.fetchDoseLogs);
  const protocols = useProtocolStore((state) => state.protocols);
  const fetchProtocols = useProtocolStore((state) => state.fetchProtocols);

  useEffect(() => {
    if (user?.id) {
      fetchProtocols(user.id);
      fetchDoseLogs(user.id);
    }
  }, [fetchDoseLogs, fetchProtocols, user?.id]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const firstName = useMemo(() => profile?.full_name?.trim().split(' ')[0] ?? '', [profile?.full_name]);
  const greetingLine = firstName ? `${greeting}, ${firstName}` : `${greeting} 👋`;
  const todayDate = useMemo(
    () =>
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }),
    [],
  );

  const activeProtocols = useMemo(() => protocols.filter((protocol) => protocol.status === 'active'), [protocols]);
  const todayKey = new Date().toISOString().slice(0, 10);
  const loggedTodayNames = useMemo(
    () => new Set(doseLogs.filter((d) => d.logged_at.slice(0, 10) === todayKey).map((d) => (d.peptide_name ?? '').toLowerCase())),
    [doseLogs, todayKey],
  );

  const adherencePct = useMemo(() => {
    if (activeProtocols.length === 0) return 0;
    const last7 = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().slice(0, 10);
    });
    const logged = new Set(doseLogs.map((l) => l.logged_at.slice(0, 10)));
    return Math.round((last7.filter((d) => logged.has(d)).length / 7) * 100);
  }, [activeProtocols.length, doseLogs]);

  const stats = [
    { label: 'Active Protocols', value: `${activeProtocols.length}` },
    { label: 'Doses Logged Today', value: `${loggedTodayNames.size}` },
    { label: '7-Day Adherence', value: `${adherencePct}%` },
  ];

  if (!profile && !user) {
    return (
      <SafeAreaView style={styles.loadingWrap}>
        <ActivityIndicator size="small" color={Colors.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.greetingCard}>
          <Text style={styles.greetingTitle}>{greetingLine}</Text>
          <Text style={styles.greetingDate}>{todayDate}</Text>
        </View>

        <Pressable onPress={() => router.push('/(tabs)/chat')} style={styles.askCard}>
          <Text style={styles.askText}>💬 Ask PTMOS anything...</Text>
        </Pressable>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.summaryRow}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{stat.value}</Text>
              <Text style={styles.summaryLabel}>{stat.label}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.protocolListWrap}>
          {activeProtocols.length === 0 ? (
            <Text style={styles.emptyText}>No active protocols scheduled today.</Text>
          ) : (
            activeProtocols.map((protocol) => {
              const isLogged = loggedTodayNames.has(protocol.name.toLowerCase());
              return (
                <View key={protocol.id} style={styles.protocolRow}>
                  <View style={styles.statusWrap}>{isLogged ? <Text style={styles.check}>✓</Text> : <View style={styles.circle} />}</View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.protocolName}>{protocol.name}</Text>
                    <Text style={styles.protocolDose}>{protocol.dose_amount} {protocol.dose_unit}</Text>
                  </View>
                  <Text style={styles.protocolTime}>{protocol.time_of_day}</Text>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 96, gap: 14 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  greetingCard: { backgroundColor: Colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.border },
  greetingTitle: { fontSize: 24, fontWeight: '700', color: Colors.text },
  greetingDate: { marginTop: 4, fontSize: 14, color: Colors.textSecondary },
  askCard: { backgroundColor: Colors.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.border },
  askText: { fontSize: 16, color: Colors.textSecondary },
  summaryRow: { gap: 10 },
  summaryCard: {
    minWidth: 150,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  summaryValue: { fontSize: 28, fontWeight: '800', color: Colors.text },
  summaryLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  protocolListWrap: { backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14 },
  protocolRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  statusWrap: { width: 24, alignItems: 'center', marginRight: 8 },
  check: { color: '#16A34A', fontSize: 14, fontWeight: '800' },
  circle: { width: 10, height: 10, borderRadius: 5, borderWidth: 1.5, borderColor: Colors.textSecondary },
  protocolName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  protocolDose: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  protocolTime: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  emptyText: { paddingVertical: 16, fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
});
