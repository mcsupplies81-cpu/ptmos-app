import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import ScreenHeader from '@/components/ScreenHeader';
import Colors from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { cancelAllReminders, scheduleProtocolReminders } from '@/lib/notifications';
import { useAuthStore } from '@/stores/authStore';
import { useLifestyleStore } from '@/stores/lifestyleStore';
import { Profile, useProfileStore } from '@/stores/profileStore';
import { useProtocolStore } from '@/stores/protocolStore';

const goals = ['Peptide Research', 'Sleep & Recovery', 'Energy & Focus', 'Body Composition', 'Health Optimization', 'Cognitive Enhancement', 'Recovery & Healing'];

export default function SettingsScreen() {
  const user = useAuthStore((state) => state.user);
  const profile = useProfileStore((state) => state.profile);
  const setProfile = useProfileStore((state) => state.setProfile);
  const protocols = useProtocolStore((state) => state.protocols);
  const logs = useLifestyleStore((state) => state.logs);
  const fetchLogs = useLifestyleStore((state) => state.fetchLogs);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [weightLbs, setWeightLbs] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('');

  useEffect(() => {
    if (user?.id) fetchLogs(user.id);
  }, [fetchLogs, user?.id]);

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

  const handleSave = async () => {
    if (!user?.id) return;
    try {
      setSaving(true);
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: `${firstName} ${lastName}`.trim() || null,
          date_of_birth: dob || null,
          height_inches: heightInches ? Number(heightInches) : null,
          weight_lbs: weightLbs ? Number(weightLbs) : null,
          goal: selectedGoal || null,
        })
        .select('*')
        .single();
      if (error) throw error;
      setProfile(data as Profile);
      Alert.alert('Saved', 'Profile updated.');
    } catch (e: any) {
      Alert.alert('Save failed', e?.message ?? 'Please try again.');
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
          <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
          <View style={styles.row2}>
            <TextInput value={firstName} onChangeText={setFirstName} placeholder="First Name" placeholderTextColor={Colors.textSecondary} style={styles.inputHalf} />
            <TextInput value={lastName} onChangeText={setLastName} placeholder="Last Name" placeholderTextColor={Colors.textSecondary} style={styles.inputHalf} />
          </View>
          <TextInput value={dob} onChangeText={setDob} placeholder="Date of Birth (YYYY-MM-DD)" placeholderTextColor={Colors.textSecondary} style={styles.input} />
          <Pressable style={styles.saveBtn} onPress={handleSave} disabled={saving}><Text style={styles.saveText}>{saving ? 'Saving...' : 'Save Profile'}</Text></Pressable>
        </View>

        <View style={styles.sectionCard}>
          <TextInput value={heightInches} onChangeText={setHeightInches} placeholder="Height (inches)" keyboardType="number-pad" placeholderTextColor={Colors.textSecondary} style={styles.input} />
          <TextInput value={weightLbs} onChangeText={setWeightLbs} placeholder="Weight (lbs)" keyboardType="decimal-pad" placeholderTextColor={Colors.textSecondary} style={styles.input} />
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.goalsWrap}>{goals.map((goal) => {
            const selected = selectedGoal === goal;
            return <Pressable key={goal} onPress={() => setSelectedGoal(goal)} style={[styles.goalPill, selected && styles.goalPillActive]}><Text style={[styles.goalText, selected && styles.goalTextActive]}>{goal}</Text></Pressable>;
          })}</View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.switchRow}><Text style={styles.rowLabel}>Notifications</Text><Switch value={notificationsEnabled} onValueChange={(v) => { setNotificationsEnabled(v); v ? scheduleProtocolReminders(protocols) : cancelAllReminders(); }} trackColor={{ true: Colors.accent }} /></View>
          <View style={styles.switchRow}><Text style={styles.rowLabel}>Light/Dark Mode</Text><Text style={styles.comingSoon}>Coming soon</Text></View>
          <View style={styles.switchRow}><Text style={styles.rowLabel}>Apple Health</Text><Text style={styles.comingSoon}>Coming soon</Text></View>
        </View>

        <Pressable style={styles.signOutBtn} onPress={handleSignOut}><Text style={styles.signOutText}>Sign Out</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 36, gap: 12 },
  sectionCard: { backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 14, gap: 10 },
  avatar: { width: 70, height: 70, borderRadius: 35, alignSelf: 'center', backgroundColor: Colors.accentLight, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: Colors.accent, fontSize: 24, fontWeight: '800' },
  row2: { flexDirection: 'row', gap: 8 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 11, color: Colors.text, backgroundColor: Colors.background },
  inputHalf: { flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 11, color: Colors.text, backgroundColor: Colors.background },
  pillsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  pill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background },
  pillActive: { backgroundColor: Colors.accentLight, borderColor: Colors.accent },
  pillText: { color: Colors.textSecondary, fontWeight: '600' },
  pillTextActive: { color: Colors.accent },
  saveBtn: { backgroundColor: Colors.accent, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  goalsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  goalPill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: Colors.border },
  goalPillActive: { backgroundColor: Colors.accentLight, borderColor: Colors.accent },
  goalText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  goalTextActive: { color: Colors.accent },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  rowLabel: { fontSize: 15, color: Colors.text, fontWeight: '500' },
  comingSoon: { color: Colors.textSecondary },
  signOutBtn: { backgroundColor: '#FEE2E2', borderRadius: 12, padding: 14, alignItems: 'center' },
  signOutText: { color: '#DC2626', fontWeight: '700' },
});
