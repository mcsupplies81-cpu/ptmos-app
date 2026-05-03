import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useAuthStore } from '@/stores/authStore';
import { useProfileStore } from '@/stores/profileStore';
import { supabase } from '@/lib/supabase';

const GOALS = ['Performance', 'Recovery', 'Anti-aging', 'General Wellness'] as const;

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { fetchProfile } = useProfileStore();
  const defaultName = useMemo(() => {
    const metadata = user?.user_metadata as { full_name?: string; name?: string } | undefined;
    return metadata?.full_name ?? metadata?.name ?? '';
  }, [user?.user_metadata]);

  const [fullName, setFullName] = useState(defaultName);
  const [dob, setDob] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [weightLbs, setWeightLbs] = useState('');
  const [goal, setGoal] = useState<(typeof GOALS)[number]>('General Wellness');
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    await supabase.from('profiles').upsert({
      id: user.id,
      full_name: fullName.trim() || null,
      date_of_birth: dob.trim() || null,
      height_inches: Number(heightInches) || null,
      weight_lbs: Number(weightLbs) || null,
      goal,
      onboarding_complete: true,
    });
    await fetchProfile(user.id);
    setSaving(false);
    router.replace('/(tabs)/');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontSize: 28, fontWeight: '800', color: Colors.text }}>Set Up Your Profile</Text>
          <Text style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 4, marginBottom: 24 }}>
            This helps us personalize your experience.
          </Text>

          <Text style={labelStyle}>FULL NAME</Text>
          <TextInput value={fullName} onChangeText={setFullName} style={inputStyle} />

          <Text style={labelStyle}>DATE OF BIRTH</Text>
          <TextInput value={dob} onChangeText={setDob} placeholder="YYYY-MM-DD" placeholderTextColor={Colors.muted} style={inputStyle} />

          <Text style={labelStyle}>HEIGHT</Text>
          <TextInput value={heightInches} onChangeText={setHeightInches} placeholder="inches" placeholderTextColor={Colors.muted} keyboardType="number-pad" style={inputStyle} />

          <Text style={labelStyle}>WEIGHT</Text>
          <TextInput value={weightLbs} onChangeText={setWeightLbs} placeholder="lbs" placeholderTextColor={Colors.muted} keyboardType="number-pad" style={inputStyle} />

          <Text style={[labelStyle, { marginBottom: 8 }]}>GOAL</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
            {GOALS.map((option) => {
              const selected = goal === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => setGoal(option)}
                  style={{
                    borderRadius: 999,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderWidth: 1,
                    backgroundColor: selected ? Colors.accent : Colors.card,
                    borderColor: selected ? Colors.accent : Colors.border,
                  }}
                >
                  <Text style={{ color: selected ? Colors.white : Colors.textSecondary, fontWeight: selected ? '700' : '500' }}>{option}</Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable onPress={onSave} disabled={saving} style={[primaryButton, saving && { opacity: 0.6 }]}>
            <Text style={{ color: Colors.white, fontSize: 16, fontWeight: '700' }}>Save & Continue</Text>
          </Pressable>
          <Pressable onPress={() => router.replace('/(tabs)/')} style={{ alignItems: 'center', marginTop: 14 }}>
            <Text style={{ color: Colors.textSecondary, fontSize: 13 }}>Skip for now</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  marginBottom: 16,
  fontSize: 15,
} as const;

const primaryButton = {
  backgroundColor: Colors.accent,
  borderRadius: 12,
  height: 52,
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 8,
} as const;
