import { router } from 'expo-router';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

const ACCENT = '#2563EB';
const BACKGROUND = '#FFFFFF';
const TEXT = '#0A0A0F';
const TEXT_SECONDARY = '#6B7280';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.logoRow}>
          <Svg width={25} height={22} viewBox="0 0 25 22" fill="none">
            <Rect x={2} y={8} width={4} height={12} rx={2} fill={ACCENT} />
            <Rect x={9} y={2} width={4} height={18} rx={2} fill={ACCENT} />
            <Rect x={16} y={6} width={4} height={14} rx={2} fill={ACCENT} />
          </Svg>
          <Text style={styles.logoText}>PT-OS</Text>
        </View>

        <View style={styles.vialRow}>
          {['#2563EB', '#22C55E', '#A855F7', '#EC4899', '#F97316'].map((color, index) => (
            <View key={color} style={[styles.vial, { borderColor: color, transform: [{ translateY: index % 2 === 0 ? 0 : -8 }] }]}>
              <View style={[styles.vialCap, { backgroundColor: color }]} />
            </View>
          ))}
        </View>

        <Text style={styles.heading}>Track peptides{`\n`}with <Text style={styles.headingAccent}>clarity.</Text></Text>
        <Text style={styles.subtitle}>Log doses, monitor protocols, and understand your routine in one place.</Text>

        <View style={styles.footer}>
          <Pressable style={styles.primaryButton} onPress={() => router.push('/onboarding')} accessibilityRole="button">
            <Text style={styles.primaryButtonText}>Get started</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/(auth)/sign-in')} accessibilityRole="button">
            <Text style={styles.signInText}>Already have an account? <Text style={styles.signInLink}>Sign in</Text></Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingTop: 56,
  },
  logoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  logoText: {
    color: TEXT,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  vialRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 10,
    height: 150,
    marginTop: 54,
  },
  vial: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 9,
    borderWidth: 2,
    height: 88,
    justifyContent: 'flex-start',
    width: 36,
  },
  vialCap: {
    borderRadius: 4,
    height: 12,
    marginTop: -10,
    width: 24,
  },
  heading: {
    color: TEXT,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -0.8,
    lineHeight: 40,
    marginTop: 34,
    textAlign: 'center',
  },
  headingAccent: {
    color: ACCENT,
  },
  subtitle: {
    color: TEXT_SECONDARY,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 14,
    maxWidth: 290,
    textAlign: 'center',
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: 28,
    width: '100%',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: ACCENT,
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    width: '100%',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  signInText: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
  },
  signInLink: {
    color: ACCENT,
    fontWeight: '700',
  },
});
