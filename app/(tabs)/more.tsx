import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';

const items = [
  { label: '📦  Inventory', path: '/more/inventory' },
  { label: '💉  Injection Sites', path: '/more/injection-sites' },
  { label: '🏃  Lifestyle Log', path: '/log/lifestyle' },
  { label: '🩺  Symptoms Log', path: '/log/symptoms' },
  { label: '⚙️  Settings', path: '/settings' },
];

export default function MoreTabScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>More</Text>
      <View style={styles.list}>
        {items.map((item) => (
          <Pressable
            key={item.path}
            style={styles.navItem}
            onPress={() => router.push(item.path as any)}
          >
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.arrow}>›</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  title: { fontSize: 28, fontWeight: '700', color: Colors.text, padding: 16, paddingBottom: 8 },
  list: { padding: 16, gap: 10 },
  navItem: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: { color: Colors.text, fontSize: 16, fontWeight: '600' },
  arrow: { color: Colors.textSecondary, fontSize: 20 },
});
