import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useProtocolStore } from '@/stores/protocolStore';
import { useAuthStore } from '@/stores/authStore';
import Colors from '@/constants/Colors';
import ScreenHeader from '@/components/ScreenHeader';

const DOSE_UNITS = ['mcg', 'mg', 'IU', 'mL'] as const;
const FREQUENCY_OPTIONS = ['Daily', 'Weekly', 'Specific Days'] as const;

export default function EditProtocolScreen() {
  const { protocolId } = useLocalSearchParams<{ protocolId: string }>();
  const user = useAuthStore((state) => state.user);
  const protocols = useProtocolStore((state) => state.protocols);
  const upsertProtocol = useProtocolStore((state) => state.upsertProtocol);

  const protocol = useMemo(() => protocols.find((p) => p.id === protocolId), [protocolId, protocols]);

  const [name, setName] = useState(protocol?.name ?? '');
  const [doseAmount, setDoseAmount] = useState(String(protocol?.dose_amount ?? ''));
  const [doseUnit, setDoseUnit] = useState<(typeof DOSE_UNITS)[number]>(protocol?.dose_unit ?? 'mg');
  const [frequency, setFrequency] = useState<(typeof FREQUENCY_OPTIONS)[number]>(protocol?.frequency ?? 'Daily');
  const [timeOfDay, setTimeOfDay] = useState(protocol?.time_of_day ?? '09:00');
  const [notes, setNotes] = useState(protocol?.notes ?? '');
  const [status, setStatus] = useState(protocol?.status ?? 'active');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!protocol || !name.trim() || !user?.id) return;
    setSaving(true);
    await upsertProtocol({
      ...protocol,
      name,
      dose_amount: Number(doseAmount),
      dose_unit: doseUnit,
      frequency,
      time_of_day: timeOfDay,
      notes: notes || null,
      status,
    }, user.id);
    setSaving(false);
    router.back();
  };

  if (!protocol) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
        <ScreenHeader title="Edit Protocol" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 }}>
          <Text style={{ color: Colors.text, fontSize: 16 }}>Protocol not found</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={{ color: Colors.accent, fontWeight: '600' }}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScreenHeader title="Edit Protocol" />
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
            <Text style={{ color: Colors.white, fontSize: 16, fontWeight: '700' }}>{saving ? 'Saving...' : 'Save Changes'}</Text>
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
