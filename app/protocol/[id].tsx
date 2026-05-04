import { useEffect, useMemo } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import Colors from '@/constants/Colors';
import ScreenHeader from '@/components/ScreenHeader';
import { useProtocolStore, calcAdherence } from '@/stores/protocolStore';
import { useDoseLogStore } from '@/stores/doseLogStore';
import { useAuthStore } from '@/stores/authStore';

export default function ProtocolDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const protocols = useProtocolStore((state) => state.protocols);
  const fetchProtocols = useProtocolStore((state) => state.fetchProtocols);
  const doseLogs = useDoseLogStore((state) => state.doseLogs);
  const fetchDoseLogs = useDoseLogStore((state) => state.fetchDoseLogs);

  useEffect(() => {
    if (user?.id) {
      fetchProtocols(user.id);
      fetchDoseLogs(user.id);
    }
  }, [fetchDoseLogs, fetchProtocols, user?.id]);

  const protocol = useMemo(() => protocols.find((item) => item.id === id), [id, protocols]);

  const protocolDoseLogs = useMemo(
    () => doseLogs.filter((log) => log.protocol_id === protocol?.id),
    [doseLogs, protocol?.id],
  );

  if (!protocol) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title="Protocol" />
        <View style={styles.missingWrap}>
          <Text style={styles.missingText}>Protocol not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const adherence = calcAdherence(protocol, doseLogs);
  const statusLabel = protocol.status.charAt(0).toUpperCase() + protocol.status.slice(1);
  const statusTextStyle =
    protocol.status === 'active'
      ? styles.statusTextActive
      : protocol.status === 'paused'
        ? styles.statusTextPaused
        : styles.statusTextCompleted;

  const recentDoses = [...protocolDoseLogs]
    .sort((a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime())
    .slice(0, 5);

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title={protocol.name}
        rightLabel="Edit"
        onRightPress={() => router.push({ pathname: '/protocol/edit', params: { protocolId: protocol.id } })}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>{protocol.name}</Text>
          <Text style={styles.heroDose}>{protocol.dose_amount} {protocol.dose_unit}</Text>
          <Text style={styles.heroFrequency}>{protocol.frequency}</Text>

          <View style={styles.heroBottomRow}>
            <View style={styles.badgeWhite}>
              <Text style={styles.badgeAccentText}>{adherence}% Adherence</Text>
            </View>
            <View style={styles.badgeWhite}>
              <Text style={[styles.badgeStatusText, statusTextStyle]}>{statusLabel}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>💉 Total Doses</Text>
            <Text style={styles.statValue}>{protocolDoseLogs.length}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>📅 Start Date</Text>
            <Text style={styles.statValue}>{new Date(protocol.start_date).toLocaleDateString()}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>RECENT DOSES</Text>
        <View style={styles.sectionCard}>
          {recentDoses.length === 0 ? (
            <Text style={styles.emptyText}>No doses logged for this protocol yet.</Text>
          ) : (
            recentDoses.map((log) => (
              <View key={log.id} style={styles.doseItem}>
                <View style={styles.doseRowTop}>
                  <Text style={styles.doseDate}>{new Date(log.logged_at).toLocaleDateString()}</Text>
                  <Text style={styles.doseAmount}>{log.amount} {log.unit}</Text>
                </View>
                <Text style={styles.doseSite}>{log.injection_site ?? 'No injection site recorded'}</Text>
              </View>
            ))
          )}
        </View>

        {protocol.notes ? (
          <>
            <Text style={styles.sectionLabel}>NOTES</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{protocol.notes}</Text>
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: 32 },
  missingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  missingText: { color: Colors.text, fontSize: 16, fontWeight: '600' },
  heroCard: { backgroundColor: Colors.accent, borderRadius: 16, margin: 16, padding: 18 },
  heroTitle: { color: Colors.white, fontSize: 22, fontWeight: '800' },
  heroDose: { color: Colors.white, opacity: 0.8, fontSize: 15, marginTop: 4 },
  heroFrequency: { color: Colors.white, opacity: 0.8, fontSize: 13, marginTop: 2 },
  heroBottomRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  badgeWhite: { backgroundColor: Colors.white, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeAccentText: { color: Colors.accent, fontWeight: '700', fontSize: 12 },
  badgeStatusText: { fontWeight: '700', fontSize: 12 },
  statusTextActive: { color: Colors.accent },
  statusTextPaused: { color: Colors.warning },
  statusTextCompleted: { color: Colors.success },
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 12 },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
  },
  statLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  statValue: { marginTop: 6, fontSize: 16, color: Colors.text, fontWeight: '700' },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 10,
  },
  doseItem: { gap: 2 },
  doseRowTop: { flexDirection: 'row', justifyContent: 'space-between' },
  doseDate: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  doseAmount: { color: Colors.accent, fontSize: 14, fontWeight: '700' },
  doseSite: { color: Colors.textSecondary, fontSize: 12 },
  emptyText: { color: Colors.textSecondary, fontSize: 13 },
  notesCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: 16,
  },
  notesText: { color: Colors.text, fontSize: 14, lineHeight: 20 },
});
