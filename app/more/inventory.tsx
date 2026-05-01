import { useEffect, useState } from 'react';
import { FlatList, Modal, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import Colors from '@/constants/Colors';
import { useAuthStore } from '@/stores/authStore';
import { useInventoryStore } from '@/stores/inventoryStore';
import ScreenHeader from '@/components/ScreenHeader';

export default function InventoryScreen() {
  const user = useAuthStore((state) => state.user);
  const { items, fetchInventory, addVial } = useInventoryStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [concentration, setConcentration] = useState('');
  const [volume, setVolume] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (user?.id) fetchInventory(user.id);
  }, [fetchInventory, user?.id]);

  const saveVial = async () => {
    if (!user?.id) return;
    await addVial({ peptide_name: name, concentration_mg_per_ml: Number(concentration), volume_remaining_ml: Number(volume), expiry_date: expiryDate, notes: notes || null }, user.id);
    setOpen(false);
    setName(''); setConcentration(''); setVolume(''); setExpiryDate(''); setNotes('');
  };

  return <SafeAreaView style={styles.container}>
    <ScreenHeader title="Inventory" rightLabel="+ Add" onRightPress={() => setOpen(true)} />
    <View style={styles.header}>
      <Text style={styles.title}>Inventory</Text>
      <Pressable style={styles.addButton} onPress={() => setOpen(true)}><Text style={styles.addText}>+ Add Vial</Text></Pressable>
    </View>
    <FlatList data={items} keyExtractor={(item) => item.id} ListEmptyComponent={<Text style={styles.empty}>No vials yet.</Text>} renderItem={({ item }) => (
      <View style={styles.card}>
        <Text style={styles.name}>{item.peptide_name}</Text>
        <Text style={styles.meta}>Concentration: {item.concentration_mg_per_ml} mg/mL</Text>
        <Text style={styles.meta}>Remaining: {item.volume_remaining_ml} mL</Text>
        <Text style={styles.meta}>Expiry: {new Date(item.expiry_date).toLocaleDateString()}</Text>
      </View>
    )} />
    <Modal visible={open} animationType="slide" transparent>
      <View style={styles.overlay}><View style={styles.modal}>
        <Text style={styles.modalTitle}>Add Vial</Text>
        <TextInput style={styles.input} placeholder="Peptide name" placeholderTextColor={Colors.textSecondary} value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Concentration mg/mL" keyboardType="decimal-pad" placeholderTextColor={Colors.textSecondary} value={concentration} onChangeText={setConcentration} />
        <TextInput style={styles.input} placeholder="Remaining volume mL" keyboardType="decimal-pad" placeholderTextColor={Colors.textSecondary} value={volume} onChangeText={setVolume} />
        <TextInput style={styles.input} placeholder="Expiry date (YYYY-MM-DD)" placeholderTextColor={Colors.textSecondary} value={expiryDate} onChangeText={setExpiryDate} />
        <TextInput style={styles.input} placeholder="Notes" placeholderTextColor={Colors.textSecondary} value={notes} onChangeText={setNotes} />
        <Pressable style={styles.primary} onPress={saveVial}><Text style={styles.primaryText}>Save</Text></Pressable>
        <Pressable onPress={() => setOpen(false)}><Text style={styles.cancel}>Cancel</Text></Pressable>
      </View></View>
    </Modal>
  </SafeAreaView>;
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 16, backgroundColor: Colors.background }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }, title: { color: Colors.text, fontSize: 24, fontWeight: '700' }, addButton: { backgroundColor: '#2D6A4F', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }, addText: { color: '#fff', fontWeight: '700' }, card: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, padding: 12, marginBottom: 10 }, name: { color: Colors.text, fontSize: 16, fontWeight: '600' }, meta: { color: Colors.textSecondary, marginTop: 2 }, empty: { color: Colors.textSecondary, textAlign: 'center', marginTop: 50 }, overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000088' }, modal: { backgroundColor: Colors.background, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 16, gap: 8 }, modalTitle: { color: Colors.text, fontSize: 20, fontWeight: '700', marginBottom: 8 }, input: { borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card, color: Colors.text, borderRadius: 8, padding: 10 }, primary: { backgroundColor: '#2D6A4F', borderRadius: 8, padding: 12, alignItems: 'center' }, primaryText: { color: 'white', fontWeight: '700' }, cancel: { color: Colors.textSecondary, textAlign: 'center', marginTop: 10 } });
