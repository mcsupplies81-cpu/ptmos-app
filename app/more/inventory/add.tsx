import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';
import { useInventoryStore } from '@/stores/inventoryStore';
import { useAuthStore } from '@/stores/authStore';

export default function AddInventoryScreen() {
  const { user } = useAuthStore();
  const addItem = useInventoryStore((s) => s.addItem);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ peptide_name: '', vial_amount: '', unit: 'mg', date_received: '', expiration_date: '', storage_notes: '' });
  const save = async () => { if (!user?.id) return; setSaving(true); try { await addItem({ peptide_name: form.peptide_name, vial_amount: Number(form.vial_amount), unit: form.unit, reconstitution_amount_ml: null, concentration: null, date_received: form.date_received, expiration_date: form.expiration_date, date_reconstituted: null, storage_notes: form.storage_notes || null, protocol_id: null, remaining_amount: null }, user.id); router.back(); } finally { setSaving(false); } };
  return <View style={styles.container}><TextInput style={styles.input} placeholder="Peptide Name" placeholderTextColor={Colors.muted} value={form.peptide_name} onChangeText={(t)=>setForm((f)=>({...f,peptide_name:t}))} /><TextInput style={styles.input} placeholder="Vial Amount" keyboardType="decimal-pad" placeholderTextColor={Colors.muted} value={form.vial_amount} onChangeText={(t)=>setForm((f)=>({...f,vial_amount:t}))} /><View style={styles.row}>{['mg','mcg','IU'].map((u)=><Pressable key={u} onPress={()=>setForm((f)=>({...f,unit:u}))} style={[styles.unit,form.unit===u&&styles.unitA]}><Text style={styles.t}>{u}</Text></Pressable>)}</View><TextInput style={styles.input} placeholder="Date Received YYYY-MM-DD" placeholderTextColor={Colors.muted} value={form.date_received} onChangeText={(t)=>setForm((f)=>({...f,date_received:t}))} /><TextInput style={styles.input} placeholder="Expiration YYYY-MM-DD" placeholderTextColor={Colors.muted} value={form.expiration_date} onChangeText={(t)=>setForm((f)=>({...f,expiration_date:t}))} /><TextInput style={styles.input} placeholder="Storage Notes" placeholderTextColor={Colors.muted} value={form.storage_notes} onChangeText={(t)=>setForm((f)=>({...f,storage_notes:t}))} /><Pressable style={styles.save} onPress={save} disabled={saving}>{saving?<ActivityIndicator color={Colors.background}/>:<Text style={styles.saveText}>Save</Text>}</Pressable></View>;
}
const styles=StyleSheet.create({container:{flex:1,padding:16,gap:10,backgroundColor:Colors.background},input:{borderWidth:1,borderColor:Colors.border,backgroundColor:Colors.card,color:Colors.text,padding:12,borderRadius:10},row:{flexDirection:'row',gap:8},unit:{padding:10,borderRadius:8,borderWidth:1,borderColor:Colors.border,backgroundColor:Colors.card},unitA:{backgroundColor:Colors.accent},t:{color:Colors.text},save:{backgroundColor:Colors.accent,padding:12,borderRadius:10,alignItems:'center'},saveText:{color:Colors.background,fontWeight:'700'}});
