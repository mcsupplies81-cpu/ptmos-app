import React, { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import Colors from '@/constants/Colors';
import { Copy } from '@/constants/Copy';
import ScreenHeader from '@/components/ScreenHeader';

export default function CalculatorScreen() {
  const [mode, setMode] = useState<'reconstitution' | 'dose'>('reconstitution');
  const [peptideMg, setPeptideMg] = useState('');
  const [waterMl, setWaterMl] = useState('');
  const [concentration, setConcentration] = useState('');
  const [desiredMcg, setDesiredMcg] = useState('');

  const recon = useMemo(() => {
    const mg = Number(peptideMg);
    const ml = Number(waterMl);
    if (!mg || !ml) return null;
    return mg / ml;
  }, [peptideMg, waterMl]);

  const dose = useMemo(() => {
    const conc = Number(concentration);
    const mcg = Number(desiredMcg);
    if (!conc || !mcg) return null;
    const volume = (mcg / 1000) / conc;
    return { volume, units: volume * 100 };
  }, [concentration, desiredMcg]);

  const inputStyle = {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    color: Colors.text,
    backgroundColor: Colors.card,
  } as const;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScreenHeader title="Calculator" subtitle="Reconstitution & dose tools" />

      <View
        style={{
          flexDirection: 'row',
          margin: 16,
          marginBottom: 0,
          borderWidth: 1,
          borderColor: Colors.border,
          borderRadius: 10,
          overflow: 'hidden',
        }}
      >
        <Pressable
          onPress={() => setMode('reconstitution')}
          style={{
            flex: 1,
            height: 44,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: mode === 'reconstitution' ? Colors.accent : Colors.card,
          }}
        >
          <Text style={{ color: mode === 'reconstitution' ? Colors.white : Colors.textSecondary, fontWeight: mode === 'reconstitution' ? '700' : '600' }}>
            Reconstitution
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setMode('dose')}
          style={{
            flex: 1,
            height: 44,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: mode === 'dose' ? Colors.accent : Colors.card,
          }}
        >
          <Text style={{ color: mode === 'dose' ? Colors.white : Colors.textSecondary, fontWeight: mode === 'dose' ? '700' : '600' }}>
            Dose
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {mode === 'reconstitution' ? (
          <>
            <Text style={{ color: Colors.text, marginBottom: 6 }}>Peptide Amount (mg)</Text>
            <TextInput style={inputStyle} value={peptideMg} onChangeText={setPeptideMg} keyboardType="decimal-pad" />

            <Text style={{ color: Colors.text, marginBottom: 6 }}>Bacteriostatic Water (mL)</Text>
            <TextInput style={inputStyle} value={waterMl} onChangeText={setWaterMl} keyboardType="decimal-pad" />

            <View style={{ backgroundColor: Colors.accentLight, borderRadius: 10, padding: 12, marginBottom: 12 }}>
              <Text style={{ color: Colors.success, fontWeight: '700' }}>
                Concentration: {recon == null ? '--' : `${recon.toFixed(2)} mg/mL`}
              </Text>
            </View>

            <Text style={{ color: Colors.text, marginBottom: 6 }}>Concentration (mg/mL)</Text>
            <TextInput style={inputStyle} value={concentration} onChangeText={setConcentration} keyboardType="decimal-pad" />

            <Text style={{ color: Colors.text, marginBottom: 6 }}>Desired Dose (mcg)</Text>
            <TextInput style={inputStyle} value={desiredMcg} onChangeText={setDesiredMcg} keyboardType="decimal-pad" />

            <Text style={{ color: Colors.text, marginBottom: 4 }}>{dose == null ? '--' : `${dose.volume.toFixed(2)} mL`}</Text>
            <Text style={{ color: Colors.textSecondary, marginBottom: 12 }}>
              {dose == null ? '--' : `${Math.round(dose.units)} units on a U-100 syringe`}
            </Text>
          </>
        ) : (
          <>
            <Text style={{ color: Colors.text, marginBottom: 6 }}>Peptide Amount (mg)</Text>
            <TextInput style={inputStyle} value={peptideMg} onChangeText={setPeptideMg} keyboardType="decimal-pad" />

            <Text style={{ color: Colors.text, marginBottom: 6 }}>Desired Dose (mcg)</Text>
            <TextInput style={inputStyle} value={desiredMcg} onChangeText={setDesiredMcg} keyboardType="decimal-pad" />

            <Text style={{ color: Colors.text, marginBottom: 6 }}>Concentration (mg/mL)</Text>
            <TextInput style={inputStyle} value={concentration} onChangeText={setConcentration} keyboardType="decimal-pad" />

            <View style={{ backgroundColor: Colors.accentLight, borderRadius: 10, padding: 12, marginBottom: 12 }}>
              <Text style={{ color: Colors.success, fontWeight: '700' }}>
                Volume to inject:{' '}
                {dose == null
                  ? '--'
                  : `${(dose.volume * 1000).toFixed(2)} µL  ·  ${(dose.volume * 100).toFixed(1)} units (U-100)`}
              </Text>
            </View>
          </>
        )}

        <Pressable onPress={() => { setPeptideMg(''); setWaterMl(''); setConcentration(''); setDesiredMcg(''); }}>
          <Text style={{ color: Colors.text }}>Reset</Text>
        </Pressable>
        <View><Text style={{ color: Colors.textSecondary }}>{Copy.calculatorDisclaimer}</Text></View>
      </ScrollView>
    </SafeAreaView>
  );
}
