import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Switch, Text, View } from 'react-native';

import Colors from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useProfileStore } from '@/stores/profileStore';

export default function SettingsScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const profile = useProfileStore((state) => state.profile);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogOut = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/welcome');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.heading}>Settings</Text>

        <View style={styles.card}>
          <Text style={styles.name}>{profile?.full_name ?? 'No name set'}</Text>
          <Text style={styles.email}>{user?.email ?? 'No email available'}</Text>
        </View>

        <View style={styles.cardRow}>
          <Text style={styles.rowLabel}>Notifications</Text>
          <View style={styles.rowRight}>
            <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} trackColor={{ true: '#2D6A4F' }} />
            <Text style={styles.chevron}>›</Text>
          </View>
        </View>

        <Pressable style={styles.cardRow} onPress={handleLogOut}>
          <Text style={styles.logOutLabel}>Log Out</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        <View style={styles.cardRow}>
          <Text style={styles.comingSoonLabel}>Delete Account (Coming soon)</Text>
          <Text style={styles.chevronMuted}>›</Text>
        </View>

        <Text style={styles.version}>Version 1.0.0</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, padding: 20, gap: 14 },
  heading: { fontSize: 32, fontWeight: '800', color: Colors.text, marginBottom: 6 },
  card: {
    backgroundColor: Colors.card,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
  },
  name: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  email: { color: Colors.textSecondary, marginTop: 6 },
  cardRow: {
    backgroundColor: Colors.card,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: { color: Colors.text, fontSize: 16, fontWeight: '600' },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chevron: { color: Colors.textSecondary, fontSize: 22, lineHeight: 22 },
  chevronMuted: { color: '#98A2B3', fontSize: 22, lineHeight: 22 },
  logOutLabel: { color: '#B42318', fontSize: 16, fontWeight: '700' },
  comingSoonLabel: { color: '#98A2B3', fontSize: 16, fontWeight: '600' },
  version: { marginTop: 'auto', textAlign: 'center', color: Colors.textSecondary, fontSize: 12 },
});
