import { useState } from 'react'
import { router } from 'expo-router'
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native'

import Colors from '@/constants/Colors'
import { Copy } from '@/constants/Copy'

const features = [
  'Unlimited active protocols',
  'Advanced insights & trends',
  'Full inventory tracking',
  'Injection site rotation history',
  'Priority support',
]

export default function PaywallScreen() {
  const [selected, setSelected] = useState<'monthly' | 'annual'>('annual')

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.crownCircle}>
          <Text style={styles.crown}>👑</Text>
        </View>

        <Text style={styles.title}>PTMOS Pro</Text>
        <Text style={styles.subtitle}>Unlock your full potential</Text>

        <View style={styles.featureList}>
          {features.map((feature) => (
            <View key={feature} style={styles.featureRow}>
              <View style={styles.checkCircle}>
                <Text style={styles.check}>✓</Text>
              </View>
              <Text style={styles.featureLabel}>{feature}</Text>
            </View>
          ))}
        </View>
      </View>

      <Pressable style={styles.closeButton} onPress={() => router.back()}>
        <Text style={styles.closeText}>✕</Text>
      </Pressable>

      <View style={styles.bottomSheet}>
        <View style={styles.pricingRow}>
          <Pressable
            style={[
              styles.pricingCard,
              { borderColor: selected === 'monthly' ? Colors.accent : Colors.border },
            ]}
            onPress={() => setSelected('monthly')}
          >
            <Text style={styles.planLabel}>MONTHLY</Text>
            <Text style={styles.planPrice}>$6.99</Text>
            <Text style={styles.planUnit}>/month</Text>
          </Pressable>

          <Pressable
            style={[
              styles.pricingCard,
              styles.annualCard,
              { borderColor: selected === 'annual' ? Colors.accent : Colors.border },
            ]}
            onPress={() => setSelected('annual')}
          >
            <View style={styles.bestValueBadge}>
              <Text style={styles.bestValueText}>BEST VALUE</Text>
            </View>
            <Text style={styles.planLabel}>ANNUAL</Text>
            <Text style={styles.planPrice}>$39.99</Text>
            <Text style={styles.annualUnit}>/year · save 52%</Text>
          </Pressable>
        </View>

        <Pressable style={styles.ctaButton} onPress={() => console.log('subscribe', selected)}>
          <Text style={styles.ctaText}>Start Free 7-Day Trial</Text>
        </Pressable>

        <Text style={styles.billingText}>Then billed annually · Cancel anytime</Text>

        <Pressable onPress={() => console.log('restore')}>
          <Text style={styles.restoreText}>Restore Purchases</Text>
        </Pressable>

        <Text style={styles.disclaimer}>{Copy.disclaimerShort}</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B3A2F',
  },
  topSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  crownCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  crown: {
    fontSize: 32,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 16,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    marginTop: 6,
  },
  featureList: {
    marginTop: 24,
    gap: 10,
    alignSelf: 'stretch',
    paddingHorizontal: 32,
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
  check: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  featureLabel: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  closeButton: {
    position: 'absolute',
    top: 52,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  bottomSheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },
  pricingRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  pricingCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  annualCard: {
    position: 'relative',
  },
  planLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
  planPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  planUnit: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  annualUnit: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: '600',
  },
  bestValueBadge: {
    position: 'absolute',
    top: -10,
    right: 8,
    backgroundColor: Colors.accentLight,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  bestValueText: {
    color: Colors.accent,
    fontSize: 9,
    fontWeight: '700',
  },
  ctaButton: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  billingText: {
    color: Colors.textSecondary,
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 12,
  },
  restoreText: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
  },
  disclaimer: {
    color: Colors.textSecondary,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
})
