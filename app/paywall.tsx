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
import { PurchasesOfferings, PurchasesPackage } from 'react-native-purchases';

import Colors from '@/constants/Colors';
import { getOfferings, purchasePackage, restorePurchases, isPro } from '@/lib/purchases';
import { useSubscriptionStore } from '@/stores/subscriptionStore';

const ACCENT = '#2563EB';
const BACKGROUND = '#FFFFFF';
const TEXT = '#0A0A0F';
const TEXT_SECONDARY = '#6B7280';
const BORDER = '#E5E7EB';
const SELECTED_BACKGROUND = '#EFF6FF';
const BADGE_BACKGROUND = '#DBEAFE';
const SUCCESS = '#16A34A';
const FINE_PRINT = '#9CA3AF';

export default function PaywallScreen() {
  const setIsPro = useSubscriptionStore((s) => s.setIsPro);
  const refresh = useSubscriptionStore((s) => s.refresh);
  const params = useLocalSearchParams<{ name?: string | string[] }>();
  const firstName = Array.isArray(params.name) ? params.name[0] : params.name;
  const displayName = firstName?.trim() || 'there';

  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [selectedPkg, setSelectedPkg] = useState<PurchasesPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    void (async () => {
      const o = await getOfferings();
      setOfferings(o);
      // Pre-select annual (best value) if available
      const annual = o?.current?.annual ?? o?.current?.availablePackages.find((p) => p.packageType === 'ANNUAL');
      const monthly = o?.current?.monthly ?? o?.current?.availablePackages[0];
      setSelectedPkg(annual ?? monthly ?? null);
      setLoading(false);
    })();
  }, []);

  const monthlyPkg = offerings?.current?.monthly ?? offerings?.current?.availablePackages.find((p) => p.packageType === 'MONTHLY');
  const annualPkg = offerings?.current?.annual ?? offerings?.current?.availablePackages.find((p) => p.packageType === 'ANNUAL');

  const monthlyPrice = monthlyPkg?.product.priceString ?? '$6.99';
  const annualPrice = annualPkg?.product.priceString ?? '$39.99';

  const introPrice = selectedPkg?.product.introductoryPrice;
  const hasTrial = introPrice != null && (introPrice.price === 0 || introPrice.priceString === '$0.00');
  const trialDays = hasTrial ? (introPrice.periodNumberOfUnits ?? 7) : 0;

  const handleSubscribe = async () => {
    if (!selectedPkg) {
      Alert.alert('Not available', 'Subscriptions are not available right now. Please try again later.');
      return;
    }
    setPurchasing(true);
    try {
      const info = await purchasePackage(selectedPkg);
      if (isPro(info)) {
        setIsPro(true);
        router.back();
      }
    } catch (e: unknown) {
      const err = e as { userCancelled?: boolean; message?: string };
      if (!err.userCancelled) {
        Alert.alert('Purchase failed', err.message ?? 'Something went wrong. Please try again.');
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    const info = await restorePurchases();
    setRestoring(false);
    if (isPro(info)) {
      setIsPro(true);
      await refresh();
      router.back();
    } else {
      Alert.alert('No active subscription', "We couldn't find an active Pro subscription tied to your account.");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} bounces={false} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.backButton} onPress={() => router.back()} accessibilityRole="button">
          <Text style={styles.backButtonText}>‹</Text>
        </Pressable>

        <View style={styles.dots}>
          {[0, 1, 2, 3, 4].map((dot) => (
            <View key={dot} style={[styles.dot, dot === 4 && styles.dotActive]} />
          ))}
        </View>

        <View style={styles.headingBlock}>
          <Text style={styles.headingPrimary}>Hey {displayName},</Text>
          <Text style={styles.headingAccent}>start your 7-day</Text>
          <Text style={styles.headingAccent}>free trial</Text>
          <Text style={styles.subtitle}>Full access. No payment due today.</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={ACCENT} style={styles.loader} />
        ) : (
          <View style={styles.planList}>
            <PlanRow
              selected={selectedPkg === annualPkg}
              title="Yearly"
              price={`${annualPrice}/year`}
              onPress={() => setSelectedPkg(annualPkg ?? null)}
            />
            <PlanRow
              selected={selectedPkg === monthlyPkg}
              title="Monthly"
              price={`${monthlyPrice}/month`}
              onPress={() => setSelectedPkg(monthlyPkg ?? null)}
            />
          </View>
        )}

        {selectedPkg === annualPkg ? <Text style={styles.noPayment}>✓ No payment due today</Text> : null}

        <Pressable
          style={[styles.ctaBtn, (purchasing || !selectedPkg) && styles.ctaBtnDisabled]}
          onPress={() => void handleSubscribe()}
          disabled={purchasing || !selectedPkg}
          accessibilityRole="button"
        >
          {purchasing ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.ctaText}>Start Free Trial</Text>
          )}
        </Pressable>

        <Text style={styles.finePrint}>7 days free, then $39.99/year or $6.99/month. Cancel anytime.</Text>

        <View style={styles.legalRow}>
          <Pressable onPress={() => void Linking.openURL('https://ptmos.app/privacy')} accessibilityRole="link">
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </Pressable>
          <Text style={styles.legalLink}> · </Text>
          <Pressable onPress={() => void Linking.openURL('https://ptmos.app/terms')} accessibilityRole="link">
            <Text style={styles.legalLink}>Terms of Use</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PlanRow({
  selected,
  title,
  price,
  onPress,
}: {
  selected: boolean;
  title: string;
  price: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.planCard, selected && styles.planCardSelected]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
      <View style={styles.planCopy}>
        <Text style={styles.planName}>{title}</Text>
        <Text style={styles.planPrice}>{price}</Text>
      </View>
      <View style={styles.trialBadge}>
        <Text style={styles.trialBadgeText}>7 days free</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BACKGROUND },
  scroll: { paddingBottom: 32, paddingHorizontal: 24 },

  backButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    marginTop: 8,
    width: 44,
  },
  backButtonText: { color: TEXT, fontSize: 28, fontWeight: '400', lineHeight: 32 },

  dots: {
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  dot: {
    backgroundColor: '#CBD5E1',
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  dotActive: {
    backgroundColor: ACCENT,
    width: 28,
  },

  headingBlock: {
    alignItems: 'center',
    marginTop: 46,
  },
  headingPrimary: {
    color: TEXT,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.8,
    lineHeight: 39,
    textAlign: 'center',
  },
  headingAccent: {
    color: ACCENT,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.8,
    lineHeight: 39,
    textAlign: 'center',
  },
  subtitle: {
    color: TEXT_SECONDARY,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 8,
    textAlign: 'center',
  },

  loader: { marginVertical: 44 },
  planList: {
    gap: 12,
    marginTop: 44,
  },
  planCard: {
    alignItems: 'center',
    backgroundColor: BACKGROUND,
    borderColor: BORDER,
    borderRadius: 16,
    borderWidth: 1.5,
    flexDirection: 'row',
    height: 72,
    paddingHorizontal: 18,
  },
  planCardSelected: {
    backgroundColor: SELECTED_BACKGROUND,
    borderColor: ACCENT,
  },
  radio: {
    alignItems: 'center',
    borderColor: BORDER,
    borderRadius: 11,
    borderWidth: 2,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  radioSelected: {
    borderColor: ACCENT,
  },
  radioDot: {
    backgroundColor: ACCENT,
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  planCopy: {
    flex: 1,
    marginLeft: 14,
  },
  planName: {
    color: TEXT,
    fontSize: 16,
    fontWeight: '700',
  },
  planPrice: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    marginTop: 2,
  },
  trialBadge: {
    backgroundColor: BADGE_BACKGROUND,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  trialBadgeText: {
    color: ACCENT,
    fontSize: 11,
    fontWeight: '700',
  },
  noPayment: {
    color: SUCCESS,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 14,
    textAlign: 'center',
  },

  ctaBtn: {
    alignItems: 'center',
    backgroundColor: ACCENT,
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    marginTop: 18,
    width: '100%',
  },
  ctaBtnDisabled: { opacity: 0.6 },
  ctaText: { color: BACKGROUND, fontSize: 17, fontWeight: '700' },

  finePrint: {
    color: FINE_PRINT,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 14,
    textAlign: 'center',
  },
  legalRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  legalLink: {
    color: FINE_PRINT,
    fontSize: 12,
    textAlign: 'center',
  },
});
