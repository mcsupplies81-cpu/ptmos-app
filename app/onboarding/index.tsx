import { useRouter } from 'expo-router';
import { useOnboardingStore } from '@/stores/onboardingStore';
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
import Svg, { Rect } from 'react-native-svg';

const ACCENT = '#2563EB';
const BACKGROUND = '#FFFFFF';
const TEXT = '#0A0A0F';
const TEXT_SECONDARY = '#6B7280';
const TEXT_TERTIARY = '#9CA3AF';
const BORDER = '#F3F4F6';
const INPUT_BORDER = '#E5E7EB';
const CARD = '#FFFFFF';
const TOTAL_STEPS = 7;

const GOALS = ['Fat loss', 'Recovery', 'Muscle gain', 'Sleep', 'Energy', 'Longevity', 'Research', 'Custom'];

const EXPERIENCE_LEVELS = [
  { id: 'new', label: 'New', desc: "I'm new to peptide tracking and want a guided start." },
  { id: 'intermediate', label: 'Intermediate', desc: 'I have some experience and want more flexibility.' },
  { id: 'advanced', label: 'Advanced', desc: "I'm experienced and want full control and customization." },
];

const SCHEDULE_ROWS = [
  { compound: 'BPC-157', time: '9:00 AM' },
  { compound: 'TB-500', time: '1:00 PM' },
  { compound: 'Retatrutide', time: '8:00 PM' },
];

const DAYS = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [goals, setGoals] = useState<string[]>([]);
  const [goalsError, setGoalsError] = useState('');
  const [experience, setExperience] = useState('');
  const [experienceError, setExperienceError] = useState('');

  const goBack = () => {
    setNameError('');
    setGoalsError('');
    setExperienceError('');
    setStep((currentStep) => Math.max(currentStep - 1, 0));
  };

  const goNext = () => {
    if (step === 4) {
      const trimmedName = name.trim();

      if (!trimmedName) {
        setNameError('Please enter your first name.');
        return;
      }

      useOnboardingStore.getState().setName(trimmedName);
      setNameError('');
      setStep(5);
      return;
    }

    if (step === 5) {
      if (goals.length === 0) {
        setGoalsError('Select at least one goal.');
        return;
      }

      setGoalsError('');
      setStep(6);
      return;
    }

    if (step === 6) {
      if (!experience) {
        setExperienceError('Select your experience level.');
        return;
      }

      setExperienceError('');
      router.push('/onboarding/create-account');
      return;
    }

    setNameError('');
    setGoalsError('');
    setExperienceError('');
    setStep((currentStep) => Math.min(currentStep + 1, TOTAL_STEPS - 1));
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
            {Array.from({ length: TOTAL_STEPS }, (_, dot) => dot).map((dot) => (
              <View key={dot} style={[styles.dot, dot === step && styles.dotActive]} />
            ))}
          </View>

          <View style={styles.backButtonPlaceholder} />
        </View>

        <View style={styles.content}>
          {renderStep(
            step,
            name,
            setName,
            nameError,
            setNameError,
            goals,
            setGoals,
            goalsError,
            setGoalsError,
            experience,
            setExperience,
            experienceError,
            setExperienceError,
          )}
        </View>

        <View style={styles.footer}>
          <Pressable style={styles.primaryButton} onPress={goNext} accessibilityRole="button">
            <Text style={styles.primaryButtonText}>{step === 0 ? 'Get started' : 'Next'}</Text>
          </Pressable>
          {step === 0 ? (
            <Pressable onPress={() => router.push('/(auth)/sign-in')} accessibilityRole="button">
              <Text style={styles.signInText}>
                Already have an account? <Text style={styles.signInLink}>Sign in</Text>
              </Text>
            </Pressable>
          ) : null}
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
  goals: string[],
  setGoals: (goals: string[]) => void,
  goalsError: string,
  setGoalsError: (error: string) => void,
  experience: string,
  setExperience: (experience: string) => void,
  experienceError: string,
  setExperienceError: (error: string) => void,
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
    case 5:
      return (
        <GoalsStep
          goals={goals}
          goalsError={goalsError}
          onToggleGoal={(goal) => {
            const nextGoals = goals.includes(goal)
              ? goals.filter((selectedGoal) => selectedGoal !== goal)
              : [...goals, goal];

            setGoals(nextGoals);
            useOnboardingStore.getState().setGoals(nextGoals);
            if (goalsError) setGoalsError('');
          }}
        />
      );
    case 6:
      return (
        <ExperienceStep
          experience={experience}
          experienceError={experienceError}
          onSelectExperience={(value) => {
            setExperience(value);
            useOnboardingStore.getState().setExperience(value);
            if (experienceError) setExperienceError('');
          }}
        />
      );
    default:
      return null;
  }
}

