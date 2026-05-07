import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';

import Colors from '@/constants/Colors';
import { useAuthStore } from '@/stores/authStore';
import { useProfileStore } from '@/stores/profileStore';

const GOAL_OPTIONS = ['Performance', 'Recovery', 'Longevity'] as const;
type GoalOption = (typeof GOAL_OPTIONS)[number];

const FT_OPTIONS = Array.from({ length: 5 }, (_, i) => i + 4); // 4–8 ft
const IN_OPTIONS = Array.from({ length: 12 }, (_, i) => i);   // 0–11 in

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { upsertProfile } = useProfileStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState<Date | null>(null);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [feet, setFeet] = useState<number | null>(null);
  const [inches, setInches] = useState<number | null>(null);
  const [showHeightPicker, setShowHeightPicker] = useState(false);
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState<GoalOption>('Performance');
  const [saving, setSaving] = useState(false);

  const dobLabel = dob
    ? dob.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Select date';

  const heightLabel =
    feet !== null ? `${feet}′ ${inches ?? 0}″` : 'Select height';

  const heightInches =
    feet !== null ? feet * 12 + (inches ?? 0) : null;

  const onSave = async () => {
    if (!user?.id || !firstName.trim() || saving) return;
    setSaving(true);
    const payload = {
      full_name: `${firstName.trim()} ${lastName.trim()}`.trim() || null,
      date_of_birth: dob ? dob.toISOString().slice(0, 10) : null,
      height_inches: heightInches,
      weight_lbs: weight.trim() ? Number(weight) : null,
      goal,
      disclaimer_accepted: true,
      onboarding_complete: true,
    };
    try {
      await upsertProfile(user.id, payload);
      router.replace('/(tabs)');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header with back button */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 }}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={{ marginRight: 12 }}>
            <Text style={{ fontSize: 17, color: Colors.accent }}>‹ Back</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontSize: 28, fontWeight: '800', color: Colors.text }}>Set Up Profile</Text>
          <Text style={{ fontSize: 15, color: Colors.textSecondary, marginTop: 6, marginBottom: 28 }}>
            Tell us a bit about yourself
          </Text>

          {/* Name */}
          <View style={cardStyle}>
            <Row label="First Name" border>
              <TextInput value={firstName} onChangeText={setFirstName} style={inputStyle} placeholder="Required" placeholderTextColor={Colors.textSecondary} />
            </Row>
            <Row label="Last Name" isLast>
              <TextInput value={lastName} onChangeText={setLastName} style={inputStyle} placeholder="Optional" placeholderTextColor={Colors.textSecondary} />
            </Row>
          </View>

          {/* Body stats */}
          <View style={cardStyle}>
            {/* Date of Birth */}
            <Row label="Date of Birth" border>
              <Pressable onPress={() => setShowDobPicker(true)}>
                <Text style={{ color: dob ? Colors.text : Colors.textSecondary, fontSize: 15 }}>{dobLabel}</Text>
              </Pressable>
            </Row>

            {/* Height */}
            <Row label="Height" border>
              <Pressable onPress={() => setShowHeightPicker(true)}>
                <Text style={{ color: feet !== null ? Colors.text : Colors.textSecondary, fontSize: 15 }}>{heightLabel}</Text>
              </Pressable>
            </Row>

            {/* Weight */}
            <Row label="Weight" isLast>
              <TextInput
                value={weight}
                onChangeText={setWeight}
                placeholder="185"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="decimal-pad"
                style={inputStyle}
              />
              <Text style={{ color: Colors.textSecondary, marginLeft: 8 }}>lbs</Text>
            </Row>
          </View>

          {/* Goal */}
          <Text style={{ color: Colors.textSecondary, fontSize: 12, fontWeight: '700', marginTop: 8, marginBottom: 8 }}>GOAL</Text>
          <View style={[cardStyle, { padding: 16 }]}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {GOAL_OPTIONS.map((option) => {
                const selected = goal === option;
                return (
                  <Pressable
                    key={option}
                    onPress={() => setGoal(option)}
                    style={{
                      flex: 1,
                      borderRadius: 10,
                      paddingHorizontal: 8,
                      paddingVertical: 10,
                      backgroundColor: selected ? Colors.accent : Colors.card,
                      borderWidth: selected ? 0 : 1,
                      borderColor: Colors.border,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: selected ? Colors.white : Colors.textSecondary, fontWeight: '600', fontSize: 13 }}>{option}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Pressable
            onPress={onSave}
            disabled={!firstName.trim() || saving}
            style={{
              height: 52,
              borderRadius: 16,
              backgroundColor: Colors.accent,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 16,
              opacity: !firstName.trim() || saving ? 0.5 : 1,
            }}
          >
            <Text style={{ color: Colors.white, fontWeight: '700', fontSize: 16 }}>Complete Setup</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* DOB Picker Modal */}
      {showDobPicker && (
        <Modal transparent animationType="slide">
          <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={() => setShowDobPicker(false)} />
          <View style={pickerSheetStyle}>
            <View style={pickerHeaderStyle}>
              <Pressable onPress={() => setShowDobPicker(false)}>
                <Text style={{ color: Colors.accent, fontWeight: '600', fontSize: 16 }}>Done</Text>
              </Pressable>
            </View>
            <DateTimePicker
              value={dob ?? new Date(2000, 0, 1)}
              mode="date"
              display="spinner"
              maximumDate={new Date()}
              onChange={(_, date) => { if (date) setDob(date); }}
              textColor={Colors.text}
              style={{ backgroundColor: Colors.card }}
            />
          </View>
        </Modal>
      )}

      {/* Height Picker Modal */}
      {showHeightPicker && (
        <Modal transparent animationType="slide">
          <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={() => setShowHeightPicker(false)} />
          <View style={pickerSheetStyle}>
            <View style={pickerHeaderStyle}>
              <Text style={{ color: Colors.text, fontWeight: '700', fontSize: 16 }}>Select Height</Text>
              <Pressable onPress={() => setShowHeightPicker(false)}>
                <Text style={{ color: Colors.accent, fontWeight: '600', fontSize: 16 }}>Done</Text>
              </Pressable>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'center', paddingVertical: 16, gap: 24 }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: Colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 8 }}>FT</Text>
                <ScrollView style={{ height: 180 }} showsVerticalScrollIndicator={false}>
                  {FT_OPTIONS.map((f) => (
                    <Pressable
                      key={f}
                      onPress={() => setFeet(f)}
                      style={{
                        paddingVertical: 12,
                        paddingHorizontal: 24,
                        borderRadius: 10,
                        backgroundColor: feet === f ? Colors.accent : 'transparent',
                        marginBottom: 4,
                      }}
                    >
                      <Text style={{ color: feet === f ? Colors.white : Colors.text, fontSize: 20, fontWeight: '600' }}>{f}′</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: Colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 8 }}>IN</Text>
                <ScrollView style={{ height: 180 }} showsVerticalScrollIndicator={false}>
                  {IN_OPTIONS.map((i) => (
                    <Pressable
                      key={i}
                      onPress={() => setInches(i)}
                      style={{
                        paddingVertical: 12,
                        paddingHorizontal: 24,
                        borderRadius: 10,
                        backgroundColor: inches === i ? Colors.accent : 'transparent',
                        marginBottom: 4,
                      }}
                    >
                      <Text style={{ color: inches === i ? Colors.white : Colors.text, fontSize: 20, fontWeight: '600' }}>{i}″</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

function Row({ label, children, border, isLast }: { label: string; children: React.ReactNode; border?: boolean; isLast?: boolean }) {
  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', borderBottomWidth: isLast ? 0 : border ? 1 : 0, borderBottomColor: Colors.border }}>
      <Text style={{ color: Colors.text }}>{label}</Text>
      <View style={{ flex: 1, alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'flex-end' }}>{children}</View>
    </View>
  );
}

const cardStyle = { backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, marginBottom: 12 } as const;
const inputStyle = { flex: 1, color: Colors.text, textAlign: 'right' as const, borderWidth: 0, padding: 0, marginLeft: 12, fontSize: 15 };
const pickerSheetStyle = { backgroundColor: Colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 40 };
const pickerHeaderStyle = { flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border };
