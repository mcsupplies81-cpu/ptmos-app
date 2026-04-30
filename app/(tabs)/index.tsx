import { useEffect, useMemo } from 'react';
import { router } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Copy } from '@/constants/Copy';
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

  const recentDoses = [...doseLogs]
    .sort((a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime())
    .slice(0, 3);

  const activeProtocols = protocols.filter((protocol) => protocol.status === 'active');
  const nextProtocol = useMemo(() => {
    if (activeProtocols.length === 0) return null;

    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const withDelta = activeProtocols
      .map((protocol) => {
        const [hour, minute] = protocol.time_of_day.split(':').map(Number);
        const protocolMinutes = hour * 60 + minute;
        const delta = protocolMinutes >= nowMinutes
          ? protocolMinutes - nowMinutes
          : 1440 - nowMinutes + protocolMinutes;
        return { protocol, delta };
      })
      .sort((a, b) => a.delta - b.delta);

    return withDelta[0]?.protocol ?? null;
  }, [activeProtocols]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.greeting}>
          {greeting}, {profile?.full_name ?? 'there'}
        </Text>

        <View style={styles.row}>
          <Text style={styles.sectionHeader}>NEXT DOSE</Text>
          {nextProtocol ? (
            <View>
              <Text style={styles.rowTitle}>{nextProtocol.name}</Text>
              <Text style={styles.rowDetail}>
                {nextProtocol.dose_amount} {nextProtocol.dose_unit} · {nextProtocol.time_of_day}
              </Text>
            </View>
          ) : (
            <Text style={styles.emptyText}>No active protocols</Text>
          )}
        </View>

        <Text style={styles.sectionHeader}>TODAY'S DOSES</Text>
        {recentDoses.length === 0 ? (
          <Text style={styles.emptyText}>No doses logged today</Text>
        ) : (
          recentDoses.map((dose) => (
            <View key={dose.id} style={styles.row}>
              <Text style={styles.rowTitle}>{dose.peptide_name || 'Unnamed'}</Text>
              <Text style={styles.rowDetail}>
                {dose.amount} {dose.unit} • {new Date(dose.logged_at).toLocaleTimeString()}
              </Text>
            </View>
          ))
        )}

        <Text style={styles.sectionHeader}>ACTIVE PROTOCOLS</Text>
        <Text style={styles.rowTitle}>{activeProtocols.length} active protocol(s)</Text>
        {activeProtocols.length === 0 ? (
          <Text style={styles.emptyText}>No active protocols. Tap + on Protocols to add one.</Text>
        ) : null}

        <Text style={styles.sectionHeader}>QUICK ACTIONS</Text>
        <View style={styles.quickActionsRow}>
          <Pressable style={styles.quickActionButton} onPress={() => router.push('/log/dose')}>
            <Text style={styles.quickActionText}>Log Dose</Text>
          </Pressable>
          <Pressable
            style={styles.quickActionButton}
            onPress={() => router.push('/log/calculator')}
          >
            <Text style={styles.quickActionText}>Calculator</Text>
          </Pressable>
          <Pressable
            style={styles.quickActionButton}
            onPress={() => router.push('/more/inventory')}
          >
            <Text style={styles.quickActionText}>Inventory</Text>
          </Pressable>
          <Pressable
            style={styles.quickActionButton}
            onPress={() => router.push('/log/symptoms')}
          >
            <Text style={styles.quickActionText}>Symptoms</Text>
          </Pressable>
        </View>

        <Text style={styles.disclaimer}>{Copy.disclaimerShort}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { padding: 16, paddingBottom: 24 },
  greeting: { color: Colors.text, fontSize: 22, fontWeight: '700' },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 20,
  },
  row: {
    backgroundColor: Colors.card,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  rowTitle: { color: Colors.text, fontWeight: '600' },
  rowDetail: { color: Colors.textSecondary, marginTop: 4 },
  emptyText: { color: Colors.textSecondary },
  quickActionsRow: { flexDirection: 'row', marginHorizontal: -4 },
  quickActionButton: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    margin: 4,
  },
  quickActionText: { color: Colors.text, fontWeight: '600', fontSize: 12 },
  disclaimer: { color: Colors.textSecondary, fontSize: 12, marginTop: 20 },
});
