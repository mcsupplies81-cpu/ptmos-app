import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, SafeAreaView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useProtocolStore } from '../../stores/protocolStore';

type Filter = 'Active' | 'Completed' | 'All';

export default function ProtocolsScreen() {
  const router = useRouter();
  const { protocols } = useProtocolStore();
  const [filter, setFilter] = useState<Filter>('Active');

  const filtered = useMemo(() => {
    if (filter === 'All') return protocols;
    if (filter === 'Active') return protocols.filter((p) => p.status === 'active' || p.status === 'paused');
    return protocols.filter((p) => p.status === 'completed');
  }, [filter, protocols]);

  return (
    <SafeAreaView style={{ flex: 1, paddingHorizontal: 16, backgroundColor: '#FFFFFF' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 12 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['Active', 'Completed', 'All'] as const).map((tab) => (
            <Pressable key={tab} onPress={() => setFilter(tab)}>
              <Text>{tab}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable onPress={() => router.push('/protocol/create')}><Text>+</Text></Pressable>
      </View>
      {filtered.length === 0 ? (
        <Text>No protocols yet. Tap + to add your first one.</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={{ borderRadius: 12, padding: 12, backgroundColor: '#F2F3F5', marginBottom: 8 }}>
              <Text>{item.name}</Text>
              <Text>{item.dose_amount} {item.dose_unit} • {item.frequency}</Text>
              <Text>{item.status}</Text>
              <Text>Next dose: {item.time_of_day}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
