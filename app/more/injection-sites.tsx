import { useEffect } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';
import { useInjectionSiteStore } from '@/stores/injectionSiteStore';
import { useAuthStore } from '@/stores/authStore';
import ScreenHeader from '@/components/ScreenHeader';

const SITE_NAMES = [
  'Abdomen L',
  'Abdomen R',
  'Thigh L',
  'Thigh R',
  'Glute L',
  'Glute R',
  'Arm L',
  'Arm R',
] as const;

const STATUS_BORDER_COLORS = {
  ready: '#80C9A8',
  rest: '#F5C97A',
  avoid: '#F0978B',
} as const;

export default function InjectionSitesScreen() {
  const { user } = useAuthStore();
  const { sites, fetchSites, markSiteUsed } = useInjectionSiteStore();

  useEffect(() => {
    if (user?.id) fetchSites(user.id);
  }, [fetchSites, user?.id]);

  const getSiteState = (lastUsedAt: string | null) => {
    if (!lastUsedAt) {
      return { color: Colors.success, label: 'Ready', borderColor: STATUS_BORDER_COLORS.ready };
    }

    const daysSinceUsed = (Date.now() - new Date(lastUsedAt).getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceUsed < 3) {
      return { color: Colors.error, label: 'Avoid', borderColor: STATUS_BORDER_COLORS.avoid };
    }

    if (daysSinceUsed <= 7) {
      return { color: Colors.warning, label: 'Rest', borderColor: STATUS_BORDER_COLORS.rest };
    }

    return { color: Colors.success, label: 'Ready', borderColor: STATUS_BORDER_COLORS.ready };
  };

  const gridSites = SITE_NAMES.map((siteName) => {
    const site = sites.find((entry) => entry.site_name === siteName);
    return { siteName, site };
  });

  const historyData = [...gridSites].sort((a, b) => {
    const aTime = a.site?.last_used_at ? +new Date(a.site.last_used_at) : 0;
    const bTime = b.site?.last_used_at ? +new Date(b.site.last_used_at) : 0;
    return bTime - aTime;
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Injection Sites" />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Rotation Tracker</Text>
        <Text style={styles.subtitle}>Tap a site to mark it used today.</Text>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
            <Text style={styles.legendText}>Ready</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.warning }]} />
            <Text style={styles.legendText}>Rest</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.error }]} />
            <Text style={styles.legendText}>Avoid</Text>
          </View>
        </View>

        <View style={styles.grid}>
          {gridSites.map(({ siteName, site }) => {
            const status = getSiteState(site?.last_used_at ?? null);

            return (
              <View key={siteName} style={[styles.card, { borderColor: status.borderColor }]}>
                <View style={styles.cardTopRow}>
                  <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                  <Text style={[styles.statusLabel, { color: status.color }]}>{status.label}</Text>
                </View>

                <Text style={styles.siteName}>{siteName}</Text>
                <Text style={styles.lastUsedText}>
                  {site?.last_used_at ? `Last: ${new Date(site.last_used_at).toLocaleDateString()}` : 'Never used'}
                </Text>

                {site ? (
                  <Text style={styles.useCountText}>
                    {site.total_uses} use{site.total_uses !== 1 ? 's' : ''}
                  </Text>
                ) : (
                  <View style={styles.useCountSpacer} />
                )}

                <Pressable
                  style={styles.markUsedButton}
                  onPress={() => user?.id && markSiteUsed(siteName, user.id).catch(() => {})}
                >
                  <Text style={styles.markUsedButtonText}>Mark Used</Text>
                </Pressable>
              </View>
            );
          })}
        </View>

        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>History</Text>

          {historyData.map(({ siteName, site }) => {
            const status = getSiteState(site?.last_used_at ?? null);
            return (
              <View key={`history-${siteName}`} style={styles.historyRow}>
                <Text style={styles.historySiteName}>{siteName}</Text>
                <View style={styles.historyRight}>
                  <Text style={styles.historyDate}>{site?.last_used_at ? new Date(site.last_used_at).toLocaleDateString() : 'Never'}</Text>
                  <View style={[styles.historyDot, { backgroundColor: status.color }]} />
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <Pressable style={styles.fab} onPress={() => router.push('/log/dose')}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 4, marginBottom: 16 },
  legendRow: { flexDirection: 'row', gap: 16, marginBottom: 16, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: Colors.textSecondary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    width: '48%',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 2,
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusLabel: { fontSize: 11, fontWeight: '700' },
  siteName: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  lastUsedText: { fontSize: 12, color: Colors.textSecondary, marginBottom: 12 },
  useCountText: { fontSize: 11, color: Colors.textSecondary, marginBottom: 10 },
  useCountSpacer: { height: 24, marginBottom: 10 },
  markUsedButton: {
    backgroundColor: Colors.accent,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  markUsedButtonText: { color: Colors.white, fontSize: 13, fontWeight: '600' },
  historySection: { marginTop: 24 },
  historyTitle: { fontSize: 17, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  historySiteName: { fontSize: 14, color: Colors.text },
  historyRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  historyDate: { fontSize: 13, color: Colors.textSecondary },
  historyDot: { width: 8, height: 8, borderRadius: 4 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  fabText: { fontSize: 28, color: Colors.white, lineHeight: 30 },
});
