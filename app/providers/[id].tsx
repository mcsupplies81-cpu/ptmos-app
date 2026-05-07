import { useMemo } from 'react';
import { Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import Colors from '@/constants/Colors';
import { providers } from '@/constants/providers';
import type { DirectoryProvider, ProviderType } from '@/constants/providers';

const typeColors: Record<ProviderType, { backgroundColor: string; color: string }> = {
  Clinic: { backgroundColor: '#DBEAFE', color: '#1D4ED8' },
  'Med Spa': { backgroundColor: '#FCE7F3', color: '#BE185D' },
  Online: { backgroundColor: Colors.accentLight, color: Colors.accent },
  Pharmacy: { backgroundColor: '#FEF3C7', color: '#B45309' },
};

const formatLocation = (provider: DirectoryProvider) => provider.location ?? 'Ships Nationwide';

export default function ProviderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const provider = useMemo(() => providers.find((entry) => entry.id === id), [id]);

  if (!provider) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFoundWrap}>
          <Text style={styles.notFoundTitle}>Provider not found</Text>
          <Pressable style={styles.secondaryButton} onPress={() => router.back()}>
            <Text style={styles.secondaryButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const badge = typeColors[provider.type];

  const handleContactProvider = async () => {
    await Linking.openURL(provider.website);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>

        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{provider.name.charAt(0)}</Text>
            </View>
            {provider.verified ? (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ Verified</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.title}>{provider.name}</Text>
          <View style={styles.metaRow}>
            <View style={[styles.typeBadge, { backgroundColor: badge.backgroundColor }]}>
              <Text style={[styles.typeBadgeText, { color: badge.color }]}>{provider.type.toUpperCase()}</Text>
            </View>
            <Text style={styles.rating}>⭐ {provider.rating.toFixed(1)} ({provider.reviewCount} reviews)</Text>
          </View>

          <Text style={styles.location}>{formatLocation(provider)}</Text>
          <Text style={styles.website}>{provider.website.replace(/^https?:\/\//, '')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{provider.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services</Text>
          <View style={styles.servicesList}>
            {provider.services.map((service) => (
              <View key={service} style={styles.serviceChip}>
                <Text style={styles.serviceText}>{service}</Text>
              </View>
            ))}
          </View>
        </View>

        <Pressable style={styles.contactButton} onPress={handleContactProvider}>
          <Text style={styles.contactButtonText}>Contact Provider</Text>
        </Pressable>

        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerTitle}>Disclaimer</Text>
          <Text style={styles.disclaimerText}>
            PT-OS does not endorse or verify providers. Directory listings are informational only and all sample providers in this beta are fictional placeholders. Always consult a licensed healthcare professional before starting or changing any protocol.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 44 },
  backButton: { alignSelf: 'flex-start', paddingVertical: 8, marginBottom: 8 },
  backButtonText: { color: Colors.accent, fontSize: 15, fontWeight: '800' },
  heroCard: { backgroundColor: Colors.card, borderColor: Colors.border, borderWidth: 1, borderRadius: 22, padding: 18, marginBottom: 16 },
  heroTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 },
  avatar: { width: 64, height: 64, borderRadius: 18, backgroundColor: Colors.accentLight, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: Colors.accent, fontSize: 28, fontWeight: '800' },
  verifiedBadge: { backgroundColor: Colors.white, borderColor: Colors.accentLight, borderWidth: 1, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 },
  verifiedText: { color: Colors.success, fontSize: 12, fontWeight: '800' },
  title: { color: Colors.text, fontSize: 26, fontWeight: '800', marginBottom: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10 },
  typeBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  typeBadgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  rating: { color: Colors.text, fontSize: 14, fontWeight: '700' },
  location: { color: Colors.text, fontSize: 15, fontWeight: '700', marginTop: 16 },
  website: { color: Colors.textSecondary, fontSize: 14, marginTop: 4 },
  section: { backgroundColor: Colors.white, borderColor: Colors.border, borderWidth: 1, borderRadius: 18, padding: 16, marginBottom: 14 },
  sectionTitle: { color: Colors.text, fontSize: 17, fontWeight: '800', marginBottom: 10 },
  description: { color: Colors.textSecondary, fontSize: 15, lineHeight: 23 },
  servicesList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  serviceChip: { backgroundColor: Colors.accentLight, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 7 },
  serviceText: { color: Colors.accent, fontSize: 13, fontWeight: '800' },
  contactButton: { backgroundColor: Colors.accent, borderRadius: 16, height: 54, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  contactButtonText: { color: Colors.white, fontSize: 16, fontWeight: '800' },
  disclaimerCard: { backgroundColor: Colors.backgroundSecondary, borderColor: Colors.border, borderWidth: 1, borderRadius: 16, padding: 14 },
  disclaimerTitle: { color: Colors.text, fontSize: 14, fontWeight: '800', marginBottom: 6 },
  disclaimerText: { color: Colors.textSecondary, fontSize: 12, lineHeight: 18 },
  notFoundWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  notFoundTitle: { color: Colors.text, fontSize: 20, fontWeight: '800', marginBottom: 16 },
  secondaryButton: { borderColor: Colors.accent, borderWidth: 1, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 11 },
  secondaryButtonText: { color: Colors.accent, fontWeight: '800' },
});
