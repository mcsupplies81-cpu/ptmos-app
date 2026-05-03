import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { router, useLocalSearchParams } from 'expo-router';
import ScreenHeader from '@/components/ScreenHeader';
import Colors from '@/constants/Colors';
import { useDoseLogStore } from '@/stores/doseLogStore';
import { calcAdherence, useProtocolStore } from '@/stores/protocolStore';
import { useAuthStore } from '@/stores/authStore';

const CIRC = 2 * Math.PI * 22;

export default function ProtocolDetailScreen() {
  const { protocolId } = useLocalSearchParams<{ protocolId?: string }>();
  const user = useAuthStore((state) => state.user);
  const protocols = useProtocolStore((state) => state.protocols);
  const upsertProtocol = useProtocolStore((state) => state.upsertProtocol);
  const doseLogs = useDoseLogStore((state) => state.doseLogs);
  const [saving, setSaving] = useState(false);

  const protocol = useMemo(() => protocols.find((item) => item.id === protocolId), [protocolId, protocols]);

  const recentLogs = useMemo(
    () =>
      doseLogs
        .filter((log) => log.protocol_id === protocolId)
        .sort((a, b) => b.logged_at.localeCompare(a.logged_at))
        .slice(0, 6),
    [doseLogs, protocolId],
  );

  if (!protocol) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title="Protocol" />
        <View style={styles.notFoundWrap}>
          <Text style={styles.empty}>Protocol not found.</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backLink}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const adherence = calcAdherence(protocol, doseLogs);
  const boundedAdherence = Math.max(0, Math.min(100, adherence));
  const isActive = protocol.status === 'active';

  const handleMarkComplete = async () => {
    if (!user?.id) return;
    setSaving(true);
    await upsertProtocol({ ...protocol, status: 'completed' }, user.id);
    setSaving(false);
  };

  const handleReactivate = async () => {
    if (!user?.id) return;
    setSaving(true);
    await upsertProtocol({ ...protocol, status: 'active' }, user.id);
    setSaving(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={protocol?.name ?? 'Protocol Detail'} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <View style={styles.heroRow}>
            <View style={styles.heroLeft}>
              <Text style={styles.heroTitle}>{protocol.name}</Text>
              <Text style={styles.heroDose}>{protocol.dose_amount} {protocol.dose_unit}</Text>
              <View style={[styles.statusPill, isActive ? styles.statusActivePill : styles.statusCompletedPill]}>
                <Text style={[styles.statusPillText, isActive ? styles.statusActiveText : styles.statusCompletedText]}>
                  {isActive ? 'Active' : 'Completed'}
                </Text>
              </View>
            </View>

            <View style={styles.ringWrap}>
              <Svg width={56} height={56}>
                <Circle cx={28} cy={28} r={22} stroke={Colors.border} strokeWidth={6} fill="none" />
                <Circle
                  cx={28}
                  cy={28}
                  r={22}
                  stroke="white"
                  strokeWidth={6}
                  fill="none"
                  strokeDasharray={CIRC}
                  strokeDashoffset={CIRC * (1 - boundedAdherence / 100)}
                  strokeLinecap="round"
                  transform="rotate(-90 28 28)"
                />
              </Svg>
              <Text style={styles.ringText}>{boundedAdherence}%</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>PROTOCOL INFO</Text>
        <View style={styles.infoRow}><View style={styles.infoLeft}><View style={styles.iconCircle}><Text>💊</Text></View><Text style={styles.infoLabel}>Dose</Text></View><Text style={styles.infoValue}>{protocol.dose_amount} {protocol.dose_unit}</Text></View>
        <View style={styles.infoRow}><View style={styles.infoLeft}><View style={styles.iconCircle}><Text>📅</Text></View><Text style={styles.infoLabel}>Frequency</Text></View><Text style={styles.infoValue}>{protocol.frequency}</Text></View>
        <View style={styles.infoRow}><View style={styles.infoLeft}><View style={styles.iconCircle}><Text>⏰</Text></View><Text style={styles.infoLabel}>Time</Text></View><Text style={styles.infoValue}>{protocol.time_of_day}</Text></View>
        <View style={styles.infoRow}><View style={styles.infoLeft}><View style={styles.iconCircle}><Text>📆</Text></View><Text style={styles.infoLabel}>Start Date</Text></View><Text style={styles.infoValue}>{protocol.start_date ?? '—'}</Text></View>

        <Text style={styles.sectionLabel}>RECENT LOGS</Text>
        {recentLogs.length === 0 ? (
          <Text style={styles.emptyLogs}>No doses logged yet</Text>
        ) : (
          recentLogs.map((log) => (
            <View key={log.id} style={styles.logRow}>
              <Text style={styles.logDate}>{log.logged_at.slice(0, 10)}</Text>
              <Text style={styles.logAmount}>{log.amount} {log.unit}</Text>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable style={styles.primaryButton} onPress={() => router.push('/log/dose')}>
          <Text style={styles.primaryButtonText}>Log Dose</Text>
        </Pressable>

        <Pressable
          style={styles.ghostButton}
          onPress={() => router.push({ pathname: '/protocol/edit', params: { protocolId: protocol.id } })}
        >
          <Text style={styles.ghostButtonText}>Edit</Text>
        </Pressable>

        <Pressable
          style={styles.ghostButton}
          onPress={isActive ? handleMarkComplete : handleReactivate}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={Colors.text} />
          ) : (
            <Text style={styles.ghostButtonText}>{isActive ? 'Mark Complete' : 'Reactivate'}</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 120 },
  notFoundWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  empty: { color: Colors.text, fontSize: 16 },
  backLink: { color: Colors.accent, fontWeight: '600' },
  heroCard: { margin: 16, backgroundColor: Colors.accent, borderRadius: 16, padding: 18 },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroLeft: { flex: 1, paddingRight: 8 },
  heroTitle: { color: 'white', fontSize: 20, fontWeight: '700' },
  heroDose: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 },
  statusPill: { alignSelf: 'flex-start', borderRadius: 999, marginTop: 10, paddingHorizontal: 10, paddingVertical: 5 },
  statusActivePill: { backgroundColor: Colors.accentLight },
  statusCompletedPill: { backgroundColor: '#F3F4F6' },
  statusPillText: { fontSize: 12, fontWeight: '700' },
  statusActiveText: { color: Colors.accent },
  statusCompletedText: { color: '#6B7280' },
  ringWrap: { alignItems: 'center' },
  ringText: { marginTop: 6, color: 'white', fontSize: 12, fontWeight: '700' },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: Colors.textSecondary,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  infoLeft: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  infoLabel: { marginLeft: 12, fontSize: 14, color: Colors.text },
  infoValue: { fontSize: 14, fontWeight: '600', color: Colors.text },
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  logDate: { color: Colors.text, fontSize: 14 },
  logAmount: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  emptyLogs: { textAlign: 'center', color: Colors.textSecondary, paddingVertical: 16 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: 16,
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: { color: 'white', fontWeight: '700' },
  ghostButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostButtonText: { color: Colors.text, fontWeight: '600' },
});
