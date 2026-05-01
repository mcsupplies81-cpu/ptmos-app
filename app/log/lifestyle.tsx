import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Colors from '@/constants/Colors';
import { useLifestyleStore } from '@/stores/lifestyleStore';
import { useAuthStore } from '@/stores/authStore';
import ScreenHeader from '@/components/ScreenHeader';

const TODAY_LABEL_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
};

export default function LifestyleScreen() {
  const user = useAuthStore((state) => state.user);
  const logs = useLifestyleStore((state) => state.logs);
  const upsertLog = useLifestyleStore((state) => state.upsertLog);

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
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

  useEffect(() => {
    setWeightLbs(todayLog?.weight_lbs?.toString() ?? '');
    setWaterOz(todayLog?.water_oz?.toString() ?? '');
    setCalories(todayLog?.calories?.toString() ?? '');
    setProteinG(todayLog?.protein_g?.toString() ?? '');
    setSleepHours(todayLog?.sleep_hours?.toString() ?? '');
    setSteps(todayLog?.steps?.toString() ?? '');
    setWorkoutNotes(todayLog?.workout_notes ?? '');
    setNotes(todayLog?.meal_notes ?? '');
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
          mood: todayLog?.mood ?? null,
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
    <View style={styles.container}>
      <ScreenHeader title="Lifestyle" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.dateHeader}>
          <Text style={styles.todayTitle}>Today</Text>
          <Text style={styles.todaySubtitle}>{new Date().toLocaleDateString('en-US', TODAY_LABEL_FORMAT)}</Text>
        </View>

        {[
          { icon: '⚖️', label: 'Weight', unit: 'lbs', value: weightLbs, setter: setWeightLbs, kb: 'decimal-pad' as const },
          { icon: '💧', label: 'Water', unit: 'oz', value: waterOz, setter: setWaterOz, kb: 'decimal-pad' as const },
          { icon: '🔥', label: 'Calories', unit: 'kcal', value: calories, setter: setCalories, kb: 'decimal-pad' as const },
          { icon: '🥩', label: 'Protein', unit: 'g', value: proteinG, setter: setProteinG, kb: 'decimal-pad' as const },
          { icon: '🦶', label: 'Steps', unit: 'steps', value: steps, setter: setSteps, kb: 'number-pad' as const },
          { icon: '😴', label: 'Sleep', unit: 'hrs', value: sleepHours, setter: setSleepHours, kb: 'decimal-pad' as const },
        ].map((metric) => (
          <View key={metric.label} style={styles.metricRow}>
            <View style={styles.metricLeft}>
              <View style={styles.iconCircle}>
                <Text style={styles.metricEmoji}>{metric.icon}</Text>
              </View>
              <Text style={styles.metricLabel}>{metric.label}</Text>
            </View>
            <View style={styles.metricRight}>
              <TextInput
                value={metric.value}
                onChangeText={metric.setter}
                keyboardType={metric.kb}
                placeholder="—"
                placeholderTextColor={Colors.textSecondary}
                style={styles.metricInput}
              />
              <Text style={styles.metricUnit}>{metric.unit}</Text>
            </View>
          </View>
        ))}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Workout</Text>
          <TextInput
            value={workoutNotes}
            onChangeText={setWorkoutNotes}
            multiline
            placeholder="Upper body, cardio, rest day..."
            placeholderTextColor={Colors.textSecondary}
            style={styles.notesInput}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            multiline
            placeholder="Feeling strong today..."
            placeholderTextColor={Colors.textSecondary}
            style={styles.notesInput}
          />
        </View>

        <Pressable style={[styles.saveButton, saving && styles.saveButtonDisabled]} onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.saveButtonText}>{saved ? 'Saved ✓' : 'Save'}</Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 60 },
  dateHeader: { padding: 20, paddingBottom: 8 },
  todayTitle: { fontSize: 28, fontWeight: '800', color: Colors.text },
  todaySubtitle: { marginTop: 2, fontSize: 14, color: Colors.textSecondary },
  metricRow: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  metricLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricEmoji: { fontSize: 18 },
  metricLabel: { fontSize: 15, color: Colors.text },
  metricRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metricInput: {
    minWidth: 80,
    textAlign: 'right',
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  metricUnit: { fontSize: 13, color: Colors.textSecondary },
  section: { padding: 16, paddingTop: 0 },
  sectionTitle: {
    marginBottom: 8,
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  notesInput: {
    minHeight: 72,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    backgroundColor: Colors.card,
    color: Colors.text,
    textAlignVertical: 'top',
  },
  saveButton: {
    margin: 16,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: { opacity: 0.85 },
  saveButtonText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
});
