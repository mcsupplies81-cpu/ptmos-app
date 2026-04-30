import React, { useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, Text, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useDoseLogStore } from '@/stores/doseLogStore';
import { useAuthStore } from '@/stores/authStore';
import Colors from '@/constants/Colors';

export default function DoseLogScreen() {
  const router = useRouter();
  const { addDoseLog } = useDoseLogStore();
  const { user } = useAuthStore();
  const [peptideName, setPeptideName] = useState('');
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    await addDoseLog({
      protocol_id: null,
      peptide_name: peptideName.trim() || null,
      amount: Number(amount) || 0,
      unit: 'mg',
      logged_at: new Date().toISOString(),
      injection_site: null,
      notes: null,
      mood: null,
    }, user.id);
    setSaving(false);
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingHorizontal: 16, backgroundColor: Colors.background }}>
      <Text style={{ fontSize: 20, fontWeight: '700', marginVertical: 16, color: Colors.text }}>
        Log a Dose
      </Text>
      <Text style={{ color: Colors.textSecondary }}>Peptide Name</Text>
      <TextInput
        value={peptideName}
        onChangeText={setPeptideName}
        style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 10, marginBottom: 16, color: Colors.text }}
      />
      <Text style={{ color: Colors.textSecondary }}>Amount (mg)</Text>
      <TextInput
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 10, marginBottom: 24, color: Colors.text }}
      />
      <Pressable
        onPress={handleSave}
        disabled={saving}
        style={{ backgroundColor: Colors.accent, borderRadius: 10, padding: 14, alignItems: 'center' }}
      >
        {saving ? <ActivityIndicator color={Colors.white} /> : <Text style={{ color: Colors.white, fontWeight: '600' }}>Save Log</Text>}
      </Pressable>
    </SafeAreaView>
  );
}
