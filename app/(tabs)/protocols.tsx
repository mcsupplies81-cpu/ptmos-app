import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import Colors from '@/constants/Colors';
import { useAuthStore } from '@/stores/authStore';
import { useDoseLogStore } from '@/stores/doseLogStore';
import { calcAdherence, useProtocolStore } from '@/stores/protocolStore';

type Filter = 'Active' | 'Completed' | 'All';

export default function ProtocolsScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const protocols = useProtocolStore((state) => state.protocols);
  const fetchProtocols = useProtocolStore((state) => state.fetchProtocols);
  const doseLogs = useDoseLogStore((state) => state.doseLogs);
  const fetchDoseLogs = useDoseLogStore((state) => state.fetchDoseLogs);
  const [filter, setFilter] = useState<Filter>('Active');

  useEffect(() => {
    if (user?.id) {
      fetchProtocols(user.id);
      fetchDoseLogs(user.id);
    }
  }, [fetchDoseLogs, fetchProtocols, user?.id]);

  const filtered = useMemo(() => {
    if (filter === 'All') return protocols;
    if (filter === 'Active') return protocols.filter((p) => p.status === 'active');
    return protocols.filter((p) => p.status === 'completed');
  }, [filter, protocols]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Protocols</Text>
          <Pressable style={styles.newBtn} onPress={() => router.push('/protocol/create')}><Text style={styles.newText}>＋ New</Text></Pressable>
        </View>

        <View style={styles.tabs}>
          {(['Active', 'Completed', 'All'] as const).map((tab) => {
            const selected = filter === tab;
            return (
              <Pressable key={tab} style={[styles.badge, { backgroundColor: selected ? Colors.accent : Colors.card }]} onPress={() => setFilter(tab)}>
                <Text style={[styles.badgeText, { color: selected ? Colors.white : Colors.textSecondary }]}>{tab}</Text>
              </Pressable>
            );
          })}
        </View>

        {filtered.map((item) => {
          const adherence = calcAdherence(item, doseLogs);
          const adherenceColor = adherence >= 80 ? Colors.success : adherence >= 50 ? Colors.warning : Colors.error;
          return (
            <Pressable key={item.id} style={styles.card} onPress={() => router.push(`/log/protocol-detail?protocolId=${item.id}` as any)}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSub}>{item.dose_amount} {item.dose_unit} · {item.frequency}</Text>
                <Text style={styles.cardSub}>{item.time_of_day}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.adherence, { color: adherenceColor }]}>{adherence}%</Text>
                <Text style={styles.chev}>›</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.backgroundSecondary },
  container: { padding: 16, paddingBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.text },
  newBtn: { backgroundColor: Colors.accent, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  newText: { color: Colors.white, fontWeight: '600' },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 13, fontWeight: '600' },
  card: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.accentLight, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: '700', color: Colors.white },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  cardSub: { fontSize: 13, color: Colors.textSecondary },
  adherence: { fontSize: 15, fontWeight: '700' },
  chev: { fontSize: 20, color: Colors.textSecondary },
});
