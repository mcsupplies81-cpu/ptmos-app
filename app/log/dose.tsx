import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import Colors from '@/constants/Colors';
import { useAuthStore } from '@/stores/authStore';
import { useDoseLogStore } from '@/stores/doseLogStore';

const moodOptions = [
  { emoji: '😄', label: 'Great' },
  { emoji: '🙂', label: 'Good' },
  { emoji: '😐', label: 'Okay' },
  { emoji: '😕', label: 'Bad' },
  { emoji: '😞', label: 'Awful' },
];
const sites = ['Abdomen L', 'Abdomen R', 'Thigh L', 'Thigh R', 'Glute L', 'Glute R', 'Arm L', 'Arm R'];

export default function DoseLogScreen() {
  const router = useRouter();
  const { addDoseLog } = useDoseLogStore();
  const user = useAuthStore((state) => state.user);
  const [peptideName, setPeptideName] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [showSites, setShowSites] = useState(false);
  const [mood, setMood] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    await addDoseLog({ protocol_id: null, peptide_name: peptideName.trim() || null, amount: Number(amount) || 0, unit: 'mcg', logged_at: new Date().toISOString(), injection_site: selectedSite, mood, notes: notes || null }, user.id);
    setSaving(false);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.nav}>
          <Pressable onPress={() => router.back()}><Text style={styles.navAction}>Cancel</Text></Pressable>
          <Text style={styles.navTitle}>Log Dose</Text>
          <Pressable onPress={handleSave}><Text style={[styles.navAction, { fontWeight: '600' }]}>Save</Text></Pressable>
        </View>

        <View style={styles.selectRow}>
          <View style={styles.icon} />
          <View style={{ flex: 1 }}>
            <TextInput
              value={peptideName}
              onChangeText={setPeptideName}
              placeholder="Peptide name"
              placeholderTextColor={Colors.textSecondary}
              style={{ fontSize: 16, fontWeight: '600', color: Colors.text }}
            />
            {!!amount && <Text style={{ fontSize: 12, color: Colors.textSecondary }}>{amount} mcg</Text>}
          </View>
        </View>

        <View style={styles.field}><Text style={styles.label}>Amount</Text><View style={styles.inline}><TextInput value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={Colors.textSecondary} style={styles.input} /><Text style={styles.value}>mcg</Text></View></View>
        <View style={styles.field}><Text style={styles.label}>Date</Text><Text style={styles.value}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Text></View>
        <View style={styles.field}><Text style={styles.label}>Time</Text><Text style={styles.value}>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text></View>
        <Pressable style={styles.field} onPress={() => setShowSites((v) => !v)}><Text style={styles.label}>Injection Site</Text><Text style={[styles.value, !selectedSite && { color: Colors.textSecondary }]}>{selectedSite || 'Select site'}</Text></Pressable>
        <View style={styles.field}><Text style={styles.label}>Notes</Text><TextInput value={notes} onChangeText={setNotes} placeholder="Add notes..." placeholderTextColor={Colors.textSecondary} multiline style={[styles.input, { minWidth: 180, minHeight: 54 }]} /></View>

        {showSites && (
          <View style={styles.sitesWrap}>
            {sites.map((site) => {
              const selected = selectedSite === site;
              return <Pressable key={site} style={[styles.siteChip, selected && { backgroundColor: Colors.accent }]} onPress={() => setSelectedSite(site)}><Text style={{ color: selected ? Colors.white : Colors.textSecondary, fontSize: 13, fontWeight: '600' }}>{site}</Text></Pressable>;
            })}
          </View>
        )}

        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', marginBottom: 12, color: Colors.text }}>How do you feel?</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {moodOptions.map((m) => {
              const selected = mood === m.label;
              return <Pressable key={m.label} onPress={() => setMood(m.label)} style={[styles.mood, selected && { backgroundColor: Colors.accent }]}><Text style={{ fontSize: 28 }}>{m.emoji}</Text><Text style={{ fontSize: 11, color: selected ? Colors.white : Colors.text }}>{m.label}</Text></Pressable>;
            })}
          </View>
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          <Pressable style={styles.primaryBtn} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.primaryText}>Save Dose</Text>}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.backgroundSecondary },
  nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  navAction: { color: Colors.accent, fontSize: 16 },
  navTitle: { fontSize: 17, fontWeight: '600', color: Colors.text },
  selectRow: { padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 44, height: 44, backgroundColor: Colors.accentLight, borderRadius: 12 },
  field: { borderBottomWidth: 1, borderBottomColor: Colors.border, paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 13, color: Colors.textSecondary },
  value: { fontSize: 16, color: Colors.text },
  input: { textAlign: 'right', color: Colors.text },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sitesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 16, backgroundColor: Colors.backgroundSecondary },
  siteChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: Colors.card },
  mood: { alignItems: 'center', borderRadius: 12, padding: 8 },
  primaryBtn: { backgroundColor: Colors.accent, borderRadius: 14, padding: 16, alignItems: 'center' },
  primaryText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
});
