import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import ScreenHeader from '@/components/ScreenHeader';
import Colors from '@/constants/Colors';
import supabase from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useProfileStore } from '@/stores/profileStore';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const user = useAuthStore((state) => state.user);
  const profile = useProfileStore((state) => state.profile);

  const initials =
    profile?.full_name
      ?.split(' ')
      .filter(Boolean)
      .map((word) => word[0]?.toUpperCase())
      .join('') || '?';

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/welcome');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader hideBack={true} title="Settings" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
          <Text style={styles.name}>{profile?.full_name ?? 'Unknown User'}</Text>
          <Text style={styles.email}>{user?.email ?? 'No email available'}</Text>
        </View>

        <Text style={styles.sectionHeader}>PREFERENCES</Text>
        <View style={styles.rowGroup}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.iconCircle}>
                <Text style={styles.icon}>🔔</Text>
              </View>
              <Text style={styles.rowLabel}>Push Notifications</Text>
            </View>
            <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} trackColor={{ true: Colors.accent }} />
          </View>

          <Pressable style={styles.row} onPress={() => router.push('/paywall')}>
            <View style={styles.rowLeft}>
              <View style={styles.iconCircle}>
                <Text style={styles.icon}>✨</Text>
              </View>
              <Text style={styles.rowLabel}>Go Pro</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.upgradeBadge}>Upgrade</Text>
              <Text style={styles.chevron}>›</Text>
            </View>
          </Pressable>
        </View>

        <Text style={styles.sectionHeader}>ACCOUNT</Text>
        <View style={styles.rowGroup}>
          <Pressable style={styles.row} onPress={() => Linking.openURL('https://ptmos.app/privacy')}>
            <Text style={styles.rowLabel}>Privacy Policy</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
          <Pressable style={styles.row} onPress={() => Linking.openURL('https://ptmos.app/terms')}>
            <Text style={styles.rowLabel}>Terms of Service</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        </View>

        <Pressable style={[styles.row, styles.signOutRow]} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        <Text style={styles.version}>PTMOS v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: 28 },
  userCard: {
    backgroundColor: Colors.card,
    margin: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    alignItems: 'center',
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: { color: Colors.accent, fontWeight: '700', fontSize: 20 },
  name: { fontSize: 17, fontWeight: '700', color: Colors.text, marginTop: 10, textAlign: 'center' },
  email: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', marginTop: 2 },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: Colors.textSecondary,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  rowGroup: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.border },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowLabel: { color: Colors.text, fontSize: 15, fontWeight: '500' },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: { fontSize: 16 },
  upgradeBadge: {
    backgroundColor: Colors.accentLight,
    color: Colors.accent,
    fontSize: 11,
    fontWeight: '700',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    overflow: 'hidden',
  },
  chevron: { color: Colors.textSecondary, fontSize: 20, lineHeight: 20 },
  signOutRow: { marginTop: 16 },
  signOutText: { color: '#DC2626', fontSize: 15, fontWeight: '600' },
  version: { textAlign: 'center', fontSize: 12, color: Colors.textSecondary, marginTop: 24 },
});
