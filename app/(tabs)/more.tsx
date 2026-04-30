import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';

export default function MoreTabScreen() {
  return (
    <View style={styles.container}>
      <Pressable style={styles.navItem} onPress={() => router.push('/more/inventory')}>
        <Text style={styles.label}>Inventory</Text>
      </Pressable>
      <Pressable style={styles.navItem} onPress={() => router.push('/more/injection-sites')}>
        <Text style={styles.label}>Injection Sites</Text>
      </Pressable>
      <Pressable style={styles.navItem} onPress={() => router.push('/log/lifestyle')}>
        <Text style={styles.label}>🏃 Lifestyle Log</Text>
      </Pressable>
      <Pressable style={styles.navItem} onPress={() => router.push('/log/symptoms')}>
        <Text style={styles.label}>🩺 Symptoms Log</Text>
      </Pressable>
      <Pressable style={styles.navItem} onPress={() => router.push('/settings')}>
        <Text style={styles.label}>Settings</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, backgroundColor: Colors.background },
  navItem: { backgroundColor: Colors.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: Colors.border },
  label: { color: Colors.text, fontSize: 16, fontWeight: '600' },
});
