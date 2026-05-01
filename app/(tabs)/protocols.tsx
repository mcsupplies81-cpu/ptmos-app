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
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 14 }}>
        <Text style={{ fontSize: 28, fontWeight: '800', color: Colors.text }}>Protocols</Text>
        <Pressable
          onPress={() => router.push('/protocol/create')}
          style={{ backgroundColor: Colors.accent, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 }}
        >
          <Text style={{ color: Colors.white, fontWeight: '700' }}>+ New</Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
        {(['Active', 'Completed', 'All'] as const).map((tab) => {
          const isSelected = filter === tab;
          return (
            <Pressable
              key={tab}
              onPress={() => setFilter(tab)}
              style={{
                backgroundColor: isSelected ? Colors.accent : Colors.card,
                borderRadius: 999,
                borderWidth: isSelected ? 0 : 1,
                borderColor: Colors.border,
                paddingHorizontal: 14,
                paddingVertical: 8,
              }}
            >
              <Text
                style={{
                  color: isSelected ? Colors.white : Colors.textSecondary,
                  fontWeight: isSelected ? '600' : '500',
                }}
              >
                {tab}
              </Text>
            </Pressable>
          );
        })}
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
              <View
                style={{
                  backgroundColor: Colors.card,
                  borderRadius: 14,
                  padding: 14,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: Colors.accentLight,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: Colors.accent, fontWeight: '700', fontSize: 17 }}>
                    {item.name?.[0]?.toUpperCase() ?? '?'}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ color: Colors.text, fontWeight: '700', fontSize: 15 }}>{item.name}</Text>
                  <Text style={{ color: Colors.textSecondary, fontSize: 13 }}>
                    {item.dose_amount} {item.dose_unit} · {item.frequency}
                  </Text>
                  <Text style={{ color: Colors.textSecondary, fontSize: 12 }}>{item.time_of_day}</Text>
                </View>

                <View style={{ minWidth: 68, alignItems: 'flex-end' }}>
                  <Text style={{ color: adherenceColor, fontWeight: '700', fontSize: 14 }}>{pct}%</Text>
                  <View style={{ width: '100%', height: 3, borderRadius: 2, backgroundColor: Colors.border, marginTop: 6 }}>
                    <View
                      style={{
                        width: `${Math.min(pct, 100)}%`,
                        height: 3,
                        borderRadius: 2,
                        backgroundColor: adherenceColor,
                      }}
                    />
                  </View>
                  <Text style={{ color: Colors.textSecondary, marginTop: 6 }}>›</Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
