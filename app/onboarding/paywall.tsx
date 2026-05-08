import { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

const ACCENT_BLUE = '#2563EB';
const DARK_TEXT = '#1E293B';
const SECONDARY_TEXT = '#64748B';
const BORDER = '#E2E8F0';

type Plan = 'monthly' | 'yearly';

export default function OnboardingPaywallScreen() {
  const { name } = useLocalSearchParams<{ name?: string | string[] }>();
  const [selectedPlan, setSelectedPlan] = useState<Plan>('yearly');

  const displayName = useMemo(() => {
    const value = Array.isArray(name) ? name[0] : name;
    return value?.trim() || 'there';
  }, [name]);

  const goToSignup = () => {
    router.push('/auth/signup' as never);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} bounces={false}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.headerButton} hitSlop={12}>
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => {}} style={styles.restoreButton} hitSlop={12}>
            <Text style={styles.restoreText}>Restore</Text>
          </Pressable>
        </View>

        <View style={styles.progressRow}>
          {[0, 1, 2, 3, 4].map((dot) => (
            <View key={dot} style={[styles.progressDot, dot === 4 && styles.progressDotFilled]} />
          ))}
        </View>

        <View style={styles.hero}>
          <Text style={styles.headingDark}>Hey {displayName},</Text>
          <Text style={styles.headingAccent}>start your 7-day</Text>
          <Text style={styles.headingAccent}>free trial</Text>
          <Text style={styles.subtitle}>Full access to dose tracking, reminders, charts, and AI logging in PT-OS.</Text>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.featureIconWrap}>
            <Text style={styles.featureIcon}>🔓</Text>
          </View>
          <View style={styles.featureTextWrap}>
            <Text style={styles.featureTitle}>Unlock the full PT-OS experience</Text>
            <Text style={styles.featureSubtitle}>Track every dose, stay on schedule, and let AI help you stay ahead.</Text>
          </View>
        </View>

        <View style={styles.plans}>
          <PlanRow
            label="Monthly"
            price="$6.99 / month"
            selected={selectedPlan === 'monthly'}
            onPress={() => setSelectedPlan('monthly')}
          />
          <PlanRow
            label="Yearly"
            price="$39.99 / year"
            selected={selectedPlan === 'yearly'}
            badge="7 days free"
            onPress={() => setSelectedPlan('yearly')}
          />
        </View>

        {selectedPlan === 'yearly' ? <Text style={styles.noPayment}>✓ No payment due now</Text> : null}

        <Pressable accessibilityRole="button" onPress={goToSignup} style={({ pressed }) => [styles.cta, pressed && styles.pressed]}>
          <Text style={styles.ctaText}>Start My 7-Day Free Trial →</Text>
        </Pressable>

        <Pressable accessibilityRole="button" onPress={goToSignup} style={styles.skipButton} hitSlop={8}>
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>

        <Text style={styles.finePrint}>7 days free, then $39.99 per year or $6.99 per month. Cancel anytime.</Text>

        <View style={styles.legalRow}>
          <Text style={styles.legalLink}>Privacy Policy</Text>
          <Text style={styles.legalDivider}>•</Text>
          <Text style={styles.legalLink}>Terms of Use</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PlanRow({
  label,
  price,
  selected,
  badge,
  onPress,
}: {
  label: string;
  price: string;
  selected: boolean;
  badge?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.planRow, selected && styles.planRowSelected, pressed && styles.pressed]}
    >
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected ? <View style={styles.radioInner} /> : null}
      </View>
      <View style={styles.planCopy}>
        <View style={styles.planTopLine}>
          <Text style={styles.planLabel}>{label}</Text>
          {badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.planPrice}>{price}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 28,
  },
  header: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 38,
    lineHeight: 38,
    color: DARK_TEXT,
    fontWeight: '300',
  },
  restoreButton: {
    minHeight: 44,
    justifyContent: 'center',
  },
  restoreText: {
    fontSize: 15,
    fontWeight: '700',
    color: ACCENT_BLUE,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    marginBottom: 36,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
  },
  progressDotFilled: {
    width: 24,
    backgroundColor: ACCENT_BLUE,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headingDark: {
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '800',
    color: DARK_TEXT,
    textAlign: 'center',
    letterSpacing: -0.8,
  },
  headingAccent: {
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '800',
    color: ACCENT_BLUE,
    textAlign: 'center',
    letterSpacing: -0.8,
  },
  subtitle: {
    marginTop: 16,
    fontSize: 16,
    lineHeight: 23,
    color: SECONDARY_TEXT,
    textAlign: 'center',
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#F8FAFC',
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
  },
  featureIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIcon: {
    fontSize: 24,
  },
  featureTextWrap: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: DARK_TEXT,
    marginBottom: 5,
  },
  featureSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: SECONDARY_TEXT,
  },
  plans: {
    gap: 12,
    marginBottom: 14,
  },
  planRow: {
    minHeight: 74,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 18,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  planRowSelected: {
    borderColor: ACCENT_BLUE,
    backgroundColor: '#EFF6FF',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  radioOuterSelected: {
    borderColor: ACCENT_BLUE,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: ACCENT_BLUE,
  },
  planCopy: {
    flex: 1,
  },
  planTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  planLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: DARK_TEXT,
  },
  planPrice: {
    fontSize: 15,
    color: SECONDARY_TEXT,
    fontWeight: '600',
  },
  badge: {
    borderRadius: 999,
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: ACCENT_BLUE,
    fontSize: 12,
    fontWeight: '800',
  },
  noPayment: {
    textAlign: 'center',
    color: '#16A34A',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 14,
  },
  cta: {
    width: '100%',
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: ACCENT_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ACCENT_BLUE,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 3,
  },
  pressed: {
    opacity: 0.82,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  skipText: {
    color: ACCENT_BLUE,
    fontSize: 15,
    fontWeight: '800',
  },
  finePrint: {
    fontSize: 12,
    lineHeight: 18,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 18,
  },
  legalRow: {
    marginTop: 'auto',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
  },
  legalLink: {
    fontSize: 13,
    fontWeight: '700',
    color: SECONDARY_TEXT,
  },
  legalDivider: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '700',
  },
});
