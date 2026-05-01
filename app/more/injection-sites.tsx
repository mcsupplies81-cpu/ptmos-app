import { useState, useEffect } from 'react';
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, View, Dimensions } from 'react-native';
import { router } from 'expo-router';
import Svg, { Ellipse, Path, Circle, G } from 'react-native-svg';
import Colors from '@/constants/Colors';
import { useInjectionSiteStore } from '@/stores/injectionSiteStore';
import { useAuthStore } from '@/stores/authStore';
import ScreenHeader from '@/components/ScreenHeader';

const SCREEN_W = Dimensions.get('window').width;
const BODY_W = SCREEN_W - 32;
const BODY_H = BODY_W * 1.6;

const SITE_ZONES = [
  { id: 'Abdomen L', fx: 0.42, fy: 0.5 },
  { id: 'Abdomen R', fx: 0.58, fy: 0.5 },
  { id: 'Thigh L', fx: 0.38, fy: 0.68 },
  { id: 'Thigh R', fx: 0.62, fy: 0.68 },
  { id: 'Glute L', fx: 0.4, fy: 0.56 },
  { id: 'Glute R', fx: 0.6, fy: 0.56 },
  { id: 'Arm L', fx: 0.28, fy: 0.38 },
  { id: 'Arm R', fx: 0.72, fy: 0.38 },
] as const;

export default function InjectionSitesScreen() {
  const { user } = useAuthStore();
  const { sites, fetchSites, markSiteUsed } = useInjectionSiteStore();
  const [tab, setTab] = useState<'map' | 'history'>('map');

  useEffect(() => {
    if (user?.id) fetchSites(user.id);
  }, [user?.id, fetchSites]);

  const bySite = SITE_ZONES.map((z) => {
    const entry = sites.find((s) => s.site_name === z.id);
    return {
      id: z.id,
      last_used_at: entry?.last_used_at ?? null,
    };
  });

  const getDotColor = (lastUsedAt: string | null) => {
    if (!lastUsedAt) return Colors.success;
    const daysSinceUsed = (Date.now() - new Date(lastUsedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUsed < 3) return Colors.error;
    if (daysSinceUsed <= 7) return Colors.warning;
    return Colors.success;
  };

  const historyData = [...bySite].sort((a, b) => {
    if (!a.last_used_at && !b.last_used_at) return a.id.localeCompare(b.id);
    if (!a.last_used_at) return 1;
    if (!b.last_used_at) return -1;
    return +new Date(b.last_used_at) - +new Date(a.last_used_at);
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Injection Sites" />

      <View style={styles.tabs}>
        {[
          { key: 'map' as const, label: 'Body Map' },
          { key: 'history' as const, label: 'History' },
        ].map((item) => (
          <Pressable key={item.key} onPress={() => setTab(item.key)} style={[styles.tabPill, tab === item.key && styles.tabPillActive]}>
            <Text style={[styles.tabText, tab === item.key && styles.tabTextActive]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      {tab === 'map' ? (
        <>
          <View style={styles.bodyWrap}>
            <Svg width={BODY_W} height={BODY_H} viewBox="0 0 100 160" preserveAspectRatio="xMidYMid meet">
              <G>
                <Ellipse cx="50" cy="10" rx="8" ry="9" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="0.8" />
                <Path d="M46,18 L46,24 L54,24 L54,18Z" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="0.8" />
                <Path d="M32,24 L30,65 L70,65 L68,24Z" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="0.8" />
                <Path d="M32,24 L24,50 L28,52 L36,26Z" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="0.8" />
                <Path d="M68,24 L76,50 L72,52 L64,26Z" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="0.8" />
                <Path d="M36,65 L33,105 L43,105 L44,65Z" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="0.8" />
                <Path d="M56,65 L57,105 L67,105 L64,65Z" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="0.8" />
                <Circle cx="50" cy="115" r="0" fill="transparent" />
              </G>
            </Svg>

            {SITE_ZONES.map((zone) => {
              const site = bySite.find((s) => s.id === zone.id);
              const dotColor = getDotColor(site?.last_used_at ?? null);
              return (
                <Pressable
                  key={zone.id}
                  style={[styles.dotPressable, { left: zone.fx * BODY_W - 12, top: zone.fy * BODY_H - 12 }]}
                  onPress={() => user?.id && markSiteUsed(zone.id, user.id).catch(() => {})}
                >
                  <View style={[styles.dot, { backgroundColor: dotColor }]} />
                </Pressable>
              );
            })}
          </View>

          <View style={styles.legendRow}>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: Colors.success }]} /><Text style={styles.legendText}>Good to use</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: Colors.warning }]} /><Text style={styles.legendText}>Use with caution</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: Colors.error }]} /><Text style={styles.legendText}>Avoid for now</Text></View>
          </View>

          <Pressable style={styles.logButton} onPress={() => router.push('/log/dose')}>
            <Text style={styles.logButtonText}>Log Injection</Text>
          </Pressable>
        </>
      ) : (
        <FlatList
          data={historyData}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.historyList}
          renderItem={({ item }) => (
            <View style={styles.historyRow}>
              <View>
                <Text style={styles.historyName}>{item.id}</Text>
                <Text style={styles.historyMeta}>Last used: {item.last_used_at ? new Date(item.last_used_at).toLocaleDateString() : 'Never'}</Text>
              </View>
              <View style={[styles.historyIndicator, { backgroundColor: getDotColor(item.last_used_at) }]} />
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 16 },
  tabs: { flexDirection: 'row', backgroundColor: Colors.card, borderRadius: 999, borderWidth: 1, borderColor: Colors.border, padding: 4, gap: 8, marginBottom: 14 },
  tabPill: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 999 },
  tabPillActive: { backgroundColor: Colors.accent },
  tabText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: Colors.white },
  bodyWrap: { width: BODY_W, height: BODY_H, alignSelf: 'center', position: 'relative' },
  dotPressable: { position: 'absolute' },
  dot: { width: 24, height: 24, borderRadius: 12, opacity: 0.9, borderWidth: 2, borderColor: Colors.white, elevation: 2 },
  legendRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 12, marginBottom: 8, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, color: Colors.textSecondary },
  logButton: { backgroundColor: Colors.accent, borderRadius: 14, height: 50, alignItems: 'center', justifyContent: 'center', margin: 16 },
  logButtonText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  historyList: { paddingBottom: 12 },
  historyRow: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyName: { color: Colors.text, fontWeight: '700', fontSize: 15 },
  historyMeta: { color: Colors.textSecondary, marginTop: 4 },
  historyIndicator: { width: 12, height: 12, borderRadius: 6 },
});
