import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
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
import Svg, { Circle } from 'react-native-svg';

import Colors from '@/constants/Colors';
import { useAuthStore } from '@/stores/authStore';
import { useLifestyleStore } from '@/stores/lifestyleStore';

const GOAL_OZ = 128;
const RADIUS = 88;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const QUICK_AMOUNTS = [
  { oz: 8, label: '8 oz', subLabel: '0.5 cup' },
  { oz: 16, label: '16 oz', subLabel: '1 cup' },
  { oz: 24, label: '24 oz', subLabel: '1.5 cups' },
  { oz: 32, label: '32 oz', subLabel: '2 cups' },
];

type Unit = 'oz' | 'mL' | 'cups';

const dateKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const selectedDateKey = (day: 'today' | 'yesterday') => {
  const date = new Date();
  if (day === 'yesterday') date.setDate(date.getDate() - 1);
  return dateKey(date);
};
const ozToGal = (oz: number) => oz / GOAL_OZ;
const toOz = (amount: number, unit: Unit) => {
  if (unit === 'mL') return amount / 29.5735;
  if (unit === 'cups') return amount * 8;
  return amount;
};

export default function WaterLogScreen() {
  const user = useAuthStore((state) => state.user);
  const logs = useLifestyleStore((state) => state.logs);
  const fetchLogs = useLifestyleStore((state) => state.fetchLogs);
  const upsertLog = useLifestyleStore((state) => state.upsertLog);

  const [day, setDay] = useState<'today' | 'yesterday'>('today');
  const [addedOz, setAddedOz] = useState(0);
  const [customAmount, setCustomAmount] = useState('');
  const [unit, setUnit] = useState<Unit>('oz');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const logDate = selectedDateKey(day);
  const selectedLog = useMemo(() => logs.find((log) => log.date === logDate), [logs, logDate]);
  const baseOz = selectedLog?.water_oz ?? 0;
  const totalOz = Math.max(0, baseOz + addedOz);
  const percent = Math.round((totalOz / GOAL_OZ) * 100);
  const progress = Math.min(totalOz / GOAL_OZ, 1);
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  useEffect(() => {
    if (!user?.id) return;
    void fetchLogs(user.id).catch((error: Error) => Alert.alert('Error', error.message));
  }, [fetchLogs, user?.id]);

  useEffect(() => {
    setAddedOz(0);
  }, [logDate]);

  const handleAddCustom = () => {
    const parsed = Number(customAmount);
    if (!parsed || parsed <= 0) return;
    setAddedOz((current) => current + toOz(parsed, unit));
    setCustomAmount('');
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await upsertLog(
        {
          date: logDate,
          water_oz: Math.round(totalOz * 10) / 10,
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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} hitSlop={12}><Text style={styles.cancel}>Cancel</Text></Pressable>
            <Text style={styles.title}>💧 Water</Text>
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

            <View style={styles.progressWrap}>
              <Svg width={220} height={220} viewBox="0 0 220 220">
                <Circle cx={110} cy={110} r={RADIUS} stroke={Colors.border} strokeWidth={16} fill="none" />
                <Circle
                  cx={110}
                  cy={110}
                  r={RADIUS}
                  stroke={Colors.accent}
                  strokeWidth={16}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                  strokeDashoffset={dashOffset}
                  rotation="-90"
                  origin="110,110"
                />
              </Svg>
              <View style={styles.progressTextWrap}>
                <Text style={styles.amountText}>{ozToGal(totalOz).toFixed(1)} / 1 gal</Text>
                <Text style={styles.ozText}>{Math.round(totalOz)} oz</Text>
                <Text style={styles.percentText}>{percent}% of daily goal</Text>
              </View>
            </View>

            <Text style={styles.sectionHeader}>QUICK ADD</Text>
            <View style={styles.quickGrid}>
              {QUICK_AMOUNTS.map((item) => (
                <Pressable key={item.oz} style={styles.quickButton} onPress={() => setAddedOz((current) => current + item.oz)}>
                  <Text style={styles.quickLabel}>{item.label}</Text>
                  <Text style={styles.quickSubLabel}>{item.subLabel}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.sectionHeader}>CUSTOM AMOUNT</Text>
            <View style={styles.customRow}>
              <TextInput
                value={customAmount}
                onChangeText={setCustomAmount}
                keyboardType="decimal-pad"
                placeholder="Amount"
                placeholderTextColor={Colors.textSecondary}
                style={styles.customInput}
              />
              <View style={styles.pickerWrap}>
                <Picker selectedValue={unit} onValueChange={(value) => setUnit(value)} style={styles.unitPicker}>
                  <Picker.Item label="oz" value="oz" />
                  <Picker.Item label="mL" value="mL" />
                  <Picker.Item label="cups" value="cups" />
                </Picker>
              </View>
            </View>
            <Pressable style={styles.addCustomButton} onPress={handleAddCustom}>
              <Text style={styles.addCustomText}>+ Add Custom</Text>
            </Pressable>

            <Text style={styles.sectionHeader}>NOTES</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              multiline
              placeholder="Add a hydration note..."
              placeholderTextColor={Colors.textSecondary}
              style={styles.notesInput}
            />
          </ScrollView>

          <View style={styles.footer}>
            <Pressable style={[styles.saveButton, saving && styles.disabled]} onPress={handleSave} disabled={saving}>
              <Text style={styles.saveButtonText}>{saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save Water'}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  toggleRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  togglePill: { flex: 1, height: 42, borderRadius: 21, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  togglePillSelected: { backgroundColor: Colors.accentLight, borderColor: Colors.accent },
  toggleText: { color: Colors.textSecondary, fontWeight: '700' },
  toggleTextSelected: { color: Colors.accent },
  progressWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  progressTextWrap: { position: 'absolute', alignItems: 'center' },
  amountText: { color: Colors.text, fontSize: 25, fontWeight: '900' },
  ozText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '700', marginTop: 4 },
  percentText: { color: Colors.accent, fontSize: 14, fontWeight: '800', marginTop: 8 },
  sectionHeader: { fontSize: 12, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 1, marginBottom: 10, marginTop: 8 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  quickButton: { width: '47.8%', borderRadius: 14, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, paddingVertical: 14, alignItems: 'center' },
  quickLabel: { color: Colors.text, fontSize: 16, fontWeight: '800' },
  quickSubLabel: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600', marginTop: 3 },
  customRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  customInput: { flex: 1, height: 50, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card, paddingHorizontal: 14, color: Colors.text, fontSize: 16, fontWeight: '700' },
  pickerWrap: { width: 124, height: 50, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card, overflow: 'hidden', justifyContent: 'center' },
  unitPicker: { color: Colors.text, height: 50 },
  addCustomButton: { height: 44, borderRadius: 12, borderWidth: 1, borderColor: Colors.accent, alignItems: 'center', justifyContent: 'center', marginTop: 10, marginBottom: 12 },
  addCustomText: { color: Colors.accent, fontWeight: '800' },
  notesInput: { minHeight: 100, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card, padding: 14, color: Colors.text, fontSize: 16, textAlignVertical: 'top' },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.white },
  saveButton: { height: 52, borderRadius: 14, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.7 },
  saveButtonText: { color: Colors.white, fontSize: 16, fontWeight: '800' },
});
