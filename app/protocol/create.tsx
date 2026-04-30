import React, { useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, Text, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useProtocolStore } from '@/stores/protocolStore';
import { useAuthStore } from '@/stores/authStore';
import Colors from '@/constants/Colors';

export default function CreateProtocolScreen() {
  const router = useRouter();
  const { upsertProtocol } = useProtocolStore();
  const { user } = useAuthStore();
  const [name, setName] = useState('');
  const [doseAmount, setDoseAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !user?.id) return;
    setSaving(true);
    await upsertProtocol({
      name: name.trim(),
      dose_amount: Number(doseAmount) || 0,
      dose_unit: 'mg',
      frequency: 'Daily',
      days_of_week: [],
      time_of_day: '09:00',
      start_date: new Date().toISOString().slice(0, 10),
      end_date: null,
      notes: null,
      status: 'active',
    }, user.id);
    setSaving(false);
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingHorizontal: 16, backgroundColor: Colors.background }}>
      <Text style={{ fontSize: 20, fontWeight: '700', marginVertical: 16, color: Colors.text }}>
        New Protocol
      </Text>
      <Text style={{ color: Colors.textSecondary }}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 10, marginBottom: 16, color: Colors.text }}
      />
      <Text style={{ color: Colors.textSecondary }}>Dose Amount (mg)</Text>
      <TextInput
        value={doseAmount}
        onChangeText={setDoseAmount}
        keyboardType="decimal-pad"
        style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 10, marginBottom: 24, color: Colors.text }}
      />
      <Pressable
        onPress={handleSave}
        disabled={saving || !name.trim()}
        style={{ backgroundColor: Colors.accent, borderRadius: 10, padding: 14, alignItems: 'center' }}
      >
        {saving ? <ActivityIndicator color={Colors.white} /> : <Text style={{ color: Colors.white, fontWeight: '600' }}>Save Protocol</Text>}
      </Pressable>
    </SafeAreaView>
  );
}
