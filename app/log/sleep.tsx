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

const QUALITY = [
  { value: 1, emoji: '😞', label: 'Bad' },
  { value: 2, emoji: '😕', label: 'Not Great' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😄', label: 'Great' },
];

const dateKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const timeLabel = (d: Date) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

const selectedDateKey = (day: 'today' | 'yesterday') => {
  const date = new Date();
  if (day === 'yesterday') date.setDate(date.getDate() - 1);
  return dateKey(date);
};

export default function SleepLogScreen() {
  const user = useAuthStore((state) => state.user);
  const logs = useLifestyleStore((state) => state.logs);
  const fetchLogs = useLifestyleStore((state) => state.fetchLogs);
  const upsertLog = useLifestyleStore((state) => state.upsertLog);

  const [day, setDay] = useState<'today' | 'yesterday'>('today');
  const [startTime, setStartTime] = useState(() => {
    const date = new Date();
    date.setHours(22, 30, 0, 0);
    return date;
  });
  const [endTime, setEndTime] = useState(() => {
    const date = new Date();
    date.setHours(5, 42, 0, 0);
    return date;
  });
  const [pickerTarget, setPickerTarget] = useState<'start' | 'end' | null>(null);
  const [quality, setQuality] = useState(4);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const logDate = selectedDateKey(day);
  const selectedLog = useMemo(() => logs.find((log) => log.date === logDate), [logs, logDate]);
  const durationHours = useMemo(() => {
    const start = startTime.getHours() * 60 + startTime.getMinutes();
    let end = endTime.getHours() * 60 + endTime.getMinutes();
    if (end <= start) end += 24 * 60;
    return (end - start) / 60;
  }, [endTime, startTime]);
  const durationMinutes = Math.round(durationHours * 60);
  const selectedQuality = QUALITY.find((item) => item.value === quality) ?? QUALITY[3];

  useEffect(() => {
    if (!user?.id) return;
    void fetchLogs(user.id).catch((error: Error) => Alert.alert('Error', error.message));
  }, [fetchLogs, user?.id]);

  useEffect(() => {
    if (selectedLog?.mood) setQuality(selectedLog.mood);
  }, [selectedLog?.mood]);

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await upsertLog(
        {
          date: logDate,
          sleep_hours: Math.round(durationHours * 10) / 10,
          mood: quality,
          meal_notes: notes.trim() || selectedLog?.meal_notes || null,
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

  const pickerValue = pickerTarget === 'start' ? startTime : endTime;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} hitSlop={12}><Text style={styles.cancel}>Cancel</Text></Pressable>
            <Text style={styles.title}>😴 Sleep</Text>
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

            <Text style={styles.sectionHeader}>SLEEP DURATION</Text>
            <View style={styles.card}>
              <Text style={styles.duration}>{Math.floor(durationMinutes / 60)} h {durationMinutes % 60} m</Text>
              <Pressable style={styles.row} onPress={() => setPickerTarget('start')}>
                <Text style={styles.rowLabel}>Start Time</Text><Text style={styles.rowValue}>{timeLabel(startTime)}</Text>
              </Pressable>
              <Pressable style={styles.row} onPress={() => setPickerTarget('end')}>
                <Text style={styles.rowLabel}>End Time</Text><Text style={styles.rowValue}>{timeLabel(endTime)}</Text>
              </Pressable>
            </View>

            <Text style={styles.sectionHeader}>SLEEP QUALITY</Text>
            <View style={styles.qualityRow}>
              {QUALITY.map((item) => (
                <Pressable key={item.value} onPress={() => setQuality(item.value)} style={[styles.emojiCircle, quality === item.value && styles.emojiCircleSelected]}>
                  <Text style={styles.emoji}>{item.emoji}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.selectedLabel}>{selectedQuality.label}</Text>

            <Text style={styles.sectionHeader}>NOTES</Text>
            <TextInput
              value={notes}
              onChangeText={(value) => setNotes(value.slice(0, 200))}
              multiline
              maxLength={200}
              placeholder="How did you sleep?"
              placeholderTextColor={Colors.textSecondary}
              style={styles.notesInput}
            />
            <Text style={styles.charCount}>{notes.length}/200</Text>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable style={[styles.saveButton, saving && styles.disabled]} onPress={handleSave} disabled={saving}>
              <Text style={styles.saveButtonText}>{saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save Sleep'}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={pickerTarget !== null} transparent animationType="slide" onRequestClose={() => setPickerTarget(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.pickerSheet}>
            <View style={styles.pickerHeader}>
              <Pressable onPress={() => setPickerTarget(null)}><Text style={styles.cancel}>Cancel</Text></Pressable>
              <Text style={styles.pickerTitle}>{pickerTarget === 'start' ? 'Start Time' : 'End Time'}</Text>
              <Pressable onPress={() => setPickerTarget(null)}><Text style={styles.saveTop}>Done</Text></Pressable>
            </View>
            {pickerTarget && (
              <DateTimePicker
                value={pickerValue}
                mode="time"
                display="spinner"
                onChange={(_, selected) => {
                  if (!selected) return;
                  if (pickerTarget === 'start') setStartTime(selected);
                  if (pickerTarget === 'end') setEndTime(selected);
                }}
                style={styles.picker}
              />
            )}
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
  card: { backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 16, marginBottom: 20 },
  duration: { color: Colors.text, fontSize: 40, fontWeight: '800', textAlign: 'center', marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderTopWidth: 1, borderTopColor: Colors.border },
  rowLabel: { color: Colors.text, fontSize: 16, fontWeight: '600' },
  rowValue: { color: Colors.accent, fontSize: 16, fontWeight: '800' },
  qualityRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  emojiCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  emojiCircleSelected: { borderColor: Colors.accent, backgroundColor: Colors.accentLight },
  emoji: { fontSize: 28 },
  selectedLabel: { color: Colors.accent, fontSize: 15, fontWeight: '800', textAlign: 'center', marginBottom: 22 },
  notesInput: { minHeight: 110, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card, padding: 14, color: Colors.text, fontSize: 16, textAlignVertical: 'top' },
  charCount: { color: Colors.textSecondary, fontSize: 12, textAlign: 'right', marginTop: 6 },
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
