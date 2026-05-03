import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import ScreenHeader from '@/components/ScreenHeader';
import Colors from '@/constants/Colors';
import { useAuthStore } from '@/stores/authStore';
import { useDoseLogStore } from '@/stores/doseLogStore';
import { useInjectionSiteStore } from '@/stores/injectionSiteStore';
import { useProtocolStore } from '@/stores/protocolStore';

const moodOptions = [
  { emoji: '😄', label: 'Great' },
  { emoji: '🙂', label: 'Good' },
  { emoji: '😐', label: 'Okay' },
  { emoji: '😕', label: 'Bad' },
  { emoji: '😞', label: 'Awful' },
];

const INJECTION_SITES = ['Abdomen L', 'Abdomen R', 'Thigh L', 'Thigh R', 'Glute L', 'Glute R', 'Arm L', 'Arm R'] as const;

export default function DoseLogScreen() {
  const router = useRouter();
  const { addDoseLog } = useDoseLogStore();
  const user = useAuthStore((state) => state.user);
  const protocols = useProtocolStore((s) => s.protocols);
  const fetchProtocols = useProtocolStore((state) => state.fetchProtocols);
  const activeProtocols = protocols.filter((p) => p.status === 'active');
  useInjectionSiteStore((s) => s.sites);

  const [protocolId, setProtocolId] = useState<string | null>(null);
  const [peptideName, setPeptideName] = useState('');
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState<'mcg' | 'mg' | 'IU' | 'mL'>('mcg');
  const now = new Date();
  const [logDate, setLogDate] = useState(now.toISOString().slice(0, 10));
  const [logTime, setLogTime] = useState(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [mood, setMood] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.id) fetchProtocols(user.id);
  }, [fetchProtocols, user?.id]);

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    const logged_at = new Date(`${logDate}T${logTime}:00`).toISOString();
    await addDoseLog({ protocol_id: protocolId, peptide_name: peptideName.trim() || null, amount: Number(amount) || 0, unit, logged_at, injection_site: selectedSite, mood, notes: notes || null }, user.id);
    setSaving(false);
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScreenHeader title="Log Dose" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          <Text style={styles.fieldLabel}>PEPTIDE / COMPOUND</Text>
          <TextInput
            value={peptideName}
            onChangeText={setPeptideName}
            placeholder="e.g. BPC-157"
            placeholderTextColor={Colors.textSecondary}
            style={styles.input}
          />

          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16, alignItems: 'flex-end' }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>DOSE AMOUNT</Text>
              <TextInput value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={Colors.textSecondary} style={[styles.input, { marginBottom: 0 }]} />
            </View>
            <View>
              <Text style={styles.fieldLabel}>UNIT</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {(['mcg', 'mg', 'IU', 'mL'] as const).map((u) => {
                  const selected = unit === u;
                  return (
                    <Pressable key={u} onPress={() => setUnit(u)} style={[styles.unitChip, selected && styles.selectedRectChip]}>
                      <Text style={[styles.chipText, selected && styles.selectedChipText]}>{u}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>DATE</Text>
              <TextInput value={logDate} onChangeText={setLogDate} placeholder="YYYY-MM-DD" placeholderTextColor={Colors.textSecondary} style={[styles.input, { marginBottom: 0 }]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>TIME</Text>
              <TextInput value={logTime} onChangeText={setLogTime} placeholder="HH:MM" placeholderTextColor={Colors.textSecondary} style={[styles.input, { marginBottom: 0 }]} />
            </View>
          </View>

          <Text style={styles.fieldLabel}>INJECTION SITE</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {INJECTION_SITES.map((site) => {
              const selected = selectedSite === site;
              return (
                <Pressable key={site} onPress={() => setSelectedSite(site === selectedSite ? null : site)} style={[styles.siteChip, selected && styles.selectedPillChip]}>
                  <Text style={[styles.siteChipText, selected && styles.selectedChipText]}>{site}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.fieldLabel}>PROTOCOL (OPTIONAL)</Text>
          {activeProtocols.length > 0 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {[{ id: null, name: 'None' }, ...activeProtocols].map((item) => {
                const selected = protocolId === item.id;
                return (
                  <Pressable key={item.id ?? 'none'} onPress={() => setProtocolId(item.id)} style={[styles.siteChip, selected && styles.selectedPillChip]}>
                    <Text style={[styles.siteChipText, selected && styles.selectedChipText]}>{item.name}</Text>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <Text style={{ color: Colors.textSecondary, fontSize: 13, marginBottom: 16 }}>No active protocols</Text>
          )}

          <Text style={styles.fieldLabel}>NOTES (OPTIONAL)</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes..."
            placeholderTextColor={Colors.textSecondary}
            multiline
            style={[styles.input, { minHeight: 72, textAlignVertical: 'top' }]}
          />

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', marginBottom: 12, color: Colors.text }}>How do you feel?</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {moodOptions.map((m) => {
                const selected = mood === m.label;
                return (
                  <Pressable key={m.label} onPress={() => setMood(m.label)} style={[styles.mood, selected && { backgroundColor: Colors.accent }]}>
                    <Text style={{ fontSize: 28 }}>{m.emoji}</Text>
                    <Text style={{ fontSize: 11, color: selected ? Colors.white : Colors.text }}>{m.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Pressable style={[styles.primaryBtn, (!amount.trim() || saving) && { opacity: 0.4 }]} onPress={handleSave} disabled={!amount.trim() || saving}>
            {saving ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.primaryText}>Save Dose</Text>}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fieldLabel: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6, letterSpacing: 0.5 },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    color: Colors.text,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    fontSize: 15,
  },
  unitChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card },
  siteChip: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card },
  selectedRectChip: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  selectedPillChip: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  chipText: { color: Colors.textSecondary, fontWeight: '600' },
  siteChipText: { color: Colors.textSecondary, fontSize: 13 },
  selectedChipText: { color: Colors.white, fontWeight: '700' },
  mood: { alignItems: 'center', borderRadius: 12, padding: 8 },
  primaryBtn: { backgroundColor: Colors.accent, borderRadius: 12, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  primaryText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
});
