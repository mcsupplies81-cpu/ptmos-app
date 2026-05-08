import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import * as Haptics from 'expo-haptics';

import Skeleton from '@/components/Skeleton';
import Colors from '@/constants/Colors';
import { useAuthStore } from '@/stores/authStore';
import { LifestyleLog, useLifestyleStore } from '@/stores/lifestyleStore';

type MetricKey = 'sleep' | 'water' | 'workout' | 'mood' | 'energy' | 'weight';

type EditableLifestyleLog = Omit<LifestyleLog, 'id' | 'user_id'>;

const WATER_TARGET_OZ = 128;
const SLEEP_TARGET_HOURS = 8;
const MOOD_LABELS: Record<number, string> = { 1: 'Low', 2: 'Okay', 3: 'Steady', 4: 'Good', 5: 'Great' };
const ENERGY_LABELS: Record<number, string> = { 1: 'Drained', 2: 'Low', 3: 'Steady', 4: 'Energized', 5: 'Peak' };
const QUICK_ADD: Array<{ key: MetricKey; label: string; emoji: string }> = [
  { key: 'sleep', label: 'Sleep', emoji: '🌙' },
  { key: 'water', label: 'Water', emoji: '💧' },
  { key: 'workout', label: 'Workout', emoji: '🏃' },
  { key: 'mood', label: 'Mood', emoji: '😊' },
  { key: 'energy', label: 'Energy', emoji: '⚡' },
  { key: 'weight', label: 'Weight', emoji: '⚖️' },
];

const dateKey = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const parseDateKey = (key: string) => {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
const clampScore = (value: number) => Math.min(100, Math.max(0, value));
const ratingScore = (rating: number | null | undefined) => (rating ? rating * 20 : 50);
const getEnergyRating = (log?: LifestyleLog | null) => log?.energy_level ?? log?.energy ?? null;
const workoutLogged = (log?: LifestyleLog | null) => Boolean(log?.workout_type);
const sleepScore = (hours: number | null | undefined) => clampScore(((hours ?? 0) / SLEEP_TARGET_HOURS) * 100);
const waterScore = (ounces: number | null | undefined) => clampScore(((ounces ?? 0) / WATER_TARGET_OZ) * 100);
const workoutScore = (log?: LifestyleLog | null) => (workoutLogged(log) ? 100 : 0);

const lifestyleScore = (log?: LifestyleLog | null) => {
  const score =
    sleepScore(log?.sleep_hours) * 0.3 +
    waterScore(log?.water_oz) * 0.25 +
    ratingScore(log?.mood) * 0.2 +
    ratingScore(getEnergyRating(log)) * 0.15 +
    workoutScore(log) * 0.1;

  return Math.round(score);
};

const scoreLabel = (score: number) => {
  if (score < 60) return 'Needs Work';
  if (score < 75) return 'Fair';
  if (score < 85) return 'Good';
  return 'Excellent';
};

const formatSelectedDate = (date: Date, isToday: boolean) => {
  const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' })}, ${monthDay}`;
};

const formatSleep = (hours?: number | null) => {
  if (!hours) return 'Not logged';
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  return `${wholeHours}h ${minutes}m`;
};

const toInput = (value: number | string | null | undefined) => value?.toString() ?? '';
const toNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && value.trim() ? parsed : null;
};

