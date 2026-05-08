import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { ActivityIndicator, Alert, Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import Colors from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useProfileStore } from '@/stores/profileStore';
import { uploadAvatar } from '@/utils/avatar';

type MenuItem = {
  emoji: string;
  label: string;
  subtitle?: string;
  onPress: () => void;
};

export default function MoreTabScreen() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const profile = useProfileStore((s) => s.profile);
  const setProfile = useProfileStore((s) => s.setProfile);
  const fetchProfile = useProfileStore((s) => s.fetchProfile);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id);
    }
  }, [fetchProfile, user?.id]);

  const displayName = profile?.full_name?.trim() || 'Your Profile';
  const email = user?.email || 'Add your email in settings';
  const initial = displayName.charAt(0).toUpperCase() || '?';
  const avatarUrl = profile?.avatar_url ?? null;

  const handleAvatarPress = async () => {
    if (!user?.id || uploadingAvatar) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    try {
      setUploadingAvatar(true);
      const selectedAsset = result.assets[0];
      const publicUrl = selectedAsset?.uri ? await uploadAvatar(user.id, selectedAsset.uri) : null;

      if (!publicUrl) {
        Alert.alert('Upload failed', 'Please try selecting your profile photo again.');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (error) {
        Alert.alert('Save failed', error.message);
        return;
      }

      if (profile) {
        setProfile({ ...profile, avatar_url: publicUrl });
      } else {
        await fetchProfile(user.id);
      }
    } finally {
      setUploadingAvatar(false);
    }
  };

  const trackingItems: MenuItem[] = [
    { emoji: '💉', label: 'Protocols', onPress: () => router.push('/(tabs)/protocols') },
    { emoji: '📋', label: 'Dose History', onPress: () => router.push('/log/history') },
    { emoji: '🩺', label: 'Symptoms', onPress: () => router.push('/log/symptoms') },
    { emoji: '🏃', label: 'Lifestyle', onPress: () => router.push('/log/lifestyle') },
  ];

  const insightsItems: MenuItem[] = [
    { emoji: '📊', label: 'Weekly Summary', onPress: () => router.push('/insights/weekly-summary') },
    {
      emoji: '🏥',
      label: 'Provider Directory',
      subtitle: 'Find verified clinics & med spas',
      onPress: () => router.push('/providers'),
    },
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
        router.replace('/(auth)/sign-in');
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
                <View style={styles.itemCopy}>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                  {item.subtitle ? <Text style={styles.itemSubtitle}>{item.subtitle}</Text> : null}
                </View>
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
        <View style={styles.profileHeader}>
          <Pressable style={styles.avatar} onPress={handleAvatarPress} disabled={uploadingAvatar}>
            {uploadingAvatar ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{initial}</Text>
            )}
            <View style={styles.avatarBadge}>
              <Text style={styles.avatarBadgeText}>🤳</Text>
            </View>
          </Pressable>
          <Pressable style={styles.profileDetails} onPress={() => router.push('/settings')}>
            <Text style={styles.displayName}>{displayName}</Text>
            <Text style={styles.email}>{email}</Text>
          </Pressable>
        </View>

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
  profileDetails: {
    alignItems: 'center',
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
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  avatarBadge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBadgeText: {
    fontSize: 12,
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
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
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
  itemCopy: {
    flex: 1,
    marginLeft: 12,
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  itemSubtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 3,
  },
  chevron: {
    fontSize: 20,
    color: Colors.textSecondary,
  },
});
