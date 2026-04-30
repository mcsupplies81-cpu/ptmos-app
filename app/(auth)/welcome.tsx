import { useRouter } from 'expo-router';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { Copy } from '@/constants/Copy';
import Colors from '@/constants/Colors';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.monogramCircle}>
          <Text style={styles.monogram}>PT</Text>
        </View>
        <Text style={styles.appName}>PTMOS</Text>
        <Text style={styles.tagline}>Your peptide protocol companion</Text>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.primaryButton} onPress={() => router.replace('/(auth)/sign-up')}>
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => router.replace('/(auth)/sign-in')}>
          <Text style={styles.secondaryButtonText}>Sign In</Text>
        </Pressable>
      </View>

      <Text style={styles.disclaimer}>{Copy.disclaimerShort}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  monogramCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#2D6A4F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  monogram: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: 1,
  },
  appName: {
    color: Colors.text,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 2,
  },
  tagline: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  actions: {
    gap: 12,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#2D6A4F',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 15,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryButton: {
    borderWidth: 1.5,
    borderColor: '#2D6A4F',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 15,
  },
  secondaryButtonText: {
    color: '#2D6A4F',
    fontSize: 17,
    fontWeight: '700',
  },
  disclaimer: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
});
