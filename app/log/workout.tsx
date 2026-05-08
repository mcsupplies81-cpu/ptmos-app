import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
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
import { useAuthStore } from '@/stores/authStore';
import { useLifestyleStore } from '@/stores/lifestyleStore';

const WORKOUT_TYPES = ['Upper Body', 'Lower Body', 'Push', 'Pull', 'Legs', 'Full Body', 'Cardio', 'Run', 'Bike', 'Swim', 'Yoga', 'Stretch', 'Other'];
const INTENSITY_LABELS: Record<number, string> = { 1: 'Easy', 2: 'Moderate', 3: 'Hard', 4: 'Very Hard', 5: 'Max' };

const dateKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const selectedDateKey = (day: 'today' | 'yesterday') => {
  const date = new Date();
  if (day === 'yesterday') date.setDate(date.getDate() - 1);
  return dateKey(date);
};
const timeLabel = (d: Date) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

export default function WorkoutLogScreen() {
  const user = useAuthStore((state) => state.user);
  const logs = useLifestyleStore((state) => state.logs);
  const fetchLogs = useLifestyleStore((state) => state.fetchLogs);
  const upsertLog = useLifestyleStore((state) => state.upsertLog);

  const [day, setDay] = useState<'today' | 'yesterday'>('today');
  const [workoutType, setWorkoutType] = useState('Full Body');
  const [startTime, setStartTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [durationMin, setDurationMin] = useState('45');
  const [intensity, setIntensity] = useState(3);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const logDate = selectedDateKey(day);
  const selectedLog = useMemo(() => logs.find((log) => log.date === logDate), [logs, logDate]);

  useEffect(() => {
    if (!user?.id) return;
    void fetchLogs(user.id).catch((error: Error) => Alert.alert('Error', error.message));
  }, [fetchLogs, user?.id]);

  useEffect(() => {
    if (selectedLog?.workout_type) setWorkoutType(selectedLog.workout_type);
    if (selectedLog?.workout_duration_min) setDurationMin(String(selectedLog.workout_duration_min));
    if (selectedLog?.workout_intensity) setIntensity(selectedLog.workout_intensity);
    if (selectedLog?.workout_notes) setNotes(selectedLog.workout_notes);
  }, [selectedLog]);

  const openWorkoutPicker = () => {
    Alert.alert(
      'Workout Type',
      'Choose a workout type',
      [
        ...WORKOUT_TYPES.map((type) => ({ text: type, onPress: () => setWorkoutType(type) })),
        { text: 'Cancel', style: 'cancel' as const },
      ],
      { cancelable: true },
    );
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await upsertLog(
        {
          date: logDate,
          workout_type: workoutType,
          workout_duration_min: Number(durationMin) || null,
          workout_intensity: intensity,
          workout_notes: notes.trim() || null,
        },
        user.id,
      );
      setSaved(true);
      setTimeout(() => router.back(), 600);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Something went wrong. Please try again.');
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} hitSlop={12}><Text style={styles.cancel}>Cancel</Text></Pressable>
            <Text style={styles.title}>🏃 Workout</Text>
            <Pressable onPress={handleSave} disabled={saving} hitSlop={12}><Text style={styles.saveTop}>{saved ? 'Saved' : 'Save'}</Text></Pressable>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
            <View style={styles.toggleRow}>
              {(['today', 'yesterday'] as const).map((value) => (
                <Pressable key={value} onPress={() => setDay(value)} style={[styles.togglePill, day === value && styles.togglePillSelected]}>
                  <Text style={[styles.toggleText, day === value && styles.toggleTextSelected]}>{value === 'today' ? 'Today' : 'Yesterday'}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.sectionHeader}>WORKOUT TYPE</Text>
            <Pressable style={styles.selectRow} onPress={openWorkoutPicker}>
              <Text style={styles.selectLabel}>{workoutType}</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>

            <Text style={styles.sectionHeader}>START TIME</Text>
            <Pressable style={styles.selectRow} onPress={() => setShowTimePicker(true)}>
              <Text style={styles.selectLabel}>{timeLabel(startTime)}</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>

            <Text style={styles.sectionHeader}>DURATION</Text>
            <View style={styles.durationRow}>
              <TextInput
                value={durationMin}
                onChangeText={setDurationMin}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={Colors.textSecondary}
                style={styles.durationInput}
              />
              <Text style={styles.unitText}>min</Text>
            </View>

            <Text style={styles.sectionHeader}>INTENSITY</Text>
            <View style={styles.intensityRow}>
              {[1, 2, 3, 4, 5].map((value) => {
                const selected = intensity === value;
                return (
                  <Pressable key={value} onPress={() => setIntensity(value)} style={[styles.intensityCircle, selected && styles.intensityCircleSelected]}>
                    <Text style={[styles.intensityNumber, selected && styles.intensityNumberSelected]}>{value}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.selectedLabel}>{INTENSITY_LABELS[intensity]}</Text>

            <Text style={styles.sectionHeader}>NOTES</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              multiline
              placeholder="How did the workout feel?"
              placeholderTextColor={Colors.textSecondary}
              style={styles.notesInput}
            />
          </ScrollView>

          <View style={styles.footer}>
            <Pressable style={[styles.saveButton, saving && styles.disabled]} onPress={handleSave} disabled={saving}>
              <Text style={styles.saveButtonText}>{saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save Workout'}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={showTimePicker} transparent animationType="slide" onRequestClose={() => setShowTimePicker(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.pickerSheet}>
            <View style={styles.pickerHeader}>
              <Pressable onPress={() => setShowTimePicker(false)}><Text style={styles.cancel}>Cancel</Text></Pressable>
              <Text style={styles.pickerTitle}>Start Time</Text>
              <Pressable onPress={() => setShowTimePicker(false)}><Text style={styles.saveTop}>Done</Text></Pressable>
            </View>
            <DateTimePicker
              value={startTime}
              mode="time"
              display="spinner"
              onChange={(_, selected) => {
                if (selected) setStartTime(selected);
              }}
              style={styles.picker}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  flex: { flex: 1 },
  sheet: { flex: 1, backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  header: { height: 56, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: Colors.border },
  cancel: { color: Colors.textSecondary, fontSize: 16, fontWeight: '600' },
  title: { color: Colors.text, fontSize: 18, fontWeight: '800', position: 'absolute', left: 0, right: 0, textAlign: 'center' },
  saveTop: { color: Colors.accent, fontSize: 16, fontWeight: '800' },
  content: { padding: 20, paddingBottom: 16 },
  toggleRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  togglePill: { flex: 1, height: 42, borderRadius: 21, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  togglePillSelected: { backgroundColor: Colors.accentLight, borderColor: Colors.accent },
  toggleText: { color: Colors.textSecondary, fontWeight: '700' },
  toggleTextSelected: { color: Colors.accent },
  sectionHeader: { fontSize: 12, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 1, marginBottom: 10, marginTop: 8 },
  selectRow: { height: 54, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  selectLabel: { color: Colors.text, fontSize: 16, fontWeight: '800' },
  chevron: { color: Colors.textSecondary, fontSize: 24 },
  durationRow: { height: 54, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  durationInput: { flex: 1, color: Colors.text, fontSize: 18, fontWeight: '800' },
  unitText: { color: Colors.textSecondary, fontSize: 16, fontWeight: '800' },
  intensityRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  intensityCircle: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  intensityCircleSelected: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  intensityNumber: { color: Colors.textSecondary, fontSize: 17, fontWeight: '800' },
  intensityNumberSelected: { color: Colors.white },
  selectedLabel: { color: Colors.accent, fontSize: 15, fontWeight: '800', textAlign: 'center', marginBottom: 22 },
  notesInput: { minHeight: 110, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card, padding: 14, color: Colors.text, fontSize: 16, textAlignVertical: 'top' },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.white },
  saveButton: { height: 52, borderRadius: 14, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.7 },
  saveButtonText: { color: Colors.white, fontSize: 16, fontWeight: '800' },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(17, 24, 39, 0.35)' },
  pickerSheet: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 24 },
  pickerHeader: { height: 54, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: Colors.border },
  pickerTitle: { color: Colors.text, fontWeight: '800', fontSize: 16 },
  picker: { alignSelf: 'stretch' },
});
