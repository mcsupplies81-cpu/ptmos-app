import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, SafeAreaView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useAuthStore } from '@/stores/authStore';
import { useDoseLogStore } from '@/stores/doseLogStore';
import { calcAdherence, useProtocolStore } from '@/stores/protocolStore';

type Filter = 'Active' | 'Completed' | 'All';

export default function ProtocolsScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const protocols = useProtocolStore((state) => state.protocols);
  const doseLogs = useDoseLogStore((state) => state.doseLogs);
  const fetchDoseLogs = useDoseLogStore((state) => state.fetchDoseLogs);
  const [filter, setFilter] = useState<Filter>('Active');

  useEffect(() => {
    if (user?.id) {
      fetchDoseLogs(user.id);
    }
  }, [fetchDoseLogs, user?.id]);

  const filtered = useMemo(() => {
    if (filter === 'All') return protocols;
    if (filter === 'Active') return protocols.filter((p) => p.status === 'active' || p.status === 'paused');
    return protocols.filter((p) => p.status === 'completed');
  }, [filter, protocols]);

  return (
    <SafeAreaView style={{ flex: 1, paddingHorizontal: 16, backgroundColor: Colors.background }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 12 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['Active', 'Completed', 'All'] as const).map((tab) => (
            <Pressable key={tab} onPress={() => setFilter(tab)}>
              <Text style={{ color: Colors.text }}>{tab}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable onPress={() => router.push('/protocol/create')}><Text style={{ color: Colors.text }}>+</Text></Pressable>
      </View>
      {filtered.length === 0 ? (
        <Text style={{ color: Colors.textSecondary }}>No protocols yet. Tap + to add your first one.</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const pct = calcAdherence(item, doseLogs);
            const adherenceColor = pct >= 80 ? Colors.success : pct >= 50 ? Colors.warning : Colors.error;

            return (
              <Pressable
                onPress={() => router.push(`/log/protocol-detail?protocolId=${item.id}`)}
                style={{ borderRadius: 12, padding: 12, backgroundColor: Colors.card, marginBottom: 8 }}
              >
                <Text style={{ color: Colors.text }}>{item.name}</Text>
                <Text style={{ color: Colors.textSecondary }}>{item.dose_amount} {item.dose_unit} • {item.frequency}</Text>
                <Text style={{ color: Colors.textSecondary }}>{item.status}</Text>
                <Text style={{ color: Colors.textSecondary }}>Next dose: {item.time_of_day}</Text>
                <Text style={{ fontSize: 12, color: adherenceColor }}>{pct}% adherence</Text>
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
