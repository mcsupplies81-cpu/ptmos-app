import { useEffect } from 'react';
import { router } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import Colors from '@/constants/Colors';
import { useAuthStore } from '@/stores/authStore';
import { useProfileStore } from '@/stores/profileStore';

type SectionRow = {
  icon: string;
  iconBg: string;
  label: string;
  path: string;
  isUpgrade?: boolean;
};

const trackingRows: SectionRow[] = [
  { icon: '💉', iconBg: '#E8F5E9', label: 'Log Dose', path: '/log/dose' },
  { icon: '🗓️', iconBg: '#E8F5E9', label: 'Injection Sites', path: '/more/injection-sites' },
  { icon: '📦', iconBg: '#E8F5E9', label: 'Inventory', path: '/more/inventory' },
  { icon: '🩺', iconBg: '#E8F5E9', label: 'Symptoms', path: '/log/symptoms' },
  { icon: '🏃', iconBg: '#E8F5E9', label: 'Lifestyle Log', path: '/log/lifestyle' },
];

const learnRows: SectionRow[] = [
  { icon: '🔬', iconBg: '#EDE9FE', label: 'Research Library', path: '/research' },
  { icon: '🏥', iconBg: '#EDE9FE', label: 'Find Providers', path: '/providers' },
  { icon: '🧮', iconBg: '#EDE9FE', label: 'Dosage Calculator', path: '/log/calculator' },
];

const accountRows: SectionRow[] = [
  { icon: '⚙️', iconBg: '#F3F4F6', label: 'Settings', path: '/settings' },
  { icon: '✨', iconBg: Colors.accentLight, label: 'Go Pro', path: '/paywall', isUpgrade: true },
];

export default function MoreTabScreen() {
  const user = useAuthStore((s) => s.user);
  const profile = useProfileStore((s) => s.profile);
  const fetchProfile = useProfileStore((s) => s.fetchProfile);

  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id);
    }
  }, [fetchProfile, user?.id]);

  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?';

  const displayName = profile?.full_name || 'Your Profile';
  const email = user?.email || 'Add your email in settings';

  const renderSection = (title: string, rows: SectionRow[]) => (
    <>
      <Text style={styles.sectionHeader}>{title}</Text>
      <View style={styles.sectionCard}>
        {rows.map((row, index) => (
          <Pressable
            key={row.path}
            style={[styles.row, index === rows.length - 1 && styles.rowLast]}
            onPress={() => router.push(row.path as any)}
          >
            <View style={[styles.iconCircle, { backgroundColor: row.iconBg }]}>
              <Text style={styles.iconText}>{row.icon}</Text>
            </View>
            <Text style={styles.rowLabel}>{row.label}</Text>
            {row.isUpgrade && <Text style={styles.upgradeBadge}>UPGRADE</Text>}
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ paddingTop: 16 }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.initials}>{initials}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userEmail}>{email}</Text>
          </View>
          <Pressable onPress={() => router.push('/settings')}>
            <Text style={styles.cardChevron}>›</Text>
          </Pressable>
        </View>

        {renderSection('TRACKING', trackingRows)}
        {renderSection('LEARN', learnRows)}
        {renderSection('ACCOUNT', accountRows)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: 40 },
  userCard: {
    margin: 16,
    marginTop: 8,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.accent,
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 17, fontWeight: '700', color: Colors.text },
  userEmail: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  cardChevron: { fontSize: 22, color: Colors.textSecondary },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: Colors.textSecondary,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionCard: {
    borderRadius: 14,
    overflow: 'hidden',
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: { fontSize: 16 },
  rowLabel: {
    fontSize: 15,
    color: Colors.text,
    flex: 1,
  },
  chevron: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  upgradeBadge: {
    backgroundColor: Colors.accentLight,
    color: Colors.accent,
    fontSize: 10,
    fontWeight: '700',
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
});
