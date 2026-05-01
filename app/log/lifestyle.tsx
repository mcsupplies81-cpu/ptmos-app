import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';
import { useLifestyleStore } from '@/stores/lifestyleStore';
import { useAuthStore } from '@/stores/authStore';
import ScreenHeader from '@/components/ScreenHeader';

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

export default function LifestyleScreen() {
  const user = useAuthStore((state) => state.user);
  const upsertLog = useLifestyleStore((state) => state.upsertLog);

  const [date, setDate] = useState(todayDate());
  const [steps, setSteps] = useState('');
  const [sleepHours, setSleepHours] = useState('');
  const [weightLbs, setWeightLbs] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user?.id) return;

    try {
      setSaving(true);
      await upsertLog(
        {
          date,
          steps: Number(steps) || null,
          sleep_hours: Number(sleepHours) || null,
          weight_lbs: Number(weightLbs) || null,
          workout_notes: notes.trim() || null,
          water_oz: null,
          calories: null,
          protein_g: null,
          mood: null,
          energy: null,
          meal_notes: null,
        },
        user.id,
      );
      router.back();
    } catch {
      Alert.alert('Could not save', 'Please check your values and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Lifestyle Log" />
      <Text style={styles.title}>Lifestyle Log</Text>

      <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
      <TextInput
        value={date}
        onChangeText={setDate}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={Colors.muted}
        style={styles.input}
        autoCapitalize="none"
      />

      <Text style={styles.label}>Steps</Text>
      <TextInput
        value={steps}
        onChangeText={setSteps}
        keyboardType="number-pad"
        placeholder="e.g. 10000"
        placeholderTextColor={Colors.muted}
        style={styles.input}
      />

      <Text style={styles.label}>Sleep Hours</Text>
      <TextInput
        value={sleepHours}
        onChangeText={setSleepHours}
        keyboardType="decimal-pad"
        placeholder="e.g. 7.5"
        placeholderTextColor={Colors.muted}
        style={styles.input}
      />

      <Text style={styles.label}>Weight (lbs)</Text>
      <TextInput
        value={weightLbs}
        onChangeText={setWeightLbs}
        keyboardType="decimal-pad"
        placeholder="e.g. 175.2"
        placeholderTextColor={Colors.muted}
        style={styles.input}
      />

      <Text style={styles.label}>Notes</Text>
      <TextInput
        value={notes}
        onChangeText={setNotes}
        multiline
        placeholder="Any additional notes"
        placeholderTextColor={Colors.muted}
        style={[styles.input, styles.notes]}
      />

      <Pressable style={styles.saveButton} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color={Colors.background} /> : <Text style={styles.saveText}>Save</Text>}
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginVertical: 16,
    color: Colors.text,
  },
  label: {
    color: Colors.text,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    color: Colors.text,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  notes: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  saveButton: {
    marginTop: 8,
    backgroundColor: '#2D6A4F',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveText: {
    color: Colors.background,
    fontWeight: '700',
  },
});
