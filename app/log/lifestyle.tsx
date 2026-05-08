import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
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
import { router } from 'expo-router';
import Colors from '@/constants/Colors';
import ScreenHeader from '@/components/ScreenHeader';
import { useLifestyleStore } from '@/stores/lifestyleStore';
import { useAuthStore } from '@/stores/authStore';
import { useDoseLogStore } from '@/stores/doseLogStore';
import * as Haptics from 'expo-haptics';

const METRICS = [
  { key: 'weight_lbs', emoji: '⚖️', label: 'Weight', unit: 'lbs', keyboard: 'decimal-pad' as const, placeholder: '0' },
  { key: 'sleep_hours', emoji: '😴', label: 'Sleep', unit: 'hrs', keyboard: 'decimal-pad' as const, placeholder: '0' },
  { key: 'steps', emoji: '🦶', label: 'Steps', unit: 'steps', keyboard: 'number-pad' as const, placeholder: '0' },
  { key: 'water_oz', emoji: '💧', label: 'Water', unit: 'oz', keyboard: 'decimal-pad' as const, placeholder: '0' },
  { key: 'calories', emoji: '🔥', label: 'Calories', unit: 'kcal', keyboard: 'number-pad' as const, placeholder: '0' },
  { key: 'protein_g', emoji: '🥩', label: 'Protein', unit: 'g', keyboard: 'decimal-pad' as const, placeholder: '0' },
];

const MOOD_EMOJI: Record<number, string> = { 1: '😞', 2: '😕', 3: '😐', 4: '🙂', 5: '😁' };
const MOOD_LABELS: Record<number, string> = { 1: 'Bad', 2: 'Not Great', 3: 'Okay', 4: 'Good', 5: 'Great' };

