import { useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Svg, { Rect } from 'react-native-svg';
import type { PurchasesPackage } from 'react-native-purchases';

import { useAuthStore } from '@/stores/authStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useProfileStore } from '@/stores/profileStore';

const ACCENT = '#2563EB';
const BACKGROUND = '#FFFFFF';
const TEXT = '#0A0A0F';
const TEXT_SECONDARY = '#6B7280';
const TEXT_TERTIARY = '#9CA3AF';
const BORDER = '#E5E7EB';
const SELECTED_BACKGROUND = '#EFF6FF';
const BADGE_BACKGROUND = '#DBEAFE';
const SUCCESS = '#16A34A';

export default function OnboardingPaywallScreen() {
  const params = useLocalSearchParams<{ name?: string | string[] }>();
  const profile = useProfileStore((state) => state.profile);
  const firstName = Array.isArray(params.name) ? params.name[0] : params.name;
  const profileFirstName = profile?.full_name?.trim().split(/\s+/)[0];
  const displayName = firstName?.trim() || profileFirstName || 'there';
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [submitting, setSubmitting] = useState(false);

  const completeOnboarding = async (planType?: 'free') => {
    await useOnboardingStore.getState().complete();

    const userId = useAuthStore.getState().session?.user?.id;
    if (!userId) return;

    await useProfileStore.getState().upsertProfile(userId, { onboarding_complete: true });

    if (planType === 'free') {
      try {
        const { supabase } = await import('@/lib/supabase');
        await supabase.from('profiles').update({ plan_type: 'free' }).eq('id', userId);
      } catch (error) {
        console.warn('[OnboardingPaywall] Unable to set free plan type', error);
      }
    }
  };

  const handleStartTrial = async () => {
    if (submitting) return;

    setSubmitting(true);
    try {
      try {
        const { getOfferings, purchasePackage } = await import('@/lib/purchases');
        const offerings = await getOfferings();
        const pkg: PurchasesPackage | undefined =
          selectedPlan === 'yearly'
            ? offerings?.current?.annual ?? offerings?.current?.availablePackages.find((item) => item.packageType === 'ANNUAL')
            : offerings?.current?.monthly ?? offerings?.current?.availablePackages.find((item) => item.packageType === 'MONTHLY');

        if (pkg) await purchasePackage(pkg);
      } catch (error) {
        console.warn('[OnboardingPaywall] Purchase skipped or failed in dev mode', error);
      }

      await completeOnboarding();
      router.replace('/(tabs)');
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinueFree = async () => {
    if (submitting) return;

    setSubmitting(true);
    try {
      await completeOnboarding('free');
      router.replace('/(tabs)');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} accessibilityRole="button" hitSlop={12}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <Pressable accessibilityRole="button" hitSlop={12}>
            <Text style={styles.restoreText}>Restore</Text>
          </Pressable>
        </View>

        <LogoRow />

        <View style={styles.headingBlock}>
          <Text style={styles.headingName}>Hey {displayName},</Text>
          <Text style={styles.headingAccent}>start your 7-day{`\n`}free trial</Text>
        </View>

        <Text style={styles.subtitle}>
          Full access to everything in PT-OS. You won't be charged until your trial ends.
        </Text>

        <View style={styles.timelineCard}>
          <View style={styles.timelineLine} />
          <TimelineRow active label="Today" description="Unlock dose tracking, AI logging, inventory, insights, and reminders." />
          <TimelineRow label="In 5 days" description="We'll remind you before your free trial ends." />
          <TimelineRow label="Day 7" description="Billing starts unless you cancel." last />
        </View>

        <View style={styles.planList}>
          <PlanCard
            selected={selectedPlan === 'monthly'}
            title="Monthly"
            price="$6.99 / month"
            onPress={() => setSelectedPlan('monthly')}
          />
          <PlanCard
            selected={selectedPlan === 'yearly'}
            title="Yearly"
            price="$39.99 / year"
            badge="Best value"
            onPress={() => setSelectedPlan('yearly')}
          />
        </View>

        <Text style={styles.noPayment}>✓ No payment due today. Cancel anytime.</Text>

        <Pressable
          style={[styles.ctaButton, submitting && styles.disabledButton]}
          onPress={() => void handleStartTrial()}
          disabled={submitting}
          accessibilityRole="button"
        >
          {submitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.ctaButtonText}>Start my 7-day free trial</Text>}
        </Pressable>

        <Pressable onPress={() => void handleContinueFree()} disabled={submitting} accessibilityRole="button">
          <Text style={styles.freeLink}>Continue with limited free plan</Text>
        </Pressable>

        <Text style={styles.footerText}>Privacy Policy · Terms of Use</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function LogoRow() {
  return (
    <View style={styles.logoRow}>
      <Svg width={25} height={22} viewBox="0 0 25 22" fill="none">
        <Rect x={2} y={8} width={4} height={12} rx={2} fill={ACCENT} />
        <Rect x={9} y={2} width={4} height={18} rx={2} fill={ACCENT} />
        <Rect x={16} y={6} width={4} height={14} rx={2} fill={ACCENT} />
      </Svg>
      <Text style={styles.logoText}>PT-OS</Text>
    </View>
  );
}

function TimelineRow({
  active,
  label,
  description,
  last,
}: {
  active?: boolean;
  label: string;
  description: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.timelineRow, last && styles.timelineRowLast]}>
      <View style={[styles.timelineIcon, active ? styles.timelineIconActive : styles.timelineIconInactive]}>
        {active ? <View style={styles.timelineDot} /> : null}
      </View>
      <View style={styles.timelineTextBlock}>
        <Text style={styles.timelineLabel}>{label}</Text>
        <Text style={styles.timelineDescription}>{description}</Text>
      </View>
    </View>
  );
}

function PlanCard({
  selected,
  title,
  price,
  badge,
  onPress,
}: {
  selected: boolean;
  title: string;
  price: string;
  badge?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.planCard, selected && styles.planCardSelected]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected ? <View style={styles.radioInner} /> : null}
      </View>
      <View style={styles.planCopy}>
        <Text style={styles.planTitle}>{title}</Text>
        <Text style={styles.planPrice}>{price}</Text>
      </View>
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  backText: {
    color: TEXT,
    fontSize: 28,
    lineHeight: 32,
  },
  restoreText: {
    color: TEXT_TERTIARY,
    fontSize: 14,
  },
  logoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 26,
  },
  logoText: {
    color: TEXT,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  headingBlock: {
    alignItems: 'center',
    marginTop: 24,
  },
  headingName: {
    color: TEXT,
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 36,
    textAlign: 'center',
  },
  headingAccent: {
    color: ACCENT,
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 36,
    textAlign: 'center',
  },
  subtitle: {
    color: TEXT_SECONDARY,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 14,
    textAlign: 'center',
  },
  timelineCard: {
    backgroundColor: BACKGROUND,
    borderRadius: 20,
    marginTop: 24,
    padding: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
  timelineLine: {
    borderColor: '#BFDBFE',
    borderLeftWidth: 1,
    borderStyle: 'dashed',
    bottom: 42,
    left: 29,
    position: 'absolute',
    top: 42,
    width: 1,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 14,
    paddingBottom: 22,
  },
  timelineRowLast: {
    paddingBottom: 0,
  },
  timelineIcon: {
    alignItems: 'center',
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    marginTop: 2,
    width: 20,
    zIndex: 1,
  },
  timelineIconActive: {
    backgroundColor: ACCENT,
  },
  timelineIconInactive: {
    backgroundColor: BACKGROUND,
    borderColor: TEXT_TERTIARY,
    borderWidth: 1.5,
  },
  timelineDot: {
    backgroundColor: BACKGROUND,
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  timelineTextBlock: {
    flex: 1,
  },
  timelineLabel: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '700',
  },
  timelineDescription: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  planList: {
    gap: 12,
    marginTop: 22,
  },
  planCard: {
    alignItems: 'center',
    backgroundColor: BACKGROUND,
    borderColor: BORDER,
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 12,
    minHeight: 64,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  planCardSelected: {
    backgroundColor: SELECTED_BACKGROUND,
    borderColor: ACCENT,
  },
  radioOuter: {
    alignItems: 'center',
    borderColor: TEXT_TERTIARY,
    borderRadius: 10,
    borderWidth: 1.5,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  radioOuterSelected: {
    borderColor: ACCENT,
  },
  radioInner: {
    backgroundColor: ACCENT,
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  planCopy: {
    flex: 1,
  },
  planTitle: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '700',
  },
  planPrice: {
    color: TEXT,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 3,
  },
  badge: {
    backgroundColor: BADGE_BACKGROUND,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    color: ACCENT,
    fontSize: 11,
    fontWeight: '700',
  },
  noPayment: {
    color: SUCCESS,
    fontSize: 13,
    marginTop: 16,
    textAlign: 'center',
  },
  ctaButton: {
    alignItems: 'center',
    backgroundColor: ACCENT,
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    marginTop: 16,
    width: '100%',
  },
  disabledButton: {
    opacity: 0.75,
  },
  ctaButtonText: {
    color: BACKGROUND,
    fontSize: 16,
    fontWeight: '700',
  },
  freeLink: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  footerText: {
    color: TEXT_TERTIARY,
    fontSize: 12,
    marginTop: 28,
    textAlign: 'center',
  },
});
