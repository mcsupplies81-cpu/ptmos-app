import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import ScreenHeader from '@/components/ScreenHeader';
import Colors from '@/constants/Colors';
import { COMPOUNDS, searchCompounds, type Compound } from '@/constants/compounds';
import { useAuthStore } from '@/stores/authStore';
import { useDoseLogStore } from '@/stores/doseLogStore';
import { useInjectionSiteStore } from '@/stores/injectionSiteStore';
import { useProtocolStore } from '@/stores/protocolStore';

const moodOptions = [
  { emoji: '😞', label: 'Bad' },
  { emoji: '😕', label: 'Not Great' },
  { emoji: '😐', label: 'Okay' },
  { emoji: '🙂', label: 'Good' },
  { emoji: '😁', label: 'Great' },
];

const ROUTE_OPTIONS = ['Sub-Q', 'IM', 'Oral', 'Topical', 'Intranasal'] as const;
const INJECTION_SITES = ['Right Abdomen', 'Left Abdomen', 'Right Thigh', 'Left Thigh', 'Right Glute', 'Left Glute', 'Right Arm', 'Left Arm', 'Skip'] as const;

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

  const [route, setRoute] = useState<(typeof ROUTE_OPTIONS)[number]>('Sub-Q');
  const [showCompoundModal, setShowCompoundModal] = useState(false);
  const [compoundQuery, setCompoundQuery] = useState('');
  const compoundResults = useMemo(() => searchCompounds(compoundQuery).slice(0, 20), [compoundQuery]);

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

  const openRoutePicker = () => {
    Alert.alert('Select Route', undefined, [
      ...ROUTE_OPTIONS.map((option) => ({ text: option, onPress: () => setRoute(option) })),
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const openInjectionSitePicker = () => {
    Alert.alert('Select Injection Site', undefined, [
      ...INJECTION_SITES.map((site) => ({ text: site, onPress: () => setSelectedSite(site === 'Skip' ? null : site) })),
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScreenHeader title="Log Dose" rightLabel="Save" onRightPress={handleSave} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

          <View style={styles.card}>
            <Pressable style={styles.row} onPress={() => { setShowCompoundModal(true); setCompoundQuery(peptideName); }}>
              <Text style={styles.rowLabel}>Peptide</Text>
              <View style={styles.rowEnd}>
                <Text style={[styles.rowValue, { color: Colors.accent }]}>{peptideName || 'Select compound'}</Text>
                <Text style={styles.chevron}>›</Text>
              </View>
            </Pressable>
          </View>

          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Dose</Text>
              <View style={[styles.rowEnd, { gap: 8 }]}>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={Colors.textSecondary}
                  style={styles.amountInput}
                />
                <View style={styles.unitRow}>
                  {(['mcg', 'mg', 'IU', 'mL'] as const).map((u) => {
                    const selected = unit === u;
                    return (
                      <Pressable key={u} onPress={() => setUnit(u)} style={[styles.unitChip, selected && styles.unitChipSelected]}>
                        <Text style={[styles.unitChipText, selected && styles.unitChipTextSelected]}>{u}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>
            <Pressable style={styles.row} onPress={openRoutePicker}>
              <Text style={styles.rowLabel}>Route</Text>
              <View style={styles.rowEnd}>
                <Text style={styles.rowValue}>{route}</Text>
                <Text style={styles.chevron}>›</Text>
              </View>
            </Pressable>
            <Pressable style={[styles.row, styles.lastRow]} onPress={openInjectionSitePicker}>
              <Text style={styles.rowLabel}>Injection Site</Text>
              <View style={styles.rowEnd}>
                <Text style={styles.rowValue}>{selectedSite || 'Skip'}</Text>
                <Text style={styles.chevron}>›</Text>
              </View>
            </Pressable>
          </View>

          <View style={styles.card}>
            <Pressable style={styles.row}>
              <Text style={styles.rowLabel}>Date</Text>
              <View style={styles.rowEnd}>
                <Text style={styles.rowValue}>{logDate}</Text>
                <Text style={styles.chevron}>›</Text>
              </View>
            </Pressable>
            <Pressable style={[styles.row, styles.lastRow]}>
              <Text style={styles.rowLabel}>Time</Text>
              <View style={styles.rowEnd}>
                <Text style={styles.rowValue}>{logTime}</Text>
                <Text style={styles.chevron}>›</Text>
              </View>
            </Pressable>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionLabel}>MOOD</Text>
            <View style={styles.moodRow}>
              {moodOptions.map((m) => {
                const selected = mood === m.label;
                return (
                  <Pressable key={m.label} onPress={() => setMood(m.label)} style={[styles.moodChip, selected && styles.moodChipSelected]}>
                    <Text style={{ fontSize: 24 }}>{m.emoji}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Text style={styles.sectionLabel}>NOTES (OPTIONAL)</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes..."
            placeholderTextColor={Colors.textSecondary}
            multiline
            style={styles.notesInput}
          />

          <Pressable style={[styles.primaryBtn, (!amount.trim() || saving) && { opacity: 0.5 }]} onPress={handleSave} disabled={!amount.trim() || saving}>
            {saving ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.primaryText}>Log Dose</Text>}
          </Pressable>
        </ScrollView>

        <Modal visible={showCompoundModal} animationType="slide" presentationStyle="pageSheet">
          <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
            <View style={{ padding: 16, gap: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.text }}>Select Compound</Text>
              <TextInput
                autoFocus
                value={compoundQuery}
                onChangeText={setCompoundQuery}
                placeholder="Search compounds..."
                placeholderTextColor={Colors.textSecondary}
                style={styles.modalInput}
              />
            </View>
            <FlatList
              keyboardShouldPersistTaps="handled"
              data={[...compoundResults, { id: 'custom-compound', name: 'Custom compound', aliases: [], category: 'other', summary: '' } as Compound]}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    if (item.id === 'custom-compound') {
                      setPeptideName(compoundQuery);
                      setShowCompoundModal(false);
                      return;
                    }
                    setPeptideName(item.name);
                    setCompoundQuery(item.name);
                    setShowCompoundModal(false);
                  }}
                  style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border }}
                >
                  <Text style={{ color: Colors.text, fontWeight: '600' }}>{item.name}</Text>
                  {item.id !== 'custom-compound' && <Text style={{ color: Colors.textSecondary, fontSize: 12 }}>{item.category}</Text>}
                </Pressable>
              )}
            />
            <Pressable onPress={() => setShowCompoundModal(false)} style={{ padding: 16 }}>
              <Text style={{ color: Colors.textSecondary, textAlign: 'center' }}>Cancel</Text>
            </Pressable>
          </SafeAreaView>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  lastRow: { borderBottomWidth: 0 },
  rowLabel: { fontSize: 15, color: Colors.text, flex: 1 },
  rowEnd: { flexDirection: 'row', alignItems: 'center' },
  rowValue: { fontSize: 15, color: Colors.textSecondary, marginRight: 4 },
  chevron: { fontSize: 18, color: Colors.textSecondary },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, marginHorizontal: 16, marginTop: 6, marginBottom: 8, letterSpacing: 0.5 },
  amountInput: { width: 80, textAlign: 'right', color: Colors.text, fontSize: 15, paddingVertical: 4 },
  unitRow: { flexDirection: 'row', gap: 6 },
  unitChip: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 999, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card },
  unitChipSelected: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  unitChipText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
  unitChipTextSelected: { color: Colors.white },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 14 },
  moodChip: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card },
  moodChipSelected: { backgroundColor: Colors.accent + '22', borderColor: Colors.accent },
  notesInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    color: Colors.text,
    borderRadius: 16,
    padding: 12,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  primaryBtn: { backgroundColor: Colors.accent, borderRadius: 16, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  primaryText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    color: Colors.text,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
});
