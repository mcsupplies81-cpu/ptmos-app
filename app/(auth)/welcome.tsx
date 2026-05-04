import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import Colors from '@/constants/Colors';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>P</Text>
        </View>
        <Text style={styles.brandText}>PT-OS</Text>
        <Text style={styles.subtitleText}>All-in-one peptide{`\n`}tracking and optimization platform.</Text>
      </View>

      <View style={styles.bottomSection}>
        <Pressable style={styles.primaryButton} onPress={() => router.replace('/(auth)/disclaimer')}>
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={() => router.replace('/(auth)/sign-in')}>
          <Text style={styles.secondaryButtonText}>Sign In</Text>
        </Pressable>

        <Text style={styles.legalText}>By continuing you agree to our Terms & Privacy Policy.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    flex: 1.3,
    backgroundColor: '#1B3A2F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#2D6A4F',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  brandText: {
    marginTop: 12,
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  subtitleText: {
    marginTop: 10,
    fontSize: 14,
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 240,
  },
  bottomSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    paddingTop: 36,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: Colors.accent,
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.accent,
    fontSize: 16,
    fontWeight: '600',
  },
  legalText: {
    marginTop: 28,
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
