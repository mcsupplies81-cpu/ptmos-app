import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import ScreenHeader from '@/components/ScreenHeader';
import Colors from '@/constants/Colors';
import supabase from '@/lib/supabase';
import { cancelAllReminders, scheduleProtocolReminders } from '@/lib/notifications';
import { useAuthStore } from '@/stores/authStore';
import { useLifestyleStore } from '@/stores/lifestyleStore';
import { useProfileStore } from '@/stores/profileStore';
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
  const [sex, setSex] = useState<'M' | 'F' | 'Other'>('Other');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [experience, setExperience] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  useEffect(() => {
    if (user?.id) fetchLogs(user.id);
  }, [fetchLogs, user?.id]);

  useEffect(() => {
    if (!profile) return;
    const parts = (profile.full_name ?? '').split(' ').filter(Boolean);
    setFirstName(parts[0] ?? '');
    setLastName(parts.slice(1).join(' '));
    const profileAny = profile as any;
    setDob(profileAny.date_of_birth ?? '');
    setSex((profileAny.sex as 'M' | 'F' | 'Other') ?? 'Other');
    setHeight(profileAny.height ?? '');
    setBodyFat(profileAny.body_fat_pct ? String(profileAny.body_fat_pct) : '');
    setExperience((profileAny.experience_level as 'Beginner' | 'Intermediate' | 'Advanced') ?? 'Beginner');
    setSelectedGoals(Array.isArray(profileAny.goals) ? profileAny.goals : []);
  }, [profile]);

  useEffect(() => {
    if (weight) return;
    const latest = logs[0];
    if (latest?.weight_lbs) setWeight(String(latest.weight_lbs));
  }, [logs, weight]);

  const initials = useMemo(() => `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase() || '?', [firstName, lastName]);

  const handleSave = async () => {
    if (!user?.id) return;
    try {
      setSaving(true);
      const payload: any = {
        id: user.id,
        full_name: `${firstName} ${lastName}`.trim() || null,
        date_of_birth: dob || null,
        sex,
        height: height || null,
        weight: weight ? Number(weight) : null,
        body_fat_pct: bodyFat ? Number(bodyFat) : null,
        experience_level: experience,
        goals: selectedGoals,
      };
      const { data, error } = await supabase.from('profiles').upsert(payload).select('*').single();
      if (error) throw error;
      setProfile((data as any) ?? null);
      Alert.alert('Saved', 'Profile updated successfully.');
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
          <View style={styles.pillsRow}>{(['M', 'F', 'Other'] as const).map((option) => <Pressable key={option} onPress={() => setSex(option)} style={[styles.pill, sex === option && styles.pillActive]}><Text style={[styles.pillText, sex === option && styles.pillTextActive]}>{option}</Text></Pressable>)}</View>
          <Pressable style={styles.saveBtn} onPress={handleSave} disabled={saving}><Text style={styles.saveText}>{saving ? 'Saving...' : 'Save Profile'}</Text></Pressable>
        </View>

        <View style={styles.sectionCard}>
          <TextInput value={height} onChangeText={setHeight} placeholder="Height (ft/in or cm)" placeholderTextColor={Colors.textSecondary} style={styles.input} />
          <TextInput value={weight} onChangeText={setWeight} placeholder="Weight" keyboardType="decimal-pad" placeholderTextColor={Colors.textSecondary} style={styles.input} />
          <TextInput value={bodyFat} onChangeText={setBodyFat} placeholder="Body fat % (optional)" keyboardType="decimal-pad" placeholderTextColor={Colors.textSecondary} style={styles.input} />
          <View style={styles.pillsRow}>{(['Beginner', 'Intermediate', 'Advanced'] as const).map((option) => <Pressable key={option} onPress={() => setExperience(option)} style={[styles.pill, experience === option && styles.pillActive]}><Text style={[styles.pillText, experience === option && styles.pillTextActive]}>{option}</Text></Pressable>)}</View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.goalsWrap}>{goals.map((goal) => {
            const selected = selectedGoals.includes(goal);
            return <Pressable key={goal} onPress={() => setSelectedGoals((prev) => selected ? prev.filter((g) => g !== goal) : [...prev, goal])} style={[styles.goalPill, selected && styles.goalPillActive]}><Text style={[styles.goalText, selected && styles.goalTextActive]}>{goal}</Text></Pressable>;
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
