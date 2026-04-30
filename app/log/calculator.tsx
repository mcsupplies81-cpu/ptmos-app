import React, { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, Text, TextInput, View } from 'react-native';
import { Copy } from '../../constants/Copy';

export default function CalculatorScreen() {
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

  return (
    <SafeAreaView style={{ flex: 1, paddingHorizontal: 16 }}>
      <Text>Reconstitution</Text>
      <TextInput value={peptideMg} onChangeText={setPeptideMg} keyboardType="decimal-pad" />
      <TextInput value={waterMl} onChangeText={setWaterMl} keyboardType="decimal-pad" />
      <Text>{recon == null ? '--' : `${recon.toFixed(2)} mg/mL`}</Text>
      <Text>Dose</Text>
      <TextInput value={concentration} onChangeText={setConcentration} keyboardType="decimal-pad" />
      <TextInput value={desiredMcg} onChangeText={setDesiredMcg} keyboardType="decimal-pad" />
      <Text>{dose == null ? '--' : `${dose.volume.toFixed(2)} mL`}</Text>
      <Text>{dose == null ? '--' : `${Math.round(dose.units)} units on a U-100 syringe`}</Text>
      <Pressable onPress={() => { setPeptideMg(''); setWaterMl(''); setConcentration(''); setDesiredMcg(''); }}><Text>Reset</Text></Pressable>
      <View><Text>{Copy.calculatorDisclaimer}</Text></View>
    </SafeAreaView>
  );
}
