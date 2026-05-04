import { useEffect } from 'react';
import { router } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import Colors from '@/constants/Colors';
import { useAuthStore } from '@/stores/authStore';
import { useProfileStore } from '@/stores/profileStore';

type MenuItem = {
  emoji: string;
  label: string;
  onPress: () => void;
};

export default function MoreTabScreen() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const profile = useProfileStore((s) => s.profile);
  const fetchProfile = useProfileStore((s) => s.fetchProfile);

  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id);
    }
  }, [fetchProfile, user?.id]);

  const displayName = profile?.full_name?.trim() || 'Your Profile';
  const email = user?.email || 'Add your email in settings';
  const initial = displayName.charAt(0).toUpperCase() || '?';

  const trackingItems: MenuItem[] = [
    { emoji: '💉', label: 'Protocols', onPress: () => router.push('/(tabs)/protocols') },
    { emoji: '📋', label: 'Dose History', onPress: () => router.push('/log/history') },
    { emoji: '🩺', label: 'Symptoms', onPress: () => router.push('/log/symptoms') },
    { emoji: '🏃', label: 'Lifestyle', onPress: () => router.push('/log/lifestyle') },
  ];

  const insightsItems: MenuItem[] = [
    { emoji: '📊', label: 'Weekly Summary', onPress: () => router.push('/insights/weekly-summary') },
    { emoji: '🧪', label: 'Inventory', onPress: () => router.push('/more/inventory') },
  ];

  const accountItems: MenuItem[] = [
    { emoji: '⚙️', label: 'Settings', onPress: () => router.push('/settings') },
    { emoji: '📄', label: 'Disclaimer', onPress: () => router.push('/disclaimer-modal') },
    {
      emoji: '🚪',
      label: 'Sign Out',
      onPress: () => {
        signOut();
        router.replace('/(auth)/login');
      },
    },
  ];

  const renderSection = (title: string, items: MenuItem[]) => (
    <View>
      <Text style={styles.sectionLabel}>{title}</Text>
      <View style={styles.sectionCard}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <Pressable
              key={`${title}-${item.label}`}
              style={[styles.itemRow, isLast && styles.itemRowLast]}
              onPress={item.onPress}
            >
              <View style={styles.itemLeft}>
                <View style={styles.emojiCircle}>
                  <Text style={styles.emoji}>{item.emoji}</Text>
                </View>
                <Text style={styles.itemLabel}>{item.label}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.profileHeader} onPress={() => router.push('/settings')}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={styles.displayName}>{displayName}</Text>
          <Text style={styles.email}>{email}</Text>
        </Pressable>

        {renderSection('TRACKING', trackingItems)}
        {renderSection('INSIGHTS', insightsItems)}
        {renderSection('ACCOUNT', accountItems)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: 16, paddingBottom: 60 },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  displayName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  email: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  itemRowLast: {
    borderBottomWidth: 0,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emojiCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 16,
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 12,
  },
  chevron: {
    fontSize: 20,
    color: Colors.textSecondary,
  },
});
