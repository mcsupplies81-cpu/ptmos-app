import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { PurchasesOfferings, PurchasesPackage } from 'react-native-purchases';

import Colors from '@/constants/Colors';
import { getOfferings, purchasePackage, restorePurchases, isPro } from '@/lib/purchases';
import { useSubscriptionStore } from '@/stores/subscriptionStore';

const FEATURES = [
  { icon: '🤖', title: 'AI Health Coach', desc: 'Ask PT-OS anything about your protocols' },
  { icon: '📋', title: 'Protocols', desc: 'Unlimited multi-compound protocols with adherence tracking' },
  { icon: '🏥', title: 'Provider Directory', desc: 'Find verified clinics, med spas & pharmacies' },
  { icon: '📊', title: 'Full Dose History', desc: 'Unlimited history with search & filtering' },
];

export default function PaywallScreen() {
  const setIsPro = useSubscriptionStore((s) => s.setIsPro);
  const refresh = useSubscriptionStore((s) => s.refresh);

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

  const monthlyPrice = monthlyPkg?.product.priceString ?? '$2.99';
  const annualPrice = annualPkg?.product.priceString ?? '$24.99';

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
      <ScrollView contentContainerStyle={styles.scroll} bounces={false}>
        {/* Close */}
        <Pressable style={styles.closeBtn} onPress={() => router.back()}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.crownBadge}>
            <Text style={styles.crownEmoji}>👑</Text>
          </View>
          <Text style={styles.heroTitle}>PT-OS Pro</Text>
          <Text style={styles.heroSub}>Unlock your full health stack</Text>
        </View>

        {/* Feature list */}
        <View style={styles.features}>
          {FEATURES.map((f) => (
            <View key={f.title} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <View style={styles.featureCopy}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
              <Text style={styles.checkmark}>✓</Text>
            </View>
          ))}
        </View>

        {/* Pricing cards */}
        {loading ? (
          <ActivityIndicator size="large" color={Colors.accent} style={{ marginVertical: 24 }} />
        ) : (
          <View style={styles.pricingRow}>
            {/* Monthly */}
            <Pressable
              onPress={() => setSelectedPkg(monthlyPkg ?? null)}
              style={[styles.priceCard, selectedPkg === monthlyPkg && styles.priceCardSelected]}
            >
              <Text style={styles.priceLabel}>Monthly</Text>
              <Text style={styles.priceAmount}>{monthlyPrice}</Text>
              <Text style={styles.pricePer}>per month</Text>
            </Pressable>

            {/* Annual */}
            <Pressable
              onPress={() => setSelectedPkg(annualPkg ?? null)}
              style={[styles.priceCard, selectedPkg === annualPkg && styles.priceCardSelected]}
            >
              <View style={styles.bestValueBadge}>
                <Text style={styles.bestValueText}>BEST VALUE</Text>
              </View>
              <Text style={styles.priceLabel}>Annual</Text>
              <Text style={styles.priceAmount}>{annualPrice}</Text>
              <Text style={styles.pricePer}>per year · save 30%</Text>
            </Pressable>
          </View>
        )}

        {/* CTA */}
        <Pressable
          style={[styles.ctaBtn, (purchasing || !selectedPkg) && styles.ctaBtnDisabled]}
          onPress={() => void handleSubscribe()}
          disabled={purchasing || !selectedPkg}
        >
          {purchasing ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.ctaText}>Start Pro</Text>
          )}
        </Pressable>

        {/* Restore */}
        <Pressable onPress={() => void handleRestore()} disabled={restoring} style={styles.restoreBtn}>
          {restoring ? (
            <ActivityIndicator size="small" color={Colors.textSecondary} />
          ) : (
            <Text style={styles.restoreText}>Restore purchases</Text>
          )}
        </Pressable>

        {/* Legal */}
        <View style={styles.legalRow}>
          <Pressable onPress={() => void Linking.openURL('https://ptmos.app/privacy')}>
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </Pressable>
          <Text style={styles.legalDot}>·</Text>
          <Pressable onPress={() => void Linking.openURL('https://ptmos.app/terms')}>
            <Text style={styles.legalLink}>Terms of Use</Text>
          </Pressable>
        </View>

        {Platform.OS === 'ios' && (
          <Text style={styles.legalNote}>
            Payment will be charged to your Apple ID account at confirmation of purchase. Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current period.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 24, paddingBottom: 48 },

  closeBtn: { alignSelf: 'flex-end', marginTop: 16, padding: 8 },
  closeText: { color: Colors.textSecondary, fontSize: 18 },

  hero: { alignItems: 'center', marginTop: 8, marginBottom: 32 },
  crownBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1B3A2F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  crownEmoji: { fontSize: 34 },
  heroTitle: { fontSize: 30, fontWeight: '800', color: Colors.white, letterSpacing: -0.5 },
  heroSub: { marginTop: 6, fontSize: 15, color: Colors.textSecondary },

  features: { gap: 4, marginBottom: 32 },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 12,
    marginBottom: 8,
  },
  featureIcon: { fontSize: 22, width: 32, textAlign: 'center' },
  featureCopy: { flex: 1 },
  featureTitle: { fontSize: 14, fontWeight: '700', color: Colors.white },
  featureDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  checkmark: { fontSize: 16, color: Colors.accent, fontWeight: '700' },

  pricingRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  priceCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 16,
    alignItems: 'center',
    position: 'relative',
    paddingTop: 22,
  },
  priceCardSelected: {
    borderColor: Colors.accent,
    backgroundColor: '#1B3A2F',
  },
  bestValueBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: Colors.accent,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  bestValueText: { fontSize: 9, fontWeight: '800', color: Colors.white, letterSpacing: 0.5 },
  priceLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6 },
  priceAmount: { fontSize: 26, fontWeight: '800', color: Colors.white },
  pricePer: { fontSize: 11, color: Colors.textSecondary, marginTop: 2, textAlign: 'center' },

  ctaBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 4,
  },
  ctaBtnDisabled: { opacity: 0.6 },
  ctaText: { color: Colors.white, fontSize: 17, fontWeight: '800' },

  restoreBtn: { alignItems: 'center', marginTop: 16, padding: 8 },
  restoreText: { color: Colors.textSecondary, fontSize: 13 },

  legalRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20 },
  legalLink: { fontSize: 12, color: Colors.textSecondary, textDecorationLine: 'underline' },
  legalDot: { color: Colors.textSecondary, fontSize: 12 },
  legalNote: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 15,
    opacity: 0.7,
  },
});
