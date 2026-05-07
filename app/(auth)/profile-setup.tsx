import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import Colors from '@/constants/Colors';
import { useAuthStore } from '@/stores/authStore';
import { useProfileStore } from '@/stores/profileStore';

const GOAL_OPTIONS = ['Performance', 'Recovery', 'Longevity'] as const;

type GoalOption = (typeof GOAL_OPTIONS)[number];

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { upsertProfile } = useProfileStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState<GoalOption>('Performance');
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    if (!user?.id || !firstName.trim() || saving) {
      return;
    }

    setSaving(true);

    const payload = {
      full_name: `${firstName.trim()} ${lastName.trim()}`.trim() || null,
      date_of_birth: dateOfBirth.trim() || null,
      height_inches: height.trim() ? Number(height) : null,
      weight_lbs: weight.trim() ? Number(weight) : null,
      goal,
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
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontSize: 28, fontWeight: '800', color: Colors.text }}>Set Up Profile</Text>
          <Text style={{ fontSize: 15, color: Colors.textSecondary, marginTop: 6, marginBottom: 28 }}>
            Tell us a bit about yourself
          </Text>

          <View style={cardStyle}>
            <Row label="First Name" isLast>
              <TextInput value={firstName} onChangeText={setFirstName} style={inputStyle} />
            </Row>
          </View>

          <View style={cardStyle}>
            <Row label="Last Name" border>
              <TextInput value={lastName} onChangeText={setLastName} style={inputStyle} />
            </Row>
            <Row label="Date of Birth" border>
              <TextInput
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.textSecondary}
                style={inputStyle}
              />
            </Row>
            <Row label="Height" border>
              <TextInput
                value={height}
                onChangeText={setHeight}
                placeholder="70"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="decimal-pad"
                style={inputStyle}
              />
              <Text style={{ color: Colors.textSecondary, marginLeft: 8 }}>in</Text>
            </Row>
            <Row label="Weight" isLast>
              <TextInput
                value={weight}
                onChangeText={setWeight}
                placeholder="165"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="decimal-pad"
                style={inputStyle}
              />
              <Text style={{ color: Colors.textSecondary, marginLeft: 8 }}>lbs</Text>
            </Row>
          </View>

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
                      borderRadius: 10,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      backgroundColor: selected ? Colors.accent : Colors.card,
                      borderWidth: selected ? 0 : 1,
                      borderColor: Colors.border,
                    }}
                  >
                    <Text style={{ color: selected ? Colors.white : Colors.textSecondary, fontWeight: '600' }}>{option}</Text>
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
    </SafeAreaView>
  );
}

function Row({
  label,
  children,
  border,
  isLast,
}: {
  label: string;
  children: React.ReactNode;
  border?: boolean;
  isLast?: boolean;
}) {
  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: isLast ? 0 : border ? 1 : 0,
        borderBottomColor: Colors.border,
      }}
    >
      <Text style={{ color: Colors.text }}>{label}</Text>
      <View style={{ flex: 1, alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'flex-end' }}>{children}</View>
    </View>
  );
}

const cardStyle = {
  backgroundColor: Colors.card,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: Colors.border,
  marginBottom: 12,
} as const;

const inputStyle = {
  flex: 1,
  color: Colors.text,
  textAlign: 'right',
  borderWidth: 0,
  padding: 0,
  marginLeft: 12,
} as const;
