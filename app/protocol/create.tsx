import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useProtocolStore } from '@/stores/protocolStore';
import { useAuthStore } from '@/stores/authStore';
import Colors from '@/constants/Colors';
import ScreenHeader from '@/components/ScreenHeader';

const DOSE_UNITS = ['mcg', 'mg', 'IU', 'mL'] as const;
const FREQUENCY_OPTIONS = ['Daily', 'Weekly', 'Specific Days'] as const;

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
      frequency: frequency as 'Daily' | 'Weekly' | 'Specific Days',
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
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScreenHeader title="New Protocol" />
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 28 }} keyboardShouldPersistTaps="handled">
          <Text style={labelStyle}>PEPTIDE NAME</Text>
          <TextInput value={name} onChangeText={setName} returnKeyType="next" style={[inputStyle, { marginBottom: 16 }]} />

          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16, alignItems: 'flex-end' }}>
            <View style={{ flex: 1 }}>
              <Text style={labelStyle}>DOSE AMOUNT</Text>
              <TextInput value={doseAmount} onChangeText={setDoseAmount} keyboardType="decimal-pad" style={inputStyle} />
            </View>
            <View>
              <Text style={labelStyle}>UNIT</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {DOSE_UNITS.map((option) => (
                  <Chip key={option} label={option} selected={doseUnit === option} onPress={() => setDoseUnit(option)} />
                ))}
              </View>
            </View>
          </View>

          <Text style={labelStyle}>FREQUENCY</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {FREQUENCY_OPTIONS.map((option) => (
              <Chip key={option} label={option} selected={frequency === option} onPress={() => setFrequency(option)} />
            ))}
          </View>

          <Text style={labelStyle}>TIME OF DAY</Text>
          <TextInput value={timeOfDay} onChangeText={setTimeOfDay} placeholder="09:00" placeholderTextColor={Colors.muted} style={[inputStyle, { marginBottom: 16 }]} />

          <Text style={labelStyle}>NOTES (OPTIONAL)</Text>
          <TextInput value={notes} onChangeText={setNotes} multiline style={[inputStyle, { minHeight: 72, textAlignVertical: 'top' }]} />

          <Pressable
            onPress={handleSave}
            disabled={!name.trim() || saving}
            style={[buttonStyle, (!name.trim() || saving) && { opacity: 0.4 }]}
          >
            <Text style={{ color: Colors.white, fontSize: 16, fontWeight: '700' }}>{saving ? 'Saving...' : 'Save Protocol'}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        backgroundColor: selected ? Colors.accent : Colors.card,
        borderColor: selected ? Colors.accent : Colors.border,
      }}
    >
      <Text style={{ color: selected ? Colors.white : Colors.textSecondary }}>{label}</Text>
    </Pressable>
  );
}

const labelStyle = {
  fontSize: 12,
  fontWeight: '600',
  color: Colors.textSecondary,
  marginBottom: 6,
  letterSpacing: 0.5,
} as const;

const inputStyle = {
  borderWidth: 1,
  borderColor: Colors.border,
  backgroundColor: Colors.card,
  color: Colors.text,
  borderRadius: 10,
  padding: 12,
  fontSize: 15,
} as const;

const buttonStyle = {
  width: '100%',
  backgroundColor: Colors.accent,
  borderRadius: 12,
  height: 52,
  marginTop: 16,
  marginBottom: 8,
  alignItems: 'center',
  justifyContent: 'center',
} as const;
