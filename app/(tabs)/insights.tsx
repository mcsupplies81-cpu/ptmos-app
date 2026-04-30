import { useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Copy } from '@/constants/Copy';
import Colors from '@/constants/Colors';
import { useAuthStore } from '@/stores/authStore';
import { useInsightStore } from '@/stores/insightStore';

export default function InsightsScreen() {
  const user = useAuthStore((state) => state.user);
  const insights = useInsightStore((state) => state.insights);
  const loading = useInsightStore((state) => state.loading);
  const fetchInsights = useInsightStore((state) => state.fetchInsights);

  useEffect(() => {
    if (user?.id) {
      fetchInsights(user.id);
    }
  }, [fetchInsights, user?.id]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator color={Colors.tabActive} />
        ) : (
          <FlatList
            data={insights}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No insights yet. Keep logging to unlock your first insight.
              </Text>
            }
            contentContainerStyle={
              insights.length === 0 ? styles.emptyContainer : undefined
            }
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardBody}>{item.body}</Text>
                <Text style={styles.cardDate}>
                  {new Date(item.generated_at).toLocaleDateString()}
                </Text>
              </View>
            )}
          />
        )}
        <Text style={styles.disclaimer}>{Copy.disclaimerShort}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, padding: 16 },
  card: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  cardTitle: { color: Colors.text, fontWeight: '700', marginBottom: 4 },
  cardBody: { color: Colors.text, marginBottom: 8 },
  cardDate: { color: Colors.textSecondary, fontSize: 12 },
  emptyContainer: { flexGrow: 1, justifyContent: 'center' },
  emptyText: { color: Colors.textSecondary, textAlign: 'center' },
  disclaimer: { color: Colors.textSecondary, fontSize: 12, marginTop: 12 },
});
