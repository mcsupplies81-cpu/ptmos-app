import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Svg, { Line, Path, Rect } from 'react-native-svg';
import { PurchasesOfferings, PurchasesPackage } from 'react-native-purchases';

import Colors from '@/constants/Colors';
import { getOfferings, isPro, purchasePackage } from '@/lib/purchases';
import { supabase } from '@/lib/supabase';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useProfileStore } from '@/stores/profileStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';

const PRIMARY = '#1B4332';
const BACKGROUND = '#F8F8F6';
const CARD = '#FFFFFF';
const GRAY = '#6B7280';
const BORDER = '#E5E7EB';
const LINE = '#D1D5DB';
const BADGE_BG = '#D1FAE5';
const DOT_INACTIVE = '#D1D5DB';

export default function OnboardingPaywallScreen() {
  const setIsPro = useSubscriptionStore((s) => s.setIsPro);
  const fetchProfile = useProfileStore((s) => s.fetchProfile);
  const params = useLocalSearchParams<{ name?: string | string[] }>();
  const firstName = Array.isArray(params.name) ? params.name[0] : params.name;
  const storeName = useOnboardingStore((s) => s.name);
  const displayName = firstName?.trim() || storeName.trim() || 'there';

  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [selectedPkg, setSelectedPkg] = useState<PurchasesPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');

  useEffect(() => {
    void (async () => {
      const o = await getOfferings();
      setOfferings(o);
      // Pre-select annual (best value) if available.
      const annual = o?.current?.annual ?? o?.current?.availablePackages.find((p) => p.packageType === 'ANNUAL');
      const monthly = o?.current?.monthly ?? o?.current?.availablePackages[0];
      setSelectedPkg(annual ?? monthly ?? null);
      setSelectedPlan(annual ? 'annual' : 'monthly');
      setLoading(false);
    })();
  }, []);

  const monthlyPkg = offerings?.current?.monthly ?? offerings?.current?.availablePackages.find((p) => p.packageType === 'MONTHLY');
  const annualPkg = offerings?.current?.annual ?? offerings?.current?.availablePackages.find((p) => p.packageType === 'ANNUAL');

  const monthlyPrice = monthlyPkg?.product.priceString ?? '$6.99';
  const annualPrice = annualPkg?.product.priceString ?? '$39.99';

  const completeOnboarding = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user.id;

    if (userId) {
      await supabase.from('profiles').upsert({ id: userId, onboarding_complete: true });
      await fetchProfile(userId);
    }

    router.replace('/(tabs)');
  };

  const handleStartTrial = async () => {
    setSubmitting(true);
    try {
      if (selectedPkg) {
        const info = await purchasePackage(selectedPkg);
        if (isPro(info)) setIsPro(true);
      }

      await completeOnboarding();
    } catch (e: unknown) {
      const err = e as { userCancelled?: boolean; message?: string };
      if (!err.userCancelled) {
        Alert.alert('Purchase failed', err.message ?? 'Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinueFree = async () => {
    setSubmitting(true);
    try {
      await completeOnboarding();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} bounces={false} showsVerticalScrollIndicator={false}>
        <View style={styles.topNav}>
          <Pressable style={styles.backButton} onPress={() => router.back()} accessibilityRole="button">
            <Text style={styles.backButtonText}>‹</Text>
          </Pressable>

          <View style={styles.dots}>
            {Array.from({ length: 7 }).map((_, index) => (
              <View key={index} style={[styles.dot, index === 6 && styles.dotActive]} />
            ))}
          </View>

          <View style={styles.navSpacer} />
        </View>

        <View style={styles.logoRow}>
          <LogoMark />
          <Text style={styles.logoText}>PT-OS</Text>
        </View>

        <View style={styles.headlineBlock}>
          <Text style={styles.headline}>Hey {displayName},</Text>
          <Text style={styles.headline}>start your 7-day free trial</Text>
          <Text style={styles.subtitle}>
            Full access to everything in PT-OS. You won't be charged until your trial ends.
          </Text>
        </View>

        <View style={styles.timelineCard}>
          <View style={styles.timelineLine} />
          <TimelineRow
            icon="calendar"
            title="Today"
            body="Unlock dose tracking, AI logging, reminders, and insights."
          />
          <TimelineRow icon="bell" title="In 5 days" body="We'll remind you before your free trial ends." />
          <TimelineRow icon="dollar" title="Day 7" body="Billing starts unless you cancel." last />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={PRIMARY} style={styles.loader} />
        ) : (
          <View style={styles.planList}>
            <PlanCard
              selected={selectedPlan === 'monthly'}
              title="Monthly"
              price={`${monthlyPrice}/mo`}
              onPress={() => {
                setSelectedPlan('monthly');
                setSelectedPkg(monthlyPkg ?? null);
              }}
            />
            <PlanCard
              selected={selectedPlan === 'annual'}
              title="Yearly"
              price={`${annualPrice}/yr`}
              badge="Best value"
              onPress={() => {
                setSelectedPlan('annual');
                setSelectedPkg(annualPkg ?? null);
              }}
            />
          </View>
        )}

        <View style={styles.trustLine}>
          <View style={styles.checkCircle}>
            <Text style={styles.checkText}>✓</Text>
          </View>
          <Text style={styles.trustText}>No payment due today. Cancel anytime.</Text>
        </View>

        <Pressable
          style={[styles.ctaButton, submitting && styles.disabled]}
          onPress={() => void handleStartTrial()}
          disabled={submitting}
          accessibilityRole="button"
        >
          <View style={styles.ctaArrowCircle}>
            <Text style={styles.ctaArrow}>→</Text>
          </View>
          {submitting ? (
            <ActivityIndicator color={Colors.white} style={styles.ctaLoader} />
          ) : (
            <Text style={styles.ctaText}>Start my 7-day free trial</Text>
          )}
        </Pressable>

        <Pressable
          style={styles.freeButton}
          onPress={() => void handleContinueFree()}
          disabled={submitting}
          accessibilityRole="button"
        >
          <Text style={styles.freeButtonText}>Continue with limited free plan</Text>
        </Pressable>

        <View style={styles.legalRow}>
          <Pressable onPress={() => void Linking.openURL('https://ptmos.app/privacy')} accessibilityRole="link">
            <Text style={styles.legalText}>Privacy Policy</Text>
          </Pressable>
          <Text style={styles.legalDivider}>|</Text>
          <Pressable onPress={() => void Linking.openURL('https://ptmos.app/terms')} accessibilityRole="link">
            <Text style={styles.legalText}>Terms of Use</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function LogoMark() {
  return (
    <Svg width={34} height={34} viewBox="0 0 34 34" fill="none">
      <Rect x="3" y="11" width="6" height="19" rx="3" fill={PRIMARY} />
      <Rect x="14" y="3" width="6" height="28" rx="3" fill={PRIMARY} />
      <Rect x="25" y="9" width="6" height="7" rx="3" fill={PRIMARY} />
      <Rect x="25" y="20" width="6" height="11" rx="3" fill={PRIMARY} />
    </Svg>
  );
}

function TimelineRow({
  icon,
  title,
  body,
  last = false,
}: {
  icon: 'calendar' | 'bell' | 'dollar';
  title: string;
  body: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.timelineRow, !last && styles.timelineRowSpacing]}>
      <View style={styles.timelineIconCircle}>
        <TimelineIcon type={icon} />
      </View>
      <View style={styles.timelineCopy}>
        <Text style={styles.timelineTitle}>{title}</Text>
        <Text style={styles.timelineBody}>{body}</Text>
      </View>
    </View>
  );
}

