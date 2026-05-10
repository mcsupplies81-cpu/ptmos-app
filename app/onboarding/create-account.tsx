import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Rect } from 'react-native-svg';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { signInWithProvider } from '@/utils/oauth';

const ACCENT = '#2563EB';
const BACKGROUND = '#FFFFFF';
const TEXT = '#0A0A0F';
const TEXT_SECONDARY = '#6B7280';
const TEXT_TERTIARY = '#9CA3AF';
const INPUT_BORDER = '#E5E7EB';
const CARD = '#FFFFFF';
const ERROR = '#DC2626';

type ProfileUpsertPayload = {
  id: string;
  full_name: string;
  email: string;
  goal: string;
  experience_level: string;
  disclaimer_accepted: boolean;
};

export default function CreateAccountScreen() {
  const router = useRouter();
  const authSession = useAuthStore((state) => state.session);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const upsertOnboardingProfile = async (userId: string, userEmail: string) => {
    const { name, goals, experience } = useOnboardingStore.getState();
    const payload: ProfileUpsertPayload = {
      id: userId,
      full_name: name,
      email: userEmail.trim(),
      goal: goals.join(','),
      experience_level: experience,
      disclaimer_accepted: false,
    };

    const { error } = await supabase.from('profiles').upsert(payload);

    if (error) throw error;
  };

  const handleCreateAccount = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMessage('Enter your email address.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const { name } = useOnboardingStore.getState();
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: { data: { full_name: name } },
      });

      if (error) throw error;
      if (!data.user?.id) throw new Error('Could not create your account. Please try again.');

      await upsertOnboardingProfile(data.user.id, trimmedEmail);
      router.replace({ pathname: '/onboarding/paywall', params: { name } });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not create your account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderSignIn = async (provider: 'apple' | 'google') => {
    setLoading(true);
    setErrorMessage('');

    try {
      const error = await signInWithProvider(provider);

      if (error) throw new Error(error);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const activeSession = session ?? useAuthStore.getState().session ?? authSession;
      const user = activeSession?.user;

      if (!user?.id) return;

      const { name } = useOnboardingStore.getState();
      await upsertOnboardingProfile(user.id, user.email ?? email.trim());
      router.replace({ pathname: '/onboarding/paywall', params: { name } });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button">
            <Text style={styles.backButtonText}>‹</Text>
          </Pressable>

          <View style={styles.logoRow}>
            <Svg width={25} height={22} viewBox="0 0 25 22" fill="none">
              <Rect x={2} y={8} width={4} height={12} rx={2} fill={ACCENT} />
              <Rect x={9} y={2} width={4} height={18} rx={2} fill={ACCENT} />
              <Rect x={16} y={6} width={4} height={14} rx={2} fill={ACCENT} />
            </Svg>
            <Text style={styles.logoText}>PT-OS</Text>
          </View>

          <View style={styles.headerCopy}>
            <Text style={styles.title}>Create your{`\n`}PT-OS account</Text>
            <Text style={styles.subtitle}>Save your protocols, logs, and progress securely.</Text>
          </View>

          <View style={styles.authOptions}>
            {Platform.OS === 'ios' ? (
              <Pressable
                onPress={() => handleProviderSignIn('apple')}
                style={[styles.providerButton, styles.appleButton]}
                accessibilityRole="button"
                disabled={loading}
              >
                <Text style={styles.appleIcon}></Text>
                <Text style={styles.appleButtonText}>Continue with Apple</Text>
              </Pressable>
            ) : null}

            <Pressable
              onPress={() => handleProviderSignIn('google')}
              style={[styles.providerButton, styles.googleButton]}
              accessibilityRole="button"
              disabled={loading}
            >
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </Pressable>
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with email</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.form}>
            <TextInput
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="Email"
              placeholderTextColor={TEXT_TERTIARY}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              returnKeyType="next"
              style={styles.input}
            />

            <View style={styles.passwordField}>
              <TextInput
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="Password"
                placeholderTextColor={TEXT_TERTIARY}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                style={styles.passwordInput}
              />
              <Pressable
                onPress={() => setShowPassword((current) => !current)}
                style={styles.eyeButton}
                accessibilityRole="button"
              >
                <Text style={styles.eyeText}>👁</Text>
              </Pressable>
            </View>

            <Pressable
              style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
              onPress={handleCreateAccount}
              accessibilityRole="button"
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>{loading ? 'Creating…' : 'Create account'}</Text>
            </Pressable>

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          </View>

          <Pressable onPress={() => router.push('/(auth)/sign-in')} accessibilityRole="button">
            <Text style={styles.footerLink}>
              Already have an account? <Text style={styles.footerLinkAccent}>Sign in</Text>
            </Text>
          </Pressable>

          <Text style={styles.privacyText}>
            Your protocol data stays private. PT-OS does not sell your health data.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  backButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  backButtonText: {
    color: TEXT,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 32,
  },
  logoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 9,
    justifyContent: 'center',
    marginTop: 18,
  },
  logoText: {
    color: ACCENT,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  headerCopy: {
    alignItems: 'center',
    gap: 12,
    marginTop: 28,
  },
  title: {
    color: TEXT,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.7,
    lineHeight: 36,
    textAlign: 'center',
  },
  subtitle: {
    color: TEXT_SECONDARY,
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 300,
    textAlign: 'center',
  },
  authOptions: {
    gap: 10,
    marginTop: 34,
  },
  providerButton: {
    alignItems: 'center',
    borderRadius: 14,
    flexDirection: 'row',
    gap: 10,
    height: 52,
    justifyContent: 'center',
    width: '100%',
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  appleIcon: {
    color: CARD,
    fontSize: 18,
    fontWeight: '800',
  },
  appleButtonText: {
    color: CARD,
    fontSize: 15,
    fontWeight: '800',
  },
  googleButton: {
    backgroundColor: CARD,
    borderColor: INPUT_BORDER,
    borderWidth: 1.5,
  },
  googleIcon: {
    color: '#4285F4',
    fontSize: 18,
    fontWeight: '900',
  },
  googleButtonText: {
    color: TEXT,
    fontSize: 15,
    fontWeight: '800',
  },
  dividerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  dividerLine: {
    backgroundColor: INPUT_BORDER,
    flex: 1,
    height: 1,
  },
  dividerText: {
    color: TEXT_TERTIARY,
    fontSize: 12,
    fontWeight: '600',
  },
  form: {
    gap: 12,
    marginTop: 20,
  },
  input: {
    backgroundColor: CARD,
    borderColor: INPUT_BORDER,
    borderRadius: 14,
    borderWidth: 1.5,
    color: TEXT,
    fontSize: 17,
    height: 52,
    paddingHorizontal: 18,
    width: '100%',
  },
  passwordField: {
    alignItems: 'center',
    backgroundColor: CARD,
    borderColor: INPUT_BORDER,
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: 'row',
    height: 52,
    width: '100%',
  },
  passwordInput: {
    color: TEXT,
    flex: 1,
    fontSize: 17,
    height: '100%',
    paddingLeft: 18,
    paddingRight: 8,
  },
  eyeButton: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  eyeText: {
    fontSize: 16,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: ACCENT,
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    marginTop: 4,
    width: '100%',
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: CARD,
    fontSize: 17,
    fontWeight: '700',
  },
  errorText: {
    color: ERROR,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    textAlign: 'center',
  },
  footerLink: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 24,
    textAlign: 'center',
  },
  footerLinkAccent: {
    color: ACCENT,
    fontWeight: '800',
  },
  privacyText: {
    color: TEXT_TERTIARY,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 'auto',
    paddingTop: 28,
    textAlign: 'center',
  },
});
