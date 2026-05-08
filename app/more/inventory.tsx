import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Colors from '@/constants/Colors';
import { useAuthStore } from '@/stores/authStore';
import { useInventoryStore, type InventoryItem } from '@/stores/inventoryStore';
import { useProtocolStore, type Protocol } from '@/stores/protocolStore';
import ScreenHeader from '@/components/ScreenHeader';
import EmptyState from '@/components/EmptyState';

type DoseRemainingInfo = {
  count: number;
  label: string;
  color: string;
  vialMg: number;
  doseMcg: number;
  sourceLabel: string;
};

type ReconstitutionInfo = {
  volumeMl: number;
  vialMg: number;
  concentrationMcgPerMl: number;
};

const getErrorMessage = (error: unknown, fallback: string): string => (
  error instanceof Error ? error.message : fallback
);

type InventoryDoseFields = InventoryItem & {
  vial_mg?: number | null;
  total_amount?: number | null;
  water_ml?: number | null;
  reconstitution_amount_ml?: number | null;
  dose_amount?: number | null;
  dose_mcg?: number | null;
  manual_dose_mcg?: number | null;
  protocol_id?: string | null;
};

const toPositiveNumber = (value: unknown): number | null => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : null;
};

const doseToMcg = (amount: number, unit?: string | null): number | null => {
  if (!Number.isFinite(amount) || amount <= 0) return null;
  if (unit === 'mcg') return amount;
  if (unit === 'mg') return amount * 1000;
  return null;
};

const getItemVialMg = (item: InventoryDoseFields): number | null => (
  toPositiveNumber(item.vial_mg)
  ?? toPositiveNumber(item.total_amount)
  ?? toPositiveNumber(item.concentration_mg_per_ml * item.volume_remaining_ml)
);

const getItemWaterMl = (item: InventoryDoseFields): number | null => (
  toPositiveNumber(item.water_ml)
  ?? toPositiveNumber(item.reconstitution_amount_ml)
  ?? toPositiveNumber(item.volume_remaining_ml)
);

const findLinkedProtocol = (item: InventoryDoseFields, protocols: Protocol[]): Protocol | undefined => {
  if (item.protocol_id) {
    const byId = protocols.find((protocol) => protocol.id === item.protocol_id);
    if (byId) return byId;
  }

  const itemName = item.peptide_name.trim().toLowerCase();
  return protocols.find((protocol) => protocol.name.trim().toLowerCase() === itemName && protocol.status === 'active')
    ?? protocols.find((protocol) => protocol.name.trim().toLowerCase() === itemName);
};

const getDoseMcg = (item: InventoryDoseFields, protocol?: Protocol): { doseMcg: number; sourceLabel: string } | null => {
  const noteDoseMatch = item.storage_notes?.match(/dose:\s*(\d+(?:\.\d+)?)\s*mcg/i);
  const noteDoseMcg = noteDoseMatch ? Number(noteDoseMatch[1]) : null;
  const manualDose = toPositiveNumber(item.dose_mcg) ?? toPositiveNumber(item.manual_dose_mcg) ?? toPositiveNumber(noteDoseMcg);
  if (manualDose) return { doseMcg: manualDose, sourceLabel: 'Manual dose' };

  const itemDoseAmount = toPositiveNumber(item.dose_amount);
  if (itemDoseAmount) return { doseMcg: itemDoseAmount, sourceLabel: 'Manual dose' };

  if (!protocol) return null;
  const protocolDose = doseToMcg(protocol.dose_amount, protocol.dose_unit);
  return protocolDose ? { doseMcg: protocolDose, sourceLabel: protocol.name } : null;
};

const getDosesRemainingInfo = (item: InventoryDoseFields, protocol?: Protocol): DoseRemainingInfo | null => {
  const vialMg = getItemVialMg(item);
  const doseInfo = getDoseMcg(item, protocol);
  if (!vialMg || !doseInfo) return null;

  const count = Math.floor((vialMg * 1000) / doseInfo.doseMcg);
  if (!Number.isFinite(count)) return null;

  if (count <= 1) {
    return { count, label: 'Low supply', color: Colors.error, vialMg, ...doseInfo };
  }

  return {
    count,
    label: `${count} doses remaining`,
    color: count > 5 ? Colors.success : Colors.warning,
    vialMg,
    ...doseInfo,
  };
};

const getReconstitutionInfo = (item: InventoryDoseFields): ReconstitutionInfo | null => {
  const waterMl = getItemWaterMl(item);
  const vialMg = getItemVialMg(item);
  if (!waterMl || !vialMg) return null;

  return {
    volumeMl: waterMl,
    vialMg,
    concentrationMcgPerMl: (vialMg * 1000) / waterMl,
  };
};

