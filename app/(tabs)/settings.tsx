import { router } from 'expo-router';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { Copy } from '@/constants/Copy';
import Colors from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useProfileStore } from '@/stores/profileStore';

export default function SettingsScreen() {
  const user = useAuthStore((state) => state.user);
  const isPro = useAuthStore((state) => state.isPro);
  const signOut = useAuthStore((state) => state.signOut);
  const profile = useProfileStore((state) => state.profile);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    signOut();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.sectionHeader}>ACCOUNT</Text>
        <View style={styles.settingRow}>
          <Text style={styles.label}>Full Name</Text>
          <Text style={styles.value}>{profile?.full_name ?? '-'}</Text>
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email ?? '-'}</Text>
        </View>
        <Pressable style={styles.settingRow} onPress={handleSignOut}>
          <Text style={styles.label}>Sign Out</Text>
        </Pressable>

        <Text style={styles.sectionHeader}>SUBSCRIPTION</Text>
        <View style={styles.settingRow}>
          <Text style={styles.label}>Plan</Text>
          <Text style={styles.value}>{isPro ? 'Pro' : 'Free'}</Text>
        </View>
        {!isPro ? (
          <Pressable style={styles.settingRow} onPress={() => router.push('/paywall')}>
            <Text style={styles.label}>Upgrade to Pro</Text>
          </Pressable>
        ) : null}

        <Text style={styles.sectionHeader}>ABOUT</Text>
        <View style={styles.settingRow}>
          <Text style={styles.label}>Version</Text>
          <Text style={styles.value}>1.0.0</Text>
        </View>
        <Pressable
          style={styles.settingRow}
          onPress={() => router.push('/disclaimer-modal')}
        >
          <Text style={styles.label}>Disclaimer</Text>
        </Pressable>

        <Text style={styles.disclaimer}>{Copy.disclaimerShort}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, padding: 16 },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  label: { color: Colors.text },
  value: { color: Colors.textSecondary },
  disclaimer: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 'auto',
    paddingTop: 16,
  },
});
