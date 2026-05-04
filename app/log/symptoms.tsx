import { useEffect, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import Colors from '@/constants/Colors';
import ScreenHeader from '@/components/ScreenHeader';
import { useSymptomStore } from '@/stores/symptomStore';
import { useAuthStore } from '@/stores/authStore';

const PRESET_SYMPTOMS = [
  'Fatigue',
  'Headache',
  'Nausea',
  'Injection Site Irritation',
  'Sleep Quality',
  'Mood',
  'Appetite',
  'Energy',
  'Brain Fog',
  'Joint Pain',
];

const symptomLabel = (value: string): string => {
  return value
    .split(' ')
    .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const severityColor = (severity: number): string => {
  if (severity < 4) return Colors.success;
  if (severity <= 6) return Colors.warning;
  return Colors.error;
};

export default function SymptomsScreen() {
  const user = useAuthStore((state) => state.user);
  const logs = useSymptomStore((state) => state.logs);
  const fetchLogs = useSymptomStore((state) => state.fetchLogs);
  const addLog = useSymptomStore((state) => state.addLog);

  const [selected, setSelected] = useState<string | null>(null);
  const [severity, setSeverity] = useState(5);

  const todayStr = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (user?.id) {
      void fetchLogs(user.id);
    }
  }, [fetchLogs, user?.id]);

  const todaysLogs = useMemo(
    () => logs.filter((log) => log.logged_at.slice(0, 10) === todayStr),
    [logs, todayStr],
  );

  const loggedNamesToday = useMemo(() => {
    return new Set(todaysLogs.map((log) => symptomLabel(log.symptom).toLowerCase()));
  }, [todaysLogs]);

  const quickAddItems = PRESET_SYMPTOMS.filter((item) => !loggedNamesToday.has(item.toLowerCase()));

  const saveSymptom = async () => {
    if (!user?.id || !selected) return;

    await addLog(
      {
        symptom: selected.trim(),
        severity,
        notes: null,
        logged_at: new Date().toISOString(),
      },
      user.id,
    );

    setSelected(null);
    setSeverity(5);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Symptoms" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Symptoms</Text>
          <Pressable style={styles.addButton} onPress={() => setSelected('custom')}>
            <Text style={styles.addButtonText}>+ Add</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>Today</Text>
        {todaysLogs.length === 0 ? (
          <Text style={styles.emptyText}>No symptoms logged today</Text>
        ) : (
          todaysLogs.map((log) => {
            const color = severityColor(log.severity);
            return (
              <View key={log.id} style={styles.logCard}>
                <View style={styles.logRow}>
                  <View style={styles.logNameRow}>
                    <View style={[styles.dot, { backgroundColor: color }]} />
                    <Text style={styles.logName}>{symptomLabel(log.symptom)}</Text>
                  </View>
                  <View style={styles.rightWrap}>
                    <Text style={[styles.severityText, { color }]}>{log.severity}/10</Text>
                    <Text style={styles.dateText}>{new Date(log.logged_at).toLocaleTimeString()}</Text>
                  </View>
                </View>
              </View>
            );
          })
        )}

        {quickAddItems.length > 0 && (
          <>
            <Text style={styles.sectionLabelQuick}>Quick Add</Text>
            <View style={styles.chipsWrap}>
              {quickAddItems.map((name) => (
                <Pressable key={name} style={styles.chip} onPress={() => setSelected(name)}>
                  <Text style={styles.chipText}>{name}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {selected !== null && (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Rate: {selected}</Text>
            <View style={styles.scaleRow}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
                const isSelected = severity === n;
                return (
                  <Pressable
                    key={n}
                    style={[
                      styles.scaleItem,
                      isSelected
                        ? { backgroundColor: Colors.accent, borderColor: Colors.accent }
                        : { backgroundColor: Colors.card, borderColor: Colors.border },
                    ]}
                    onPress={() => setSeverity(n)}>
                    <Text style={[styles.scaleText, isSelected ? styles.scaleTextActive : styles.scaleTextInactive]}>{n}</Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.actionRow}>
              <Pressable style={styles.cancelButton} onPress={() => setSelected(null)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.logButton} onPress={saveSymptom}>
                <Text style={styles.logButtonText}>Log It</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 24 },
  headerRow: { paddingHorizontal: 20, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 28, fontWeight: '800', color: Colors.text },
  addButton: { backgroundColor: Colors.accent, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  addButtonText: { color: Colors.white, fontWeight: '700' },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, letterSpacing: 1, paddingHorizontal: 20, paddingBottom: 8 },
  sectionLabelQuick: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, letterSpacing: 1, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  emptyText: { color: Colors.textSecondary, textAlign: 'center', marginTop: 20 },
  logCard: { backgroundColor: Colors.card, borderRadius: 12, padding: 12, marginHorizontal: 16, marginBottom: 8, borderWidth: 1, borderColor: Colors.border },
  logRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logNameRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  logName: { fontSize: 15, fontWeight: '600', color: Colors.text, flexShrink: 1 },
  rightWrap: { alignItems: 'flex-end' },
  severityText: { fontSize: 14, fontWeight: '700' },
  dateText: { fontSize: 11, color: Colors.textSecondary },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16 },
  chip: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  chipText: { fontSize: 13, color: Colors.textSecondary },
  panel: { backgroundColor: Colors.card, borderRadius: 16, margin: 16, padding: 16, borderWidth: 1, borderColor: Colors.border },
  panelTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  scaleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  scaleItem: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  scaleText: { fontSize: 12, fontWeight: '700' },
  scaleTextActive: { color: Colors.white },
  scaleTextInactive: { color: Colors.textSecondary },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  cancelButton: { flex: 1, height: 44, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: Colors.textSecondary, fontWeight: '600' },
  logButton: { flex: 1, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accent },
  logButtonText: { color: Colors.white, fontWeight: '700' },
});