function WelcomeStep() {
  return (
    <View style={styles.welcomeStep}>
      <View style={styles.logoRow}>
        <Svg width={25} height={22} viewBox="0 0 25 22" fill="none">
          <Rect x={2} y={8} width={4} height={12} rx={2} fill={ACCENT} />
          <Rect x={9} y={2} width={4} height={18} rx={2} fill={ACCENT} />
          <Rect x={16} y={6} width={4} height={14} rx={2} fill={ACCENT} />
        </Svg>
        <Text style={styles.logoText}>PT-OS</Text>
      </View>
      <Text style={styles.heroEyebrow}>Your peptide operating system</Text>
      <Text style={styles.heroTitle}>Track peptides{`\n`}with <Text style={styles.heroTitleAccent}>clarity.</Text></Text>
      <Text style={styles.heroSubtitle}>Log doses, monitor protocols, and understand your routine in one place.</Text>
    </View>
  );
}

function TrackDoseStep() {
  return (
    <FeatureShell title="Track every dose." subtitle="Track protocols, log doses, and stay consistent.">
      <View style={[styles.premiumCard, styles.scheduleCard]}>
        {SCHEDULE_ROWS.map((row, index) => (
          <View
            key={row.compound}
            style={[styles.scheduleRow, index === SCHEDULE_ROWS.length - 1 && styles.scheduleRowLast]}
          >
            <Text style={styles.scheduleCompound}>{row.compound}</Text>
            <Text style={styles.scheduleTime}>{row.time}</Text>
          </View>
        ))}
      </View>
    </FeatureShell>
  );
}

function VisualizeDoseStep() {
  return (
    <FeatureShell title="See what's active." subtitle="Understand estimated active levels at a glance.">
      <View style={[styles.premiumCard, styles.activeCard]}>
        <View style={styles.activeLine} />
        <Text style={styles.activeLabel}>ESTIMATED ACTIVE</Text>
        <Text style={styles.activeValue}>142 mcg</Text>
        <View style={styles.dayRow}>
          {DAYS.map((day) => (
            <Text key={day} style={styles.dayLabel}>
              {day}
            </Text>
          ))}
        </View>
      </View>
    </FeatureShell>
  );
}

