import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';
import { SymptomType, useSymptomStore } from '@/stores/symptomStore';
import { useAuthStore } from '@/stores/authStore';

export default function SymptomsScreen() {
  const user = useAuthStore((state) => state.user);
  const addLog = useSymptomStore((state) => state.addLog);
  const [type, setType] = useState<SymptomType>('fatigue');
  const [severity, setSeverity] = useState(5);
  const [notes, setNotes] = useState('');

  const save = async () => {
    if (!user?.id) return;
    await addLog({ symptom_type: type, severity, notes: notes || null, logged_at: new Date().toISOString() }, user.id);
    router.back();
  };

  return <View style={styles.container}>
    <Text style={styles.label}>Symptom Type</Text>
    <View style={styles.pickerWrap}><Picker selectedValue={type} onValueChange={(value) => setType(value as SymptomType)} style={styles.picker}><Picker.Item label="fatigue" value="fatigue" /><Picker.Item label="headache" value="headache" /><Picker.Item label="nausea" value="nausea" /><Picker.Item label="joint pain" value="joint pain" /><Picker.Item label="other" value="other" /></Picker></View>
    <Text style={styles.label}>Severity: {severity}</Text>
    <Slider minimumValue={1} maximumValue={10} step={1} minimumTrackTintColor="#2D6A4F" maximumTrackTintColor={Colors.border} thumbTintColor="#2D6A4F" value={severity} onValueChange={setSeverity} />
    <Text style={styles.label}>Notes</Text>
    <TextInput style={styles.input} value={notes} onChangeText={setNotes} placeholder="Optional notes" placeholderTextColor={Colors.textSecondary} multiline />
    <Pressable style={styles.button} onPress={save}><Text style={styles.buttonText}>Save Symptom</Text></Pressable>
  </View>;
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 16, backgroundColor: Colors.background }, label: { color: Colors.text, marginBottom: 8, fontWeight: '600' }, pickerWrap: { borderWidth: 1, borderColor: Colors.border, borderRadius: 8, backgroundColor: Colors.card, marginBottom: 12 }, picker: { color: Colors.text }, input: { minHeight: 96, borderColor: Colors.border, borderWidth: 1, backgroundColor: Colors.card, borderRadius: 8, color: Colors.text, padding: 10, textAlignVertical: 'top' }, button: { marginTop: 16, backgroundColor: '#2D6A4F', borderRadius: 8, padding: 12, alignItems: 'center' }, buttonText: { color: '#fff', fontWeight: '700' } });
