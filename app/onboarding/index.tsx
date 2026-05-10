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
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

const ACCENT = '#2563EB';
const PRIMARY = '#1B4332';
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
  const storedName = useOnboardingStore((state) => state.name);
  const setName = useOnboardingStore((state) => state.setName);
  const [step, setStep] = useState(0);
  const [name, setNameState] = useState(storedName);
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

      setName(trimmedName);
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

  const isNameStep = step === 4;

  const skipNameStep = () => {
    setNameError('');
    setStep(5);
  };

  return (
    <SafeAreaView style={[styles.safeArea, isNameStep && styles.nameSafeArea]}>
      <KeyboardAvoidingView
        style={[styles.container, isNameStep && styles.nameContainer]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {isNameStep ? (
          <NameStep
            name={name}
            nameError={nameError}
            onBack={goBack}
            onNext={goNext}
            onSkip={skipNameStep}
            onChangeName={(value) => {
              setNameState(value);
              setName(value);
              if (nameError) setNameError('');
            }}
          />
        ) : (
          <>
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
            setNameState,
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
          </>
        )}
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
      return null;
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

function LogoMark({ width = 31, height = 38 }: { width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 31 38" fill="none">
      <Rect x={0} y={12} width={5} height={17} rx={2.5} fill={PRIMARY} />
      <Rect x={9} y={4} width={5} height={27} rx={2.5} fill={PRIMARY} />
      <Rect x={18} y={0} width={5} height={38} rx={2.5} fill={PRIMARY} />
      <Rect x={27} y={10} width={4} height={18} rx={2} fill={PRIMARY} />
    </Svg>
  );
}

function PersonIcon({ size = 24, color = PRIMARY }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={7.5} r={3.5} stroke={color} strokeWidth={2} />
      <Path d="M4.5 20c.7-4 3.3-6.2 7.5-6.2s6.8 2.2 7.5 6.2H4.5Z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
    </Svg>
  );
}

function ArrowRightIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12h13M13 6l6 6-6 6" stroke={PRIMARY} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function NameStep({
  name,
  nameError,
  onBack,
  onNext,
  onSkip,
  onChangeName,
}: {
  name: string;
  nameError: string;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  onChangeName: (name: string) => void;
}) {
  const [isNameInputFocused, setIsNameInputFocused] = useState(true);
  const isDisabled = name.trim().length === 0;

  return (
    <View style={styles.nameScreen}>
      <View style={styles.nameTopNav}>
        <Pressable onPress={onBack} style={styles.nameBackButton} accessibilityRole="button">
          <Text style={styles.nameBackButtonText}>‹</Text>
        </Pressable>

        <View style={styles.nameDots}>
          {Array.from({ length: 5 }, (_, dot) => dot).map((dot) => (
            <View key={dot} style={[styles.nameDot, dot === 4 && styles.nameDotActive]} />
          ))}
        </View>

        <View style={styles.nameNavSpacer} />
      </View>

      <View style={styles.nameIntro}>
        <View style={styles.nameLogoRow}>
          <LogoMark />
          <Text style={styles.nameLogoText}>PT-OS</Text>
        </View>

        <View style={styles.nameHeadlineGroup}>
          <Text style={styles.nameHeadlineDark}>What's your</Text>
          <Text style={styles.nameHeadlineGreen}>first name?</Text>
        </View>

        <Text style={styles.nameSubtext}>We'll use this to personalize your PT-OS experience.</Text>
      </View>

      <View
        style={[
          styles.floatingNameInput,
          isNameInputFocused && styles.floatingNameInputFocused,
          nameError ? styles.nameInputError : null,
        ]}
      >
        <View style={styles.nameFieldCopy}>
          <Text style={styles.floatingNameLabel}>First name</Text>
          <TextInput
            value={name}
            onChangeText={onChangeName}
            onFocus={() => setIsNameInputFocused(true)}
            onBlur={() => setIsNameInputFocused(false)}
            autoFocus
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="next"
            style={styles.floatingNameTextInput}
          />
        </View>
        <PersonIcon size={29} />
      </View>
      {nameError ? <Text style={styles.nameScreenError}>{nameError}</Text> : null}

      <View style={styles.nameScenicBlock}>
        <LinearGradient colors={[BACKGROUND, 'rgba(255,255,255,0.72)', 'rgba(255,255,255,0)']} style={styles.nameScenicGradient} />
        <View style={styles.placeholderSun} />
        <View style={styles.placeholderCliffOne} />
        <View style={styles.placeholderCliffTwo} />
        <View style={styles.placeholderTree} />
        <View style={styles.placeholderMountainOne} />
        <View style={styles.placeholderMountainTwo} />
        <LinearGradient colors={['rgba(255,255,255,0)', BACKGROUND]} style={styles.nameScenicBottomFade} />
      </View>

      <View style={styles.nameBottomContent}>
        <View style={styles.nameInfoCard}>
          <View style={styles.nameInfoIconCircle}>
            <PersonIcon size={25} />
          </View>
          <View style={styles.nameInfoCopy}>
            <Text style={styles.nameInfoTitle}>We keep it personal.</Text>
            <Text style={styles.nameInfoText}>Your name helps us personalize your PT-OS experience.</Text>
          </View>
        </View>

        <Pressable
          onPress={onNext}
          disabled={isDisabled}
          style={[styles.nameNextButton, isDisabled && styles.nameNextButtonDisabled]}
          accessibilityRole="button"
        >
          <View style={styles.nameNextIconCircle}>
            <ArrowRightIcon />
          </View>
          <Text style={styles.nameNextText}>Next</Text>
        </Pressable>

        <Pressable onPress={onSkip} accessibilityRole="button" style={styles.nameSkipButton}>
          <Text style={styles.nameSkipText}>Skip for now</Text>
        </Pressable>
      </View>
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
  nameSafeArea: {
    backgroundColor: '#F8F8F6',
  },
  nameContainer: {
    backgroundColor: BACKGROUND,
    paddingHorizontal: 0,
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

  nameScreen: {
    backgroundColor: BACKGROUND,
    flex: 1,
    overflow: 'hidden',
  },
  nameTopNav: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingTop: 8,
  },
  nameBackButton: {
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
    width: 44,
  },
  nameBackButtonText: {
    color: PRIMARY,
    fontSize: 40,
    fontWeight: '500',
    lineHeight: 42,
    marginTop: -3,
  },
  nameNavSpacer: {
    height: 44,
    width: 44,
  },
  nameDots: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
  nameDot: {
    backgroundColor: '#D1D5DB',
    borderRadius: 7,
    height: 14,
    opacity: 0.9,
    width: 14,
  },
  nameDotActive: {
    backgroundColor: PRIMARY,
    opacity: 1,
  },
  nameIntro: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 69,
    zIndex: 3,
  },
  nameLogoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'center',
    marginBottom: 40,
  },
  nameLogoText: {
    color: PRIMARY,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 4,
  },
  nameHeadlineGroup: {
    alignItems: 'center',
    marginBottom: 20,
  },
  nameHeadlineDark: {
    color: TEXT,
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -0.8,
    lineHeight: 44,
    textAlign: 'center',
  },
  nameHeadlineGreen: {
    color: PRIMARY,
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -0.8,
    lineHeight: 44,
    textAlign: 'center',
  },
  nameSubtext: {
    color: TEXT_SECONDARY,
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 300,
    textAlign: 'center',
  },
  floatingNameInput: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: CARD,
    borderColor: INPUT_BORDER,
    borderRadius: 16,
    borderWidth: 1.5,
    flexDirection: 'row',
    height: 80,
    justifyContent: 'space-between',
    marginTop: 70,
    paddingHorizontal: 16,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    width: '82%',
    zIndex: 4,
  },
  floatingNameInputFocused: {
    borderColor: PRIMARY,
  },
  nameFieldCopy: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 14,
  },
  floatingNameLabel: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 5,
  },
  floatingNameTextInput: {
    color: TEXT,
    fontSize: 20,
    fontWeight: '500',
    height: 38,
    margin: 0,
    padding: 0,
  },
  nameScreenError: {
    alignSelf: 'center',
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
    width: '82%',
    zIndex: 4,
  },
  nameScenicBlock: {
    backgroundColor: '#E8F0EE',
    height: 330,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 475,
    zIndex: 1,
  },
  nameScenicGradient: {
    height: 135,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 5,
  },
  nameScenicBottomFade: {
    bottom: 0,
    height: 80,
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 5,
  },
  placeholderSun: {
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 130,
    height: 260,
    left: -80,
    position: 'absolute',
    top: 0,
    width: 260,
  },
  placeholderMountainOne: {
    backgroundColor: 'rgba(149, 182, 193, 0.42)',
    height: 160,
    left: -38,
    position: 'absolute',
    top: 172,
    transform: [{ rotate: '22deg' }],
    width: 260,
  },
  placeholderMountainTwo: {
    backgroundColor: 'rgba(122, 164, 177, 0.32)',
    height: 190,
    left: 190,
    position: 'absolute',
    top: 150,
    transform: [{ rotate: '-25deg' }],
    width: 290,
  },
  placeholderCliffOne: {
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderTopLeftRadius: 14,
    height: 205,
    position: 'absolute',
    right: 0,
    top: 74,
    width: 170,
  },
  placeholderCliffTwo: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderTopLeftRadius: 18,
    bottom: 20,
    height: 115,
    position: 'absolute',
    right: 90,
    width: 170,
  },
  placeholderTree: {
    backgroundColor: 'rgba(89, 105, 69, 0.34)',
    borderRadius: 42,
    height: 150,
    position: 'absolute',
    right: -25,
    top: 136,
    transform: [{ rotate: '-13deg' }],
    width: 72,
    zIndex: 4,
  },
  nameBottomContent: {
    bottom: 22,
    left: 0,
    paddingHorizontal: 40,
    position: 'absolute',
    right: 0,
    zIndex: 6,
  },
  nameInfoCard: {
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 16,
    marginBottom: 45,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 22,
    elevation: 4,
  },
  nameInfoIconCircle: {
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  nameInfoCopy: {
    flex: 1,
    gap: 5,
  },
  nameInfoTitle: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '800',
  },
  nameInfoText: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 20,
  },
  nameNextButton: {
    alignItems: 'center',
    backgroundColor: PRIMARY,
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    width: '100%',
  },
  nameNextButtonDisabled: {
    opacity: 0.5,
  },
  nameNextIconCircle: {
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    left: 10,
    position: 'absolute',
    width: 48,
  },
  nameNextText: {
    color: CARD,
    fontSize: 20,
    fontWeight: '500',
  },
  nameSkipButton: {
    alignItems: 'center',
    paddingTop: 23,
  },
  nameSkipText: {
    color: PRIMARY,
    fontSize: 17,
    fontWeight: '700',
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
