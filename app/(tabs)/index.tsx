import { useEffect, useMemo } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import Colors from '@/constants/Colors';
import { useAuthStore } from '@/stores/authStore';
import { useDoseLogStore } from '@/stores/doseLogStore';
import { useLifestyleStore } from '@/stores/lifestyleStore';
import { useProfileStore } from '@/stores/profileStore';
import { useProtocolStore } from '@/stores/protocolStore';

export default function DashboardScreen() {
  const user = useAuthStore((state) => state.user);
  const profile = useProfileStore((state) => state.profile);

  const doseLogs = useDoseLogStore((state) => state.doseLogs);
  const fetchDoseLogs = useDoseLogStore((state) => state.fetchDoseLogs);
  const protocols = useProtocolStore((state) => state.protocols);
  const fetchProtocols = useProtocolStore((state) => state.fetchProtocols);
  const lifestyleLogs = useLifestyleStore((state) => state.logs);
  const fetchLifestyleLogs = useLifestyleStore((state) => state.fetchLogs);
  const lifestyleLoading = useLifestyleStore((state) => state.loading);

  useEffect(() => {
    if (user?.id) {
      fetchProtocols(user.id);
      fetchDoseLogs(user.id);
      fetchLifestyleLogs(user.id);
    }
  }, [fetchDoseLogs, fetchLifestyleLogs, fetchProtocols, user?.id]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const recentDoses = [...doseLogs]
    .sort((a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime())
    .slice(0, 3);

  const activeProtocols = protocols.filter((protocol) => protocol.status === 'active');
  const nextProtocol = useMemo(() => {
    if (activeProtocols.length === 0) return null;

    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const withDelta = activeProtocols
      .map((protocol) => {
        const [hour, minute] = protocol.time_of_day.split(':').map(Number);
        const protocolMinutes = hour * 60 + minute;
        const delta = protocolMinutes >= nowMinutes
          ? protocolMinutes - nowMinutes
          : 1440 - nowMinutes + protocolMinutes;
        return { protocol, delta };
      })
      .sort((a, b) => a.delta - b.delta);

    return withDelta[0]?.protocol ?? null;
  }, [activeProtocols]);

  const nextDose = useMemo(() => {
    if (activeProtocols.length === 0) return null;

    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const withDelta = activeProtocols
      .map((protocol) => {
        const [hour, minute] = protocol.time_of_day.split(':').map(Number);
        const protocolMinutes = hour * 60 + minute;
        const delta = protocolMinutes >= nowMinutes
          ? protocolMinutes - nowMinutes
          : 1440 - nowMinutes + protocolMinutes;
        return { protocol, delta };
      })
      .sort((a, b) => a.delta - b.delta);

    return withDelta[0] ?? null;
  }, [activeProtocols]);

  const latestDose = useMemo(
    () => [...doseLogs].sort((a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime())[0] ?? null,
    [doseLogs],
  );
  const streakDays = useMemo(() => {
    const logged = new Set(doseLogs.map((l) => l.logged_at.slice(0, 10)));
    let streak = 0;
    const d = new Date();
    d.setDate(d.getDate() - 1);
    while (logged.has(d.toISOString().slice(0, 10))) {
      streak++;
      d.setDate(d.getDate() - 1);
    }
    return streak;
  }, [doseLogs]);

  const firstName = useMemo(() => profile?.full_name?.split(' ')[0] ?? 'there', [profile?.full_name]);

  const countdownText = useMemo(() => {
    if (!nextDose) return '—';
    const h = Math.floor(nextDose.delta / 60);
    const m = nextDose.delta % 60;
    return h > 0 ? `in ${h}h ${m}m` : `in ${m}m`;
  }, [nextDose]);

  const adherencePct = useMemo(() => {
    if (activeProtocols.length === 0) return 0;
    const last7 = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() - i);
      return d.toISOString().slice(0, 10);
    });
    const logged = new Set(doseLogs.map((l) => l.logged_at.slice(0, 10)));
    return Math.round((last7.filter((d) => logged.has(d)).length / 7) * 100);
  }, [activeProtocols, doseLogs]);

  const lastDoseText = useMemo(() => {
    if (!latestDose) return 'No doses logged';
    const days = Math.floor((Date.now() - new Date(latestDose.logged_at).getTime()) / 86400000);
    const when = days === 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days} days ago`;
    return `${when}  ·  ${latestDose.peptide_name ?? 'Dose'}  ${latestDose.amount} ${latestDose.unit}`;
  }, [latestDose]);

  const todayLifestyle = lifestyleLogs[0];
  const CIRC = 2 * Math.PI * 26;

  if (lifestyleLoading && lifestyleLogs.length === 0) {
    return (
      <SafeAreaView style={styles.loadingWrap}>
        <ActivityIndicator size="small" color={Colors.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
          <Text style={{ fontSize: 22, fontWeight: '700', color: Colors.text }}>{greeting}, {firstName} 👋</Text>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 18 }}>🔔</Text>
          </View>
        </View>

        {/* Next Dose Card */}
        <View style={{ margin: 16, marginTop: 8, backgroundColor: Colors.accent, borderRadius: 16, padding: 18 }}>
          <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10, fontWeight: '600', letterSpacing: 1.5, marginBottom: 10 }}>NEXT DOSE</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 46, height: 46, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 22 }}>💉</Text>
              </View>
              <View>
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>
                  {nextDose?.protocol.name ?? 'No active protocol'}
                </Text>
                {nextDose && (
                  <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 2 }}>
                    {nextDose.protocol.dose_amount} {nextDose.protocol.dose_unit}
                  </Text>
                )}
              </View>
            </View>
            {nextDose && (
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700' }}>{countdownText}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 }}>{nextDose.protocol.time_of_day}</Text>
              </View>
            )}
          </View>
        </View>

        <Pressable
          onPress={() => router.push('/(tabs)/chat')}
          style={{
            marginHorizontal: 16,
            marginBottom: 10,
            backgroundColor: Colors.card,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: Colors.border,
            padding: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.accentLight, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 18 }}>💬</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.text }}>Log with AI</Text>
            <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 1 }}>Just say what you did</Text>
          </View>
          <Text style={{ fontSize: 18, color: Colors.textSecondary }}>›</Text>
        </Pressable>

        <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 4 }}>
          <View style={{ flex: 1, backgroundColor: Colors.accentLight, borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ fontSize: 22 }}>🔥</Text>
            <View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.accent }}>{streakDays} day streak</Text>
              <Text style={{ fontSize: 11, color: Colors.accent, opacity: 0.8 }}>Keep it up!</Text>
            </View>
          </View>
          <View style={{ flex: 1, backgroundColor: Colors.card, borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: Colors.border }}>
            <Text style={{ fontSize: 22 }}>💊</Text>
            <View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.text }}>{activeProtocols.length} active</Text>
              <Text style={{ fontSize: 11, color: Colors.textSecondary }}>protocols</Text>
            </View>
          </View>
        </View>

        {/* Last Dose */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 }}>
          <Text style={{ color: Colors.textSecondary, fontSize: 11, fontWeight: '600', letterSpacing: 1 }}>LAST DOSE</Text>
          <Text style={{ color: Colors.text, fontSize: 13 }}>{lastDoseText}</Text>
        </View>

        <View style={{ height: 1, backgroundColor: Colors.border, marginHorizontal: 20 }} />

        {/* Protocol Adherence */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 }}>
          <View>
            <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.text }}>Protocol Adherence</Text>
            <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 3 }}>This Week</Text>
          </View>
          <View style={{ width: 64, height: 64 }}>
            <Svg width={64} height={64}>
              <Circle cx={32} cy={32} r={26} stroke={Colors.border} strokeWidth={5} fill="none" />
              <Circle
                cx={32} cy={32} r={26}
                stroke={Colors.accent} strokeWidth={5} fill="none"
                strokeDasharray={CIRC}
                strokeDashoffset={CIRC * (1 - adherencePct / 100)}
                strokeLinecap="round"
                transform="rotate(-90 32 32)"
              />
            </Svg>
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.accent }}>{adherencePct}%</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 1, backgroundColor: Colors.border, marginHorizontal: 20 }} />

        {/* Today Overview */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
          <Text style={{ fontSize: 10, fontWeight: '600', color: Colors.textSecondary, letterSpacing: 1.5, marginBottom: 12 }}>TODAY OVERVIEW</Text>
          {[
            { icon: '🦶', label: 'Steps', value: todayLifestyle?.steps ? `${todayLifestyle.steps.toLocaleString()} / 10,000` : '— / 10,000' },
            { icon: '😴', label: 'Sleep', value: todayLifestyle?.sleep_hours ? `${todayLifestyle.sleep_hours}h` : '—' },
            { icon: '⚖️', label: 'Weight', value: todayLifestyle?.weight_lbs ? `${todayLifestyle.weight_lbs} lbs` : '—' },
          ].map((row) => (
            <View key={row.label} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 16 }}>{row.icon}</Text>
                </View>
                <Text style={{ fontSize: 14, color: Colors.text }}>{row.label}</Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.text }}>{row.value}</Text>
            </View>
          ))}
        </View>
        <View style={{ height: 1, backgroundColor: Colors.border, marginHorizontal: 20 }} />
        <View style={{ padding: 16, paddingTop: 16 }}>
          <Text style={{ fontSize: 10, fontWeight: '600', color: Colors.textSecondary, letterSpacing: 1.5, marginBottom: 12 }}>QUICK ACTIONS</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {[
              { emoji: '💉', label: 'Log Dose', path: '/log/dose' },
              { emoji: '🧮', label: 'Calculator', path: '/log/calculator' },
              { emoji: '📦', label: 'Inventory', path: '/more/inventory' },
              { emoji: '🩺', label: 'Symptoms', path: '/log/symptoms' },
            ].map((action) => (
              <Pressable
                key={action.label}
                style={{ flex: 1, backgroundColor: Colors.card, borderRadius: 12, padding: 12, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: Colors.border }}
                onPress={() => router.push(action.path as any)}
              >
                <Text style={{ fontSize: 24 }}>{action.emoji}</Text>
                <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.text, textAlign: 'center' }}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={{ height: 1, backgroundColor: Colors.border, marginHorizontal: 20, marginTop: 8 }} />
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
          <Text style={{ fontSize: 10, fontWeight: '600', color: Colors.textSecondary, letterSpacing: 1.5, marginBottom: 12 }}>RECENT ACTIVITY</Text>
          {recentDoses.length === 0 ? (
            <Text style={{ color: Colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 8 }}>No activity yet — log your first dose!</Text>
          ) : (
            recentDoses.map((dose) => {
              const daysAgo = Math.floor((Date.now() - new Date(dose.logged_at).getTime()) / 86400000);
              const when = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`;
              return (
                <View
                  key={dose.id}
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 12 }}
                >
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.accentLight, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16 }}>💉</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.text }}>{dose.peptide_name ?? 'Dose'}</Text>
                    <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 1 }}>{dose.amount} {dose.unit}</Text>
                  </View>
                  <Text style={{ fontSize: 12, color: Colors.textSecondary }}>{when}</Text>
                </View>
              );
            })
          )}
        </View>

      </ScrollView>

      {/* FAB */}
      <Pressable
        style={{ position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.accent, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 }}
        onPress={() => router.push('/log/dose')}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 30, lineHeight: 34 }}>+</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
