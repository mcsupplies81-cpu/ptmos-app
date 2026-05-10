import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Rect } from 'react-native-svg';

const PRIMARY = '#1B4332';
const BACKGROUND = '#F8F8F6';
const TEXT = '#0A0A0F';
const TEXT_SECONDARY = '#6B7280';
const BUTTON_BORDER = '#D1D5DB';

function LogoMark() {
  return (
    <Svg width={62} height={62} viewBox="0 0 62 62" fill="none">
      <Rect x={7} y={19} width={9} height={30} rx={4.5} fill={PRIMARY} />
      <Rect x={25} y={9} width={9} height={43} rx={4.5} fill={PRIMARY} />
      <Rect x={43} y={23} width={9} height={12} rx={4.5} fill={PRIMARY} />
      <Rect x={43} y={40} width={9} height={17} rx={4.5} fill={PRIMARY} />
    </Svg>
  );
}

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.logoSection}>
          <View style={styles.logoRow}>
            <LogoMark />
            <Text style={styles.brandText}>PT-OS</Text>
          </View>
          <Text style={styles.tagline}>YOUR PEPTIDE OPERATING SYSTEM</Text>
        </View>

        <View style={styles.copySection}>
          <Text style={styles.headline}>
            Track peptides with <Text style={styles.headlineAccent}>clarity.</Text>
          </Text>
          <Text style={styles.bodyCopy}>Log doses, monitor protocols, and understand your routine in one place.</Text>
        </View>

        <View style={styles.heroSection}>
          <Image style={styles.heroImagePlaceholder} resizeMode="cover" accessibilityLabel="Peptide vial hero image" />
        </View>

        <View style={styles.buttonSection}>
          <Pressable style={styles.getStartedButton} onPress={() => router.push('/onboarding')}>
            <View style={styles.arrowCircle}>
              <Text style={styles.arrowText}>→</Text>
            </View>
            <Text style={styles.getStartedText}>Get started</Text>
            <View style={styles.buttonSpacer} />
          </Pressable>

          <Pressable style={styles.signInButton} onPress={() => router.push('/(auth)/sign-in')}>
            <Text style={styles.signInText}>
              Already have an account? <Text style={styles.signInTextBold}>Sign in</Text>
            </Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.footerText}>Your data is private and secure. PT-OS does not sell your health data.</Text>
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
    flex: 1,
    backgroundColor: BACKGROUND,
    paddingHorizontal: 28,
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: 118,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  brandText: {
    color: PRIMARY,
    fontSize: 43,
    fontWeight: '800',
    letterSpacing: 2.4,
  },
  tagline: {
    marginTop: 34,
    color: TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    textAlign: 'center',
  },
  copySection: {
    alignItems: 'center',
    paddingTop: 47,
  },
  headline: {
    color: TEXT,
    fontSize: 40,
    fontWeight: '800',
    lineHeight: 46,
    textAlign: 'center',
  },
  headlineAccent: {
    color: PRIMARY,
  },
  bodyCopy: {
    maxWidth: 335,
    marginTop: 26,
    color: TEXT_SECONDARY,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  heroSection: {
    marginHorizontal: -28,
    marginTop: 26,
  },
  heroImagePlaceholder: {
    width: '100%',
    height: 320,
    backgroundColor: '#EEF0F2',
  },
  buttonSection: {
    marginTop: 28,
    gap: 18,
  },
  getStartedButton: {
    width: '100%',
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 36,
    backgroundColor: PRIMARY,
    paddingLeft: 14,
    paddingRight: 24,
  },
  arrowCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  arrowText: {
    color: PRIMARY,
    fontSize: 33,
    fontWeight: '500',
    lineHeight: 36,
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '400',
  },
  buttonSpacer: {
    width: 52,
  },
  signInButton: {
    width: '100%',
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 29,
    borderWidth: 1,
    borderColor: BUTTON_BORDER,
    backgroundColor: '#FFFFFF',
  },
  signInText: {
    color: TEXT,
    fontSize: 16,
    fontWeight: '400',
  },
  signInTextBold: {
    color: PRIMARY,
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingTop: 34,
    paddingBottom: 12,
  },
  lockIcon: {
    fontSize: 17,
    lineHeight: 22,
  },
  footerText: {
    maxWidth: 300,
    color: TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
});