const dateKey = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export default function LifestyleScreen() {
  const user = useAuthStore((state) => state.user);
  const logs = useLifestyleStore((state) => state.logs);
  const upsertLog = useLifestyleStore((state) => state.upsertLog);
  const fetchLogs = useLifestyleStore((state) => state.fetchLogs);
  const doseLogs = useDoseLogStore((state) => state.doseLogs);

  const today = new Date();
  const todayStr = dateKey(today);
  const [selectedDate, setSelectedDate] = useState(today);
  const [isEditing, setIsEditing] = useState(false);
  const [focusedMetric, setFocusedMetric] = useState<string | null>(null);

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
  const [energy, setEnergy] = useState<number | null>(null);

  const selectedDateKey = dateKey(selectedDate);
  const selectedLog = useMemo(() => logs.find((l) => l.date === selectedDateKey), [logs, selectedDateKey]);
  const isViewingToday = selectedDateKey === todayStr;

  useEffect(() => {
    if (!user?.id) return;

    void fetchLogs(user.id).catch((error: Error) => {
      Alert.alert('Error', error.message);
    });
  }, [fetchLogs, user?.id]);

  useEffect(() => {
    const log = selectedLog;
    setWeightLbs(log?.weight_lbs?.toString() ?? '');
    setWaterOz(log?.water_oz?.toString() ?? '');
    setCalories(log?.calories?.toString() ?? '');
    setProteinG(log?.protein_g?.toString() ?? '');
    setSleepHours(log?.sleep_hours?.toString() ?? '');
    setSteps(log?.steps?.toString() ?? '');
    setWorkoutNotes(log?.workout_notes ?? '');
    setNotes(log?.meal_notes ?? '');
    setMood(log?.mood ?? null);
    setEnergy(log?.energy ?? null);
  }, [selectedLog]);

  const formatTime = (logDate: string) => {
    if (logDate !== todayStr) return '';
    return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const handleSave = async () => {
    if (!user?.id || !isViewingToday) return;
    setSaving(true);
    try {
      await upsertLog(
        {
          date: selectedDateKey,
          weight_lbs: Number(weightLbs) || null,
          water_oz: Number(waterOz) || null,
          calories: Number(calories) || null,
          protein_g: Number(proteinG) || null,
          sleep_hours: Number(sleepHours) || null,
          steps: Number(steps) || null,
          workout_notes: workoutNotes.trim() || null,
          mood,
          energy,
          meal_notes: notes.trim() || null,
        },
        user.id,
      );
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const summaryRows = [
    { key: 'weight', emoji: '⚖️', label: 'Weight', value: selectedLog?.weight_lbs ? `${selectedLog.weight_lbs} lbs` : '—' },
    { key: 'water', emoji: '💧', label: 'Water', value: selectedLog?.water_oz ? `${selectedLog.water_oz} oz` : '—', route: '/log/water' },
    { key: 'sleep', emoji: '😴', label: 'Sleep', value: selectedLog?.sleep_hours ? `${selectedLog.sleep_hours} hr` : '—', route: '/log/sleep' },
    {
      key: 'workout',
      emoji: '🏃',
      label: 'Workout',
      value: selectedLog?.workout_type
        ? `${selectedLog.workout_type}${selectedLog.workout_duration_min ? ` • ${selectedLog.workout_duration_min} min` : ''}`
        : selectedLog?.workout_notes || '—',
      route: '/log/workout',
    },
    {
      key: 'mood',
      emoji: '😊',
      label: 'Mood',
      value: selectedLog?.mood ? `${MOOD_EMOJI[selectedLog.mood]} ${MOOD_LABELS[selectedLog.mood]}` : '—',
    },
    { key: 'energy', emoji: '⚡', label: 'Energy', value: selectedLog?.energy ? `${selectedLog.energy}/10` : '—' },
  ];

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const day = new Date(today);
      day.setDate(today.getDate() - (6 - i));
      const key = dateKey(day);
      const hasDose = doseLogs.some((d) => d.logged_at.startsWith(key));
      const hasLifestyle = logs.some((l) => l.date === key);
      return { label: day.toLocaleDateString('en-US', { weekday: 'narrow' }), hasDose, hasLifestyle };
    });
  }, [doseLogs, logs, today]);

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Lifestyle" rightLabel={isViewingToday ? (isEditing ? 'Done' : 'Edit') : undefined} onRightPress={isViewingToday ? () => setIsEditing((v) => !v) : undefined} />
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          <View style={styles.dateNav}>
            <Pressable onPress={() => setSelectedDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1))}>
              <Text style={styles.arrow}>{'<'}</Text>
            </Pressable>
            <Text style={styles.dateTitle}>{isViewingToday ? 'Today' : selectedDate.toLocaleDateString('en-US', { weekday: 'short' })}, {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
            <Pressable
              disabled={isViewingToday}
              onPress={() => setSelectedDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1))}
              style={!isViewingToday ? undefined : { opacity: 0.35 }}
            >
              <Text style={styles.arrow}>{'>'}</Text>
            </Pressable>
          </View>

          <Text style={styles.sectionHeader}>TODAY'S LOG</Text>
          <View style={styles.card}>
            {summaryRows.map((row) => (
              <Pressable
                key={row.key}
                style={styles.metricRow}
                onPress={() => {
                  if (!isViewingToday) return;
                  if ('route' in row && row.route) {
                    router.push(row.route as '/log/sleep' | '/log/water' | '/log/workout');
                    return;
                  }
                  if (!isEditing) setIsEditing(true);
                  setFocusedMetric(row.key);
                }}
              >
                <View style={styles.emojiCircle}><Text style={styles.emoji}>{row.emoji}</Text></View>
                <View>
                  <Text style={styles.metricLabel}>{row.label}</Text>
                  <Text style={styles.metricValue}>{row.value}</Text>
                </View>
                <Text style={styles.timeText}>{selectedLog ? formatTime(selectedLog.date) : ''}</Text>
                <Text style={styles.chevron}>{'›'}</Text>
              </Pressable>
            ))}
          </View>

          {isViewingToday && (
            <View style={styles.quickAddWrap}>
              <Text style={styles.sectionHeader}>QUICK ADD</Text>
              <View style={styles.quickAddRow}>
                <Pressable style={styles.quickAddButton} onPress={() => router.push('/log/sleep')}>
                  <Text style={styles.quickAddEmoji}>😴</Text>
                  <Text style={styles.quickAddText}>Sleep</Text>
                </Pressable>
                <Pressable style={styles.quickAddButton} onPress={() => router.push('/log/water')}>
                  <Text style={styles.quickAddEmoji}>💧</Text>
                  <Text style={styles.quickAddText}>Water</Text>
                </Pressable>
                <Pressable style={styles.quickAddButton} onPress={() => router.push('/log/workout')}>
                  <Text style={styles.quickAddEmoji}>🏃</Text>
                  <Text style={styles.quickAddText}>Workout</Text>
                </Pressable>
              </View>
              <Pressable style={styles.addButton} onPress={() => setIsEditing(true)}>
                <Text style={styles.addButtonText}>+ Add Full Log</Text>
              </Pressable>
            </View>
          )}

          {isEditing && isViewingToday && (
            <View style={styles.formWrap}>
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
                  <View key={metric.key} style={[styles.metricCard, focusedMetric?.includes(metric.key.split('_')[0]) && styles.focusedCard]}>
                    <Text style={styles.metricLabel}>{metric.label}</Text>
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
              <Text style={styles.sectionHeader}>MOOD</Text>
              <View style={styles.moodRow}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <Pressable key={value} onPress={() => setMood(value)} style={[styles.moodChip, mood === value && styles.moodChipSelected]}>
                    <Text style={styles.moodEmoji}>{MOOD_EMOJI[value]}</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={styles.sectionHeader}>ENERGY</Text>
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const).map((n) => {
                  const selected = energy === n;
                  return (
                    <Pressable
                      key={n}
                      onPress={() => setEnergy(n)}
                      style={{
                        width: 36, height: 36, borderRadius: 18,
                        alignItems: 'center', justifyContent: 'center',
                        backgroundColor: selected ? Colors.accent : Colors.card,
                        borderWidth: 1,
                        borderColor: selected ? Colors.accent : Colors.border,
                      }}
                    >
                      <Text style={{ color: selected ? Colors.white : Colors.textSecondary, fontSize: 13, fontWeight: '600' }}>{n}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <Pressable style={[styles.saveButton, (saving || !isViewingToday) && styles.saveButtonDisabled]} onPress={handleSave} disabled={saving || !isViewingToday}>
                <Text style={styles.saveButtonText}>{saving ? 'Saving...' : saved ? 'Saved ✓' : "Save Today's Log"}</Text>
              </Pressable>
            </View>
          )}

          <View style={styles.weeklyHeaderRow}>
            <Text style={styles.sectionHeader}>WEEKLY OVERVIEW</Text>
            <Pressable onPress={() => router.push('/insights/weekly-summary')}>
              <Text style={styles.viewAll}>View All</Text>
            </Pressable>
          </View>
          <View style={styles.weeklyChart}>
            {weekDays.map((d, idx) => {
              const barColor = d.hasDose ? Colors.accent : d.hasLifestyle ? Colors.accentLight : Colors.border;
              return (
                <View key={`${d.label}-${idx}`} style={styles.dayCol}>
                  <View style={[styles.bar, { backgroundColor: barColor }]} />
                  <Text style={styles.dayLabel}>{d.label}</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  keyboard: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  dateNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  arrow: { fontSize: 20, color: Colors.text, paddingHorizontal: 8 },
  dateTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  sectionHeader: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 1, marginBottom: 10 },
  card: { backgroundColor: Colors.card, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  metricRow: { paddingHorizontal: 16, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  emojiCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.backgroundSecondary, justifyContent: 'center', alignItems: 'center' },
  emoji: { fontSize: 20 },
  metricLabel: { fontSize: 15, fontWeight: '600', color: Colors.text },
  metricValue: { fontSize: 13, color: Colors.textSecondary, marginTop: 1, maxWidth: 180 },
  timeText: { fontSize: 12, color: Colors.textSecondary, marginLeft: 'auto' },
  chevron: { color: Colors.textSecondary, marginLeft: 8, fontSize: 18 },
  quickAddWrap: { marginTop: 14 },
  quickAddRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  quickAddButton: { flex: 1, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 14, paddingVertical: 14, alignItems: 'center', gap: 4 },
  quickAddEmoji: { fontSize: 22 },
  quickAddText: { color: Colors.text, fontSize: 13, fontWeight: '800' },
  addButton: { borderWidth: 1, borderColor: Colors.accent, borderRadius: 12, height: 46, alignItems: 'center', justifyContent: 'center' },
  addButtonText: { color: Colors.accent, fontWeight: '700' },
  formWrap: { marginTop: 16, gap: 10 },
  metricCard: { backgroundColor: Colors.card, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  focusedCard: { borderColor: Colors.accent },
  metricInput: { width: 100, textAlign: 'right', color: Colors.text, fontSize: 16, fontWeight: '700' },
  notesInput: { minHeight: 80, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 14, color: Colors.text, textAlignVertical: 'top', fontSize: 15 },
  moodRow: { flexDirection: 'row', gap: 10 },
  moodChip: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  moodChipSelected: { backgroundColor: Colors.accentLight, borderColor: Colors.accent },
  moodEmoji: { fontSize: 22 },
  saveButton: { marginTop: 6, backgroundColor: Colors.accent, borderRadius: 12, height: 52, alignItems: 'center', justifyContent: 'center' },
  saveButtonDisabled: { opacity: 0.8 },
  saveButtonText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  weeklyHeaderRow: { marginTop: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  viewAll: { color: Colors.accent, fontWeight: '600' },
  weeklyChart: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: Colors.card, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: Colors.border },
  dayCol: { alignItems: 'center', gap: 8 },
  bar: { width: 20, minHeight: 20, borderRadius: 4 },
  dayLabel: { fontSize: 12, color: Colors.textSecondary },
});
