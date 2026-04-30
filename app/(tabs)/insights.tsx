import { useEffect, useMemo } from 'react';
import { Dimensions, SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import Colors from '@/constants/Colors';
import { useAuthStore } from '@/stores/authStore';
import { useDoseLogStore } from '@/stores/doseLogStore';
import { useLifestyleStore } from '@/stores/lifestyleStore';

const CHART_WIDTH = Dimensions.get('window').width - 32;

export default function InsightsScreen() {
  const user = useAuthStore((state) => state.user);
  const { doseLogs, fetchDoseLogs } = useDoseLogStore();
  const { logs, fetchLogs } = useLifestyleStore();

  useEffect(() => {
    if (!user?.id) return;
    fetchDoseLogs(user.id);
    fetchLogs(user.id);
  }, [fetchDoseLogs, fetchLogs, user?.id]);

  const adherence = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().slice(0, 10);
      const hasDose = doseLogs.some((log) => log.logged_at.slice(0, 10) === key);
      return { label: `${d.getMonth() + 1}/${d.getDate()}`, value: hasDose ? 1 : 0 };
    });
  }, [doseLogs]);

  const last30 = useMemo(() => {
    return logs.slice().sort((a, b) => a.date.localeCompare(b.date)).slice(-30);
  }, [logs]);

  const chartConfig = {
    backgroundGradientFrom: Colors.card,
    backgroundGradientTo: Colors.card,
    color: (o = 1) => `rgba(45,106,79,${o})`,
    labelColor: () => Colors.textSecondary,
    decimalPlaces: 1,
  };

  // LineChart crashes if data array is empty — always ensure at least one point
  const weightData = last30.length > 0 ? last30.map((d) => d.weight_lbs ?? 0) : [0];
  const weightLabels = last30.length > 0 ? last30.map((d) => d.date.slice(5)) : ['—'];
  const sleepData = last30.length > 0 ? last30.map((d) => d.sleep_hours ?? 0) : [0];
  const sleepLabels = last30.length > 0 ? last30.map((d) => d.date.slice(5)) : ['—'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Insights</Text>

        <Text style={styles.section}>7-Day Adherence</Text>
        <BarChart
          data={{
            labels: adherence.map((d) => d.label),
            datasets: [{ data: adherence.map((d) => d.value) }],
          }}
          width={CHART_WIDTH}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          fromZero
          chartConfig={chartConfig}
          showValuesOnTopOfBars
        />

        <Text style={styles.section}>Weight Trend (30 Days)</Text>
        {last30.length === 0
          ? <Text style={styles.empty}>No lifestyle logs yet.</Text>
          : <LineChart
              data={{ labels: weightLabels, datasets: [{ data: weightData }] }}
              width={CHART_WIDTH}
              height={220}
              chartConfig={chartConfig}
              bezier
            />
        }

        <Text style={styles.section}>Sleep Trend (30 Days)</Text>
        {last30.length === 0
          ? <Text style={styles.empty}>No lifestyle logs yet.</Text>
          : <LineChart
              data={{ labels: sleepLabels, datasets: [{ data: sleepData }] }}
              width={CHART_WIDTH}
              height={220}
              chartConfig={chartConfig}
              bezier
            />
        }
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  content: { padding: 16, gap: 10, paddingBottom: 32 },
  title: { color: Colors.text, fontWeight: '700', fontSize: 24, marginBottom: 4 },
  section: { color: Colors.text, fontWeight: '600', fontSize: 16, marginTop: 16 },
  empty: { color: Colors.textSecondary, fontSize: 13, marginTop: 4 },
});
