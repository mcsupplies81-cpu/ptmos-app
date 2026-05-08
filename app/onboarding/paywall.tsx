import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import Colors from '@/constants/Colors';

export default function OnboardingPaywallScreen() {
  const router = useRouter();

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('onboarding_complete', '1');
  };

  const handleCreateAccount = async () => {
    await completeOnboarding();
    router.replace('/(auth)/sign-up');
  };

  const handleSkip = async () => {
    await completeOnboarding();
    router.replace('/(auth)/welcome');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>PT-OS</Text>
          </View>

          <Text style={styles.title}>Build your peptide tracking system</Text>
          <Text style={styles.subtitle}>
            Track protocols, log doses, and keep your health stack organized in one place.
          </Text>

          <View style={styles.featureList}>
            <Text style={styles.feature}>✓ Protocol and dose tracking</Text>
            <Text style={styles.feature}>✓ Progress insights and reminders</Text>
            <Text style={styles.feature}>✓ Provider and research tools</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.primaryButton} onPress={() => void handleCreateAccount()}>
            <Text style={styles.primaryButtonText}>Create account</Text>
          </Pressable>

          <Pressable style={styles.skipButton} onPress={() => void handleSkip()}>
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, padding: 24, justifyContent: 'space-between' },
  content: { flex: 1, justifyContent: 'center' },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.accentLight,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 24,
  },
  badgeText: { color: Colors.accent, fontWeight: '800', letterSpacing: 0.5 },
  title: { color: Colors.text, fontSize: 34, fontWeight: '900', letterSpacing: -0.8, lineHeight: 40 },
  subtitle: { color: Colors.textSecondary, fontSize: 16, lineHeight: 24, marginTop: 16 },
  featureList: { gap: 12, marginTop: 32 },
  feature: { color: Colors.text, fontSize: 16, fontWeight: '600' },
  actions: { gap: 12, paddingBottom: 12 },
  primaryButton: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: { color: Colors.white, fontSize: 16, fontWeight: '800' },
  skipButton: { height: 48, justifyContent: 'center', alignItems: 'center' },
  skipButtonText: { color: Colors.textSecondary, fontSize: 15, fontWeight: '700' },
});
