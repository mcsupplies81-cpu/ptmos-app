import { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Colors from '@/constants/Colors';
import Theme from '@/constants/Theme';
import { useAuthStore } from '@/stores/authStore';
import { useProfileStore } from '@/stores/profileStore';

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { session } = useAuthStore();
  const { profile, fetchProfile } = useProfileStore();

  const firstName = useMemo(() => profile?.full_name?.split(' ')[0] ?? 'there', [profile?.full_name]);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const onRefresh = useCallback(async () => {
    if (!session?.user?.id) return;
    setRefreshing(true);
    await fetchProfile(session.user.id);
    setRefreshing(false);
  }, [session?.user?.id, fetchProfile]);

  return (
    <ScrollView contentContainerStyle={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <Text style={styles.greeting}>{greeting}, {firstName}</Text>
      <View style={styles.row}><Badge title="Active Protocols" value="0"/><Badge title="Inventory" value="0"/></View>
      <Card title="Next Dose" subtitle="No protocols yet — add your first protocol" cta="Add Protocol" />
      <Card title="Last Dose" subtitle="No doses logged yet" />
      <Card title="Protocol Adherence" subtitle="—%" />
      <Card title="Today Overview" custom={<View style={styles.row}><Mini label="Steps"/><Mini label="Sleep"/><Mini label="Weight"/></View>} />
    </ScrollView>
  );
}

function Card({ title, subtitle, cta, custom }: { title: string; subtitle?: string; cta?: string; custom?: React.ReactNode }) {
  return <View style={styles.card}><Text style={styles.cardTitle}>{title}</Text>{subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}{custom}{cta ? <Pressable><Text style={styles.cta}>{cta}</Text></Pressable> : null}</View>;
}
function Badge({ title, value }: { title: string; value: string }) { return <View style={[styles.card, styles.badge]}><Text style={styles.sub}>{title}</Text><Text style={styles.badgeValue}>{value}</Text></View>; }
function Mini({ label }: { label: string }) { return <Pressable style={styles.mini}><Text style={styles.sub}>{label}</Text><Text style={styles.cta}>Tap to log</Text></Pressable>; }

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: Colors.background, gap: 12 },
  greeting: { fontSize: 28, fontWeight: '700', marginBottom: 8, color: Colors.text },
  row: { flexDirection: 'row', gap: 12 },
  card: { backgroundColor: Colors.card, borderRadius: 12, padding: 14, ...Theme.shadow.card },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  sub: { color: Colors.mutedText },
  cta: { marginTop: 10, color: Colors.accent, fontWeight: '700' },
  badge: { flex: 1 },
  badgeValue: { fontSize: 22, fontWeight: '800', color: Colors.accent, marginTop: 6 },
  mini: { flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 10 },
});
