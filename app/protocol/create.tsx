import React, { useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useProtocolStore } from '@/stores/protocolStore';
import { useAuthStore } from '@/stores/authStore';
import Colors from '@/constants/Colors';
import ScreenHeader from '@/components/ScreenHeader';

const DOSE_UNITS = ['mcg', 'mg', 'IU', 'mL'] as const;
const FREQUENCY_OPTIONS = ['Daily', 'Every Other Day', '3x/week', 'Weekly'] as const;

export default function CreateProtocolScreen() {
  const router = useRouter();
  const { upsertProtocol } = useProtocolStore();
  const { user } = useAuthStore();
  const [name, setName] = useState('');
  const [doseAmount, setDoseAmount] = useState('');
  const [doseUnit, setDoseUnit] = useState<(typeof DOSE_UNITS)[number]>('mg');
  const [frequency, setFrequency] = useState<(typeof FREQUENCY_OPTIONS)[number]>('Daily');
  const [timeOfDay, setTimeOfDay] = useState('09:00');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !user?.id) return;
    setSaving(true);
    await upsertProtocol({
      name: name.trim(),
      dose_amount: Number(doseAmount) || 0,
      dose_unit: doseUnit,
      frequency: frequency as unknown as 'Daily' | 'Weekly' | 'Specific Days',
      days_of_week: [],
      time_of_day: timeOfDay.trim() || '09:00',
      start_date: new Date().toISOString().slice(0, 10),
      end_date: null,
      notes: notes.trim() || null,
      status: 'active',
    }, user.id);
    setSaving(false);
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScreenHeader title="Create Protocol" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 28 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginVertical: 16, color: Colors.text }}>Create Protocol</Text>

        <Text style={{ color: Colors.textSecondary }}>Name</Text>
        <TextInput value={name} onChangeText={setName} style={inputStyle} />

        <Text style={{ color: Colors.textSecondary }}>Dose Amount</Text>
        <TextInput value={doseAmount} onChangeText={setDoseAmount} keyboardType="decimal-pad" style={inputStyle} />

        <Text style={{ color: Colors.textSecondary, marginBottom: 8 }}>Dose Unit</Text>
        <View style={chipRow}>
          {DOSE_UNITS.map((option) => <Chip key={option} label={option} selected={doseUnit === option} onPress={() => setDoseUnit(option)} />)}
        </View>

        <Text style={{ color: Colors.textSecondary, marginBottom: 8 }}>Frequency</Text>
        <View style={chipRow}>
          {FREQUENCY_OPTIONS.map((option) => <Chip key={option} label={option} selected={frequency === option} onPress={() => setFrequency(option)} />)}
        </View>

        <Text style={{ color: Colors.textSecondary }}>Time of Day (HH:MM)</Text>
        <TextInput value={timeOfDay} onChangeText={setTimeOfDay} placeholder="09:00" placeholderTextColor={Colors.muted} style={inputStyle} />

        <Text style={{ color: Colors.textSecondary }}>Notes</Text>
        <TextInput value={notes} onChangeText={setNotes} multiline style={[inputStyle, { minHeight: 100, textAlignVertical: 'top' }]} />

        <Pressable onPress={handleSave} disabled={saving || !name.trim()} style={buttonStyle}>
          {saving ? <ActivityIndicator color={Colors.white} /> : <Text style={{ color: Colors.white, fontWeight: '700' }}>Create Protocol</Text>}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderWidth: 1,
        borderColor: selected ? Colors.accent : Colors.border,
        backgroundColor: selected ? Colors.accentLight : Colors.card,
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 8,
      }}
    >
      <Text style={{ color: Colors.text }}>{label}</Text>
    </Pressable>
  );
}

const inputStyle = {
  borderWidth: 1,
  borderColor: Colors.border,
  borderRadius: 8,
  padding: 10,
  marginBottom: 16,
  color: Colors.text,
} as const;

const chipRow = { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 } as const;
const buttonStyle = { backgroundColor: Colors.accent, borderRadius: 10, padding: 14, alignItems: 'center' } as const;
