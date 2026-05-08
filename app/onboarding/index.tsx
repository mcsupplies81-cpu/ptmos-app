import { useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const ACCENT = '#2563EB';
const BACKGROUND = '#F0F4FF';
const TEXT = '#111827';
const TEXT_SECONDARY = '#64748B';
const CARD = '#FFFFFF';

const SCHEDULE_ROWS = [
  { compound: 'BPC-157', time: '9:00 AM' },
  { compound: 'TB-500', time: '1:00 PM' },
  { compound: 'Retatrutide', time: '8:00 PM' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');

  const goBack = () => {
    setNameError('');
    setStep((currentStep) => Math.max(currentStep - 1, 0));
  };

  const goNext = () => {
    if (step === 4) {
      const trimmedName = name.trim();

      if (!trimmedName) {
        setNameError('Please enter your first name.');
        return;
      }

      router.push({ pathname: '/onboarding/paywall', params: { name: trimmedName } });
      return;
    }

    setNameError('');
    setStep((currentStep) => Math.min(currentStep + 1, 4));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.progressHeader}>
          {step > 0 ? (
            <Pressable onPress={goBack} style={styles.backButton} accessibilityRole="button">
              <Text style={styles.backButtonText}>←</Text>
            </Pressable>
          ) : (
            <View style={styles.backButtonPlaceholder} />
          )}

          <View style={styles.dots}>
            {[0, 1, 2, 3, 4].map((dot) => (
              <View key={dot} style={[styles.dot, dot === step && styles.dotActive]} />
            ))}
          </View>

          <View style={styles.backButtonPlaceholder} />
        </View>

        <View style={styles.content}>{renderStep(step, name, setName, nameError, setNameError)}</View>

        <View style={styles.footer}>
          <Pressable style={styles.primaryButton} onPress={goNext} accessibilityRole="button">
            <Text style={styles.primaryButtonText}>{step === 0 ? 'Start tracking →' : 'Next →'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function renderStep(
  step: number,
  name: string,
  setName: (name: string) => void,
  nameError: string,
  setNameError: (error: string) => void,
) {
  switch (step) {
    case 0:
      return <WelcomeStep />;
    case 1:
      return <TrackDoseStep />;
    case 2:
      return <VisualizeDoseStep />;
    case 3:
      return <ReminderStep />;
    case 4:
      return (
        <NameStep
          name={name}
          nameError={nameError}
          onChangeName={(value) => {
            setName(value);
            if (nameError) setNameError('');
          }}
        />
      );
    default:
      return null;
  }
}

function WelcomeStep() {
  return (
    <View style={styles.heroStep}>
      <View style={styles.logoMark}>
        <Text style={styles.logoText}>PT-OS</Text>
      </View>
      <Text style={styles.heroTitle}>Your peptide protocol operating system</Text>
      <View style={styles.vialsPlaceholder}>
        <View style={styles.vialTall} />
        <View style={styles.vialShort} />
        <View style={styles.vialTall} />
      </View>
    </View>
  );
}

function TrackDoseStep() {
  return (
    <FeatureShell
      title="Track every dose"
      subtitle="Log injections, set schedules, and never miss a dose again."
    >
      <View style={styles.scheduleCard}>
        {SCHEDULE_ROWS.map((row, index) => (
          <View
            key={row.compound}
            style={[styles.scheduleRow, index === SCHEDULE_ROWS.length - 1 && styles.scheduleRowLast]}
          >
            <View>
              <Text style={styles.scheduleCompound}>{row.compound}</Text>
              <Text style={styles.scheduleLabel}>Scheduled dose</Text>
            </View>
            <Text style={styles.scheduleTime}>{row.time}</Text>
          </View>
        ))}
      </View>
    </FeatureShell>
  );
}

function VisualizeDoseStep() {
  return (
    <FeatureShell
      title="Visualize your doses"
      subtitle="Real-time decay curves and estimated active levels for every protocol."
    >
      <View style={styles.decayCard}>
        <View style={styles.curveLine} />
        <Text style={styles.decayText}>Decay curve</Text>
      </View>
    </FeatureShell>
  );
}

function ReminderStep() {
  return (
    <FeatureShell title="Set reminders" subtitle="Get notified at the right time, every time.">
      <View style={styles.iconPlaceholder}>
        <View style={styles.iconInnerCircle}>
          <Text style={styles.iconText}>🔔</Text>
        </View>
      </View>
    </FeatureShell>
  );
}

function NameStep({
  name,
  nameError,
  onChangeName,
}: {
  name: string;
  nameError: string;
  onChangeName: (name: string) => void;
}) {
  return (
    <View style={styles.nameStep}>
      <Text style={styles.featureTitle}>What's your first name?</Text>
      <TextInput
        value={name}
        onChangeText={onChangeName}
        placeholder="First name"
        placeholderTextColor="#94A3B8"
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType="done"
        style={[styles.nameInput, nameError ? styles.nameInputError : null]}
      />
      {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
    </View>
  );
}

function FeatureShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <View style={styles.featureStep}>
      {children}
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureSubtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  progressHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  backButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  backButtonPlaceholder: {
    height: 44,
    width: 44,
  },
  backButtonText: {
    color: ACCENT,
    fontSize: 30,
    fontWeight: '700',
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    backgroundColor: '#CBD5E1',
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  dotActive: {
    backgroundColor: ACCENT,
    width: 28,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  footer: {
    paddingBottom: 28,
    paddingTop: 16,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: ACCENT,
    borderRadius: 18,
    height: 58,
    justifyContent: 'center',
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 22,
  },
  primaryButtonText: {
    color: CARD,
    fontSize: 17,
    fontWeight: '800',
  },
  heroStep: {
    alignItems: 'center',
    gap: 28,
  },
  logoMark: {
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 28,
    paddingHorizontal: 28,
    paddingVertical: 18,
  },
  logoText: {
    color: ACCENT,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  heroTitle: {
    color: TEXT,
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 40,
    maxWidth: 320,
    textAlign: 'center',
  },
  vialsPlaceholder: {
    alignItems: 'flex-end',
    backgroundColor: '#E8F0FE',
    borderRadius: 30,
    flexDirection: 'row',
    gap: 18,
    height: 200,
    justifyContent: 'center',
    paddingBottom: 28,
    width: '100%',
  },
  vialTall: {
    backgroundColor: '#BFDBFE',
    borderColor: CARD,
    borderRadius: 16,
    borderWidth: 4,
    height: 118,
    width: 46,
  },
  vialShort: {
    backgroundColor: '#DBEAFE',
    borderColor: CARD,
    borderRadius: 16,
    borderWidth: 4,
    height: 88,
    width: 46,
  },
  featureStep: {
    alignItems: 'center',
    gap: 24,
  },
  featureTitle: {
    color: TEXT,
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 38,
    textAlign: 'center',
  },
  featureSubtitle: {
    color: TEXT_SECONDARY,
    fontSize: 17,
    lineHeight: 25,
    maxWidth: 320,
    textAlign: 'center',
  },
  scheduleCard: {
    backgroundColor: CARD,
    borderRadius: 28,
    padding: 18,
    width: '100%',
  },
  scheduleRow: {
    alignItems: 'center',
    borderBottomColor: '#E2E8F0',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  scheduleRowLast: {
    borderBottomWidth: 0,
  },
  scheduleCompound: {
    color: TEXT,
    fontSize: 17,
    fontWeight: '800',
  },
  scheduleLabel: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    marginTop: 4,
  },
  scheduleTime: {
    color: ACCENT,
    fontSize: 16,
    fontWeight: '800',
  },
  decayCard: {
    alignItems: 'center',
    backgroundColor: '#E8F0FE',
    borderRadius: 28,
    height: 220,
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
  },
  curveLine: {
    borderColor: ACCENT,
    borderRadius: 120,
    borderTopWidth: 5,
    height: 120,
    opacity: 0.45,
    position: 'absolute',
    top: 88,
    transform: [{ rotate: '-12deg' }],
    width: 280,
  },
  decayText: {
    color: ACCENT,
    fontSize: 26,
    fontWeight: '900',
  },
  iconPlaceholder: {
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 36,
    height: 220,
    justifyContent: 'center',
    width: '100%',
  },
  iconInnerCircle: {
    alignItems: 'center',
    backgroundColor: '#E8F0FE',
    borderRadius: 56,
    height: 112,
    justifyContent: 'center',
    width: 112,
  },
  iconText: {
    fontSize: 48,
  },
  nameStep: {
    gap: 18,
  },
  nameInput: {
    backgroundColor: CARD,
    borderColor: 'transparent',
    borderRadius: 18,
    borderWidth: 2,
    color: TEXT,
    fontSize: 18,
    height: 58,
    paddingHorizontal: 18,
  },
  nameInputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
    marginTop: -6,
  },
});
