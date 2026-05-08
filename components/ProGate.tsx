import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';
import { useSubscriptionStore } from '@/stores/subscriptionStore';

/**
 * Wrap any screen or section with <ProGate>.
 * If the user is not Pro, renders a locked overlay instead of children.
 * Tapping "Unlock Pro" navigates to the paywall modal.
 */
interface ProGateProps {
  children: ReactNode;
  feature?: string; // e.g. "Protocols" — shown in the lock message
}

export function ProGate({ children, feature }: ProGateProps) {
  const isPro = useSubscriptionStore((s) => s.isPro);
  const isLoading = useSubscriptionStore((s) => s.isLoading);

  // While loading subscription status, show children (avoid flash of lock)
  if (isLoading || isPro) return <>{children}</>;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.crown}>👑</Text>
        <Text style={styles.title}>Pro Feature</Text>
        <Text style={styles.desc}>
          {feature
            ? `${feature} is available on PT-OS Pro.`
            : 'This feature is available on PT-OS Pro.'}
          {'\n'}Upgrade for $2.99/mo or $24.99/yr.
        </Text>
        <Pressable style={styles.btn} onPress={() => router.push('/paywall')}>
          <Text style={styles.btnText}>Unlock Pro</Text>
        </Pressable>
        <Text style={styles.sub}>All your free features still work as normal.</Text>
      </View>
    </View>
  );
}

// Legacy shape — kept for backwards compat, now just delegates to ProGate
export const FREE_TIER_LIMITS = {
  activeProtocols: 1,
  inventoryItems: 1,
  doseLogs: 30,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 32,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 28,
    alignItems: 'center',
    gap: 12,
    width: '100%',
    maxWidth: 340,
  },
  crown: { fontSize: 40, marginBottom: 4 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.white, letterSpacing: -0.3 },
  desc: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 21 },
  btn: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 3,
  },
  btnText: { color: Colors.white, fontSize: 16, fontWeight: '800' },
  sub: { fontSize: 11, color: Colors.textSecondary, marginTop: 4 },
});
