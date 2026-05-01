import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, FlatList } from 'react-native';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';
import { useInventoryStore } from '@/stores/inventoryStore';
import { useAuthStore } from '@/stores/authStore';
import { ScreenHeader } from '@/components/ScreenHeader';

type FilterTab = 'All' | 'Active' | 'Expired';

export default function InventoryScreen() {
  const [tab, setTab] = useState<FilterTab>('All');
  const { user } = useAuthStore();
  const { items, fetchInventory } = useInventoryStore();

  useEffect(() => {
    if (user?.id) fetchInventory(user.id);
  }, [user?.id, fetchInventory]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const expRaw = (item as any).expiry_date ?? (item as any).expiration_date;
      if (!expRaw) return tab !== 'Expired';
      const exp = new Date(expRaw);
      exp.setHours(0, 0, 0, 0);
      const expired = exp < today;
      if (tab === 'Active') return !expired;
      if (tab === 'Expired') return expired;
      return true;
    });
  }, [items, tab, today]);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Inventory" />
      <View style={styles.headerRow}>
        <Text style={styles.subtitle}>Track your available vials</Text>
        <Pressable onPress={() => router.push('/more/inventory/add')} style={styles.plusButton}><Text style={styles.plus}>+</Text></Pressable>
      </View>

      <View style={styles.tabs}>
        {(['All', 'Active', 'Expired'] as const).map((item) => (
          <Pressable key={item} onPress={() => setTab(item)} style={[styles.tabPill, tab === item && styles.tabPillActive]}>
            <Text style={[styles.tabText, tab === item && styles.tabTextActive]}>{item}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No items yet</Text>}
        renderItem={({ item }) => {
          const expRaw = (item as any).expiry_date ?? (item as any).expiration_date;
          const expDate = expRaw ? new Date(expRaw) : null;
          const isExpired = expDate ? expDate < today : false;
          const isLow = Number((item as any).volume_remaining_ml ?? 0) < 1;
          const status = isExpired ? 'Expired' : isLow ? 'Low' : 'Active';

          return (
            <View style={styles.card}>
              <View style={styles.cardRow}>
                <View style={styles.iconWrap}><Text style={styles.icon}>💉</Text></View>
                <View style={styles.cardMid}>
                  <Text style={styles.name}>{item.peptide_name}</Text>
                  <Text style={styles.meta}>{(item as any).concentration_mg_per_ml ?? item.vial_amount} mg/mL  ·  {(item as any).volume_remaining_ml ?? item.unit} mL remaining</Text>
                  <Text style={styles.exp}>Exp: {expDate ? expDate.toLocaleDateString() : 'N/A'}</Text>
                </View>
                <View style={[styles.badge, status === 'Expired' ? styles.badgeExpired : status === 'Low' ? styles.badgeLow : styles.badgeActive]}>
                  <Text style={[styles.badgeText, status === 'Expired' ? styles.badgeTextExpired : status === 'Low' ? styles.badgeTextLow : styles.badgeTextActive]}>{status}</Text>
                </View>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: Colors.background },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  subtitle: { color: Colors.textSecondary, fontSize: 13 },
  plusButton: { backgroundColor: Colors.accent, width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  plus: { color: Colors.white, fontSize: 24, marginTop: -2 },
  tabs: { flexDirection: 'row', backgroundColor: Colors.card, borderRadius: 999, borderWidth: 1, borderColor: Colors.border, padding: 4, gap: 8, marginBottom: 12 },
  tabPill: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 999 },
  tabPillActive: { backgroundColor: Colors.accent },
  tabText: { color: Colors.textSecondary, fontWeight: '600' },
  tabTextActive: { color: Colors.white },
  empty: { textAlign: 'center', color: Colors.textSecondary, marginTop: 40 },
  card: { backgroundColor: Colors.card, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: Colors.border },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: { width: 48, height: 48, backgroundColor: Colors.accentLight, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 22 },
  cardMid: { flex: 1, marginLeft: 12 },
  name: { fontWeight: '700', fontSize: 15, color: Colors.text },
  meta: { fontSize: 13, color: Colors.textSecondary, marginTop: 3 },
  exp: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  badgeExpired: { backgroundColor: '#FEE2E2' },
  badgeLow: { backgroundColor: '#FEF3C7' },
  badgeActive: { backgroundColor: Colors.accentLight },
  badgeText: { fontSize: 11, fontWeight: '700' },
  badgeTextExpired: { color: '#DC2626' },
  badgeTextLow: { color: '#D97706' },
  badgeTextActive: { color: Colors.accent },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(17,24,39,0.35)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: Colors.white, borderRadius: 12, padding: 14 },
  modalInput: { borderRadius: 8, padding: 10, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card, color: Colors.text },
});
