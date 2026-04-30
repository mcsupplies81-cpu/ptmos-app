import { useEffect, useMemo } from 'react';
import { router } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import Colors from '@/constants/Colors';
import { Copy } from '@/constants/Copy';
import { useAuthStore } from '@/stores/authStore';
import { useDoseLogStore } from '@/stores/doseLogStore';
import { useLifestyleStore } from '@/stores/lifestyleStore';
import { useProfileStore } from '@/stores/profileStore';
import { calcAdherence, useProtocolStore } from '@/stores/protocolStore';

export default function DashboardScreen() {
  const user = useAuthStore((state) => state.user);
  const profile = useProfileStore((state) => state.profile);
  const protocols = useProtocolStore((state) => state.protocols);
  const fetchProtocols = useProtocolStore((state) => state.fetchProtocols);
  const doseLogs = useDoseLogStore((state) => state.doseLogs);
  const fetchDoseLogs = useDoseLogStore((state) => state.fetchDoseLogs);
  const lifestyleLogs = useLifestyleStore((state) => state.logs);
  const fetchLifestyleLogs = useLifestyleStore((state) => state.fetchLogs);

  useEffect(() => {
    if (user?.id) {
      fetchProtocols(user.id);
      fetchDoseLogs(user.id);
      fetchLifestyleLogs(user.id);
    }
  }, [fetchDoseLogs, fetchLifestyleLogs, fetchProtocols, user?.id]);

  const firstName = (profile?.full_name || user?.email?.split('@')[0] || 'there').split(' ')[0];
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const activeProtocols = protocols.filter((protocol) => protocol.status === 'active');
  const nextDose = useMemo(() => {
    if (activeProtocols.length === 0) return null;
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    return activeProtocols
      .map((protocol) => {
        const [hh, mm] = protocol.time_of_day.split(':').map(Number);
        const protocolMinutes = hh * 60 + mm;
        const delta = protocolMinutes >= nowMinutes ? protocolMinutes - nowMinutes : 1440 - nowMinutes + protocolMinutes;
        return { protocol, delta, isTomorrow: protocolMinutes < nowMinutes };
      })
      .sort((a, b) => a.delta - b.delta)[0];
  }, [activeProtocols]);

  const latestDose = useMemo(
    () => [...doseLogs].sort((a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime())[0],
    [doseLogs],
  );

  const lastDoseTimeAgo = useMemo(() => {
    if (!latestDose) return 'No doses logged yet';
    const diffHours = (Date.now() - new Date(latestDose.logged_at).getTime()) / (1000 * 60 * 60);
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${Math.floor(diffHours)} hours ago`;
    if (diffHours < 48) return 'Yesterday';
    return `${Math.floor(diffHours / 24)} days ago`;
  }, [latestDose]);

  const adherence = activeProtocols.length
    ? Math.round(activeProtocols.reduce((sum, protocol) => sum + calcAdherence(protocol, doseLogs), 0) / activeProtocols.length)
    : null;

  const latestLifestyle = lifestyleLogs[lifestyleLogs.length - 1];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.greeting}>{greeting}, {firstName}</Text>
          <Pressable><Text style={styles.bell}>🔔</Text></Pressable>
        </View>

        <Text style={styles.sectionLabel}>NEXT DOSE</Text>
        <View style={styles.card}>
          {nextDose ? (
            <View style={styles.nextDoseRow}>
              <View style={styles.pillIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{nextDose.protocol.name}</Text>
                <Text style={styles.sub}>{nextDose.protocol.dose_amount} {nextDose.protocol.dose_unit} · {nextDose.protocol.frequency}</Text>
                <Text style={styles.sub}>{nextDose.protocol.time_of_day}</Text>
              </View>
              <Text style={styles.accentText}>{nextDose.isTomorrow ? 'Tomorrow' : `In ${Math.floor(nextDose.delta / 60)}h ${nextDose.delta % 60}m`}</Text>
            </View>
          ) : <Text style={styles.sub}>No active protocols</Text>}
        </View>

        <Text style={styles.sectionLabel}>LAST DOSE</Text>
        <View style={styles.card}>
          {latestDose ? (
            <>
              <Text style={styles.title}>{latestDose.peptide_name || 'Unknown peptide'}</Text>
              <Text style={styles.sub}>{latestDose.amount} {latestDose.unit}</Text>
              <Text style={styles.sub}>{lastDoseTimeAgo}</Text>
            </>
          ) : <Text style={styles.sub}>No doses logged yet</Text>}
        </View>

        <Text style={styles.sectionLabel}>PROTOCOL ADHERENCE</Text>
        <View style={[styles.card, styles.center]}>
          <Text style={styles.adherence}>{adherence == null ? '--' : adherence}</Text>
          <Text style={styles.sub}>% This Week</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>TODAY OVERVIEW</Text>
          {[['🦶', 'Steps', latestLifestyle?.steps], ['😴', 'Sleep', latestLifestyle?.sleep_hours], ['⚖️', 'Weight', latestLifestyle?.weight]]
            .map(([icon, label, value], idx) => (
              <View key={String(label)} style={[styles.overviewRow, idx === 2 && { borderBottomWidth: 0 }]}> 
                <Text style={styles.title}>{icon} {label}</Text>
                <Text style={styles.sub}>{value ?? '--'}</Text>
              </View>
            ))}
        </View>

        <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
        <View style={styles.quickGrid}>
          {[['💉', 'Log Dose', '/log/dose'], ['🧮', 'Calculator', '/log/calculator'], ['📦', 'Inventory', '/more/inventory'], ['🩺', 'Symptoms', '/log/symptoms']].map(([icon, label, path]) => (
            <Pressable key={String(label)} style={[styles.card, styles.quickAction]} onPress={() => router.push(path as '/log/dose')}>
              <Text style={{ fontSize: 24 }}>{icon}</Text>
              <Text style={styles.quickLabel}>{label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.disclaimer}>{Copy.disclaimerShort}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.backgroundSecondary },
  container: { padding: 16, paddingBottom: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 24, fontWeight: '700', color: Colors.text },
  bell: { fontSize: 24 },
  card: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  sectionLabel: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, marginTop: 20 },
  nextDoseRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pillIcon: { width: 44, height: 44, backgroundColor: Colors.accentLight, borderRadius: 12 },
  title: { fontSize: 16, fontWeight: '700', color: Colors.text },
  sub: { fontSize: 13, color: Colors.textSecondary },
  accentText: { fontSize: 13, fontWeight: '600', color: Colors.accent },
  center: { alignItems: 'center' },
  adherence: { fontSize: 48, fontWeight: '800', color: Colors.accent },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, marginBottom: 4 },
  overviewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: Colors.border, paddingVertical: 12 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickAction: { flexBasis: '47%', alignItems: 'center', paddingVertical: 18 },
  quickLabel: { marginTop: 8, fontSize: 12, fontWeight: '600', color: Colors.text },
  disclaimer: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center', paddingVertical: 16 },
});
