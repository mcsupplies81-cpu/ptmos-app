import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Colors from '@/constants/Colors';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSend = async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.topSection}>
          <View style={styles.lockCircle}>
            <Text style={styles.lockEmoji}>🔒</Text>
          </View>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>We'll send a reset link to your email</Text>
        </View>

        <View style={styles.bottomSheet}>
          {success ? (
            <View style={styles.successContainer}>
              <Text style={styles.successEmoji}>✅</Text>
              <Text style={styles.successTitle}>Check your email</Text>
              <Text style={styles.successMessage}>A password reset link has been sent.</Text>

              <Pressable style={styles.primaryButton} onPress={() => router.back()}>
                <Text style={styles.primaryButtonText}>Back to Sign In</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text style={styles.label}>EMAIL</Text>
              <TextInput
                placeholder="Email"
                placeholderTextColor={Colors.textSecondary}
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <Pressable style={styles.sendButton} onPress={onSend} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.sendButtonText}>Send Reset Link</Text>
                )}
              </Pressable>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <View style={styles.backRow}>
                <Text style={styles.backPrompt}>Remember it?</Text>
                <Pressable onPress={() => router.back()}>
                  <Text style={styles.backLink}> Sign In</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1B3A2F',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  topSection: {
    flex: 0.35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockEmoji: {
    fontSize: 26,
  },
  title: {
    marginTop: 14,
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.65)',
    fontSize: 14,
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    paddingTop: 32,
  },
  successContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  successEmoji: {
    fontSize: 48,
  },
  successTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  successMessage: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  primaryButton: {
    marginTop: 32,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    height: 48,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    color: Colors.text,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    marginBottom: 20,
  },
  sendButton: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
  },
  backRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  backPrompt: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  backLink: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '700',
  },
});
