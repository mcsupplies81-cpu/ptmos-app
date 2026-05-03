import React, { useMemo, useState } from 'react';
import {
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
import ScreenHeader from '@/components/ScreenHeader';
import Colors from '@/constants/Colors';
import { Copy } from '@/constants/Copy';

function calcReconstitution(vialMg: number, waterMl: number) {
  const concentrationMgPerMl = vialMg / waterMl;
  const concentrationMcgPerMl = concentrationMgPerMl * 1000;
  const doseMcgValues = [50, 100, 150, 200, 250, 300, 500, 1000];
  const doseTable = doseMcgValues
    .filter((mcg) => mcg <= concentrationMcgPerMl)
    .map((mcg) => ({
      mcg,
      ml: (mcg / concentrationMcgPerMl).toFixed(3).replace(/0+$/, '').replace(/\.$/, ''),
    }));
  return { concentrationMgPerMl, concentrationMcgPerMl, doseTable };
}

export default function CalculatorScreen() {
  const [desiredDose, setDesiredDose] = useState('');
  const [concentration, setConcentration] = useState('');
  const [vialMg, setVialMg] = useState('');
  const [waterMl, setWaterMl] = useState('');
  const [doseUnit, setDoseUnit] = useState<'mcg' | 'mg'>('mcg');
  const [mode, setMode] = useState<'dose' | 'recon'>('dose');

  const doseResult = useMemo(() => {
    const conc = Number(concentration);
    const dose = Number(desiredDose);
    if (!conc || !dose) return null;

    const volMl = doseUnit === 'mcg'
      ? (dose / 1000) / conc
      : dose / conc;

    return {
      volMl,
      units: volMl * 100,
    };
  }, [concentration, desiredDose, doseUnit]);

  const recon = useMemo(() => {
    const mg = Number(vialMg);
    const ml = Number(waterMl);
    if (!mg || !ml) return null;
    return calcReconstitution(mg, ml);
  }, [vialMg, waterMl]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Calculator" />

      <View style={styles.modeToggle}>
        <Pressable
          style={[styles.modeTab, mode === 'dose' && styles.modeTabActive]}
          onPress={() => setMode('dose')}
        >
          <Text style={[styles.modeTabText, mode === 'dose' && styles.modeTabTextActive]}>Dose Volume</Text>
        </Pressable>
        <Pressable
          style={[styles.modeTab, mode === 'recon' && styles.modeTabActive]}
          onPress={() => setMode('recon')}
        >
          <Text style={[styles.modeTabText, mode === 'recon' && styles.modeTabTextActive]}>Reconstitution</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          {mode === 'dose' ? (
            <View style={styles.section}>
              <Text style={styles.fieldLabel}>DESIRED DOSE</Text>
              <View style={styles.rowBottom}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={desiredDose}
                  onChangeText={setDesiredDose}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={Colors.textSecondary}
                />
                <View style={styles.chipRow}>
                  {(['mcg', 'mg'] as const).map((unit) => (
                    <Pressable
                      key={unit}
                      onPress={() => setDoseUnit(unit)}
                      style={[styles.chip, doseUnit === unit && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, doseUnit === unit && styles.chipTextActive]}>{unit}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <Text style={styles.fieldLabel}>VIAL CONCENTRATION</Text>
              <View style={styles.rowCenter}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={concentration}
                  onChangeText={setConcentration}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={Colors.textSecondary}
                />
                <Text style={styles.staticUnit}>mg/mL</Text>
              </View>

              {doseResult && (
                <View style={styles.resultCard}>
                  <Text style={styles.resultLabel}>DRAW</Text>
                  <Text style={styles.resultValue}>{doseResult.volMl.toFixed(3)}</Text>
                  <Text style={styles.resultUnit}>mL</Text>
                  <View style={styles.resultDivider} />

                  <View style={styles.resultRow}>
                    <View style={styles.resultCol}>
                      <Text style={styles.resultMetaLabel}>Insulin Units (IU)</Text>
                      <Text style={styles.resultMetaValue}>{doseResult.units.toFixed(1)}IU</Text>
                    </View>
                    <View style={styles.resultCol}>
                      <Text style={styles.resultMetaLabel}>Dose Confirmed</Text>
                      <Text style={styles.resultMetaValue}>{desiredDose}{doseUnit}</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.section}>
              <Text style={styles.fieldLabel}>VIAL SIZE</Text>
              <View style={styles.rowCenter}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={vialMg}
                  onChangeText={setVialMg}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={Colors.textSecondary}
                />
                <Text style={styles.staticUnit}>mg</Text>
              </View>

              <Text style={styles.fieldLabel}>BAC WATER ADDED</Text>
              <View style={[styles.rowCenter, { marginBottom: 24 }]}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={waterMl}
                  onChangeText={setWaterMl}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={Colors.textSecondary}
                />
                <Text style={styles.staticUnit}>mL</Text>
              </View>

              {recon && (
                <View style={styles.reconCard}>
                  <View style={styles.reconConc}>
                    <Text style={styles.reconConcValue}>{recon.concentrationMgPerMl.toFixed(2)} mg/mL</Text>
                    <Text style={styles.reconConcLabel}>{recon.concentrationMcgPerMl.toFixed(0)} mcg/mL</Text>
                  </View>

                  <Text style={styles.reconTableLabel}>DOSE TABLE</Text>
                  {recon.doseTable.map((row) => (
                    <View key={row.mcg} style={styles.reconTableRow}>
                      <Text style={styles.reconTableDose}>{row.mcg} mcg</Text>
                      <Text style={styles.reconTableMl}>{row.ml} mL</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          <View style={styles.disclaimerWrap}>
            <Text style={styles.disclaimer}>{Copy.calculatorDisclaimer}</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  modeToggle: {
    margin: 16,
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modeTab: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modeTabActive: { backgroundColor: Colors.accent },
  modeTabText: { color: Colors.textSecondary, fontWeight: '600' },
  modeTabTextActive: { color: Colors.white, fontWeight: '700' },
  section: { paddingHorizontal: 16 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    color: Colors.text,
    borderRadius: 10,
    padding: 14,
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'right',
  },
  rowBottom: { flexDirection: 'row', gap: 8, marginBottom: 16, alignItems: 'flex-end' },
  rowCenter: { flexDirection: 'row', gap: 8, marginBottom: 24, alignItems: 'center' },
  chipRow: { flexDirection: 'row', gap: 8 },
  chip: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  chipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  chipText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: Colors.white, fontWeight: '700' },
  staticUnit: { fontSize: 15, color: Colors.textSecondary, fontWeight: '600' },
  resultCard: {
    backgroundColor: Colors.accent,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  resultLabel: { color: 'rgba(255,255,255,0.65)', fontSize: 11, fontWeight: '600', letterSpacing: 1.5 },
  resultValue: { color: Colors.white, fontSize: 44, fontWeight: '800' },
  resultUnit: { color: 'rgba(255,255,255,0.8)', fontSize: 18, marginTop: -4 },
  resultDivider: { backgroundColor: 'rgba(255,255,255,0.2)', height: 1, width: '100%', marginVertical: 14 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  resultCol: { alignItems: 'center', gap: 2 },
  resultMetaLabel: { color: 'rgba(255,255,255,0.65)', fontSize: 10 },
  resultMetaValue: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  reconCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.accentLight,
    padding: 16,
    marginVertical: 4,
  },
  reconConc: { backgroundColor: Colors.accentLight, borderRadius: 10, padding: 12, alignItems: 'center', marginBottom: 14 },
  reconConcValue: { fontSize: 24, fontWeight: '800', color: Colors.accent },
  reconConcLabel: { fontSize: 12, color: Colors.accent, opacity: 0.8, marginTop: 2 },
  reconTableLabel: { fontSize: 10, fontWeight: '600', color: Colors.textSecondary, letterSpacing: 1.5, marginBottom: 8 },
  reconTableRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: Colors.border },
  reconTableDose: { fontSize: 14, color: Colors.text, fontWeight: '600' },
  reconTableMl: { fontSize: 14, color: Colors.accent, fontWeight: '700' },
  disclaimerWrap: { paddingHorizontal: 16, marginTop: 16 },
  disclaimer: { color: Colors.textSecondary, fontSize: 12 },
});