function ProgressBar({ progress, color = Colors.accent }: { progress: number; color?: string }) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${clampScore(progress * 100)}%`, backgroundColor: color }]} />
    </View>
  );
}

export default function LifestyleScreen() {
  const user = useAuthStore((state) => state.user);
  const logs = useLifestyleStore((state) => state.logs);
  const loading = useLifestyleStore((state) => state.loading);
  const fetchLogs = useLifestyleStore((state) => state.fetchLogs);
  const upsertLog = useLifestyleStore((state) => state.upsertLog);
  const { width } = useWindowDimensions();

  const today = useMemo(() => new Date(), []);
  const todayStr = dateKey(today);
  const [selectedDate, setSelectedDate] = useState(today);
  const [activeMetric, setActiveMetric] = useState<MetricKey | null>(null);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [sleepHours, setSleepHours] = useState('');
  const [waterOz, setWaterOz] = useState('');
  const [workoutType, setWorkoutType] = useState('');
  const [workoutDuration, setWorkoutDuration] = useState('');
  const [workoutIntensity, setWorkoutIntensity] = useState<number | null>(null);
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [mood, setMood] = useState<number | null>(null);
  const [energyLevel, setEnergyLevel] = useState<number | null>(null);
  const [weightLbs, setWeightLbs] = useState('');

  const selectedDateKey = dateKey(selectedDate);
  const selectedLog = useMemo(() => logs.find((log) => log.date === selectedDateKey), [logs, selectedDateKey]);
  const isViewingToday = selectedDateKey === todayStr;
  const logByDate = useMemo(() => new Map(logs.map((log) => [log.date, log])), [logs]);

  useEffect(() => {
    if (!user?.id) return;

    void fetchLogs(user.id).catch((error: Error) => {
      Alert.alert('Error', error.message);
    });
  }, [fetchLogs, user?.id]);

  const handleRefresh = useCallback(async () => {
    if (!user?.id) return;

    setRefreshing(true);
    try {
      await fetchLogs(user.id);
    } finally {
      setRefreshing(false);
    }
  }, [fetchLogs, user?.id]);

  useEffect(() => {
    setSleepHours(toInput(selectedLog?.sleep_hours));
    setWaterOz(toInput(selectedLog?.water_oz));
    setWorkoutType(selectedLog?.workout_type ?? '');
    setWorkoutDuration(toInput(selectedLog?.workout_duration_min));
    setWorkoutIntensity(selectedLog?.workout_intensity ?? null);
    setWorkoutNotes(selectedLog?.workout_notes ?? '');
    setMood(selectedLog?.mood ?? null);
    setEnergyLevel(getEnergyRating(selectedLog));
    setWeightLbs(toInput(selectedLog?.weight_lbs));
  }, [selectedLog]);

  const score = lifestyleScore(selectedLog);

  const dayKeys = useMemo(
    () => Array.from({ length: 14 }, (_, index) => dateKey(addDays(selectedDate, index - 13))),
    [selectedDate],
  );

  const currentTrend = dayKeys.slice(7).map((key) => lifestyleScore(logByDate.get(key)));
  const previousTrend = dayKeys.slice(0, 7).map((key) => lifestyleScore(logByDate.get(key)));
  const currentAverage = currentTrend.reduce((sum, value) => sum + value, 0) / currentTrend.length;
  const previousAverage = previousTrend.reduce((sum, value) => sum + value, 0) / previousTrend.length;
  const trendChange = previousAverage ? ((currentAverage - previousAverage) / previousAverage) * 100 : 0;
  const trendIsUp = trendChange >= 0;

  const weeklyKeys = dayKeys.slice(7);
  const weeklyLabels = weeklyKeys.map((key) => parseDateKey(key).toLocaleDateString('en-US', { weekday: 'narrow' }));
  const weeklySleep = weeklyKeys.map((key) => sleepScore(logByDate.get(key)?.sleep_hours));
  const weeklyEnergy = weeklyKeys.map((key) => ratingScore(getEnergyRating(logByDate.get(key))));
  const weeklyMood = weeklyKeys.map((key) => ratingScore(logByDate.get(key)?.mood));
  const weeklyWorkout = weeklyKeys.map((key) => workoutScore(logByDate.get(key)));

  const previousWeight = useMemo(() => {
    return logs
      .filter((log) => log.date < selectedDateKey && log.weight_lbs)
      .sort((a, b) => b.date.localeCompare(a.date))[0]?.weight_lbs ?? null;
  }, [logs, selectedDateKey]);

  const weightDelta = selectedLog?.weight_lbs && previousWeight ? selectedLog.weight_lbs - previousWeight : null;

  const basePayload = (): EditableLifestyleLog => ({
    date: selectedDateKey,
    weight_lbs: selectedLog?.weight_lbs ?? null,
    water_oz: selectedLog?.water_oz ?? null,
    calories: selectedLog?.calories ?? null,
    protein_g: selectedLog?.protein_g ?? null,
    sleep_hours: selectedLog?.sleep_hours ?? null,
    steps: selectedLog?.steps ?? null,
    workout_notes: selectedLog?.workout_notes ?? null,
    workout_type: selectedLog?.workout_type ?? null,
    workout_duration_min: selectedLog?.workout_duration_min ?? null,
    workout_intensity: selectedLog?.workout_intensity ?? null,
    mood: selectedLog?.mood ?? null,
    energy: selectedLog?.energy ?? null,
    energy_level: getEnergyRating(selectedLog),
    meal_notes: selectedLog?.meal_notes ?? null,
  });

  const handleSaveMetric = async () => {
    if (!user?.id || !activeMetric) return;
    setSaving(true);

    try {
      const payload = basePayload();

      if (activeMetric === 'sleep') payload.sleep_hours = toNumber(sleepHours);
      if (activeMetric === 'water') payload.water_oz = toNumber(waterOz);
      if (activeMetric === 'workout') {
        payload.workout_type = workoutType.trim() || null;
        payload.workout_duration_min = toNumber(workoutDuration);
        payload.workout_intensity = workoutIntensity;
        payload.workout_notes = workoutNotes.trim() || null;
      }
      if (activeMetric === 'mood') payload.mood = mood;
      if (activeMetric === 'energy') {
        payload.energy_level = energyLevel;
        payload.energy = energyLevel;
      }
      if (activeMetric === 'weight') payload.weight_lbs = toNumber(weightLbs);

      await upsertLog(payload, user.id);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setActiveMetric(null);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const openMetric = (metric: MetricKey) => setActiveMetric(metric);
  const nextDisabled = isViewingToday;
  const chartConfig = {
    backgroundGradientFrom: Colors.card,
    backgroundGradientTo: Colors.card,
    color: (opacity = 1) => `rgba(45, 106, 79, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    decimalPlaces: 0,
    propsForBackgroundLines: { stroke: Colors.border, strokeDasharray: '3 6' },
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.accent} />}
        >
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Lifestyle</Text>
              <View style={styles.dateNav}>
                <Pressable style={styles.dateArrow} onPress={() => setSelectedDate((date) => addDays(date, -1))}>
                  <Text style={styles.dateArrowText}>{'<'}</Text>
                </Pressable>
                <Text style={styles.dateTitle}>{formatSelectedDate(selectedDate, isViewingToday)}</Text>
                <Pressable
                  style={[styles.dateArrow, nextDisabled && styles.disabledArrow]}
                  disabled={nextDisabled}
                  onPress={() => setSelectedDate((date) => addDays(date, 1))}
                >
                  <Text style={styles.dateArrowText}>{'>'}</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {loading ? (
            <View style={[styles.card, styles.scoreCard]}>
              <View style={styles.scoreTopRow}>
                <View style={styles.scoreSkeletonCopy}>
                  <Skeleton width={120} height={12} borderRadius={6} />
                  <Skeleton width={150} height={26} borderRadius={8} />
                </View>
                <Skeleton width={86} height={86} borderRadius={43} />
              </View>
              <View style={styles.trendRow}>
                <View style={styles.scoreSkeletonCopy}>
                  <Skeleton width={96} height={11} borderRadius={6} />
                  <Skeleton width={180} height={16} borderRadius={8} />
                </View>
                <Skeleton width={120} height={40} borderRadius={10} />
              </View>
            </View>
          ) : (
            <View style={[styles.card, styles.scoreCard]}>
              <View style={styles.scoreTopRow}>
                <View>
                  <Text style={styles.scoreEyebrow}>LIFESTYLE SCORE</Text>
                  <Text style={styles.scoreLabel}>{scoreLabel(score)}</Text>
                </View>
                <View style={styles.scoreCircle}>
                  <Text style={styles.scoreValue}>{score}</Text>
                  <Text style={styles.scoreMax}>/100</Text>
                </View>
              </View>
              <View style={styles.trendRow}>
                <View>
                  <Text style={styles.trendLabel}>7-DAY TREND</Text>
                  <Text style={[styles.trendValue, { color: trendIsUp ? Colors.success : Colors.error }]}>
                    {trendIsUp ? '↗' : '↘'} {Math.abs(trendChange).toFixed(0)}% vs previous 7 days
                  </Text>
                </View>
                <LineChart
                  data={{ labels: weeklyLabels, datasets: [{ data: currentTrend }] }}
                  width={120}
                  height={40}
                  chartConfig={chartConfig}
                  withDots={false}
                  withInnerLines={false}
                  withOuterLines={false}
                  withVerticalLabels={false}
                  withHorizontalLabels={false}
                  fromZero
                  bezier
                  style={styles.sparkline}
                />
              </View>
            </View>
          )}

          <Text style={styles.sectionHeader}>TODAY'S LOG</Text>
          <View style={styles.card}>
            <Pressable style={styles.logRow} onPress={() => openMetric('sleep')}>
              <Text style={styles.rowIcon}>🌙</Text>
              <View style={styles.rowBody}>
                <View style={styles.rowTitleLine}><Text style={styles.rowLabel}>Sleep</Text><Text style={styles.rowValue}>{formatSleep(selectedLog?.sleep_hours)}</Text></View>
                <ProgressBar progress={(selectedLog?.sleep_hours ?? 0) / SLEEP_TARGET_HOURS} color="#8B5CF6" />
              </View>
              <Text style={styles.rowMeta}>{Math.round(sleepScore(selectedLog?.sleep_hours))}%</Text>
            </Pressable>
            <Pressable style={styles.logRow} onPress={() => openMetric('water')}>
              <Text style={styles.rowIcon}>💧</Text>
              <View style={styles.rowBody}>
                <View style={styles.rowTitleLine}><Text style={styles.rowLabel}>Water</Text><Text style={styles.rowValue}>{selectedLog?.water_oz ? `${selectedLog.water_oz} oz / ${WATER_TARGET_OZ} oz` : 'Not logged'}</Text></View>
                <ProgressBar progress={(selectedLog?.water_oz ?? 0) / WATER_TARGET_OZ} color="#0EA5E9" />
              </View>
              <Text style={styles.rowMeta}>{Math.round(waterScore(selectedLog?.water_oz))}%</Text>
            </Pressable>
            <Pressable style={styles.logRow} onPress={() => openMetric('workout')}>
              <Text style={styles.rowIcon}>🏃</Text>
              <View style={styles.rowBody}><Text style={styles.rowLabel}>Workout</Text><Text style={styles.rowValue}>{selectedLog?.workout_type || 'Not logged'}</Text></View>
              <Text style={[styles.checkmark, workoutLogged(selectedLog) && styles.checkmarkActive]}>{workoutLogged(selectedLog) ? '✓' : '○'}</Text>
            </Pressable>
            <Pressable style={styles.logRow} onPress={() => openMetric('mood')}>
              <Text style={styles.rowIcon}>😊</Text>
              <View style={styles.rowBody}><Text style={styles.rowLabel}>Mood</Text><Text style={styles.rowValue}>{selectedLog?.mood ? MOOD_LABELS[selectedLog.mood] : 'Not logged'}</Text></View>
              <Text style={styles.rowMeta}>{selectedLog?.mood ? `${selectedLog.mood}/5` : '—'}</Text>
            </Pressable>
            <Pressable style={styles.logRow} onPress={() => openMetric('energy')}>
              <Text style={styles.rowIcon}>⚡</Text>
              <View style={styles.rowBody}><Text style={styles.rowLabel}>Energy</Text><Text style={styles.rowValue}>{getEnergyRating(selectedLog) ? ENERGY_LABELS[getEnergyRating(selectedLog)!] : 'Not logged'}</Text></View>
              <Text style={styles.rowMeta}>{getEnergyRating(selectedLog) ? `${getEnergyRating(selectedLog)}/5` : '—'}</Text>
            </Pressable>
            <Pressable style={[styles.logRow, styles.lastLogRow]} onPress={() => openMetric('weight')}>
              <Text style={styles.rowIcon}>⚖️</Text>
              <View style={styles.rowBody}><Text style={styles.rowLabel}>Weight</Text><Text style={styles.rowValue}>{selectedLog?.weight_lbs ? `${selectedLog.weight_lbs} lbs` : 'Not logged'}</Text></View>
              <Text style={[styles.rowMeta, weightDelta && weightDelta > 0 ? styles.deltaUp : styles.deltaDown]}>{weightDelta ? `${weightDelta > 0 ? '+' : ''}${weightDelta.toFixed(1)} lbs` : '—'}</Text>
            </Pressable>
          </View>

          <Text style={styles.sectionHeader}>WEEKLY OVERVIEW</Text>
          {loading ? (
            <View style={[styles.card, styles.weeklyCard, styles.weeklySkeletonCard]}>
              <Skeleton width="100%" height={210} borderRadius={16} />
              <View style={styles.legendRow}>
                <Skeleton width={62} height={14} borderRadius={7} />
                <Skeleton width={70} height={14} borderRadius={7} />
                <Skeleton width={60} height={14} borderRadius={7} />
                <Skeleton width={78} height={14} borderRadius={7} />
              </View>
            </View>
          ) : (
            <View style={[styles.card, styles.weeklyCard]}>
              <LineChart
                data={{
                  labels: weeklyLabels,
                  datasets: [
                    { data: weeklySleep, color: () => '#8B5CF6', strokeWidth: 2 },
                    { data: weeklyEnergy, color: () => '#10B981', strokeWidth: 2 },
                    { data: weeklyMood, color: () => '#F59E0B', strokeWidth: 2 },
                    { data: weeklyWorkout, color: () => '#F97316', strokeWidth: 2 },
                  ],
                }}
                width={Math.max(width - 48, 280)}
                height={210}
                chartConfig={chartConfig}
                withDots={false}
                withShadow={false}
                fromZero
                segments={4}
                bezier
                style={styles.weeklyChart}
              />
              <View style={styles.legendRow}>
                <LegendDot color="#8B5CF6" label="Sleep" />
                <LegendDot color="#10B981" label="Energy" />
                <LegendDot color="#F59E0B" label="Mood" />
                <LegendDot color="#F97316" label="Workout" />
              </View>
            </View>
          )}

          <Text style={styles.sectionHeader}>QUICK ADD</Text>
          <View style={styles.quickAddRow}>
            {QUICK_ADD.map((item) => (
              <Pressable key={item.key} style={styles.quickChip} onPress={() => openMetric(item.key)}>
                <Text style={styles.quickEmoji}>{item.emoji}</Text>
                <Text style={styles.quickLabel}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <MetricModal
        activeMetric={activeMetric}
        onClose={() => setActiveMetric(null)}
        saving={saving}
        onSave={handleSaveMetric}
        sleepHours={sleepHours}
        setSleepHours={setSleepHours}
        waterOz={waterOz}
        setWaterOz={setWaterOz}
        workoutType={workoutType}
        setWorkoutType={setWorkoutType}
        workoutDuration={workoutDuration}
        setWorkoutDuration={setWorkoutDuration}
        workoutIntensity={workoutIntensity}
        setWorkoutIntensity={setWorkoutIntensity}
        workoutNotes={workoutNotes}
        setWorkoutNotes={setWorkoutNotes}
        mood={mood}
        setMood={setMood}
        energyLevel={energyLevel}
        setEnergyLevel={setEnergyLevel}
        weightLbs={weightLbs}
        setWeightLbs={setWeightLbs}
      />
    </SafeAreaView>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

function MetricModal({
  activeMetric,
  onClose,
  saving,
  onSave,
  sleepHours,
  setSleepHours,
  waterOz,
  setWaterOz,
  workoutType,
  setWorkoutType,
  workoutDuration,
  setWorkoutDuration,
  workoutIntensity,
  setWorkoutIntensity,
  workoutNotes,
  setWorkoutNotes,
  mood,
  setMood,
  energyLevel,
  setEnergyLevel,
  weightLbs,
  setWeightLbs,
}: {
  activeMetric: MetricKey | null;
  onClose: () => void;
  saving: boolean;
  onSave: () => void;
  sleepHours: string;
  setSleepHours: (value: string) => void;
  waterOz: string;
  setWaterOz: (value: string) => void;
  workoutType: string;
  setWorkoutType: (value: string) => void;
  workoutDuration: string;
  setWorkoutDuration: (value: string) => void;
  workoutIntensity: number | null;
  setWorkoutIntensity: (value: number | null) => void;
  workoutNotes: string;
  setWorkoutNotes: (value: string) => void;
  mood: number | null;
  setMood: (value: number | null) => void;
  energyLevel: number | null;
  setEnergyLevel: (value: number | null) => void;
  weightLbs: string;
  setWeightLbs: (value: string) => void;
}) {
  const title = activeMetric ? QUICK_ADD.find((item) => item.key === activeMetric)?.label : '';

  return (
    <Modal visible={Boolean(activeMetric)} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheetWrap}>
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Log {title}</Text>
            <Pressable onPress={onClose}><Text style={styles.sheetClose}>Close</Text></Pressable>
          </View>

          {activeMetric === 'sleep' && <MetricInput label="Sleep hours" value={sleepHours} onChangeText={setSleepHours} placeholder="8" unit="hrs" />}
          {activeMetric === 'water' && <MetricInput label="Water" value={waterOz} onChangeText={setWaterOz} placeholder="128" unit="oz" />}
          {activeMetric === 'weight' && <MetricInput label="Weight" value={weightLbs} onChangeText={setWeightLbs} placeholder="180" unit="lbs" />}
          {activeMetric === 'workout' && (
            <>
              <MetricInput label="Workout type" value={workoutType} onChangeText={setWorkoutType} placeholder="Strength, run, yoga..." keyboardType="default" />
              <MetricInput label="Duration" value={workoutDuration} onChangeText={setWorkoutDuration} placeholder="45" unit="min" />
              <Text style={styles.pickerLabel}>Intensity</Text>
              <RatingPicker value={workoutIntensity} onChange={setWorkoutIntensity} labels={ENERGY_LABELS} />
              <TextInput
                value={workoutNotes}
                onChangeText={setWorkoutNotes}
                multiline
                placeholder="Workout notes"
                placeholderTextColor={Colors.textSecondary}
                style={styles.notesInput}
              />
            </>
          )}
          {activeMetric === 'mood' && <RatingPicker value={mood} onChange={setMood} labels={MOOD_LABELS} />}
          {activeMetric === 'energy' && <RatingPicker value={energyLevel} onChange={setEnergyLevel} labels={ENERGY_LABELS} />}

          <Pressable style={[styles.saveButton, saving && styles.saveButtonDisabled]} onPress={onSave} disabled={saving}>
            <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Log'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function MetricInput({
  label,
  unit,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'decimal-pad',
}: {
  label: string;
  unit?: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'decimal-pad' | 'number-pad';
}) {
  return (
    <View style={styles.inputRow}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholder={placeholder}
          placeholderTextColor={Colors.textSecondary}
          style={styles.input}
        />
        {unit ? <Text style={styles.inputUnit}>{unit}</Text> : null}
      </View>
    </View>
  );
}

function RatingPicker({ value, onChange, labels }: { value: number | null; onChange: (value: number | null) => void; labels: Record<number, string> }) {
  return (
    <View style={styles.ratingRow}>
      {[1, 2, 3, 4, 5].map((rating) => {
        const selected = value === rating;
        return (
          <Pressable key={rating} style={[styles.ratingChip, selected && styles.ratingChipSelected]} onPress={() => onChange(rating)}>
            <Text style={[styles.ratingNumber, selected && styles.ratingNumberSelected]}>{rating}</Text>
            <Text style={[styles.ratingLabel, selected && styles.ratingNumberSelected]}>{labels[rating]}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  keyboard: { flex: 1 },
  content: { padding: 20, paddingBottom: 120, gap: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: Colors.text, fontSize: 34, fontWeight: '800', letterSpacing: -0.5 },
  dateNav: { marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  dateArrow: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  disabledArrow: { opacity: 0.35 },
  dateArrowText: { color: Colors.text, fontSize: 16, fontWeight: '800' },
  dateTitle: { color: Colors.textSecondary, fontSize: 15, fontWeight: '700' },
  card: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 18, overflow: 'hidden' },
  scoreCard: { padding: 18, gap: 18 },
  scoreTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scoreSkeletonCopy: { gap: 10 },
  scoreEyebrow: { color: Colors.textSecondary, fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  scoreLabel: { color: Colors.text, fontSize: 22, fontWeight: '800', marginTop: 6 },
  scoreCircle: { width: 86, height: 86, borderRadius: 43, backgroundColor: Colors.accentLight, alignItems: 'center', justifyContent: 'center' },
  scoreValue: { color: Colors.accent, fontSize: 32, fontWeight: '900' },
  scoreMax: { color: Colors.textSecondary, fontSize: 12, fontWeight: '800' },
  trendRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  trendLabel: { color: Colors.textSecondary, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  trendValue: { fontSize: 13, fontWeight: '800', marginTop: 4 },
  sparkline: { paddingRight: 0, paddingLeft: 0, marginLeft: -12 },
  sectionHeader: { color: Colors.textSecondary, fontSize: 12, fontWeight: '800', letterSpacing: 1, marginTop: 8 },
  logRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  lastLogRow: { borderBottomWidth: 0 },
  rowIcon: { width: 34, fontSize: 24, textAlign: 'center' },
  rowBody: { flex: 1, gap: 7 },
  rowTitleLine: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  rowLabel: { color: Colors.text, fontSize: 15, fontWeight: '800' },
  rowValue: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  rowMeta: { color: Colors.textSecondary, minWidth: 44, textAlign: 'right', fontSize: 13, fontWeight: '800' },
  progressTrack: { height: 7, borderRadius: 4, backgroundColor: Colors.border, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  checkmark: { color: Colors.textSecondary, fontSize: 22, fontWeight: '800' },
  checkmarkActive: { color: Colors.success },
  deltaUp: { color: Colors.warning },
  deltaDown: { color: Colors.success },
  weeklyCard: { paddingVertical: 10 },
  weeklySkeletonCard: { paddingHorizontal: 10, gap: 12 },
  weeklyChart: { marginLeft: -16, borderRadius: 16 },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14, paddingHorizontal: 12, paddingBottom: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 9, height: 9, borderRadius: 5 },
  legendLabel: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700' },
  quickAddRow: { flexDirection: 'row', gap: 8 },
  quickChip: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 14, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  quickEmoji: { fontSize: 19 },
  quickLabel: { color: Colors.text, fontSize: 10, fontWeight: '800', marginTop: 4 },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(17, 24, 39, 0.38)' },
  sheetWrap: { flex: 1, justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 34, gap: 14 },
  sheetHandle: { alignSelf: 'center', width: 44, height: 4, borderRadius: 2, backgroundColor: Colors.border, marginBottom: 2 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sheetTitle: { color: Colors.text, fontSize: 22, fontWeight: '900' },
  sheetClose: { color: Colors.accent, fontSize: 14, fontWeight: '800' },
  inputRow: { gap: 8 },
  inputLabel: { color: Colors.text, fontSize: 14, fontWeight: '800' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.border, borderRadius: 14, backgroundColor: Colors.card, paddingHorizontal: 14 },
  input: { flex: 1, color: Colors.text, fontSize: 17, fontWeight: '700', minHeight: 48 },
  inputUnit: { color: Colors.textSecondary, fontSize: 14, fontWeight: '800' },
  pickerLabel: { color: Colors.text, fontSize: 14, fontWeight: '800' },
  notesInput: { minHeight: 82, borderWidth: 1, borderColor: Colors.border, borderRadius: 14, backgroundColor: Colors.card, color: Colors.text, padding: 14, textAlignVertical: 'top', fontSize: 15 },
  ratingRow: { flexDirection: 'row', gap: 8 },
  ratingChip: { flex: 1, minHeight: 68, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  ratingChipSelected: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  ratingNumber: { color: Colors.text, fontSize: 18, fontWeight: '900' },
  ratingLabel: { color: Colors.textSecondary, fontSize: 10, fontWeight: '800', marginTop: 4, textAlign: 'center' },
  ratingNumberSelected: { color: Colors.white },
  saveButton: { backgroundColor: Colors.accent, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  saveButtonDisabled: { opacity: 0.65 },
  saveButtonText: { color: Colors.white, fontSize: 16, fontWeight: '900' },
});
