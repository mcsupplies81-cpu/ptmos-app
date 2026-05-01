import { useEffect } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Copy } from '@/constants/Copy';
import Colors from '@/constants/Colors';
import { useAuthStore } from '@/stores/authStore';
import { useInsightStore } from '@/stores/insightStore'
import { useProfileStore } from '@/stores/profileStore'

export default function InsightsScreen() {
  const user = useAuthStore((state) => state.user);
  const { insights, loading: insightsLoading, fetchInsights } = useInsightStore();
  const profile = useProfileStore((state) => state.profile)

  useEffect(() => {
    if (user?.id) {
      fetchInsights(user.id);
    }
  }, [fetchInsights, user?.id]);

  const firstName = (profile?.full_name || 'there').split(' ')[0];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        <View style={{ padding: 20, paddingBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 28, fontWeight: '800', color: Colors.text }}>AI Insights</Text>
            <Text style={{ fontSize: 22 }}>✨</Text>
          </View>
          <Text style={{ color: Colors.textSecondary, fontSize: 14, marginTop: 4 }}>
            Personalized based on your data, {firstName}
          </Text>
        </View>

        {insightsLoading ? (
          <ActivityIndicator color={Colors.accent} style={{ marginTop: 40 }} />
        ) : insights.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Text style={{ fontSize: 40 }}>📊</Text>
            <Text style={{ fontSize: 17, fontWeight: '600', color: Colors.text, marginTop: 12 }}>
              No insights yet
            </Text>
            <Text style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 6, textAlign: 'center' }}>
              Keep logging doses and lifestyle data — insights appear after 3+ days.
            </Text>
          </View>
        ) : (
          insights.map((insight) => (
            <View key={insight.id} style={styles.card}>
              <Text style={styles.type}>{insight.type.toUpperCase()}</Text>
              <Text style={styles.cardTitle}>{insight.title}</Text>
              <Text style={styles.cardBody}>{insight.body}</Text>
              <Text style={styles.cardDate}>{new Date(insight.generated_at).toLocaleDateString()}</Text>
            </View>
          ))
        )}

        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Dose Adherence (7 days)</Text>
          <View style={styles.chartWrap} />
        </View>
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Weight Trend (30 days)</Text>
          <View style={styles.chartWrap} />
        </View>

        <Text style={styles.disclaimer}>{Copy.disclaimerShort}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
    marginBottom: 0,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  type: { fontSize: 12, fontWeight: '600', color: Colors.accent, letterSpacing: 1, marginBottom: 6 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  cardBody: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  cardDate: { fontSize: 11, color: Colors.textSecondary, marginTop: 10 },
  chartSection: { marginTop: 16, paddingHorizontal: 16 },
  chartTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  chartWrap: { padding: 16, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card, minHeight: 40 },
  disclaimer: { color: Colors.textSecondary, fontSize: 12, marginTop: 12, paddingHorizontal: 16 },
});
