import { Alert, Pressable, SafeAreaView, StyleSheet, Text, ToastAndroid, View } from 'react-native';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';

const cards = [
  { icon: '💉', label: 'Log Dose', path: '/log/dose' },
  { icon: '🩺', label: 'Symptoms', path: '/log/symptoms' },
  { icon: '🏃', label: 'Lifestyle', path: '/log/lifestyle' },
] as const;

export default function LogTab() {
  const handleBodyStats = () => {
    const message = 'Coming soon';
    if (ToastAndroid?.show) {
      ToastAndroid.show(message, ToastAndroid.SHORT);
      return;
    }
    Alert.alert(message);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Log</Text>
      <View style={styles.grid}>
        {cards.map((card) => (
          <Pressable key={card.path} style={styles.card} onPress={() => router.push(card.path)}>
            <Text style={styles.icon}>{card.icon}</Text>
            <Text style={styles.label}>{card.label}</Text>
          </Pressable>
        ))}
        <Pressable style={styles.card} onPress={handleBodyStats}>
          <Text style={styles.icon}>📊</Text>
          <Text style={styles.label}>Body Stats</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: Colors.background,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '48%',
    minHeight: 130,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    backgroundColor: '#F7FAF8',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  icon: {
    fontSize: 36,
    marginBottom: 10,
  },
  label: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
