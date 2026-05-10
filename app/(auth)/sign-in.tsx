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

import Colors from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { signInWithProvider } from '@/utils/oauth';

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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.keyboardContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.topSection}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>P</Text>
          </View>
          <Text style={styles.heading}>Welcome back</Text>
          <Text style={styles.subheading}>Sign in to PT-OS</Text>
        </View>

        <View style={styles.bottomSheet}>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Colors.textSecondary}
              secureTextEntry
              returnKeyType="done"
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={onSignIn}
            />

            <Pressable onPress={() => router.push('/(auth)/forgot-password')}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>

            <Pressable style={[styles.primaryButton, loading && styles.buttonDisabled]} onPress={onSignIn} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Sign In</Text>}
            </Pressable>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social login */}
            <View style={styles.socialRow}>
              <Pressable
                style={[styles.socialButton, oauthLoading === 'google' && styles.socialDisabled]}
                onPress={() => handleOAuth('google')}
                disabled={oauthLoading !== null}
              >
                {oauthLoading === 'google' ? (
                  <ActivityIndicator size="small" color={Colors.text} />
                ) : (
                  <>
                    <Text style={styles.googleIcon}>G</Text>
                    <Text style={styles.socialButtonText}>Google</Text>
                  </>
                )}
              </Pressable>

              {Platform.OS === 'ios' && (
                <Pressable
                  style={[styles.socialButton, styles.appleButton, oauthLoading === 'apple' && styles.socialDisabled]}
                  onPress={() => handleOAuth('apple')}
                  disabled={oauthLoading !== null}
                >
                  {oauthLoading === 'apple' ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.appleIcon}></Text>
                      <Text style={styles.appleButtonText}>Apple</Text>
                    </>
                  )}
                </Pressable>
              )}
            </View>

            <Pressable style={styles.ghostButton} onPress={() => router.push('/(auth)/sign-up')}>
              <Text style={styles.ghostButtonText}>Create Account</Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  keyboardContainer: { flex: 1 },
  topSection: { flex: 0.28, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { fontSize: 26, fontWeight: '800', color: Colors.accent },
  heading: { color: Colors.text, fontSize: 22, fontWeight: '700', marginTop: 14 },
  subheading: { color: Colors.textSecondary, fontSize: 14, marginTop: 4 },
  bottomSheet: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    padding: 28,
    paddingTop: 32,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    color: Colors.text,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    fontSize: 15,
  },
  forgotText: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  buttonDisabled: { opacity: 0.8 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  errorText: { fontSize: 13, color: '#DC2626', textAlign: 'center', marginBottom: 12 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dividerLine: { height: 1, backgroundColor: Colors.border, flex: 1 },
  dividerText: { color: Colors.textSecondary, fontSize: 13, marginHorizontal: 12 },
  ghostButton: {
    borderWidth: 1.5,
    borderColor: Colors.accent,
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostButtonText: { color: Colors.accent, fontSize: 15, fontWeight: '700' },
  socialRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    gap: 8,
  },
  socialDisabled: { opacity: 0.6 },
  googleIcon: { fontSize: 15, fontWeight: '800', color: '#4285F4' },
  socialButtonText: { fontSize: 14, fontWeight: '600', color: Colors.text },
  appleButton: { backgroundColor: '#000', borderColor: '#000' },
  appleIcon: { fontSize: 15, color: '#fff' },
  appleButtonText: { fontSize: 14, fontWeight: '600', color: '#fff' },
});
