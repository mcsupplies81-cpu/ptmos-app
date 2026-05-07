import { router } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import Colors from '@/constants/Colors';

const features: string[] = [
  'AI-powered dose logging via chat',
  'Unlimited protocols & compounds',
  'Full symptom & lifestyle tracking',
  'Weekly insights & adherence reports',
  'Injection site rotation tracking',
];

export default function PaywallScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.badge}>BETA</Text>
        <Text style={styles.title}>Free During Beta</Text>
        <Text style={styles.subtitle}>
          PT-OS is completely free while we're in beta. All features are unlocked for early members.
        </Text>

        <View style={styles.featureList}>
          {features.map((feature) => (
            <View key={feature} style={styles.featureRow}>
              <View style={styles.checkCircle}>
                <Text style={styles.checkText}>✓</Text>
              </View>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎉 You're In</Text>
          <Text style={styles.cardBody}>
            As a beta member you'll get a significant discount when premium features launch.
            No credit card required — ever.
          </Text>
        </View>

        <Pressable style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Continue Using PT-OS</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 24, paddingBottom: 60, alignItems: 'center' },
  badge: {
    backgroundColor: Colors.accentLight,
    color: Colors.accent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 16,
    marginBottom: 16,
  },
  title: { fontSize: 28, fontWeight: '800', color: Colors.text, textAlign: 'center' },
  subtitle: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', marginTop: 8, marginBottom: 28, lineHeight: 22 },
  featureList: { gap: 14, marginBottom: 28, alignSelf: 'stretch' },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkCircle: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.accent,
    justifyContent: 'center', alignItems: 'center',
  },
  checkText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  featureText: { flex: 1, fontSize: 15, color: Colors.text, fontWeight: '500' },
  card: {
    backgroundColor: Colors.accentLight,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignSelf: 'stretch',
  },
  cardTitle: { fontSize: 17, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  cardBody: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },
  button: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
});
