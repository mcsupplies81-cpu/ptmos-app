import { useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useProfileStore } from '@/stores/profileStore';

export default function DisclaimerScreen() {
  const { session } = useAuthStore();
  const { fetchProfile } = useProfileStore();
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const onAccept = async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    await supabase
      .from('profiles')
      .update({ disclaimer_accepted: true, disclaimer_accepted_at: new Date().toISOString() })
      .eq('id', session.user.id);
    await fetchProfile(session.user.id);
    setLoading(false);
    router.replace('/(auth)/profile-setup');
  };

  const disabled = loading || !accepted;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.shieldCircle}>
          <Text style={styles.shieldEmoji}>🛡️</Text>
        </View>
        <Text style={styles.topTitle}>Before You Begin</Text>
        <Text style={styles.topSubtitle}>Please read and accept our disclaimer</Text>
      </View>

      <View style={styles.bottomSheet}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.sectionHeading}>Not Medical Advice</Text>
          <Text style={styles.bodyText}>
            PTMOS is a personal tracking tool. It does not provide medical advice, diagnose conditions, or recommend
            treatments. Always consult a licensed healthcare provider before starting any protocol.
          </Text>

          <Text style={styles.sectionHeading}>Educational Only</Text>
          <Text style={styles.bodyText}>
            Research content in this app is provided for educational purposes only. References to compounds are based
            on published research and do not constitute endorsement or recommendation.
          </Text>

          <Text style={styles.sectionHeading}>Your Responsibility</Text>
          <Text style={styles.bodyText}>
            You are solely responsible for any decisions you make regarding your health and protocols. PTMOS tracks
            what you log — nothing more.
          </Text>

          <Text style={styles.sectionHeading}>Provider Directory</Text>
          <Text style={styles.bodyText}>
            Provider listings are for informational purposes. PTMOS does not endorse, verify, or guarantee any listed
            provider.
          </Text>

          <Pressable style={styles.acceptanceRow} onPress={() => setAccepted((prev) => !prev)}>
            <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
              {accepted ? <Text style={styles.checkmark}>✓</Text> : null}
            </View>
            <Text style={styles.acceptanceText}>
              I understand that PTMOS is a tracking tool and not a medical service.
            </Text>
          </Pressable>

          <Pressable style={[styles.button, disabled && styles.buttonDisabled]} onPress={onAccept} disabled={disabled}>
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.buttonText}>I Agree, Continue</Text>
            )}
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B3A2F',
  },
  topSection: {
    paddingTop: 60,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  shieldCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldEmoji: {
    fontSize: 30,
  },
  topTitle: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: '800',
    color: Colors.white,
  },
  topSubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: 24,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 36,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
    marginTop: 16,
  },
  bodyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  acceptanceRow: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  checkmark: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 20,
  },
  acceptanceText: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
    lineHeight: 22,
  },
  button: {
    marginTop: 24,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
