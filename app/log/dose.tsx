import React, { useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
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
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const injectionSites = ['Abdomen L', 'Abdomen R', 'Thigh L', 'Thigh R', 'Glute L', 'Glute R', 'Arm L', 'Arm R', 'Other'];
  const moodOptions = ['😞', '😕', '😐', '🙂', '😄'];

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    await addDoseLog({
      protocol_id: null,
      peptide_name: peptideName.trim() || null,
      amount: Number(amount) || 0,
      unit: 'mg',
      logged_at: new Date().toISOString(),
      injection_site: selectedSite ?? null,
      notes: notes.trim() || null,
      mood: selectedMood ?? null,
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
      <Text style={{ fontSize: 14, color: Colors.textSecondary, marginBottom: 6 }}>Injection Site</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {injectionSites.map((site) => {
            const selected = selectedSite === site;
            return (
              <Pressable
                key={site}
                onPress={() => setSelectedSite(site)}
                style={{ backgroundColor: selected ? Colors.accent : Colors.card, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 }}
              >
                <Text style={{ color: selected ? Colors.white : Colors.text }}>{site}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <Text style={{ fontSize: 14, color: Colors.textSecondary, marginBottom: 6 }}>Mood</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {moodOptions.map((mood, index) => {
          const selected = selectedMood === mood;
          return (
            <Pressable
              key={mood}
              onPress={() => setSelectedMood(mood)}
              accessibilityLabel={`Mood ${index + 1}`}
              style={{ padding: 8, borderRadius: 999, backgroundColor: selected ? Colors.accent : 'transparent' }}
            >
              <Text style={{ fontSize: 24 }}>{mood}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={{ fontSize: 14, color: Colors.textSecondary, marginBottom: 6 }}>Notes</Text>
      <TextInput
        value={notes}
        onChangeText={setNotes}
        multiline
        placeholder="Notes (optional)"
        placeholderTextColor={Colors.textSecondary}
        style={{
          borderWidth: 1,
          borderColor: Colors.border,
          borderRadius: 8,
          padding: 10,
          minHeight: 90,
          textAlignVertical: 'top',
          marginBottom: 24,
          color: Colors.text,
        }}
      />
      <Pressable
        onPress={handleSave}
        disabled={saving}
        style={{ backgroundColor: Colors.accent, borderRadius: 10, padding: 14, alignItems: 'center' }}
      >
        {saving ? <ActivityIndicator color={Colors.white} /> : <Text style={{ color: Colors.white, fontWeight: '600' }}>Save Dose</Text>}
      </Pressable>
    </SafeAreaView>
  );
}
