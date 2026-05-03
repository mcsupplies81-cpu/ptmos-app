import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Colors from '@/constants/Colors';
import ScreenHeader from '@/components/ScreenHeader';
import { useLifestyleStore } from '@/stores/lifestyleStore';
import { useAuthStore } from '@/stores/authStore';

const TODAY_LABEL_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
};

const METRICS = [
  { key: 'weight_lbs', emoji: '⚖️', label: 'Weight', unit: 'lbs', keyboard: 'decimal-pad' as const, placeholder: '0' },
  { key: 'sleep_hours', emoji: '😴', label: 'Sleep', unit: 'hrs', keyboard: 'decimal-pad' as const, placeholder: '0' },
  { key: 'steps', emoji: '🦶', label: 'Steps', unit: 'steps', keyboard: 'number-pad' as const, placeholder: '0' },
  { key: 'water_oz', emoji: '💧', label: 'Water', unit: 'oz', keyboard: 'decimal-pad' as const, placeholder: '0' },
  { key: 'calories', emoji: '🔥', label: 'Calories', unit: 'kcal', keyboard: 'number-pad' as const, placeholder: '0' },
  { key: 'protein_g', emoji: '🥩', label: 'Protein', unit: 'g', keyboard: 'decimal-pad' as const, placeholder: '0' },
];

const MOOD_EMOJI: Record<number, string> = {
  1: '😞',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😁',
};

export default function LifestyleScreen() {
  const user = useAuthStore((state) => state.user);
  const logs = useLifestyleStore((state) => state.logs);
  const upsertLog = useLifestyleStore((state) => state.upsertLog);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayLog = logs.find((l) => l.date === todayStr);

  const [weightLbs, setWeightLbs] = useState('');
  const [waterOz, setWaterOz] = useState('');
  const [calories, setCalories] = useState('');
  const [proteinG, setProteinG] = useState('');
  const [sleepHours, setSleepHours] = useState('');
  const [steps, setSteps] = useState('');
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mood, setMood] = useState<number | null>(null);

  useEffect(() => {
    setWeightLbs(todayLog?.weight_lbs?.toString() ?? '');
    setWaterOz(todayLog?.water_oz?.toString() ?? '');
    setCalories(todayLog?.calories?.toString() ?? '');
    setProteinG(todayLog?.protein_g?.toString() ?? '');
    setSleepHours(todayLog?.sleep_hours?.toString() ?? '');
    setSteps(todayLog?.steps?.toString() ?? '');
    setWorkoutNotes(todayLog?.workout_notes ?? '');
    setNotes(todayLog?.meal_notes ?? '');
    setMood(todayLog?.mood ?? null);
  }, [todayLog]);

  const handleSave = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      await upsertLog(
        {
          date: todayStr,
          weight_lbs: Number(weightLbs) || null,
          water_oz: Number(waterOz) || null,
          calories: Number(calories) || null,
          protein_g: Number(proteinG) || null,
          sleep_hours: Number(sleepHours) || null,
          steps: Number(steps) || null,
          workout_notes: workoutNotes.trim() || null,
          mood,
          energy: todayLog?.energy ?? null,
          meal_notes: notes.trim() || null,
        },
        user.id,
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 900);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Lifestyle Log" />
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          <View style={styles.dateHeader}>
            <Text style={styles.metaLabel}>TODAY</Text>
            <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', TODAY_LABEL_FORMAT)}</Text>
          </View>

          {METRICS.map((metric) => {
            const metricState = {
              weight_lbs: [weightLbs, setWeightLbs],
              sleep_hours: [sleepHours, setSleepHours],
              steps: [steps, setSteps],
              water_oz: [waterOz, setWaterOz],
              calories: [calories, setCalories],
              protein_g: [proteinG, setProteinG],
            }[metric.key] as [string, (value: string) => void];

            return (
              <View key={metric.key} style={styles.metricCard}>
                <View style={styles.emojiCircle}>
                  <Text style={styles.emoji}>{metric.emoji}</Text>
                </View>
                <View style={styles.metricMiddle}>
                  <Text style={styles.metricLabel}>{metric.label}</Text>
                  <Text style={styles.metricUnit}>{metric.unit}</Text>
                </View>
                <TextInput
                  value={metricState[0]}
                  onChangeText={metricState[1]}
                  keyboardType={metric.keyboard}
                  placeholder={metric.placeholder}
                  placeholderTextColor={Colors.textSecondary}
                  style={styles.metricInput}
                />
              </View>
            );
          })}

          <View style={styles.section}>
            <Text style={styles.metaLabel}>WORKOUT / NOTES</Text>
            <TextInput
              value={`${workoutNotes}${workoutNotes && notes ? '\n' : ''}${notes}`}
              onChangeText={(text) => {
                const [workout = '', ...rest] = text.split('\n');
                setWorkoutNotes(workout);
                setNotes(rest.join('\n'));
              }}
              multiline
              placeholder="Workout, meals, notes..."
              placeholderTextColor={Colors.textSecondary}
              style={styles.notesInput}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.metaLabel}>MOOD</Text>
            <View style={styles.moodRow}>
              {[1, 2, 3, 4, 5].map((value) => {
                const selected = mood === value;
                return (
                  <Pressable
                    key={value}
                    onPress={() => setMood(value)}
                    style={[styles.moodChip, selected && styles.moodChipSelected]}
                  >
                    <Text style={styles.moodEmoji}>{MOOD_EMOJI[value]}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Pressable style={[styles.saveButton, saving && styles.saveButtonDisabled]} onPress={handleSave} disabled={saving}>
            <Text style={styles.saveButtonText}>{saving ? 'Saving...' : saved ? 'Saved ✓' : "Save Today's Log"}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  keyboard: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  dateHeader: { marginBottom: 20 },
  metaLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  dateText: { fontSize: 22, fontWeight: '800', color: Colors.text, marginTop: 2 },
  metricCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  emojiCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: { fontSize: 20 },
  metricMiddle: { flex: 1 },
  metricLabel: { fontSize: 15, fontWeight: '600', color: Colors.text },
  metricUnit: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  metricInput: {
    width: 80,
    textAlign: 'right',
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    borderBottomWidth: 1.5,
    borderColor: Colors.border,
    paddingBottom: 2,
  },
  section: { marginTop: 4 },
  notesInput: {
    minHeight: 80,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    color: Colors.text,
    textAlignVertical: 'top',
    fontSize: 15,
  },
  moodRow: { flexDirection: 'row', gap: 10 },
  moodChip: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  moodChipSelected: {
    backgroundColor: Colors.accentLight,
    borderColor: Colors.accent,
    borderRadius: 999,
  },
  moodEmoji: { fontSize: 22 },
  saveButton: {
    marginTop: 20,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: { opacity: 0.8 },
  saveButtonText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});
