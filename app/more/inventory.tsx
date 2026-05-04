import { useEffect, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Colors from '@/constants/Colors';
import { useAuthStore } from '@/stores/authStore';
import { useInventoryStore } from '@/stores/inventoryStore';
import ScreenHeader from '@/components/ScreenHeader';
import EmptyState from '@/components/EmptyState';

export default function InventoryScreen() {
  const user = useAuthStore((state) => state.user);
  const { items, fetchInventory, addVial, updateVialVolume, deleteVial } = useInventoryStore();
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
    try {
      await addVial(
        {
          peptide_name: name.trim(),
          concentration_mg_per_ml: Number(concentration) || 0,
          volume_remaining_ml: Number(volume) || 0,
          expiry_date: expiryDate.trim() || new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
          notes: notes.trim() || null,
        },
        user.id,
      );
      setOpen(false);
      setName(''); setConcentration(''); setVolume(''); setExpiryDate(''); setNotes('');
    } catch (e: any) {
      Alert.alert('Save failed', e?.message ?? 'Could not save vial. Please try again.');
    }
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
          <EmptyState
            emoji="📦"
            title="No vials yet"
            subtitle="Tap + Add to track your first vial."
            actionLabel="Add Vial"
            onAction={() => setOpen(true)}
          />
        }
        renderItem={({ item }) => {
          const expired = item.expiry_date < today;
          const empty = !expired && item.volume_remaining_ml === 0;
          const low = !expired && !empty && item.volume_remaining_ml <= 0.5;
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
                <View style={[styles.statusBadge, expired ? styles.badgeExpired : empty ? styles.badgeEmpty : low ? styles.badgeLow : styles.badgeActive]}>
                  <Text style={[styles.statusText, expired ? styles.textExpired : empty ? styles.textEmpty : low ? styles.textLow : styles.textActive]}>
                    {expired ? 'Expired' : empty ? 'Empty' : low ? 'Low' : 'Active'}
                  </Text>
                </View>
              </View>

              <View style={styles.actionDivider} />

              <View style={styles.actionRow}>
                <Pressable
                  style={styles.useDoseBtn}
                  onPress={() => {
                    Alert.alert(
                      'Mark Dose Used',
                      `Reduce volume for ${item.peptide_name}?`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: '−0.1 mL',
                          onPress: () => {
                            if (!user?.id) return;
                            const next = Math.max(0, item.volume_remaining_ml - 0.1);
                            void updateVialVolume(item.id, parseFloat(next.toFixed(2)), user.id);
                          },
                        },
                        {
                          text: '−0.2 mL',
                          onPress: () => {
                            if (!user?.id) return;
                            const next = Math.max(0, item.volume_remaining_ml - 0.2);
                            void updateVialVolume(item.id, parseFloat(next.toFixed(2)), user.id);
                          },
                        },
                      ],
                    );
                  }}
                >
                  <Text style={styles.useDoseText}>Use Dose</Text>
                </Pressable>

                <Pressable
                  style={styles.deleteBtn}
                  onPress={() => {
                    Alert.alert(
                      'Delete Vial',
                      `Remove ${item.peptide_name} from inventory?`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: () => {
                            if (!user?.id) return;
                            void deleteVial(item.id, user.id);
                          },
                        },
                      ],
                    );
                  }}
                >
                  <Text style={styles.deleteBtnText}>🗑</Text>
                </Pressable>
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
  card: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 14, padding: 14, marginBottom: 10 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  vialIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: Colors.accentLight, justifyContent: 'center', alignItems: 'center' },
  cardName: { color: Colors.text, fontSize: 15, fontWeight: '600' },
  cardMeta: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  badgeActive: { backgroundColor: Colors.accentLight },
  badgeLow: { backgroundColor: '#FEF3C7' },
  badgeExpired: { backgroundColor: '#FEE2E2' },
  badgeEmpty: { backgroundColor: '#F3F4F6' },
  statusText: { fontSize: 11, fontWeight: '700' },
  textActive: { color: Colors.accent },
  textLow: { color: '#D97706' },
  textExpired: { color: '#DC2626' },
  textEmpty: { color: '#9CA3AF' },
  actionDivider: { height: 1, backgroundColor: Colors.border, marginTop: 10, marginBottom: 10 },
  actionRow: { flexDirection: 'row', gap: 8 },
  useDoseBtn: { flex: 1, backgroundColor: Colors.accentLight, borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  useDoseText: { color: Colors.accent, fontSize: 13, fontWeight: '600' },
  deleteBtn: { width: 40, backgroundColor: '#FEE2E2', borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  deleteBtnText: { fontSize: 16 },
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
