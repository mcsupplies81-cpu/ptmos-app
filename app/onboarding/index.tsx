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
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

const ACCENT = '#1B4332';
const BACKGROUND = '#F8F8F6';
const TEXT = '#0A0A0F';
const TEXT_SECONDARY = '#6B7280';
const TEXT_TERTIARY = '#9CA3AF';
const BORDER = '#E5E7EB';
const INPUT_BORDER = '#E5E7EB';
const CARD = '#FFFFFF';
const TOTAL_STEPS = 7;

const GOALS = ['Fat loss', 'Muscle gain', 'Recovery', 'Sleep', 'Energy', 'Longevity', 'Research', 'Custom'];

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
  const goals = useOnboardingStore((state) => state.goals);
  const setGoals = useOnboardingStore((state) => state.setGoals);
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
    <SafeAreaView style={[styles.safeArea, step === 5 && styles.goalsSafeArea]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.progressHeader, step === 5 && styles.goalsProgressHeader]}>
          {step > 0 ? (
            <Pressable onPress={goBack} style={[styles.backButton, step === 5 && styles.goalsBackButton]} accessibilityRole="button">
              <Text style={[styles.backButtonText, step === 5 && styles.goalsBackButtonText]}>{step === 5 ? '‹' : '←'}</Text>
            </Pressable>
          ) : (
            <View style={styles.backButtonPlaceholder} />
          )}

          <View style={styles.dots}>
            {Array.from({ length: step === 5 ? 5 : TOTAL_STEPS }, (_, dot) => dot).map((dot) => (
              <View
                key={dot}
                style={[
                  styles.dot,
                  step === 5 && styles.goalsDot,
                  (step === 5 ? dot === 4 : dot === step) && styles.dotActive,
                  step === 5 && dot === 4 && styles.goalsDotActive,
                ]}
              />
            ))}
          </View>

          <View style={styles.backButtonPlaceholder} />
        </View>

        <View style={[styles.content, step === 5 && styles.goalsContent]}>
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

        <View style={[styles.footer, step === 5 && styles.goalsFooter]}>
          <Pressable style={[styles.primaryButton, step === 5 && styles.goalsPrimaryButton]} onPress={goNext} accessibilityRole="button">
            {step === 5 ? (
              <View style={styles.goalsButtonArrowCircle}>
                <Text style={styles.goalsButtonArrow}>→</Text>
              </View>
            ) : null}
            <Text style={[styles.primaryButtonText, step === 5 && styles.goalsPrimaryButtonText]}>{step === 0 ? 'Get started' : 'Next'}</Text>
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
    <View style={styles.goalsStep}>
      <View style={styles.goalsLogoRow}>
        <Svg width={38} height={38} viewBox="0 0 38 38" fill="none">
          <Rect x={8} y={13} width={5} height={16} rx={2.5} fill={ACCENT} />
          <Rect x={17} y={6} width={5} height={25} rx={2.5} fill={ACCENT} />
          <Rect x={26} y={16} width={5} height={18} rx={2.5} fill={ACCENT} />
        </Svg>
        <Text style={styles.goalsLogoText}>PT-OS</Text>
      </View>

      <View style={styles.goalsHeaderCopy}>
        <Text style={styles.goalsTitle}>What are you</Text>
        <Text style={[styles.goalsTitle, styles.goalsTitleAccent]}>focused on?</Text>
        <Text style={styles.goalsSubtitle}>We'll tailor PT-OS around your goals.</Text>
      </View>

      <View style={styles.goalsGrid}>
        {GOALS.map((goal) => {
          const selected = goals.includes(goal);

          return (
            <Pressable
              key={goal}
              onPress={() => onToggleGoal(goal)}
              style={[styles.goalCard, selected && styles.goalCardSelected]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <View style={styles.goalCardTopRow}>
                <View style={styles.goalIconCircle}>
                  <GoalIcon goal={goal} />
                </View>
                <View style={[styles.goalSelectionCircle, selected && styles.goalSelectionCircleSelected]}>
                  {selected ? <Text style={styles.checkText}>✓</Text> : null}
                </View>
              </View>
              <Text style={styles.goalLabel}>{goal}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.goalsInfoCard}>
        <View style={styles.goalsInfoIconCircle}>
          <GoalIcon goal="Fat loss" size={24} />
        </View>
        <View style={styles.goalsInfoCopy}>
          <Text style={styles.goalsInfoTitle}>You can always change this later.</Text>
          <Text style={styles.goalsInfoText}>PT-OS adapts as your goals and protocols evolve.</Text>
        </View>
      </View>

      {goalsError ? <Text style={styles.errorText}>{goalsError}</Text> : null}
    </View>
  );
}

function GoalIcon({ goal, size = 24 }: { goal: string; size?: number }) {
  const common = {
    stroke: ACCENT,
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };

  switch (goal) {
    case 'Fat loss':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx={11} cy={13} r={7} {...common} />
          <Circle cx={11} cy={13} r={3.5} {...common} />
          <Line x1={11} y1={13} x2={20} y2={4} {...common} />
          <Path d="M17 4h3v3" {...common} />
          <Path d="M20 4l-3 3" {...common} />
        </Svg>
      );
    case 'Muscle gain':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M7 14c1-4 2.5-7 5-8l1.2 2.6-1.6 2.2h3.2c2 0 3.7 1.6 3.7 3.7v3H13l-1.4-2.3L9 19H5.5v-3.2c0-1 .6-1.7 1.5-1.8Z" {...common} />
          <Path d="M14 6c.5-1.2 1.5-2 3-2" {...common} />
          <Path d="M18.5 17.5h2" {...common} />
        </Svg>
      );
    case 'Recovery':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M19 9a7 7 0 0 0-12-3l-2 2" {...common} />
          <Path d="M5 4v4h4" {...common} />
          <Path d="M5 15a7 7 0 0 0 12 3l2-2" {...common} />
          <Path d="M19 20v-4h-4" {...common} />
        </Svg>
      );
    case 'Sleep':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M18.5 15.5A8 8 0 0 1 8.5 5.5a8 8 0 1 0 10 10Z" {...common} />
          <Path d="M17 6h3l-3 4h3" {...common} />
          <Path d="M12.5 8h2l-2 3h2" {...common} />
        </Svg>
      );
    case 'Energy':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M13 2 5 13h6l-1 9 8-12h-6l1-8Z" {...common} />
        </Svg>
      );
    case 'Longevity':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M7 3h10" {...common} />
          <Path d="M7 21h10" {...common} />
          <Path d="M8 3v4.5L12 12l4-4.5V3" {...common} />
          <Path d="M8 21v-4.5L12 12l4 4.5V21" {...common} />
          <Path d="M10 7h4" {...common} />
          <Path d="M10 17h4" {...common} />
        </Svg>
      );
    case 'Research':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M9 3h6" {...common} />
          <Path d="M10 3v6l-4.6 8.2A2.6 2.6 0 0 0 7.7 21h8.6a2.6 2.6 0 0 0 2.3-3.8L14 9V3" {...common} />
          <Path d="M8.5 16h7" {...common} />
          <Circle cx={10} cy={18} r={0.8} fill={ACCENT} />
          <Circle cx={14} cy={14.5} r={0.8} fill={ACCENT} />
        </Svg>
      );
    default:
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M4 17.5V21h3.5L18.8 9.7l-3.5-3.5L4 17.5Z" {...common} />
          <Path d="m14 7.5 3.5 3.5" {...common} />
          <Path d="M19.5 8.5 16.5 5.5l1.2-1.2a2 2 0 0 1 2.8 2.8l-1 1.4Z" {...common} />
          <Line x1={4} y1={22} x2={14} y2={22} {...common} />
        </Svg>
      );
  }
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
  goalsSafeArea: {
    backgroundColor: '#F8F8F6',
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
  goalsProgressHeader: {
    paddingTop: 10,
  },
  backButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  goalsBackButton: {
    backgroundColor: CARD,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
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
  goalsBackButtonText: {
    color: ACCENT,
    fontSize: 40,
    fontWeight: '600',
    lineHeight: 42,
    marginTop: -3,
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
  goalsDot: {
    backgroundColor: '#D1D5DB',
    borderRadius: 7,
    height: 14,
    width: 14,
  },
  goalsDotActive: {
    backgroundColor: ACCENT,
    width: 14,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  goalsContent: {
    justifyContent: 'flex-start',
  },
  footer: {
    gap: 14,
    paddingBottom: 28,
    paddingTop: 16,
  },
  goalsFooter: {
    paddingBottom: 18,
    paddingTop: 8,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: ACCENT,
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    width: '100%',
  },
  goalsPrimaryButton: {
    borderRadius: 30,
    height: 60,
    position: 'relative',
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 5,
  },
  goalsButtonArrowCircle: {
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    left: 5,
    position: 'absolute',
    width: 50,
  },
  goalsButtonArrow: {
    color: ACCENT,
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 32,
  },
  primaryButtonText: {
    color: CARD,
    fontSize: 17,
    fontWeight: '700',
  },
  goalsPrimaryButtonText: {
    fontSize: 20,
    fontWeight: '600',
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
  goalsStep: {
    alignItems: 'center',
    flex: 1,
    paddingTop: 26,
    width: '100%',
  },
  goalsLogoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    marginBottom: 18,
  },
  goalsLogoText: {
    color: ACCENT,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
  },
  goalsHeaderCopy: {
    alignItems: 'center',
    marginBottom: 24,
  },
  goalsTitle: {
    color: TEXT,
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -0.6,
    lineHeight: 42,
    textAlign: 'center',
  },
  goalsTitleAccent: {
    color: ACCENT,
  },
  goalsSubtitle: {
    color: TEXT_SECONDARY,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
    textAlign: 'center',
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    width: '100%',
  },
  goalCard: {
    backgroundColor: CARD,
    borderColor: INPUT_BORDER,
    borderRadius: 16,
    borderWidth: 1,
    height: 102,
    justifyContent: 'space-between',
    padding: 16,
    width: '48%',
  },
  goalCardSelected: {
    borderColor: ACCENT,
    borderWidth: 2,
    padding: 15,
  },
  goalCardTopRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalIconCircle: {
    alignItems: 'center',
    backgroundColor: '#F1F3F1',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  goalSelectionCircle: {
    alignItems: 'center',
    borderColor: '#D1D5DB',
    borderRadius: 11,
    borderWidth: 1.5,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  goalSelectionCircleSelected: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  goalLabel: {
    color: TEXT,
    fontSize: 15,
    fontWeight: '600',
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
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 18,
  },
  goalsInfoCard: {
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 14,
    marginTop: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 3,
    width: '100%',
  },
  goalsInfoIconCircle: {
    alignItems: 'center',
    backgroundColor: '#F1F3F1',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  goalsInfoCopy: {
    flex: 1,
    gap: 3,
  },
  goalsInfoTitle: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '800',
  },
  goalsInfoText: {
    color: TEXT_SECONDARY,
    fontSize: 13,
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
