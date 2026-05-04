import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import Colors from '@/constants/Colors';

const features: string[] = [
  'AI-powered dose logging via chat',
  'Unlimited protocols & compounds',
  'Full symptom & lifestyle tracking',
  'Weekly insights & adherence reports',
  'Inventory management with expiry alerts',
];

export default function PaywallScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.heroEmoji}>⚡</Text>
        <Text style={styles.title}>Upgrade to Pro</Text>
        <Text style={styles.subtitle}>Unlock the full PT-OS experience</Text>

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

        <View style={styles.pricingCard}>
          <Text style={styles.planLabel}>PRO MONTHLY</Text>
          <Text style={styles.planPrice}>$9.99 / month</Text>
          <Text style={styles.planSubtext}>Cancel anytime</Text>
        </View>

        <Pressable
          style={styles.ctaButton}
          onPress={() => Alert.alert('Coming Soon', 'In-app purchases will be available in the next update.')}
        >
          <Text style={styles.ctaText}>Start Free Trial</Text>
        </Pressable>

        <Text style={styles.trialText}>7-day free trial, then $9.99/mo</Text>
        <Pressable>
          <Text style={styles.restoreText}>Restore purchases</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  heroEmoji: {
    fontSize: 56,
    textAlign: 'center',
    marginTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
  },
  featureList: {
    gap: 12,
    marginBottom: 28,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500',
  },
  pricingCard: {
    backgroundColor: Colors.accentLight,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  planLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: Colors.accent,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 4,
  },
  planSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  ctaButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 17,
  },
  trialText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  restoreText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
  },
});
