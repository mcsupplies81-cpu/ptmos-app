import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import Colors from '@/constants/Colors';
import { signInWithProvider } from '@/utils/oauth';

export default function WelcomeScreen() {
  const router = useRouter();
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setOauthLoading(provider);
    const err = await signInWithProvider(provider);
    setOauthLoading(null);
    if (err) Alert.alert('Sign in failed', err);
    // On success, authStore session listener fires → _layout.tsx routes to (tabs)
  };

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
        {/* Primary CTA */}
        <Pressable style={styles.primaryButton} onPress={() => router.replace('/(auth)/sign-up')}>
          <Text style={styles.primaryButtonText}>Create Account</Text>
        </Pressable>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social buttons */}
        <View style={styles.socialRow}>
          <Pressable
            style={[styles.socialButton, oauthLoading === 'google' && styles.socialButtonLoading]}
            onPress={() => handleOAuth('google')}
            disabled={oauthLoading !== null}
          >
            {oauthLoading === 'google' ? (
              <ActivityIndicator size="small" color={Colors.text} />
            ) : (
              <>
                <Text style={styles.socialIcon}>G</Text>
                <Text style={styles.socialButtonText}>Google</Text>
              </>
            )}
          </Pressable>

          {Platform.OS === 'ios' && (
            <Pressable
              style={[styles.socialButton, styles.appleButton, oauthLoading === 'apple' && styles.socialButtonLoading]}
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

        {/* Sign in link */}
        <Pressable onPress={() => router.replace('/(auth)/sign-in')} style={styles.signInRow}>
          <Text style={styles.signInText}>Already have an account? <Text style={styles.signInLink}>Sign In</Text></Text>
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
    marginBottom: 20,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginHorizontal: 12,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  socialButtonLoading: {
    opacity: 0.7,
  },
  socialIcon: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4285F4',
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  appleButton: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  appleIcon: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  appleButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  signInRow: {
    alignItems: 'center',
    marginBottom: 12,
  },
  signInText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  signInLink: {
    color: Colors.accent,
    fontWeight: '700',
  },
  legalText: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
