import { useEffect, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
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
    if (!user?.id || !name.trim()) return;
    await addVial(
      {
        peptide_name: name.trim(),
        concentration_mg_per_ml: Number(concentration),
        volume_remaining_ml: Number(volume),
        expiry_date: expiryDate,
        notes: notes.trim() || null,
      },
      user.id,
    );
    setOpen(false);
    setName(''); setConcentration(''); setVolume(''); setExpiryDate(''); setNotes('');
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Inventory" rightLabel="+ Add" onRightPress={() => setOpen(true)} />

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>💊</Text>
            <Text style={styles.emptyTitle}>No vials yet</Text>
            <Text style={styles.emptySub}>Tap + Add to log your first vial</Text>
          </View>
        }
        renderItem={({ item }) => {
          const expired = item.expiry_date < today;
          const low = !expired && item.volume_remaining_ml < 1;
          return (
            <View style={styles.card}>
              <View style={styles.cardRow}>
                <View style={styles.vialIcon}>
                  <Text style={{ fontSize: 22 }}>💉</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardName}>{item.peptide_name}</Text>
                  <Text style={styles.cardMeta}>{item.concentration_mg_per_ml} mg/mL  ·  {item.volume_remaining_ml} mL left</Text>
                  <Text style={styles.cardMeta}>Exp: {new Date(item.expiry_date).toLocaleDateString()}</Text>
                </View>
                <View style={[styles.statusBadge, expired ? styles.badgeExpired : low ? styles.badgeLow : styles.badgeActive]}>
                  <Text style={[styles.statusText, expired ? styles.textExpired : low ? styles.textLow : styles.textActive]}>
                    {expired ? 'Expired' : low ? 'Low' : 'Active'}
                  </Text>
                </View>
              </View>
            </View>
          );
        }}
      />

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable style={styles.dismissArea} onPress={() => setOpen(false)} />
          <View style={styles.modal}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Add Vial</Text>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>Peptide Name</Text>
              <TextInput style={styles.input} placeholder="e.g. BPC-157" placeholderTextColor={Colors.textSecondary} value={name} onChangeText={setName} returnKeyType="next" />

              <Text style={styles.fieldLabel}>Concentration (mg/mL)</Text>
              <TextInput style={styles.input} placeholder="e.g. 5" keyboardType="decimal-pad" placeholderTextColor={Colors.textSecondary} value={concentration} onChangeText={setConcentration} />

              <Text style={styles.fieldLabel}>Volume Remaining (mL)</Text>
              <TextInput style={styles.input} placeholder="e.g. 2" keyboardType="decimal-pad" placeholderTextColor={Colors.textSecondary} value={volume} onChangeText={setVolume} />

              <Text style={styles.fieldLabel}>Expiry Date</Text>
              <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={Colors.textSecondary} value={expiryDate} onChangeText={setExpiryDate} keyboardType="numbers-and-punctuation" />

              <Text style={styles.fieldLabel}>Notes (optional)</Text>
              <TextInput style={[styles.input, { minHeight: 72, textAlignVertical: 'top' }]} placeholder="Any notes..." placeholderTextColor={Colors.textSecondary} value={notes} onChangeText={setNotes} multiline />

              <Pressable style={[styles.saveBtn, !name.trim() && { opacity: 0.4 }]} onPress={saveVial} disabled={!name.trim()}>
                <Text style={styles.saveBtnText}>Save Vial</Text>
              </Pressable>
              <Pressable onPress={() => setOpen(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  listContent: { padding: 16, paddingBottom: 32 },
  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginTop: 12 },
  emptySub: { fontSize: 14, color: Colors.textSecondary, marginTop: 6 },
  card: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 14, padding: 14, marginBottom: 10 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  vialIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: Colors.accentLight, justifyContent: 'center', alignItems: 'center' },
  cardName: { color: Colors.text, fontSize: 15, fontWeight: '600' },
  cardMeta: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  badgeActive: { backgroundColor: Colors.accentLight },
  badgeLow: { backgroundColor: '#FEF3C7' },
  badgeExpired: { backgroundColor: '#FEE2E2' },
  statusText: { fontSize: 11, fontWeight: '700' },
  textActive: { color: Colors.accent },
  textLow: { color: '#D97706' },
  textExpired: { color: '#DC2626' },
  overlay: { flex: 1, justifyContent: 'flex-end' },
  dismissArea: { flex: 1, backgroundColor: '#00000066' },
  modal: { backgroundColor: Colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40, maxHeight: '90%' },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { color: Colors.text, fontSize: 20, fontWeight: '700', marginBottom: 16 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6, letterSpacing: 0.5 },
  input: { borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card, color: Colors.text, borderRadius: 10, padding: 12, marginBottom: 14, fontSize: 15 },
  saveBtn: { backgroundColor: Colors.accent, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 4, marginBottom: 12 },
  saveBtnText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  cancelText: { color: Colors.textSecondary, textAlign: 'center', paddingBottom: 8 },
});