const formatCompactNumber = (value: number): string => {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2).replace(/\.?0+$/, '');
};

export default function InventoryScreen() {
  const user = useAuthStore((state) => state.user);
  const { items, fetchInventory, addVial, updateVialVolume, deleteVial } = useInventoryStore();
  const { protocols, fetchProtocols } = useProtocolStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [concentration, setConcentration] = useState('');
  const [volume, setVolume] = useState('');
  const [manualDoseMcg, setManualDoseMcg] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [storageNotes, setStorageNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedReconIds, setExpandedReconIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user?.id) {
      fetchInventory(user.id);
      fetchProtocols(user.id);
    }
  }, [fetchInventory, fetchProtocols, user?.id]);

  const saveVial = async () => {
    if (!user?.id || !name.trim()) return;
    try {
      const manualDoseNote = toPositiveNumber(manualDoseMcg) ? `Dose: ${formatCompactNumber(Number(manualDoseMcg))}mcg` : '';
      const notes = [storageNotes.trim(), manualDoseNote].filter(Boolean).join(' · ');
      await addVial(
        {
          peptide_name: name.trim(),
          concentration_mg_per_ml: Number(concentration) || 0,
          volume_remaining_ml: Number(volume) || 0,
          expiry_date: expiryDate.trim() || new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
          storage_notes: notes || null,
        },
        user.id,
      );
      setOpen(false);
      setName(''); setConcentration(''); setVolume(''); setManualDoseMcg(''); setExpiryDate(''); setStorageNotes('');
    } catch (e: unknown) {
      Alert.alert('Save failed', getErrorMessage(e, 'Could not save vial. Please try again.'));
    }
  };

  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();
  const soonThreshold = new Date(now.getTime() + 30 * 86400000);
  const filteredItems = items.filter((i) => i.peptide_name.toLowerCase().includes(searchQuery.toLowerCase()));
  const linkedProtocolsByItemId = useMemo(() => (
    items.reduce<Record<string, Protocol | undefined>>((acc, item) => {
      acc[item.id] = findLinkedProtocol(item, protocols);
      return acc;
    }, {})
  ), [items, protocols]);
  const lowStockCount = items.filter((item) => {
    const expired = item.expiry_date < today;
    return !expired && item.volume_remaining_ml <= 0.5;
  }).length;
  const expiringSoonCount = items.filter((item) => {
    const expiry = new Date(item.expiry_date);
    return expiry >= now && expiry <= soonThreshold;
  }).length;

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Inventory" rightLabel="+ Add" onRightPress={() => setOpen(true)} />

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <View style={styles.statsCard}>
              <View style={styles.statChip}>
                <Text style={styles.statValue}>{items.length}</Text>
                <Text style={styles.statLabel}>Total Vials</Text>
              </View>
              <View style={[styles.statChip, styles.statChipBorder]}>
                <Text style={[styles.statValue, { color: '#D97706' }]}>{lowStockCount}</Text>
                <Text style={styles.statLabel}>Low Stock</Text>
              </View>
              <View style={[styles.statChip, styles.statChipBorder]}>
                <Text style={[styles.statValue, { color: '#DC2626' }]}>{expiringSoonCount}</Text>
                <Text style={styles.statLabel}>Expiring Soon</Text>
              </View>
            </View>
            <View style={styles.searchBar}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search inventory..."
                placeholderTextColor={Colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>
        }
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
          const low = !expired && item.volume_remaining_ml <= 0.5;
          const linkedProtocol = linkedProtocolsByItemId[item.id];
          const dosesRemaining = getDosesRemainingInfo(item, linkedProtocol);
          const reconstitution = getReconstitutionInfo(item);
          const reconExpanded = Boolean(expandedReconIds[item.id]);
          return (
            <Pressable
              style={styles.rowCard}
              onPress={() => {
                Alert.alert(
                  item.peptide_name,
                  'Choose an action',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Use Dose',
                      onPress: () => {
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
                      },
                    },
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
              <View style={styles.rowContent}>
                <View style={styles.vialIcon}>
                  <Text style={{ fontSize: 18 }}>💉</Text>
                </View>
                <View style={styles.rowTextWrap}>
                  <Text style={styles.cardName}>{item.peptide_name}</Text>
                  <Text style={styles.cardMeta}>
                    {item.concentration_mg_per_ml}mg · Exp: {new Date(item.expiry_date).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.qtyBadge}>
                  <Text style={styles.qtyText}>Qty: {item.volume_remaining_ml}mL</Text>
                </View>
                <View style={[styles.statusDot, expired ? styles.dotExpired : low ? styles.dotLow : styles.dotActive]} />
              </View>
              {dosesRemaining ? (
                <Text style={[styles.dosesRemainingText, { color: dosesRemaining.color }]}>
                  {dosesRemaining.label}
                </Text>
              ) : null}
              {reconstitution ? (
                <Pressable
                  style={styles.reconHelper}
                  onPress={() => setExpandedReconIds((current) => ({ ...current, [item.id]: !current[item.id] }))}
                >
                  <View style={styles.reconSummaryRow}>
                    <Text style={styles.reconSummaryText}>
                      {formatCompactNumber(reconstitution.volumeMl)}mL + {formatCompactNumber(reconstitution.vialMg)}mg = {formatCompactNumber(reconstitution.concentrationMcgPerMl)}mcg/mL
                    </Text>
                    <Text style={styles.reconChevron}>{reconExpanded ? '⌃' : '⌄'}</Text>
                  </View>
                  {reconExpanded ? (
                    <View style={styles.reconBreakdown}>
                      <Text style={styles.reconBreakdownText}>
                        Concentration: ({formatCompactNumber(reconstitution.vialMg)}mg × 1000) ÷ {formatCompactNumber(reconstitution.volumeMl)}mL = {formatCompactNumber(reconstitution.concentrationMcgPerMl)}mcg/mL
                      </Text>
                      {dosesRemaining ? (
                        <Text style={styles.reconBreakdownText}>
                          Doses: floor(({formatCompactNumber(dosesRemaining.vialMg)}mg × 1000) ÷ {formatCompactNumber(dosesRemaining.doseMcg)}mcg) from {dosesRemaining.sourceLabel}
                        </Text>
                      ) : null}
                    </View>
                  ) : null}
                </Pressable>
              ) : null}
            </Pressable>
          );
        }}
      />
      <View style={styles.bottomCtaWrap}>
        <Pressable style={styles.bottomCtaBtn} onPress={() => setOpen(true)}>
          <Text style={styles.bottomCtaText}>+ Add Item</Text>
        </Pressable>
      </View>

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

              <Text style={styles.fieldLabel}>Dose Amount (mcg, optional)</Text>
              <TextInput style={styles.input} placeholder="e.g. 250" keyboardType="decimal-pad" placeholderTextColor={Colors.textSecondary} value={manualDoseMcg} onChangeText={setManualDoseMcg} />

              <Text style={styles.fieldLabel}>Expiry Date</Text>
              <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={Colors.textSecondary} value={expiryDate} onChangeText={setExpiryDate} keyboardType="numbers-and-punctuation" />

              <Text style={styles.fieldLabel}>Notes (optional)</Text>
              <TextInput style={[styles.input, { minHeight: 72, textAlignVertical: 'top' }]} placeholder="Any notes..." placeholderTextColor={Colors.textSecondary} value={storageNotes} onChangeText={setStorageNotes} multiline />

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
  listContent: { padding: 16, paddingBottom: 120 },
  headerWrap: { marginBottom: 10, gap: 10 },
  statsCard: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 14, flexDirection: 'row' },
  statChip: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  statChipBorder: { borderLeftWidth: 1, borderColor: Colors.border },
  statValue: { color: Colors.text, fontSize: 20, fontWeight: '700' },
  statLabel: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  searchBar: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 12, height: 44, alignItems: 'center', flexDirection: 'row' },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: Colors.text, fontSize: 14 },
  rowCard: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 14, padding: 12, marginBottom: 10 },
  rowContent: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  vialIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.accentLight, justifyContent: 'center', alignItems: 'center' },
  rowTextWrap: { flex: 1 },
  cardName: { color: Colors.text, fontSize: 15, fontWeight: '600' },
  cardMeta: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  qtyBadge: { backgroundColor: Colors.accentLight, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  qtyText: { color: Colors.accent, fontSize: 12, fontWeight: '600' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { backgroundColor: Colors.accent },
  dotLow: { backgroundColor: '#D97706' },
  dotExpired: { backgroundColor: '#DC2626' },
  dosesRemainingText: { fontSize: 13, fontWeight: '700', marginTop: 10 },
  reconHelper: { backgroundColor: Colors.background, borderColor: Colors.border, borderRadius: 10, borderWidth: 1, marginTop: 10, padding: 10 },
  reconSummaryRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  reconSummaryText: { color: Colors.text, flex: 1, fontSize: 12, fontWeight: '600' },
  reconChevron: { color: Colors.textSecondary, fontSize: 16, fontWeight: '700' },
  reconBreakdown: { borderTopColor: Colors.border, borderTopWidth: 1, gap: 4, marginTop: 8, paddingTop: 8 },
  reconBreakdownText: { color: Colors.textSecondary, fontSize: 12, lineHeight: 17 },
  bottomCtaWrap: { position: 'absolute', left: 16, right: 16, bottom: 18 },
  bottomCtaBtn: { backgroundColor: Colors.accent, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  bottomCtaText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
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