function ReminderStep() {
  return (
    <FeatureShell title="Chat with your peptide copilot" subtitle="Ask questions, log actions, and get guided support in natural language.">
      <View style={[styles.premiumCard, styles.copilotCard]}>
        <View style={styles.chatBubbleUser}>
          <Text style={styles.chatBubbleUserText}>I just took 300 mcg BPC in my right arm.</Text>
        </View>
        <View style={styles.chatBubbleAssistant}>
          <Text style={styles.chatBubbleAssistantTitle}>Got it — here's what I'll log:</Text>
          <Text style={styles.chatBubbleAssistantText}>Peptide BPC-157 · Dose 300 mcg · Site Right Arm</Text>
        </View>
        <View style={styles.confirmButton}>
          <Text style={styles.confirmButtonText}>Confirm & Log</Text>
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
      <Text style={styles.featureTitle}>What's your{`\n`}first name?</Text>
      <Text style={styles.featureSubtitle}>We'll personalize your experience.</Text>
      <TextInput
        value={name}
        onChangeText={onChangeName}
        placeholder="First name"
        placeholderTextColor={TEXT_TERTIARY}
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType="done"
        style={[styles.nameInput, nameError ? styles.nameInputError : null]}
      />
      {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
    </View>
  );
}


function GoalsStep({
  goals,
  goalsError,
  onToggleGoal,
}: {
  goals: string[];
  goalsError: string;
  onToggleGoal: (goal: string) => void;
}) {
  return (
    <View style={styles.selectionStep}>
      <Text style={styles.featureTitle}>What are you{`\n`}focused on?</Text>
      <Text style={styles.featureSubtitle}>We'll tailor PT-OS around your goals.</Text>
      <View style={styles.goalsGrid}>
        {GOALS.map((goal) => {
          const selected = goals.includes(goal);

          return (
            <Pressable
              key={goal}
              onPress={() => onToggleGoal(goal)}
              style={[styles.goalCard, selected && styles.selectableCardSelected]}
              accessibilityRole="button"
            >
              <Text style={styles.goalLabel}>{goal}</Text>
              {selected ? (
                <View style={styles.checkCircle}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
      {goalsError ? <Text style={styles.errorText}>{goalsError}</Text> : null}
    </View>
  );
}

function ExperienceStep({
  experience,
  experienceError,
  onSelectExperience,
}: {
  experience: string;
  experienceError: string;
  onSelectExperience: (experience: string) => void;
}) {
  return (
    <View style={styles.selectionStep}>
      <Text style={styles.featureTitle}>How experienced{`\n`}are you?</Text>
      <Text style={styles.featureSubtitle}>This helps us customize your setup and guidance.</Text>
      <View style={styles.experienceList}>
        {EXPERIENCE_LEVELS.map((option) => {
          const selected = experience === option.id;

          return (
            <Pressable
              key={option.id}
              onPress={() => onSelectExperience(option.id)}
              style={[styles.experienceCard, selected && styles.selectableCardSelected]}
              accessibilityRole="button"
            >
              <View style={styles.radioCircle}>{selected ? <View style={styles.radioDot} /> : null}</View>
              <View style={styles.experienceCopy}>
                <Text style={styles.experienceLabel}>{option.label}</Text>
                <Text style={styles.experienceDesc}>{option.desc}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      {experienceError ? <Text style={styles.errorText}>{experienceError}</Text> : null}
    </View>
  );
}

function FeatureShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <View style={styles.featureStep}>
      <Text style={styles.featureTitle}>{title}</Text>
      {children}
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
    color: TEXT,
    fontSize: 22,
    fontWeight: '700',
  },
  dots: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    backgroundColor: '#D1D5DB',
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  dotActive: {
    backgroundColor: ACCENT,
    width: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  footer: {
    gap: 14,
    paddingBottom: 28,
    paddingTop: 16,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: ACCENT,
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    width: '100%',
  },
  primaryButtonText: {
    color: CARD,
    fontSize: 17,
    fontWeight: '700',
  },
  signInText: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    textAlign: 'center',
  },
  signInLink: {
    color: ACCENT,
    fontWeight: '700',
  },
  welcomeStep: {
    alignItems: 'center',
    gap: 18,
  },
  logoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 9,
    justifyContent: 'center',
    marginBottom: 14,
  },
  logoText: {
    color: ACCENT,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  heroEyebrow: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    fontWeight: '600',
    marginTop: -8,
    textAlign: 'center',
  },
  heroTitle: {
    color: TEXT,
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -1.1,
    lineHeight: 44,
    maxWidth: 340,
    textAlign: 'center',
  },
  heroTitleAccent: {
    color: ACCENT,
  },
  heroSubtitle: {
    color: TEXT_SECONDARY,
    fontSize: 17,
    lineHeight: 25,
    maxWidth: 310,
    textAlign: 'center',
  },
  featureStep: {
    alignItems: 'center',
    gap: 24,
  },
  featureTitle: {
    color: TEXT,
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -0.8,
    lineHeight: 42,
    maxWidth: 340,
    textAlign: 'center',
  },
  featureSubtitle: {
    color: TEXT_SECONDARY,
    fontSize: 17,
    lineHeight: 25,
    maxWidth: 320,
    textAlign: 'center',
  },
  premiumCard: {
    backgroundColor: CARD,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  scheduleCard: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    width: '100%',
  },
  scheduleRow: {
    alignItems: 'center',
    borderBottomColor: BORDER,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 66,
  },
  scheduleRowLast: {
    borderBottomWidth: 0,
  },
  scheduleCompound: {
    color: TEXT,
    fontSize: 17,
    fontWeight: '800',
  },
  scheduleTime: {
    color: ACCENT,
    fontSize: 16,
    fontWeight: '800',
  },
  activeCard: {
    alignItems: 'center',
    height: 220,
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: 20,
    width: '100%',
  },
  activeLine: {
    backgroundColor: ACCENT,
    height: 2,
    left: 20,
    position: 'absolute',
    right: 20,
    top: '30%',
  },
  activeLabel: {
    color: TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.9,
    marginBottom: 10,
  },
  activeValue: {
    color: TEXT,
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -1.5,
    lineHeight: 56,
    marginBottom: 32,
  },
  dayRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  dayLabel: {
    color: TEXT_TERTIARY,
    fontSize: 11,
    fontWeight: '600',
  },
  notificationCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    minHeight: 104,
    padding: 20,
    width: '100%',
  },
  bellCircle: {
    alignItems: 'center',
    borderColor: BORDER,
    borderRadius: 24,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  notificationCopy: {
    flex: 1,
    gap: 5,
  },
  notificationTitle: {
    color: TEXT,
    fontSize: 18,
    fontWeight: '800',
  },
  notificationSubtitle: {
    color: TEXT_SECONDARY,
    fontSize: 16,
    fontWeight: '600',
  },
  copilotCard: {
    gap: 12,
    padding: 18,
    width: '100%',
  },
  chatBubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: '#065F46',
    borderRadius: 14,
    maxWidth: '82%',
    padding: 12,
  },
  chatBubbleUserText: {
    color: CARD,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  chatBubbleAssistant: {
    backgroundColor: '#F8FAFC',
    borderColor: INPUT_BORDER,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
    padding: 12,
  },
  chatBubbleAssistantTitle: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '800',
  },
  chatBubbleAssistantText: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    lineHeight: 17,
  },
  confirmButton: {
    alignItems: 'center',
    backgroundColor: '#065F46',
    borderRadius: 10,
    height: 42,
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: CARD,
    fontSize: 13,
    fontWeight: '800',
  },
  nameStep: {
    alignItems: 'center',
    gap: 18,
  },
  selectionStep: {
    alignItems: 'center',
    gap: 16,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    marginTop: 6,
    width: '100%',
  },
  goalCard: {
    alignItems: 'center',
    backgroundColor: CARD,
    borderColor: INPUT_BORDER,
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: 'row',
    height: 52,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    width: '48%',
  },
  selectableCardSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: ACCENT,
  },
  goalLabel: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '700',
  },
  checkCircle: {
    alignItems: 'center',
    backgroundColor: ACCENT,
    borderRadius: 11,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  checkText: {
    color: CARD,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 18,
  },
  experienceList: {
    gap: 12,
    marginTop: 6,
    width: '100%',
  },
  experienceCard: {
    alignItems: 'center',
    backgroundColor: CARD,
    borderColor: INPUT_BORDER,
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 14,
    padding: 16,
    width: '100%',
  },
  radioCircle: {
    alignItems: 'center',
    borderColor: INPUT_BORDER,
    borderRadius: 11,
    borderWidth: 1.5,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  radioDot: {
    backgroundColor: ACCENT,
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  experienceCopy: {
    flex: 1,
    gap: 4,
  },
  experienceLabel: {
    color: TEXT,
    fontSize: 16,
    fontWeight: '700',
  },
  experienceDesc: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 18,
  },
  nameInput: {
    backgroundColor: CARD,
    borderColor: INPUT_BORDER,
    borderRadius: 14,
    borderWidth: 1.5,
    color: TEXT,
    fontSize: 17,
    height: 56,
    marginTop: 6,
    paddingHorizontal: 18,
    width: '100%',
  },
  nameInputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    alignSelf: 'flex-start',
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
    marginTop: -6,
  },
});
