import React, { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
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
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
        <Text style={{ fontSize: 28, fontWeight: '700', color: Colors.text, marginBottom: 8 }}>Tell us about yourself</Text>
        <Text style={{ fontSize: 15, color: Colors.textSecondary, marginBottom: 20 }}>This helps personalize your experience</Text>

        <Text style={{ color: Colors.textSecondary, marginBottom: 6 }}>Full Name</Text>
        <TextInput value={fullName} onChangeText={setFullName} style={inputStyle} />

        <Text style={{ color: Colors.textSecondary, marginBottom: 6 }}>Date of Birth (YYYY-MM-DD)</Text>
        <TextInput value={dob} onChangeText={setDob} placeholder="1990-01-31" placeholderTextColor={Colors.muted} style={inputStyle} />

        <Text style={{ color: Colors.textSecondary, marginBottom: 6 }}>Height in inches</Text>
        <TextInput value={heightInches} onChangeText={setHeightInches} keyboardType="number-pad" style={inputStyle} />

        <Text style={{ color: Colors.textSecondary, marginBottom: 6 }}>Weight in lbs</Text>
        <TextInput value={weightLbs} onChangeText={setWeightLbs} keyboardType="number-pad" style={inputStyle} />

        <Text style={{ color: Colors.textSecondary, marginBottom: 8 }}>Goal</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {GOALS.map((option) => {
            const selected = goal === option;
            return (
              <Pressable
                key={option}
                onPress={() => setGoal(option)}
                style={{
                  borderWidth: 1,
                  borderColor: selected ? Colors.accent : Colors.border,
                  backgroundColor: selected ? Colors.accentLight : Colors.card,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 999,
                }}
              >
                <Text style={{ color: Colors.text }}>{option}</Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable onPress={onSave} disabled={saving} style={primaryButton}>
          <Text style={{ color: Colors.white, fontWeight: '700' }}>{saving ? 'Saving...' : 'Save & Continue'}</Text>
        </Pressable>
        <Pressable onPress={() => router.replace('/(tabs)/')} style={{ alignItems: 'center', marginTop: 14 }}>
          <Text style={{ color: Colors.textSecondary, fontWeight: '600' }}>Back</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const inputStyle = {
  borderWidth: 1,
  borderColor: Colors.border,
  borderRadius: 10,
  padding: 12,
  marginBottom: 16,
  color: Colors.text,
} as const;

const primaryButton = {
  backgroundColor: Colors.accent,
  borderRadius: 10,
  padding: 14,
  alignItems: 'center',
} as const;
