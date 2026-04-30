import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, FlatList } from 'react-native';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';
import { useInventoryStore } from '@/stores/inventoryStore';
import { useAuthStore } from '@/stores/authStore';

type FilterTab = 'all' | 'active' | 'expired';

export default function InventoryScreen() {
  const [tab, setTab] = useState<FilterTab>('all');
  const { user } = useAuthStore();
  const { items, fetchInventory } = useInventoryStore();

  useEffect(() => {
    if (user?.id) fetchInventory(user.id);
  }, [user?.id, fetchInventory]);

  const today = new Date();

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const exp = new Date(item.expiration_date);
      if (tab === 'active') return exp >= today;
      if (tab === 'expired') return exp < today;
      return true;
    });
  }, [items, tab, today]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inventory</Text>
        <Pressable onPress={() => router.push('/more/inventory/add')} style={styles.plusButton}><Text style={styles.plus}>+</Text></Pressable>
      </View>
      <View style={styles.tabs}>
        {(['all', 'active', 'expired'] as const).map((item) => (
          <Pressable key={item} onPress={() => setTab(item)} style={[styles.tab, tab === item && styles.activeTab]}>
            <Text style={styles.tabText}>{item.toUpperCase()}</Text>
          </Pressable>
        ))}
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>📦</Text>
            <Text style={styles.emptyTitle}>No vials tracked yet</Text>
            <Text style={styles.empty}>Tap ＋ Add Vial to get started</Text>
          </View>
        }
        renderItem={({ item }) => {
          const days = Math.ceil((new Date(item.expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          const badgeColor = days < 0 ? '#DC2626' : days <= 14 ? '#EAB308' : Colors.accent;
          return (
            <View style={styles.card}>
              <Text style={styles.name}>{item.peptide_name}</Text>
              <Text style={styles.meta}>{item.vial_amount} {item.unit}</Text>
              <View style={[styles.badge, { backgroundColor: badgeColor }]}>
                <Text style={styles.badgeText}>{days < 0 ? 'Expired' : `Expires in ${days}d`}</Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}
const styles = StyleSheet.create({ container: { flex: 1, padding: 16, backgroundColor: Colors.background }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, title: { fontSize: 24, color: Colors.text, fontWeight: '700' }, plusButton: { backgroundColor: '#2D6A4F', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }, plus: { color: 'white', fontSize: 24, marginTop: -2 }, tabs: { flexDirection: 'row', gap: 8, marginVertical: 12 }, tab: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: Colors.card }, activeTab: { backgroundColor: '#2D6A4F' }, tabText: { color: Colors.text, fontWeight: '600' }, emptyWrap: { alignItems: 'center', marginTop: 52 }, emptyEmoji: { fontSize: 56, marginBottom: 8 }, emptyTitle: { color: Colors.text, fontSize: 20, fontWeight: '700', marginBottom: 6 }, empty: { textAlign: 'center', color: Colors.muted }, card: { backgroundColor: Colors.card, borderColor: Colors.border, borderWidth: 1, padding: 12, marginBottom: 10, borderRadius: 10 }, name: { color: Colors.text, fontWeight: '600', fontSize: 16 }, meta: { color: Colors.text, marginTop: 4 }, badge: { alignSelf: 'flex-start', marginTop: 8, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 }, badgeText: { color: 'white', fontSize: 12 } });
