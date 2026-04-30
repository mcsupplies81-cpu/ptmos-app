import { useEffect } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Colors from '@/constants/Colors';
import { useAuthStore } from '@/stores/authStore';
import { useInjectionSiteStore } from '@/stores/injectionSiteStore';

const siteMap = ['Left Deltoid', 'Right Deltoid', 'Left Glute', 'Right Glute', 'Left Quad', 'Right Quad', 'Abdomen'];

export default function InjectionSitesScreen() {
  const user = useAuthStore((state) => state.user);
  const { sites, fetchSites, markSiteUsed } = useInjectionSiteStore();

  useEffect(() => {
    if (user?.id) fetchSites(user.id);
  }, [fetchSites, user?.id]);

  return <SafeAreaView style={styles.container}>
    <Text style={styles.title}>Injection Sites</Text>
    <Text style={styles.subtitle}>Tap a site to mark it used today.</Text>
    <View style={styles.grid}>
      {siteMap.map((siteName) => {
        const site = sites.find((entry) => entry.site_name === siteName);
        return <Pressable key={siteName} style={styles.site} onPress={() => user?.id && markSiteUsed(siteName, user.id)}>
          <Text style={styles.siteTitle}>{siteName}</Text>
          <Text style={styles.siteMeta}>Last: {site?.last_used_at ? new Date(site.last_used_at).toLocaleDateString() : 'Never'}</Text>
        </Pressable>;
      })}
    </View>
  </SafeAreaView>;
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 16, backgroundColor: Colors.background }, title: { color: Colors.text, fontWeight: '700', fontSize: 24 }, subtitle: { color: Colors.textSecondary, marginTop: 6, marginBottom: 16 }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, site: { width: '48%', backgroundColor: Colors.card, borderColor: Colors.border, borderWidth: 1, borderRadius: 10, padding: 12 }, siteTitle: { color: Colors.text, fontWeight: '600' }, siteMeta: { color: Colors.textSecondary, marginTop: 4 } });