function TimelineIcon({ type }: { type: 'calendar' | 'bell' | 'dollar' }) {
  if (type === 'calendar') {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Rect x="4" y="5" width="16" height="16" rx="3" stroke={PRIMARY} strokeWidth={2} />
        <Line x1="8" y1="3" x2="8" y2="7" stroke={PRIMARY} strokeWidth={2} strokeLinecap="round" />
        <Line x1="16" y1="3" x2="16" y2="7" stroke={PRIMARY} strokeWidth={2} strokeLinecap="round" />
        <Line x1="4" y1="10" x2="20" y2="10" stroke={PRIMARY} strokeWidth={2} strokeLinecap="round" />
      </Svg>
    );
  }

  if (type === 'bell') {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path
          d="M18 9.5C18 6.46 15.54 4 12.5 4H11.5C8.46 4 6 6.46 6 9.5V14L4.5 17H19.5L18 14V9.5Z"
          stroke={PRIMARY}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <Path d="M9.5 19C10.08 20.02 10.9 20.5 12 20.5C13.1 20.5 13.92 20.02 14.5 19" stroke={PRIMARY} strokeWidth={2} strokeLinecap="round" />
      </Svg>
    );
  }

  return <Text style={styles.dollarIcon}>$</Text>;
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
      onPress={onPress}
      style={[styles.planCard, selected && styles.planCardSelected]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <View style={[styles.radio, selected && styles.radioSelected]}>{selected ? <View style={styles.radioDot} /> : null}</View>
      <View style={styles.planTitleRow}>
        <Text style={styles.planTitle}>{title}</Text>
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>
      <Text style={[styles.planPrice, selected && styles.planPriceSelected]}>{price}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BACKGROUND },
  scroll: {
    paddingBottom: 28,
    paddingHorizontal: 24,
  },
  topNav: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    width: 44,
    elevation: 4,
  },
  backButtonText: {
    color: PRIMARY,
    fontSize: 42,
    fontWeight: '300',
    lineHeight: 42,
    marginTop: -3,
  },
  dots: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  dot: {
    backgroundColor: DOT_INACTIVE,
    borderRadius: 7,
    height: 14,
    width: 14,
  },
  dotActive: {
    backgroundColor: PRIMARY,
  },
  navSpacer: {
    height: 44,
    width: 44,
  },
  logoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'center',
    marginTop: 46,
  },
  logoText: {
    color: PRIMARY,
    fontSize: 33,
    fontWeight: '800',
    letterSpacing: 4,
  },
  headlineBlock: {
    alignItems: 'center',
    marginTop: 34,
  },
  headline: {
    color: PRIMARY,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 43,
    textAlign: 'center',
  },
  subtitle: {
    color: GRAY,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 16,
    maxWidth: 340,
    textAlign: 'center',
  },
  timelineCard: {
    backgroundColor: CARD,
    borderRadius: 20,
    marginTop: 30,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
  },
  timelineLine: {
    backgroundColor: LINE,
    bottom: 56,
    left: 45,
    position: 'absolute',
    top: 56,
    width: 1,
  },
  timelineRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 14,
  },
  timelineRowSpacing: {
    marginBottom: 30,
  },
  timelineIconCircle: {
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderColor: BORDER,
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
    zIndex: 1,
  },
  timelineCopy: {
    flex: 1,
    paddingTop: 3,
  },
  timelineTitle: {
    color: PRIMARY,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 7,
  },
  timelineBody: {
    color: GRAY,
    fontSize: 14,
    lineHeight: 20,
  },
  dollarIcon: {
    color: PRIMARY,
    fontSize: 28,
    fontWeight: '400',
    lineHeight: 30,
  },
  loader: {
    marginVertical: 46,
  },
  planList: {
    gap: 10,
    marginTop: 22,
  },
  planCard: {
    alignItems: 'center',
    backgroundColor: CARD,
    borderColor: BORDER,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    height: 60,
    paddingHorizontal: 16,
  },
  planCardSelected: {
    borderColor: PRIMARY,
    borderWidth: 2,
  },
  radio: {
    alignItems: 'center',
    borderColor: LINE,
    borderRadius: 10,
    borderWidth: 2,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  radioSelected: {
    borderColor: PRIMARY,
  },
  radioDot: {
    backgroundColor: PRIMARY,
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  planTitleRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    marginLeft: 18,
  },
  planTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
  },
  badge: {
    backgroundColor: BADGE_BG,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    color: PRIMARY,
    fontSize: 11,
    fontWeight: '700',
  },
  planPrice: {
    color: GRAY,
    fontSize: 16,
    fontWeight: '400',
  },
  planPriceSelected: {
    color: '#111827',
  },
  trustLine: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 26,
  },
  checkCircle: {
    alignItems: 'center',
    backgroundColor: PRIMARY,
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  checkText: {
    color: CARD,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
  },
  trustText: {
    color: GRAY,
    fontSize: 14,
    marginLeft: 8,
  },
  ctaButton: {
    alignItems: 'center',
    backgroundColor: PRIMARY,
    borderRadius: 30,
    flexDirection: 'row',
    height: 60,
    justifyContent: 'center',
    marginTop: 28,
    position: 'relative',
    width: '100%',
  },
  disabled: {
    opacity: 0.65,
  },
  ctaArrowCircle: {
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    left: 5,
    position: 'absolute',
    width: 50,
  },
  ctaArrow: {
    color: PRIMARY,
    fontSize: 30,
    fontWeight: '400',
    lineHeight: 32,
  },
  ctaText: {
    color: CARD,
    fontSize: 17,
    fontWeight: '700',
  },
  ctaLoader: {
    alignSelf: 'center',
  },
  freeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  freeButtonText: {
    color: PRIMARY,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  legalRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  legalText: {
    color: GRAY,
    fontSize: 12,
    textAlign: 'center',
  },
  legalDivider: {
    color: LINE,
    fontSize: 14,
    marginHorizontal: 44,
  },
});
