import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from 'react';
import { Alert, AppState, Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import ScreenHeader from '@/components/ScreenHeader';
import Colors from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import * as Notifications from 'expo-notifications';
import type { WeightUnit } from '@/lib/units';
import { requestPermission } from '@/lib/notifications';
import { useAuthStore } from '@/stores/authStore';
import { useLifestyleStore } from '@/stores/lifestyleStore';
import { Profile, useProfileStore } from '@/stores/profileStore';
import { useProtocolStore } from '@/stores/protocolStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';

const goals = ['Peptide Research', 'Sleep & Recovery', 'Energy & Focus', 'Body Composition', 'Health Optimization', 'Cognitive Enhancement', 'Recovery & Healing'];

function SectionLabel({ label }: { label: string }) {
  return <Text style={styles.sectionLabel}>{label}</Text>;
}

function SettingRow({
  icon,
  label,
  right,
  onPress,
  last,
}: {
  icon: string;
  label: string;
  right?: React.ReactNode;
  onPress?: () => void;
  last?: boolean;
}) {
  const Inner = (
    <View style={[styles.settingRow, last && styles.settingRowLast]}>
      <View style={styles.settingRowLeft}>
        <View style={styles.iconWrap}><Text style={styles.iconText}>{icon}</Text></View>
        <Text style={styles.settingRowLabel}>{label}</Text>
      </View>
      <View style={styles.settingRowRight}>{right ?? <Text style={styles.chevron}>›</Text>}</View>
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{Inner}</Pressable>;
  }
  return Inner;
}

export default function SettingsScreen() {
  const user = useAuthStore((state) => state.user);
  const profile = useProfileStore((state) => state.profile);
  const setProfile = useProfileStore((state) => state.setProfile);
  const fetchProfile = useProfileStore((state) => state.fetchProfile);
  const logs = useLifestyleStore((state) => state.logs);
  const fetchLogs = useLifestyleStore((state) => state.fetchLogs);
  const isPro = useSubscriptionStore((s) => s.isPro);

  const [notificationStatus, setNotificationStatus] = useState<string>('checking');
  const [saving, setSaving] = useState(false);
  const [savingWeightUnit, setSavingWeightUnit] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [weightLbs, setWeightLbs] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('');

  const refreshNotificationStatus = async () => {
    const permissions = await Notifications.getPermissionsAsync();
    setNotificationStatus(permissions.status);
  };

  const handleRequestNotifications = async () => {
    const granted = await requestPermission();
    if (!granted) {
      Alert.alert('Notifications disabled', 'Enable notifications in system settings to receive dose reminders.');
    }
    await refreshNotificationStatus();
  };

  const handleOpenNotificationSettings = async () => {
    await Linking.openSettings();
    await refreshNotificationStatus();
  };

  useEffect(() => {
    if (user?.id) fetchLogs(user.id);
  }, [fetchLogs, user?.id]);

  useEffect(() => {
    void refreshNotificationStatus();

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refreshNotificationStatus();
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!profile) return;
    const parts = (profile.full_name ?? '').split(' ').filter(Boolean);
    setFirstName(parts[0] ?? '');
    setLastName(parts.slice(1).join(' '));
    setDob(profile.date_of_birth ?? '');
    setHeightInches(profile.height_inches ? String(profile.height_inches) : '');
    setWeightLbs(profile.weight_lbs ? String(profile.weight_lbs) : '');
    setSelectedGoal(profile.goal ?? '');
  }, [profile]);

  useEffect(() => {
    if (weightLbs) return;
    const latest = logs[0];
    if (latest?.weight_lbs) setWeightLbs(String(latest.weight_lbs));
  }, [logs, weightLbs]);

  const initials = useMemo(() => `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase() || '?', [firstName, lastName]);
  const selectedWeightUnit = profile?.weight_unit ?? 'lbs';
  const activeProtocols = useMemo(() => protocols.filter((p) => p.status === 'active').length, [protocols]);
  const daysTracked = useMemo(() => logs.length, [logs]);
  const displayName = `${firstName} ${lastName}`.trim() || 'Your Name';

  const handleWeightUnitChange = async (value: WeightUnit) => {
    if (!user?.id || value === selectedWeightUnit || savingWeightUnit) return;

    try {
      setSavingWeightUnit(true);
      const { error } = await supabase
        .from('profiles')
        .update({ weight_unit: value })
        .eq('id', user.id);

      if (error) throw error;

      await fetchProfile(user.id);
    } catch (e: unknown) {
      Alert.alert('Save failed', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setSavingWeightUnit(false);
    }
  };

  const handleSelectGoal = (goal: string) => {
    void Haptics.selectionAsync();
    setSelectedGoal(goal);
  };

  const handleSave = async () => {
    if (!user?.id) return;
    try {
      setSaving(true);
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: `${firstName} ${lastName}`.trim() || null,
          date_of_birth: dob || null,
          height_inches: heightInches ? Number(heightInches) : null,
          weight_lbs: weightLbs ? Number(weightLbs) : null,
          goal: selectedGoal || null,
        });
      if (error) throw error;

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (fetchError) throw fetchError;

      setProfile(data as Profile);
      Alert.alert('Saved', 'Profile updated.');
    } catch (e: unknown) {
      Alert.alert('Save failed', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/welcome');
  };

  const notificationRight = notificationStatus === 'denied' ? (
    <Pressable style={styles.smallBtn} onPress={handleOpenNotificationSettings}>
      <Text style={styles.smallBtnText}>Open Settings</Text>
    </Pressable>
  ) : notificationStatus === 'undetermined' ? (
    <Pressable style={styles.smallBtn} onPress={handleRequestNotifications}>
      <Text style={styles.smallBtnText}>Allow</Text>
    </Pressable>
  ) : (
    <View style={styles.statusPill}>
      <Text style={styles.statusPillText}>{notificationStatus === 'granted' ? 'On' : notificationStatus}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader hideBack={true} title="Profile" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Hero card */}
        <View style={styles.heroCard}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.cameraBadge}><Text style={{ fontSize: 12 }}>📷</Text></View>
          </View>

          <Text style={styles.heroName}>{displayName}</Text>
          <Text style={styles.heroEmail}>{user?.email ?? ''}</Text>

          <View style={[styles.tierBadge, isPro ? styles.tierBadgePro : styles.tierBadgeFree]}>
            <Text style={[styles.tierBadgeText, isPro ? styles.tierBadgeTextPro : styles.tierBadgeTextFree]}>
              {isPro ? '✦  PT-OS Pro' : 'Free Plan'}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{activeProtocols}</Text>
              <Text style={styles.statLabel}>Active{'\n'}Protocols</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{daysTracked}</Text>
              <Text style={styles.statLabel}>Days{'\n'}Tracked</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{protocols.length}</Text>
              <Text style={styles.statLabel}>Total{'\n'}Protocols</Text>
            </View>
          </View>
        </View>

        {/* Subscription card */}
        {!isPro && (
          <>
            <SectionLabel label="SUBSCRIPTION" />
            <Pressable style={styles.upgradeCard} onPress={() => router.push('/paywall')}>
              <View style={styles.upgradeLeft}>
                <Text style={styles.upgradeTitle}>Upgrade to Pro</Text>
                <Text style={styles.upgradeSubtitle}>Unlock all protocols, AI insights & more</Text>
              </View>
              <View style={styles.upgradeArrow}>
                <Text style={styles.upgradeArrowText}>›</Text>
              </View>
            </Pressable>
          </>
        )}

        {/* Personal info */}
        <SectionLabel label="PERSONAL INFO" />
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>First Name</Text>
            <TextInput value={firstName} onChangeText={setFirstName} placeholder="First Name" placeholderTextColor={Colors.muted} style={styles.infoInput} />
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Name</Text>
            <TextInput value={lastName} onChangeText={setLastName} placeholder="Last Name" placeholderTextColor={Colors.muted} style={styles.infoInput} />
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date of Birth</Text>
            <TextInput value={dob} onChangeText={setDob} placeholder="YYYY-MM-DD" placeholderTextColor={Colors.muted} style={styles.infoInput} />
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Height</Text>
            <TextInput value={heightInches} onChangeText={setHeightInches} placeholder="inches" keyboardType="decimal-pad" placeholderTextColor={Colors.muted} style={styles.infoInput} />
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Weight</Text>
            <TextInput value={weightLbs} onChangeText={setWeightLbs} placeholder="lbs" keyboardType="decimal-pad" placeholderTextColor={Colors.muted} style={styles.infoInput} />
          </View>
          <View style={[styles.infoRow, styles.infoRowLast]}>
            <Text style={styles.infoLabel}>Display Unit</Text>
            <View style={styles.segmentedControl}>
              {(['lbs', 'kg'] as const).map((unit) => {
                const selected = selectedWeightUnit === unit;
                return (
                  <Pressable
                    key={unit}
                    onPress={() => handleWeightUnitChange(unit)}
                    disabled={savingWeightUnit}
                    style={[styles.segmentPill, selected && styles.segmentPillActive]}
                  >
                    <Text style={[styles.segmentText, selected && styles.segmentTextActive]}>{unit}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <Pressable style={styles.saveBtn} onPress={handleSave} disabled={saving}>
            <Text style={styles.saveText}>{saving ? 'Saving…' : 'Save Profile'}</Text>
          </Pressable>
        </View>

        {/* Goals */}
        <SectionLabel label="GOALS" />
        <View style={styles.card}>
          <View style={styles.goalsWrap}>
            {goals.map((goal) => {
              const selected = selectedGoal === goal;
              return (
                <Pressable key={goal} onPress={() => { void Haptics.selectionAsync(); setSelectedGoal(goal); }} style={[styles.goalPill, selected && styles.goalPillActive]}>
                  <Text style={[styles.goalText, selected && styles.goalTextActive]}>{goal}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Preferences */}
        <SectionLabel label="PREFERENCES" />
        <View style={styles.card}>
          <SettingRow
            icon="🔔"
            label="Notifications"
            right={notificationRight}
          />
          <SettingRow
            icon="🌙"
            label="Dark Mode"
            right={<Text style={styles.comingSoonText}>Coming soon</Text>}
          />
          <SettingRow
            icon="❤️"
            label="Apple Health"
            right={<Text style={styles.comingSoonText}>Coming soon</Text>}
            last
          />
        </View>

        {/* Support */}
        <SectionLabel label="SUPPORT" />
        <View style={styles.card}>
          <SettingRow
            icon="🔒"
            label="Privacy Policy"
            onPress={() => void Linking.openURL('https://ptmos.app/privacy')}
          />
          <SettingRow
            icon="📋"
            label="Terms of Service"
            onPress={() => void Linking.openURL('https://ptmos.app/terms')}
            last
          />
        </View>

        <Pressable style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>

        <Text style={styles.version}>PT-OS · v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 48, gap: 6 },

  // Section label
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 10,
    marginBottom: 2,
    paddingHorizontal: 4,
  },

  // Hero
  heroCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  avatarWrap: { position: 'relative', marginBottom: 4 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.accent,
  },
  avatarText: { color: Colors.accent, fontSize: 28, fontWeight: '800' },
  cameraBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: -2,
    bottom: -2,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  heroName: { color: Colors.text, fontSize: 20, fontWeight: '800', marginTop: 2 },
  heroEmail: { color: Colors.textSecondary, fontSize: 13 },
  tierBadge: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginTop: 4,
  },
  tierBadgePro: { backgroundColor: Colors.accentLight },
  tierBadgeFree: { backgroundColor: Colors.backgroundSecondary, borderWidth: 1, borderColor: Colors.border },
  tierBadgeText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.4 },
  tierBadgeTextPro: { color: Colors.accent },
  tierBadgeTextFree: { color: Colors.textSecondary },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 16,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 3 },
  statValue: { fontSize: 22, fontWeight: '800', color: Colors.text },
  statLabel: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center', lineHeight: 15 },
  statDivider: { width: 1, height: 36, backgroundColor: Colors.border },

  // Upgrade card
  upgradeCard: {
    backgroundColor: Colors.accent,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  upgradeLeft: { gap: 3 },
  upgradeTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  upgradeSubtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 12 },
  upgradeArrow: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  upgradeArrowText: { color: '#fff', fontSize: 20, lineHeight: 22 },

  // Card shell
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: 4,
  },

  // Info rows
  infoRow: {
    paddingHorizontal: 16,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoRowLast: { borderBottomWidth: 0 },
  infoLabel: { fontSize: 15, color: Colors.textSecondary, width: 110 },
  infoInput: { flex: 1, textAlign: 'right', fontSize: 15, color: Colors.text, padding: 0 },

  // Segmented control
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 3,
    gap: 4,
  },
  segmentPill: { minWidth: 48, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, alignItems: 'center' },
  segmentPillActive: { backgroundColor: Colors.accent },
  segmentText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  segmentTextActive: { color: Colors.white },

  saveBtn: {
    backgroundColor: Colors.accent,
    margin: 12,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // Goals
  goalsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 14 },
  goalPill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: Colors.border },
  goalPillActive: { backgroundColor: Colors.accentLight, borderColor: Colors.accent },
  goalText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  goalTextActive: { color: Colors.accent },

  // Setting rows
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingRowLast: { borderBottomWidth: 0 },
  settingRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { fontSize: 16 },
  settingRowLabel: { fontSize: 15, color: Colors.text, fontWeight: '500' },
  settingRowRight: { flexDirection: 'row', alignItems: 'center' },
  chevron: { color: Colors.muted, fontSize: 20, lineHeight: 22 },
  comingSoonText: { fontSize: 13, color: Colors.muted },
  smallBtn: {
    backgroundColor: Colors.accentLight,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  smallBtnText: { color: Colors.accent, fontSize: 13, fontWeight: '700' },
  statusPill: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusPillText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },

  // Bottom
  signOutBtn: {
    backgroundColor: '#FEE2E2',
    borderRadius: 14,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  signOutText: { color: '#DC2626', fontWeight: '700', fontSize: 15 },
  version: {
    textAlign: 'center',
    color: Colors.muted,
    fontSize: 12,
    marginTop: 8,
  },
});
