import React, { useMemo, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useProtocolStore } from '@/stores/protocolStore';
import { useAuthStore } from '@/stores/authStore';
import Colors from '@/constants/Colors';
import ScreenHeader from '@/components/ScreenHeader';
import { COMPOUNDS, searchCompounds, type Compound } from '@/constants/compounds';

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
  const [compoundQuery, setCompoundQuery] = useState('');
  const [selectedCompound, setSelectedCompound] = useState<Compound | null>(null);
  const [showCompoundPicker, setShowCompoundPicker] = useState(false);

  const compoundResults = useMemo(() => searchCompounds(compoundQuery).slice(0, 10), [compoundQuery]);

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
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScreenHeader title="New Protocol" />
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 28 }} keyboardShouldPersistTaps="handled">
          <Text style={labelStyle}>COMPOUND</Text>
          {selectedCompound ? (
            <View style={{ marginBottom: 10 }}>
              <View style={{
                alignSelf: 'flex-start',
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#1F8A5A',
                borderRadius: 999,
                paddingVertical: 8,
                paddingHorizontal: 12,
                gap: 8,
              }}>
                <Text style={{ color: Colors.white, fontWeight: '700' }}>{selectedCompound.name}</Text>
                <Pressable
                  onPress={() => {
                    setSelectedCompound(null);
                    setShowCompoundPicker(true);
                    setCompoundQuery(name);
                  }}
                >
                  <Text style={{ color: Colors.white, fontSize: 16, lineHeight: 16 }}>×</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={{ marginBottom: 16 }}>
              <TextInput
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  setCompoundQuery(text);
                  setShowCompoundPicker(true);
                }}
                onFocus={() => {
                  setShowCompoundPicker(true);
                  setCompoundQuery(name);
                }}
                placeholder="Search compounds"
                placeholderTextColor={Colors.muted}
                returnKeyType="next"
                style={inputStyle}
              />
              {showCompoundPicker && (
                <View style={{ maxHeight: 180, marginTop: 8, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, overflow: 'hidden', backgroundColor: Colors.card }}>
                  <FlatList
                    keyboardShouldPersistTaps="handled"
                    data={[...compoundResults, { id: 'custom-compound', name: 'Custom compound', aliases: [], category: 'other', summary: '' } as Compound]}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <Pressable
                        onPress={() => {
                          if (item.id === 'custom-compound') {
                            setSelectedCompound(null);
                            setShowCompoundPicker(false);
                            return;
                          }
                          setSelectedCompound(item);
                          setName(item.name);
                          setCompoundQuery(item.name);
                          setShowCompoundPicker(false);
                        }}
                        style={{ paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border }}
                      >
                        <Text style={{ color: Colors.text, fontWeight: '600' }}>{item.name}</Text>
                        {item.id !== 'custom-compound' && <Text style={{ color: Colors.textSecondary, fontSize: 12 }}>{item.category}</Text>}
                      </Pressable>
                    )}
                  />
                </View>
              )}
            </View>
          )}

          {selectedCompound && (
            <View style={{ marginBottom: 16, backgroundColor: Colors.card, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, padding: 12 }}>
              <Text style={{ color: Colors.text, marginBottom: 6 }}>{selectedCompound.summary}</Text>
              <Text style={{ color: Colors.textSecondary, fontSize: 12 }}>This is educational information only.</Text>
            </View>
          )}

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
