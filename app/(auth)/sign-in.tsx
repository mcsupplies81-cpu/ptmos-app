import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import Svg, { Rect } from 'react-native-svg';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { signInWithProvider } from '@/utils/oauth';

const ACCENT = '#2563EB';
const BACKGROUND = '#FFFFFF';
const TEXT = '#0A0A0F';
const TEXT_SECONDARY = '#6B7280';
const BORDER = '#E5E7EB';
const ERROR = '#DC2626';

export default function SignInScreen() {
  const user = useAuthStore((state) => state.user);
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setOauthLoading(provider);
    const err = await signInWithProvider(provider);
    setOauthLoading(null);
    if (err) Alert.alert('Sign in failed', err);
  };

  const onSignIn = async () => {
    if (loading) return;
    setLoading(true);
    setError('');
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.replace('/(tabs)');
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoRow}>
            <Svg width={25} height={22} viewBox="0 0 25 22" fill="none">
              <Rect x={2} y={8} width={4} height={12} rx={2} fill={ACCENT} />
              <Rect x={9} y={2} width={4} height={18} rx={2} fill={ACCENT} />
              <Rect x={16} y={6} width={4} height={14} rx={2} fill={ACCENT} />
            </Svg>
            <Text style={styles.logoText}>PT-OS</Text>
          </View>

          <Text style={styles.heading}>Welcome back</Text>
          <Text style={styles.subtitle}>Log in to continue tracking.</Text>

          <View style={styles.authButtons}>
            {Platform.OS === 'ios' ? (
              <Pressable
                style={[styles.socialButton, styles.appleButton, oauthLoading === 'apple' && styles.disabledButton]}
                onPress={() => void handleOAuth('apple')}
                disabled={oauthLoading !== null}
                accessibilityRole="button"
              >
                {oauthLoading === 'apple' ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.appleIcon}></Text>
                    <Text style={styles.appleButtonText}>Continue with Apple</Text>
                  </>
                )}
              </Pressable>
            ) : null}

            <Pressable
              style={[styles.socialButton, styles.googleButton, oauthLoading === 'google' && styles.disabledButton]}
              onPress={() => void handleOAuth('google')}
              disabled={oauthLoading !== null}
              accessibilityRole="button"
            >
              {oauthLoading === 'google' ? (
                <ActivityIndicator size="small" color={TEXT} />
              ) : (
                <>
                  <Text style={styles.googleIcon}>G</Text>
                  <Text style={styles.googleButtonText}>Continue with Google</Text>
                </>
              )}
            </Pressable>
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={TEXT_SECONDARY}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={TEXT_SECONDARY}
            secureTextEntry
            returnKeyType="done"
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={onSignIn}
          />

          <Pressable onPress={() => router.push('/(auth)/forgot-password')} accessibilityRole="button">
            <Text style={styles.forgotText}>Forgot password?</Text>
          </Pressable>

          <Pressable
            style={[styles.primaryButton, loading && styles.disabledButton]}
            onPress={() => void onSignIn()}
            disabled={loading}
            accessibilityRole="button"
          >
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Log in</Text>}
          </Pressable>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable style={styles.createAccountLink} onPress={() => router.push('/onboarding')} accessibilityRole="button">
            <Text style={styles.createAccountText}>
              New to PT-OS? <Text style={styles.createAccountTextAccent}>Create account</Text>
            </Text>
          </Pressable>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 28,
  },
  logoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  logoText: {
    color: ACCENT,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  heading: {
    color: TEXT,
    fontSize: 36,
    fontWeight: '900',
    marginTop: 40,
  },
  subtitle: {
    color: TEXT_SECONDARY,
    fontSize: 16,
    marginTop: 8,
  },
  authButtons: {
    gap: 12,
    marginTop: 34,
  },
  socialButton: {
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
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 20,
  },
  appleButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  googleButton: {
    backgroundColor: BACKGROUND,
    borderColor: BORDER,
    borderWidth: 1.5,
  },
  googleIcon: {
    color: '#4285F4',
    fontSize: 16,
    fontWeight: '900',
  },
  googleButtonText: {
    color: TEXT,
    fontSize: 15,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.72,
  },
  dividerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginVertical: 24,
  },
  dividerLine: {
    backgroundColor: BORDER,
    flex: 1,
    height: 1,
  },
  dividerText: {
    color: TEXT_SECONDARY,
    fontSize: 14,
  },
  input: {
    borderColor: BORDER,
    borderRadius: 14,
    borderWidth: 1.5,
    color: TEXT,
    fontSize: 16,
    height: 52,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  forgotText: {
    color: ACCENT,
    fontSize: 14,
    marginBottom: 22,
    marginTop: 2,
    textAlign: 'right',
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
  errorText: {
    color: ERROR,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 14,
    textAlign: 'center',
  },
  createAccountLink: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 34,
  },
  createAccountText: {
    color: TEXT_SECONDARY,
    fontSize: 14,
  },
  createAccountTextAccent: {
    color: ACCENT,
    fontWeight: '700',
  },
});
