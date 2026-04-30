import React, { useState } from 'react';
import { Pressable, SafeAreaView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useProtocolStore } from '../../stores/protocolStore';

export default function CreateProtocolScreen() {
  const router = useRouter();
  const { upsertProtocol } = useProtocolStore();
  const [name, setName] = useState('');
  const [doseAmount, setDoseAmount] = useState('');

  return (
    <SafeAreaView style={{ flex: 1, paddingHorizontal: 16 }}>
      <Text>Name</Text>
      <TextInput value={name} onChangeText={setName} style={{ borderWidth: 1, marginBottom: 12 }} />
      <Text>Dose Amount</Text>
      <TextInput value={doseAmount} onChangeText={setDoseAmount} keyboardType="decimal-pad" style={{ borderWidth: 1 }} />
      <Pressable
        onPress={() => {
          if (!name) return;
          upsertProtocol({
            id: String(Date.now()),
            name,
            dose_amount: Number(doseAmount || 0),
            dose_unit: 'mg',
            frequency: 'Daily',
            days_of_week: [],
            time_of_day: '09:00',
            start_date: new Date().toISOString().slice(0, 10),
            end_date: null,
            notes: null,
            status: 'active',
          });
          router.back();
        }}
      >
        <Text>Save</Text>
      </Pressable>
    </SafeAreaView>
  );
}
