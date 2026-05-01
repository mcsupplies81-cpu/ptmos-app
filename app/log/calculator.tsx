import { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import Colors from '@/constants/Colors';
import { Copy } from '@/constants/Copy';
import ScreenHeader from '@/components/ScreenHeader';

export default function CalculatorScreen() {
  const [activeTab, setActiveTab] = useState<'reconstitution' | 'dose'>('reconstitution');
  const [peptideAmount, setPeptideAmount] = useState('');
  const [waterMl, setWaterMl] = useState('');
  const [concentration, setConcentration] = useState('');
  const [desiredMcg, setDesiredMcg] = useState('');

  const calculatedConcentration = useMemo(() => {
    const mg = Number(peptideAmount);
    const ml = Number(waterMl);
    if (!mg || !ml) return '--';
    return `${(mg / ml).toFixed(2)} mg/mL`;
  }, [peptideAmount, waterMl]);

  const doseCalc = useMemo(() => {
    const conc = Number(concentration || calculatedConcentration.split(' ')[0]);
    const mcg = Number(desiredMcg);
    if (!conc || !mcg) return { volume: '--', units: '--' };
    const volume = (mcg / 1000) / conc;
    return { volume: `${volume.toFixed(3)} mL`, units: `${Math.round(volume * 100)} units on a U-100 syringe` };
  }, [calculatedConcentration, concentration, desiredMcg]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Calculator" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}><Text style={styles.title}>Dosage Calculator</Text><Pressable><Text style={{ fontSize: 20 }}>ℹ️</Text></Pressable></View>

        <View style={styles.tabs}>
          <Pressable style={[styles.badge, activeTab === 'reconstitution' ? styles.active : styles.inactive]} onPress={() => setActiveTab('reconstitution')}><Text style={[styles.badgeText, activeTab === 'reconstitution' ? styles.activeText : styles.inactiveText]}>Reconstitution</Text></Pressable>
          <Pressable style={[styles.badge, activeTab === 'dose' ? styles.active : styles.inactive]} onPress={() => setActiveTab('dose')}><Text style={[styles.badgeText, activeTab === 'dose' ? styles.activeText : styles.inactiveText]}>Dose</Text></Pressable>
        </View>

        {activeTab === 'reconstitution' ? (
          <View style={styles.card}>
            <View style={styles.row}><Text style={styles.label}>Peptide Amount</Text><View style={styles.end}><TextInput value={peptideAmount} onChangeText={setPeptideAmount} keyboardType="decimal-pad" style={styles.input} /><Text style={styles.label}>mg</Text></View></View>
            <View style={styles.row}><Text style={styles.label}>Bacteriostatic Water</Text><View style={styles.end}><TextInput value={waterMl} onChangeText={setWaterMl} keyboardType="decimal-pad" style={styles.input} /><Text style={styles.label}>mL</Text></View></View>
            <View style={styles.resultRow}><Text style={styles.label}>Total Volume</Text><Text style={styles.secondary}>{waterMl || '--'} mL</Text></View>
            <View style={[styles.resultRow, { borderBottomWidth: 0 }]}><Text style={styles.label}>Concentration</Text><Text style={styles.conc}>{calculatedConcentration}</Text></View>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.row}><Text style={styles.label}>Concentration</Text><View style={styles.end}><TextInput value={concentration} onChangeText={setConcentration} keyboardType="decimal-pad" placeholder={calculatedConcentration === '--' ? '' : calculatedConcentration.split(' ')[0]} placeholderTextColor={Colors.textSecondary} style={styles.input} /><Text style={styles.label}>mg/mL</Text></View></View>
            <View style={styles.row}><Text style={styles.label}>Desired Dose</Text><View style={styles.end}><TextInput value={desiredMcg} onChangeText={setDesiredMcg} keyboardType="decimal-pad" style={styles.input} /><Text style={styles.label}>mcg</Text></View></View>
            <View style={styles.resultRow}><Text style={styles.label}>Volume to Inject</Text><Text style={styles.vol}>{doseCalc.volume}</Text></View>
            <View style={[styles.resultRow, { borderBottomWidth: 0 }]}><Text style={styles.secondary}>{doseCalc.units}</Text></View>
          </View>
        )}

        <Pressable style={styles.reset} onPress={() => { setPeptideAmount(''); setWaterMl(''); setConcentration(''); setDesiredMcg(''); }}><Text style={styles.resetText}>Reset</Text></Pressable>
        <Text style={styles.disclaimer}>{Copy.calculatorDisclaimer}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.backgroundSecondary },
  container: { padding: 16, paddingBottom: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  title: { fontSize: 22, fontWeight: '700', color: Colors.text },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 13, fontWeight: '600' },
  active: { backgroundColor: Colors.accent }, inactive: { backgroundColor: Colors.card }, activeText: { color: Colors.white }, inactiveText: { color: Colors.textSecondary },
  card: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  row: { borderBottomWidth: 1, borderBottomColor: Colors.border, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultRow: { borderBottomWidth: 1, borderBottomColor: Colors.border, paddingVertical: 14, backgroundColor: Colors.backgroundSecondary, paddingHorizontal: 8, marginHorizontal: -8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 13, color: Colors.textSecondary },
  end: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { minWidth: 70, textAlign: 'right', color: Colors.text },
  secondary: { color: Colors.textSecondary, fontSize: 13 },
  conc: { color: Colors.accent, fontWeight: '600' },
  vol: { color: Colors.accent, fontWeight: '700', fontSize: 18 },
  reset: { borderWidth: 1, borderColor: Colors.accent, borderRadius: 14, padding: 14, alignItems: 'center', marginTop: 4 },
  resetText: { color: Colors.accent, fontWeight: '600' },
  disclaimer: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center', padding: 16 },
});
