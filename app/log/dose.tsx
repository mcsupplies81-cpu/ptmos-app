import React, { useState } from 'react';
import { Pressable, SafeAreaView, Text, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useDoseLogStore } from '../../stores/doseLogStore';

export default function DoseLogScreen() {
  const router = useRouter();
  const { addDoseLog } = useDoseLogStore();
  const [peptideName, setPeptideName] = useState('');
  const [amount, setAmount] = useState('');

  return (
    <SafeAreaView style={{ flex: 1, paddingHorizontal: 16 }}>
      <Text>Peptide Name</Text>
      <TextInput value={peptideName} onChangeText={setPeptideName} style={{ borderWidth: 1 }} />
      <Text>Amount</Text>
      <TextInput value={amount} onChangeText={setAmount} keyboardType="decimal-pad" style={{ borderWidth: 1 }} />
      <Pressable onPress={() => {
        addDoseLog({
          id: String(Date.now()),
          protocol_id: null,
          peptide_name: peptideName || null,
          amount: Number(amount || 0),
          unit: 'mg',
          logged_at: new Date().toISOString(),
          injection_site: null,
          notes: null,
          mood: null,
        });
        router.back();
      }}>
        <Text>Save</Text>
      </Pressable>
    </SafeAreaView>
  );
}
