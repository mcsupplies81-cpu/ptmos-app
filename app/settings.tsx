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

const goals = ['Peptide Research', 'Sleep & Recovery', 'Energy & Focus', 'Body Composition', 'Health Optimization', 'Cognitive Enhancement', 'Recovery & Healing'];

export default function SettingsScreen() {
  const user = useAuthStore((state) => state.user);
  const profile = useProfileStore((state) => state.profile);
  const setProfile = useProfileStore((state) => state.setProfile);
  const fetchProfile = useProfileStore((state) => state.fetchProfile);
  const logs = useLifestyleStore((state) => state.logs);
  const fetchLogs = useLifestyleStore((state) => state.fetchLogs);

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader hideBack={true} title="Profile" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.sectionCard}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
            <View style={styles.cameraBadge}><Text>📷</Text></View>
          </View>
          <Text style={styles.profileName}>{`${firstName} ${lastName}`.trim() || 'Your Name'}</Text>
          <Text style={styles.profileEmail}>{user?.email ?? ''}</Text>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>First Name</Text>
            <TextInput value={firstName} onChangeText={setFirstName} placeholder="First Name" placeholderTextColor={Colors.textSecondary} style={styles.infoInput} />
            <Text style={styles.chevron}>›</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Name</Text>
            <TextInput value={lastName} onChangeText={setLastName} placeholder="Last Name" placeholderTextColor={Colors.textSecondary} style={styles.infoInput} />
            <Text style={styles.chevron}>›</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date of Birth</Text>
            <TextInput value={dob} onChangeText={setDob} placeholder="YYYY-MM-DD" placeholderTextColor={Colors.textSecondary} style={styles.infoInput} />
            <Text style={styles.chevron}>›</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Height</Text>
            <TextInput value={heightInches} onChangeText={setHeightInches} placeholder="inches" keyboardType="decimal-pad" placeholderTextColor={Colors.textSecondary} style={styles.infoInput} />
            <Text style={styles.chevron}>›</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Weight</Text>
            <TextInput value={weightLbs} onChangeText={setWeightLbs} placeholder="lbs" keyboardType="decimal-pad" placeholderTextColor={Colors.textSecondary} style={styles.infoInput} />
            <Text style={styles.chevron}>›</Text>
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
          <Pressable style={styles.saveBtn} onPress={handleSave} disabled={saving}><Text style={styles.saveText}>{saving ? 'Saving...' : 'Save Profile'}</Text></Pressable>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.goalsWrap}>{goals.map((goal) => {
            const selected = selectedGoal === goal;
            return <Pressable key={goal} onPress={() => handleSelectGoal(goal)} style={[styles.goalPill, selected && styles.goalPillActive]}><Text style={[styles.goalText, selected && styles.goalTextActive]}>{goal}</Text></Pressable>;
          })}</View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.settingsRow}>
            <View style={styles.settingsRowText}>
              <Text style={styles.rowLabel}>Notifications</Text>
              <Text style={styles.statusText}>{notificationStatus === 'checking' ? 'Checking permission...' : `Permission: ${notificationStatus}`}</Text>
            </View>
            {notificationStatus === 'denied' ? (
              <Pressable style={styles.settingsButton} onPress={handleOpenNotificationSettings}>
                <Text style={styles.settingsButtonText}>Open Settings</Text>
              </Pressable>
            ) : notificationStatus === 'undetermined' ? (
              <Pressable style={styles.settingsButton} onPress={handleRequestNotifications}>
                <Text style={styles.settingsButtonText}>Allow</Text>
              </Pressable>
            ) : null}
          </View>
          <View style={styles.switchRow}><Text style={styles.rowLabel}>Light/Dark Mode</Text><Text style={styles.comingSoon}>Coming soon</Text></View>
          <View style={styles.switchRow}><Text style={styles.rowLabel}>Apple Health</Text><Text style={styles.comingSoon}>Coming soon</Text></View>
        </View>

        <Pressable
          style={[styles.infoRow, { marginTop: 8 }]}
          onPress={() => void Linking.openURL('https://ptmos.app/privacy')}
        >
          <Text style={[styles.infoLabel, { width: 'auto', flex: 1 }]}>Privacy Policy</Text>
          <Text style={{ color: Colors.textSecondary, fontSize: 18 }}>›</Text>
        </Pressable>

        <Pressable style={styles.signOutBtn} onPress={handleSignOut}><Text style={styles.signOutText}>Sign Out</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 36, gap: 12 },
  sectionCard: { backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 14, gap: 10 },
  avatarWrap: { alignSelf: 'center', position: 'relative' },
  avatar: { width: 80, height: 80, borderRadius: 40, alignSelf: 'center', backgroundColor: Colors.accentLight, alignItems: 'center', justifyContent: 'center' },
  cameraBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', position: 'absolute', right: -2, bottom: -2 },
  avatarText: { color: Colors.accent, fontSize: 24, fontWeight: '800' },
  profileName: { color: Colors.text, fontSize: 18, fontWeight: '700', textAlign: 'center' },
  profileEmail: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center' },
  infoRow: { paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: Colors.border },
  infoRowLast: { borderBottomWidth: 0 },
  infoLabel: { fontSize: 15, color: Colors.textSecondary, width: 110 },
  infoInput: { flex: 1, textAlign: 'right', fontSize: 15, color: Colors.text, padding: 0 },
  chevron: { color: Colors.textSecondary, marginLeft: 8, fontSize: 18, lineHeight: 18 },
  segmentedControl: { flexDirection: 'row', backgroundColor: Colors.background, borderRadius: 999, borderWidth: 1, borderColor: Colors.border, padding: 3, gap: 4 },
  segmentPill: { minWidth: 52, paddingVertical: 7, paddingHorizontal: 12, borderRadius: 999, alignItems: 'center' },
  segmentPillActive: { backgroundColor: Colors.accent },
  segmentText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '800', textTransform: 'uppercase' },
  segmentTextActive: { color: Colors.white },
  pillsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  pill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background },
  pillActive: { backgroundColor: Colors.accentLight, borderColor: Colors.accent },
  pillText: { color: Colors.textSecondary, fontWeight: '600' },
  pillTextActive: { color: Colors.accent },
  saveBtn: { backgroundColor: Colors.accent, borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  goalsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  goalPill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: Colors.border },
  goalPillActive: { backgroundColor: Colors.accentLight, borderColor: Colors.accent },
  goalText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  goalTextActive: { color: Colors.accent },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  settingsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingVertical: 4 },
  settingsRowText: { flex: 1, gap: 2 },
  rowLabel: { fontSize: 15, color: Colors.text, fontWeight: '500' },
  statusText: { color: Colors.textSecondary, fontSize: 13, textTransform: 'capitalize' },
  settingsButton: { backgroundColor: Colors.accentLight, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  settingsButtonText: { color: Colors.accent, fontSize: 13, fontWeight: '700' },
  comingSoon: { color: Colors.textSecondary },
  signOutBtn: { backgroundColor: '#FEE2E2', borderRadius: 12, padding: 14, alignItems: 'center' },
  signOutText: { color: '#DC2626', fontWeight: '700' },
});
