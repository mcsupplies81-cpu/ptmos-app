import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Colors from '@/constants/Colors';
import { useDoseLogStore } from '@/stores/doseLogStore';
import { calcAdherence, useProtocolStore } from '@/stores/protocolStore';
import { useAuthStore } from '@/stores/authStore';

export default function ProtocolDetailScreen() {
  const { protocolId } = useLocalSearchParams<{ protocolId?: string }>();
  const user = useAuthStore((state) => state.user);
  const protocols = useProtocolStore((state) => state.protocols);
  const upsertProtocol = useProtocolStore((state) => state.upsertProtocol);
  const doseLogs = useDoseLogStore((state) => state.doseLogs);
  const [saving, setSaving] = useState(false);

  const protocol = useMemo(() => protocols.find((item) => item.id === protocolId), [protocolId, protocols]);

  const recentLogs = useMemo(
    () => doseLogs.filter((log) => log.protocol_id === protocolId).slice(0, 7),
    [doseLogs, protocolId],
  );

  if (!protocol) {
    return (
      <SafeAreaView style={styles.container}>
        <Pressable onPress={() => router.back()}><Text style={styles.back}>← Back</Text></Pressable>
        <Text style={styles.empty}>Protocol not found.</Text>
      </SafeAreaView>
    );
  }

  const adherence = calcAdherence(protocol, doseLogs);
  const isActive = protocol.status === 'active';

  const handleMarkComplete = async () => {
    if (!user?.id) return;
    try {
      setSaving(true);
      await upsertProtocol({ ...protocol, status: 'completed' }, user.id);
      Alert.alert('Updated', 'Protocol marked as completed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.back()}><Text style={styles.back}>← Back</Text></Pressable>

        <Text style={styles.title}>{protocol.name}</Text>

        <View style={styles.row}><Text style={styles.key}>Peptide</Text><Text style={styles.value}>{protocol.name}</Text></View>
        <View style={styles.row}><Text style={styles.key}>Dose</Text><Text style={styles.value}>{protocol.dose_amount} {protocol.dose_unit}</Text></View>
        <View style={styles.row}><Text style={styles.key}>Frequency</Text><Text style={styles.value}>{protocol.frequency}</Text></View>
        <View style={styles.row}><Text style={styles.key}>Time of day</Text><Text style={styles.value}>{protocol.time_of_day}</Text></View>
        <View style={styles.row}>
          <Text style={styles.key}>Status</Text>
          <View style={[styles.badge, { backgroundColor: isActive ? '#2D6A4F' : '#9CA3AF' }]}>
            <Text style={styles.badgeText}>{isActive ? 'Active' : 'Completed'}</Text>
          </View>
        </View>

        <Text style={styles.adherence}>{adherence}% adherence</Text>

        <Text style={styles.section}>Last 7 dose logs</Text>
        {recentLogs.length === 0 ? (
          <Text style={styles.muted}>No logged doses for this protocol yet.</Text>
        ) : (
          recentLogs.map((log) => (
            <View key={log.id} style={styles.logRow}>
              <Text style={styles.value}>{log.logged_at.slice(0, 10)}</Text>
              <Text style={styles.value}>{log.amount} {log.unit}</Text>
            </View>
          ))
        )}

        {isActive ? (
          <Pressable style={styles.completeButton} onPress={handleMarkComplete} disabled={saving}>
            {saving ? <ActivityIndicator color={Colors.background} /> : <Text style={styles.completeText}>Mark Complete</Text>}
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 32 },
  back: { color: '#2D6A4F', fontWeight: '600', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.text, marginBottom: 16 },
  row: { marginBottom: 10 },
  key: { color: Colors.muted, marginBottom: 2 },
  value: { color: Colors.text, fontWeight: '600' },
  badge: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
  adherence: { marginTop: 8, marginBottom: 16, color: Colors.text, fontWeight: '700' },
  section: { color: Colors.text, fontWeight: '700', marginBottom: 8 },
  muted: { color: Colors.muted },
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    backgroundColor: Colors.card,
  },
  completeButton: {
    marginTop: 16,
    backgroundColor: '#2D6A4F',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  completeText: { color: '#FFFFFF', fontWeight: '700' },
  empty: { color: Colors.text, marginTop: 12 },
});
