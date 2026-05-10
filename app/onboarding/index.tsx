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
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

const ACCENT = '#1B4332';
const BACKGROUND = '#F8F8F6';
const TEXT = '#0A0A0F';
const TEXT_SECONDARY = '#6B7280';
const TEXT_TERTIARY = '#9CA3AF';
const BORDER = '#F3F4F6';
const INPUT_BORDER = '#E5E7EB';
const CARD = '#FFFFFF';
const TOTAL_STEPS = 7;
const SHOWCASE_DOTS = 5;
const FEATURE_TRACK_STEP = 1;

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

export default function OnboardingScreen() {
  const router = useRouter();
  const storedName = useOnboardingStore((state) => state.name);
  const setStoredName = useOnboardingStore((state) => state.setName);
  const storeGoals = useOnboardingStore((state) => state.goals);
  const setStoreGoals = useOnboardingStore((state) => state.setGoals);
  const experience = useOnboardingStore((state) => state.experience);
  const setExperience = useOnboardingStore((state) => state.setExperience);

  const [step, setStep] = useState(0);
  const [name, setName] = useState(storedName);
  const [nameError, setNameError] = useState('');
  const [goals, setGoals] = useState<string[]>(storeGoals ?? []);
  const [goalsError, setGoalsError] = useState('');
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

      setStoredName(trimmedName);
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

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        step === 2 && styles.visualizeSafeArea,
        step === 3 && styles.copilotSafeArea,
        isNameStep && styles.nameSafeArea,
        step === 5 && styles.goalsSafeArea,
        step === 6 && styles.experienceSafeArea,
      ]}
    >
      <KeyboardAvoidingView
        style={[styles.container, isNameStep && styles.nameContainer, step === 6 && styles.experienceContainer]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {isNameStep ? (
          <NameStep
            name={name}
            nameError={nameError}
            onBack={goBack}
            onNext={goNext}
            onChangeName={(value) => {
              setName(value);
              setStoredName(value);
              if (nameError) setNameError('');
            }}
          />
        ) : (
          <>
            <View style={styles.progressHeader}>
              {step > 0 ? (
                <Pressable
                  onPress={goBack}
                  style={[
                    styles.backButton,
                    step === 3 && styles.copilotBackButton,
                    step === 5 && styles.goalsBackButton,
                  ]}
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.backButtonText,
                      step === 3 && styles.copilotBackButtonText,
                      step === 5 && styles.goalsBackButtonText,
                    ]}
                  >
                    ‹
                  </Text>
                </Pressable>
              ) : (
                <View style={styles.backButtonPlaceholder} />
              )}

              <View style={styles.dots}>
                {Array.from(
                  { length: step === 2 ? 5 : step === 3 ? 4 : step === 5 ? 5 : step === 6 ? 6 : SHOWCASE_DOTS },
                  (_, dot) => dot,
                ).map((dot) => {
                  const isActive =
                    step === 2
                      ? dot === 0
                      : step === 3
                        ? dot === 3
                        : step === 5
                          ? dot === 4
                          : step === 6
                            ? dot === 5
                            : dot === Math.min(step, SHOWCASE_DOTS - 1);
                  return (
                    <View
                      key={dot}
                      style={[
                        styles.dot,
                        step === 5 && styles.goalsDot,
                        step === 6 && styles.experienceDot,
                        isActive && styles.dotActive,
                      ]}
                    />
                  );
                })}
              </View>

              <View style={styles.backButtonPlaceholder} />
            </View>

            <View
              style={[
                styles.content,
                step === FEATURE_TRACK_STEP && styles.trackDoseContent,
                step === 2 && styles.visualizeContent,
                step === 5 && styles.goalsContent,
                step === 6 && styles.experienceContent,
              ]}
            >
              {renderStep(
                step,
                name,
                setName,
                nameError,
                setNameError,
                goals,
                (nextGoals) => {
                  setGoals(nextGoals);
                  setStoreGoals(nextGoals);
                },
                goalsError,
                setGoalsError,
                experience,
                setExperience,
                experienceError,
                setExperienceError,
              )}
            </View>

            <View
              style={[
                styles.footer,
                step === FEATURE_TRACK_STEP && styles.trackDoseFooter,
                step === 2 && styles.visualizeFooter,
                step === 3 && styles.copilotFooter,
                step === 5 && styles.goalsFooter,
                step === 6 && styles.experienceFooter,
              ]}
            >
              {step === FEATURE_TRACK_STEP ? (
                <Pressable style={styles.trackNextButton} onPress={goNext} accessibilityRole="button">
                  <View style={styles.trackNextIcon}>
                    <Text style={styles.trackNextArrow}>→</Text>
                  </View>
                  <Text style={styles.trackNextText}>Next</Text>
                  <View style={styles.trackNextSpacer} />
                </Pressable>
              ) : step === 2 ? (
                <Pressable style={styles.visualizePrimaryButton} onPress={goNext} accessibilityRole="button">
                  <View style={styles.nextArrowCircle}>
                    <Text style={styles.nextArrow}>→</Text>
                  </View>
                  <Text style={styles.primaryButtonText}>Next</Text>
                </Pressable>
              ) : step === 3 ? (
                <Pressable style={styles.copilotNextButton} onPress={goNext} accessibilityRole="button">
                  <View style={styles.copilotNextArrowCircle}>
                    <Text style={styles.copilotNextArrowText}>→</Text>
                  </View>
                  <Text style={[styles.primaryButtonText, styles.copilotNextButtonText]}>Next</Text>
                </Pressable>
              ) : step === 5 ? (
                <Pressable style={styles.goalsPrimaryButton} onPress={goNext} accessibilityRole="button">
                  <View style={styles.goalsButtonArrowCircle}>
                    <Text style={styles.goalsButtonArrow}>→</Text>
                  </View>
                  <Text style={[styles.primaryButtonText, styles.goalsPrimaryButtonText]}>Next</Text>
                </Pressable>
              ) : step === 6 ? (
                <Pressable style={styles.experienceNextButton} onPress={goNext} accessibilityRole="button">
                  <View style={styles.experienceNextIcon}>
                    <Text style={styles.experienceNextArrow}>→</Text>
                  </View>
                  <Text style={styles.experienceNextText}>Next</Text>
                </Pressable>
              ) : (
                <Pressable style={styles.primaryButton} onPress={goNext} accessibilityRole="button">
                  <Text style={styles.primaryButtonText}>{step === 0 ? 'Get started' : 'Next'}</Text>
                </Pressable>
              )}
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
        <BarLogo />
        <Text style={styles.logoText}>PT-OS</Text>
      </View>
      <Text style={styles.heroEyebrow}>Your peptide operating system</Text>
      <Text style={styles.heroTitle}>
        Track peptides{`\n`}with <Text style={styles.heroTitleAccent}>clarity.</Text>
      </Text>
      <Text style={styles.heroSubtitle}>Log doses, monitor protocols, and understand your routine in one place.</Text>
    </View>
  );
}

function TrackDoseStep() {
  return (
    <View style={styles.trackDoseStep}>
      <View style={styles.protocolCardsSection}>
        <ProtocolCard compound="BPC-157" detail="500 mcg  •  8:00 AM" rotate="-3deg" />
        <ProtocolCard compound="TB-500" detail="2 mg  •  12:00 PM" rotate="-3deg" />
        <ProtocolCard compound="Retatrutide" detail="4 mg  •  9:00 PM" logged rotate="-4deg" />
      </View>

      <View style={styles.trackHeroSection}>
        <View style={styles.santoriniFallback}>
          <LinearGradient
            colors={[BACKGROUND, 'rgba(248, 248, 246, 0.82)', 'rgba(232, 240, 238, 0.28)', '#F8F8F6']}
            locations={[0, 0.24, 0.55, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.seaHorizon} />
          <View style={styles.islandLeft} />
          <View style={styles.islandRight} />
          <View style={styles.terrace} />
          <View style={styles.villaBlockTall} />
          <View style={styles.villaBlockShort} />
        </View>

        <View style={styles.trackHeroCopy}>
          <View style={styles.trackLogoRow}>
            <BarLogo size={32} />
            <Text style={styles.trackLogoText}>PT-OS</Text>
          </View>
          <Text style={styles.trackHeroTitle}>
            <Text style={styles.trackHeroTitleDark}>Track your{`\n`}</Text>
            <Text style={styles.trackHeroTitleGreen}>protocols</Text>
          </Text>
          <Text style={styles.trackHeroSubtitle}>Log injections, set schedules, and never miss a dose again.</Text>
        </View>
      </View>
    </View>
  );
}

function ProtocolCard({
  compound,
  detail,
  logged = false,
  rotate,
}: {
  compound: string;
  detail: string;
  logged?: boolean;
  rotate: string;
}) {
  return (
    <View style={[styles.protocolCard, { transform: [{ rotate }] }]}>
      <View style={[styles.protocolIconRing, logged && styles.protocolIconRingLogged]}>
        <View style={[styles.protocolIconCircle, logged && styles.protocolIconCircleLogged]}>
          {logged ? <Text style={styles.protocolCheck}>✓</Text> : <ClockIcon />}
        </View>
      </View>
      <View style={styles.protocolCopy}>
        <Text style={styles.protocolCompound}>{compound}</Text>
        <Text style={styles.protocolDetail}>{detail}</Text>
      </View>
      <View style={[styles.protocolStatusPill, logged && styles.protocolStatusPillLogged]}>
        <Text style={[styles.protocolStatusText, logged && styles.protocolStatusTextLogged]}>
          {logged ? 'Logged' : 'Log Dose'}
        </Text>
      </View>
    </View>
  );
}

function ClockIcon() {
  return (
    <Svg width={25} height={25} viewBox="0 0 25 25" fill="none">
      <Circle cx={12.5} cy={12.5} r={9} stroke={ACCENT} strokeWidth={2.6} />
      <Path d="M12.5 7.2v5.8l4 2.4" stroke={ACCENT} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function BarLogo({ size = 25 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 25 25" fill="none">
      <Rect x={2} y={10} width={4} height={12} rx={2} fill={ACCENT} />
      <Rect x={10} y={3} width={4} height={19} rx={2} fill={ACCENT} />
      <Rect x={18} y={8} width={4} height={14} rx={2} fill={ACCENT} />
    </Svg>
  );
}

// ── VisualizeDoseStep (case 2) ────────────────────────────────────────────────

function VisualizeDoseStep() {
  return (
    <View style={styles.visualizeStep}>
      <View style={styles.visualizeLogoRow}>
        <Svg width={36} height={42} viewBox="0 0 36 42" fill="none">
          <Rect x={4} y={14} width={7} height={22} rx={3.5} fill={ACCENT} />
          <Rect x={15} y={4} width={7} height={34} rx={3.5} fill={ACCENT} />
          <Rect x={26} y={12} width={6} height={8} rx={3} fill={ACCENT} />
          <Rect x={26} y={24} width={6} height={14} rx={3} fill={ACCENT} />
        </Svg>
        <Text style={styles.visualizeLogoText}>PT-OS</Text>
      </View>

      <View style={styles.visualizeHeadlineBlock}>
        <Text style={styles.visualizeHeadline}>Visualize your</Text>
        <Text style={[styles.visualizeHeadline, styles.visualizeHeadlineAccent]}>peptide life</Text>
        <Text style={styles.visualizeSubtext}>See active levels, progress, and your routine at a glance.</Text>
      </View>

      <View style={[styles.premiumCard, styles.chartCard]}>
        <View style={styles.chartHeader}>
          <View style={styles.vialThumb} />
          <View style={styles.chartHeaderCopy}>
            <Text style={styles.peptideName}>BPC-157</Text>
            <Text style={styles.peptideDose}>500 mcg</Text>
          </View>
          <View style={styles.activeBadge}>
            <View style={styles.activeBadgeDot} />
            <Text style={styles.activeBadgeText}>Active</Text>
          </View>
        </View>

        <View style={styles.chartLabelRow}>
          <Text style={styles.chartTitle}>Estimated Active Level</Text>
          <View style={styles.infoCircle}>
            <Text style={styles.infoText}>i</Text>
          </View>
        </View>

        <View style={styles.chartWrap}>
          <View style={styles.yLabels}>
            {['100%', '75%', '50%', '25%', '0%'].map((label) => (
              <Text key={label} style={styles.axisLabel}>
                {label}
              </Text>
            ))}
          </View>
          <View style={styles.chartPlot}>
            <Svg width="100%" height="100%" viewBox="0 0 280 150" preserveAspectRatio="none">
              {[10, 42.5, 75, 107.5, 140].map((y) => (
                <Line key={y} x1={0} y1={y} x2={280} y2={y} stroke="#F3F4F6" strokeWidth={1} />
              ))}
              <Path
                d="M 0 140 L 40 113 L 80 23 L 120 33 L 160 56 L 200 80 L 240 109 L 280 129 L 280 140 L 0 140 Z"
                fill="rgba(27,67,50,0.08)"
              />
              <Path
                d="M 0 140 L 40 113 L 80 23 L 120 33 L 160 56 L 200 80 L 240 109 L 280 129"
                fill="none"
                stroke={ACCENT}
                strokeWidth={2}
              />
              {[
                [0, 140],
                [40, 113],
                [80, 23],
                [120, 33],
                [160, 56],
                [200, 80],
                [240, 109],
                [280, 129],
              ].map(([cx, cy]) => (
                <Circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={4} fill={ACCENT} />
              ))}
              <Circle cx={80} cy={23} r={9} fill="rgba(27,67,50,0.22)" />
              <Circle cx={80} cy={23} r={5} fill={ACCENT} stroke={CARD} strokeWidth={2} />
            </Svg>
            <View style={styles.tooltip}>
              <Text style={styles.tooltipDay}>Day 2</Text>
              <Text style={styles.tooltipValue}>84%</Text>
              <View style={styles.tooltipPointer} />
            </View>
          </View>
        </View>
        <View style={styles.xLabels}>
          {['Day 0', 'Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'].map((label) => (
            <Text key={label} style={styles.axisLabel}>
              {label}
            </Text>
          ))}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statColumn}>
            <Text style={styles.statIcon}>↗</Text>
            <Text style={styles.statLabel}>Peak</Text>
            <Text style={styles.statValue}>84%</Text>
            <Text style={styles.statUnit}>Day 2</Text>
          </View>
          <View style={[styles.statColumn, styles.statDivider]}>
            <Text style={styles.statIcon}>🕐</Text>
            <Text style={styles.statLabel}>Half-life</Text>
            <Text style={styles.statValue}>27</Text>
            <Text style={styles.statUnit}>hours</Text>
          </View>
          <View style={[styles.statColumn, styles.statDivider]}>
            <Text style={styles.statIcon}>📅</Text>
            <Text style={styles.statLabel}>Duration</Text>
            <Text style={styles.statValue}>6–7</Text>
            <Text style={styles.statUnit}>days</Text>
          </View>
        </View>
      </View>

      <View style={styles.disclaimerCard}>
        <View style={styles.shieldCircle}>
          <Svg width={28} height={28} viewBox="0 0 28 28" fill="none">
            <Path
              d="M14 3 L23 6.5 V13.5 C23 19.2 19.4 23.4 14 25 C8.6 23.4 5 19.2 5 13.5 V6.5 L14 3 Z"
              stroke={ACCENT}
              strokeWidth={2.2}
              fill="none"
            />
            <Path
              d="M9.5 14 L12.5 17 L18.8 10.5"
              stroke={ACCENT}
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
        <View style={styles.disclaimerCopy}>
          <Text style={styles.disclaimerTitle}>For tracking and insights only</Text>
          <Text style={styles.disclaimerText}>
            PT-OS provides visual estimates to help you understand your routine. Not medical advice.
          </Text>
        </View>
      </View>
    </View>
  );
}

// ── ReminderStep (case 3) ─────────────────────────────────────────────────────

function ReminderStep() {
  const detailRows = [
    { label: 'Peptide', value: 'BPC-157' },
    { label: 'Dose', value: '300 mcg' },
    { label: 'Route', value: 'Injection (SubQ)' },
    { label: 'Site', value: 'Right Arm' },
    { label: 'Time', value: 'Today 9:41 AM' },
  ];

  return (
    <View style={styles.copilotStep}>
      <View style={styles.mediterraneanBackground} />
      <View style={styles.copilotLogoBlock}>
        <View style={styles.logoRow}>
          <BarChartLogo color={ACCENT} />
          <Text style={[styles.logoText, styles.copilotLogoText]}>PT-OS</Text>
        </View>
        <Text style={styles.copilotTitle}>
          Chat with your{`\n`}
          <Text style={styles.copilotTitleAccent}>peptide copilot</Text>
        </Text>
        <Text style={styles.copilotSubtitle}>
          Ask questions, log actions, and get guided support in natural language.
        </Text>
      </View>

      <View style={[styles.premiumCard, styles.copilotCard]}>
        <View style={styles.chatBubbleUser}>
          <Text style={styles.chatBubbleUserText}>I just took 300 mcg BPC in my right arm.</Text>
        </View>

        <View style={styles.aiRow}>
          <BarChartLogo color={ACCENT} size="small" />
          <Text style={styles.aiRowText}>Got it — here's what I'll log.</Text>
        </View>

        <View style={styles.logDetailCard}>
          <View style={styles.logDetailHeader}>
            <View style={styles.vialPlaceholder} />
            <Text style={styles.logPeptideName}>BPC-157</Text>
          </View>

          {detailRows.map((row, index) => (
            <View
              key={row.label}
              style={[styles.logDetailRow, index < detailRows.length - 1 && styles.logDetailRowDivider]}
            >
              <DetailRowIcon />
              <Text style={styles.logDetailLabel}>{row.label}</Text>
              <Text style={styles.logDetailValue}>{row.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.confirmButton}>
          <Text style={styles.confirmButtonText}>Confirm & Log</Text>
        </View>

        <View style={styles.fakeInputBar}>
          <Text style={styles.fakeInputPlaceholder}>Ask anything or log a dose...</Text>
          <View style={styles.sendButton}>
            <Text style={styles.sendButtonText}>↑</Text>
          </View>
        </View>
      </View>

      <View style={styles.privacyCard}>
        <ShieldCheckIcon />
        <View style={styles.privacyCopy}>
          <Text style={styles.privacyTitle}>Your data stays private</Text>
          <Text style={styles.privacyBody}>
            Encrypted health logs stay under your control and are never shared without permission.
          </Text>
        </View>
      </View>
    </View>
  );
}

function BarChartLogo({ color, size = 'regular' }: { color: string; size?: 'regular' | 'small' }) {
  const width = size === 'small' ? 19 : 25;
  const height = size === 'small' ? 17 : 22;

  return (
    <Svg width={width} height={height} viewBox="0 0 25 22" fill="none">
      <Rect x={2} y={8} width={4} height={12} rx={2} fill={color} />
      <Rect x={9} y={2} width={4} height={18} rx={2} fill={color} />
      <Rect x={16} y={6} width={4} height={14} rx={2} fill={color} />
    </Svg>
  );
}

function DetailRowIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Circle cx={8} cy={8} r={7} fill={ACCENT} />
      <Path
        d="M5 8.2 7.1 10.3 11.2 5.9"
        stroke="#FFFFFF"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ShieldCheckIcon() {
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28" fill="none">
      <Path d="M14 3.5 23 7.3v6.6c0 5.4-3.7 9.2-9 10.6-5.3-1.4-9-5.2-9-10.6V7.3l9-3.8Z" fill={ACCENT} />
      <Path
        d="M9.4 14.2 12.5 17.3 18.8 10.8"
        stroke="#FFFFFF"
        strokeWidth={2.1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ── NameStep (case 4) ─────────────────────────────────────────────────────────

function LogoMark({ width = 31, height = 38 }: { width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 31 38" fill="none">
      <Rect x={0} y={12} width={5} height={17} rx={2.5} fill={ACCENT} />
      <Rect x={9} y={4} width={5} height={27} rx={2.5} fill={ACCENT} />
      <Rect x={18} y={0} width={5} height={38} rx={2.5} fill={ACCENT} />
      <Rect x={27} y={10} width={4} height={18} rx={2} fill={ACCENT} />
    </Svg>
  );
}

function PersonIcon({ size = 24, color = ACCENT }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={7.5} r={3.5} stroke={color} strokeWidth={2} />
      <Path
        d="M4.5 20c.7-4 3.3-6.2 7.5-6.2s6.8 2.2 7.5 6.2H4.5Z"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ArrowRightIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12h13M13 6l6 6-6 6"
        stroke={ACCENT}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function NameStep({
  name,
  nameError,
  onBack,
  onNext,
  onChangeName,
}: {
  name: string;
  nameError: string;
  onBack: () => void;
  onNext: () => void;
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
        <LinearGradient
          colors={[CARD, 'rgba(255,255,255,0.72)', 'rgba(255,255,255,0)']}
          style={styles.nameScenicGradient}
        />
        <View style={styles.placeholderSun} />
        <View style={styles.placeholderCliffOne} />
        <View style={styles.placeholderCliffTwo} />
        <View style={styles.placeholderTree} />
        <View style={styles.placeholderMountainOne} />
        <View style={styles.placeholderMountainTwo} />
        <LinearGradient colors={['rgba(255,255,255,0)', CARD]} style={styles.nameScenicBottomFade} />
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
      </View>
    </View>
  );
}

// ── GoalsStep (case 5) ────────────────────────────────────────────────────────

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
          <Path
            d="M7 14c1-4 2.5-7 5-8l1.2 2.6-1.6 2.2h3.2c2 0 3.7 1.6 3.7 3.7v3H13l-1.4-2.3L9 19H5.5v-3.2c0-1 .6-1.7 1.5-1.8Z"
            {...common}
          />
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

// ── ExperienceStep (case 6) ───────────────────────────────────────────────────

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
    <View style={styles.experienceStep}>
      <View style={styles.experienceLogoRow}>
        <Svg width={46} height={40} viewBox="0 0 46 40" fill="none">
          <Rect x={3} y={12} width={7} height={24} rx={3.5} fill={ACCENT} />
          <Rect x={17} y={3} width={7} height={34} rx={3.5} fill={ACCENT} />
          <Rect x={31} y={10} width={7} height={26} rx={3.5} fill={ACCENT} />
          <Circle cx={42} cy={17} r={4} fill={ACCENT} />
        </Svg>
        <Text style={styles.experienceLogoText}>PT-OS</Text>
      </View>

      <View style={styles.experienceHeaderCopy}>
        <Text style={styles.experienceTitle}>How experienced</Text>
        <Text style={styles.experienceTitleAccent}>are you?</Text>
        <Text style={styles.experienceSubtitle}>This helps us customize your setup and guidance.</Text>
      </View>

      <View style={styles.experienceList}>
        {EXPERIENCE_LEVELS.map((option) => {
          const selected = experience === option.id;

          return (
            <Pressable
              key={option.id}
              onPress={() => onSelectExperience(option.id)}
              style={[styles.experienceCard, selected && styles.experienceCardSelected]}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <View style={[styles.radioCircle, selected && styles.radioCircleSelected]}>
                {selected ? <View style={styles.radioDot} /> : null}
              </View>
              <View style={styles.experienceCopy}>
                <Text style={styles.experienceLabel}>{option.label}</Text>
                <Text style={styles.experienceDesc}>{option.desc}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      {experienceError ? <Text style={styles.errorText}>{experienceError}</Text> : null}

      <View style={styles.experienceInfoCard}>
        <View style={styles.experienceInfoIconCircle}>
          <Svg width={28} height={28} viewBox="0 0 28 28" fill="none">
            <Path
              d="M14 3.5L23 7.2V13.4C23 19.1 19.2 23.7 14 25.2C8.8 23.7 5 19.1 5 13.4V7.2L14 3.5Z"
              stroke={ACCENT}
              strokeWidth={2.3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M10 14.1L12.8 16.9L18.5 11.2"
              stroke={ACCENT}
              strokeWidth={2.3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
        <View style={styles.experienceInfoCopy}>
          <Text style={styles.experienceInfoTitle}>We adapt to you.</Text>
          <Text style={styles.experienceInfoText}>You can always update this later in your settings.</Text>
        </View>
      </View>
    </View>
  );
}

// ── Shared shell ──────────────────────────────────────────────────────────────

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
  visualizeSafeArea: {
    backgroundColor: '#F8F8F6',
  },
  copilotSafeArea: {
    backgroundColor: '#F8F8F6',
  },
  nameSafeArea: {
    backgroundColor: '#F8F8F6',
  },
  goalsSafeArea: {
    backgroundColor: '#F8F8F6',
  },
  experienceSafeArea: {
    backgroundColor: '#F8F8F6',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  nameContainer: {
    backgroundColor: CARD,
    paddingHorizontal: 0,
  },
  experienceContainer: {
    paddingHorizontal: 32,
  },
  progressHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 58,
    paddingTop: 12,
    position: 'relative',
    zIndex: 3,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
    width: 44,
  },
  copilotBackButton: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  goalsBackButton: {
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
    color: ACCENT,
    fontSize: 42,
    fontWeight: '500',
    lineHeight: 42,
    marginTop: -3,
  },
  copilotBackButtonText: {
    color: ACCENT,
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 34,
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
    gap: 16,
    left: 0,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    top: 30,
  },
  dot: {
    backgroundColor: '#D1D5DB',
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  dotActive: {
    backgroundColor: ACCENT,
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
  experienceDot: {
    backgroundColor: '#D1D5DB',
    height: 8,
    width: 8,
  },
  experienceDotActive: {
    backgroundColor: ACCENT,
    width: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  trackDoseContent: {
    justifyContent: 'flex-start',
    marginHorizontal: -24,
  },
  visualizeContent: {
    justifyContent: 'flex-start',
    paddingTop: 28,
  },
  goalsContent: {
    justifyContent: 'flex-start',
  },
  experienceContent: {
    justifyContent: 'flex-start',
  },
  footer: {
    gap: 14,
    paddingBottom: 28,
    paddingTop: 16,
  },
  trackDoseFooter: {
    paddingTop: 10,
  },
  visualizeFooter: {
    gap: 18,
    paddingTop: 18,
  },
  copilotFooter: {
    paddingTop: 12,
  },
  goalsFooter: {
    paddingBottom: 18,
    paddingTop: 8,
  },
  experienceFooter: {
    paddingBottom: 28,
    paddingTop: 12,
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
  // ── VisualizeDoseStep button ──
  visualizePrimaryButton: {
    alignItems: 'center',
    backgroundColor: ACCENT,
    borderRadius: 30,
    flexDirection: 'row',
    height: 60,
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
  },
  nextArrowCircle: {
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    left: 6,
    position: 'absolute',
    width: 50,
  },
  nextArrow: {
    color: ACCENT,
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 32,
  },
  // ── ReminderStep button ──
  copilotNextButton: {
    alignItems: 'center',
    backgroundColor: ACCENT,
    borderRadius: 28,
    flexDirection: 'row',
    height: 56,
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
  },
  copilotNextArrowCircle: {
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    left: 8,
    position: 'absolute',
    width: 40,
  },
  copilotNextArrowText: {
    color: ACCENT,
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 24,
  },
  copilotNextButtonText: {
    fontSize: 18,
    fontWeight: '800',
  },
  // ── GoalsStep button ──
  goalsPrimaryButton: {
    alignItems: 'center',
    backgroundColor: ACCENT,
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    position: 'relative',
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 5,
    width: '100%',
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
  goalsPrimaryButtonText: {
    fontSize: 20,
    fontWeight: '600',
  },
  // ── ExperienceStep button ──
  experienceNextButton: {
    alignItems: 'center',
    backgroundColor: ACCENT,
    borderRadius: 30,
    flexDirection: 'row',
    height: 60,
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
  },
  experienceNextIcon: {
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    left: 6,
    position: 'absolute',
    width: 48,
  },
  experienceNextArrow: {
    color: ACCENT,
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 32,
  },
  experienceNextText: {
    color: CARD,
    fontSize: 20,
    fontWeight: '500',
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
  // ── WelcomeStep ──
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
  // ── TrackDoseStep ──
  trackDoseStep: {
    flex: 1,
  },
  protocolCardsSection: {
    gap: 16,
    paddingHorizontal: 34,
    paddingTop: 42,
    zIndex: 2,
  },
  protocolCard: {
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 15,
    minHeight: 92,
    paddingHorizontal: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 6,
    width: '100%',
  },
  protocolIconRing: {
    alignItems: 'center',
    backgroundColor: '#E8EFEC',
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    width: 60,
  },
  protocolIconRingLogged: {
    backgroundColor: '#DFE9E4',
  },
  protocolIconCircle: {
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 23,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  protocolIconCircleLogged: {
    backgroundColor: ACCENT,
  },
  protocolCheck: {
    color: CARD,
    fontSize: 34,
    fontWeight: '500',
    lineHeight: 38,
  },
  protocolCopy: {
    flex: 1,
    gap: 5,
  },
  protocolCompound: {
    color: '#080F22',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  protocolDetail: {
    color: TEXT_SECONDARY,
    fontSize: 17,
    fontWeight: '500',
  },
  protocolStatusPill: {
    alignItems: 'center',
    backgroundColor: ACCENT,
    borderRadius: 18,
    height: 50,
    justifyContent: 'center',
    minWidth: 118,
    paddingHorizontal: 19,
  },
  protocolStatusPillLogged: {
    backgroundColor: '#D1FAE5',
  },
  protocolStatusText: {
    color: CARD,
    fontSize: 16,
    fontWeight: '700',
  },
  protocolStatusTextLogged: {
    color: ACCENT,
  },
  trackHeroSection: {
    flex: 1,
    marginTop: -12,
    minHeight: 360,
    overflow: 'hidden',
  },
  santoriniFallback: {
    backgroundColor: '#E8F0EE',
    height: 360,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  seaHorizon: {
    backgroundColor: '#B9D7EA',
    height: 142,
    left: 0,
    opacity: 0.75,
    position: 'absolute',
    right: 0,
    top: 154,
  },
  islandLeft: {
    backgroundColor: '#9AB8C9',
    borderTopLeftRadius: 90,
    borderTopRightRadius: 120,
    height: 40,
    left: 28,
    opacity: 0.45,
    position: 'absolute',
    top: 218,
    width: 132,
  },
  islandRight: {
    backgroundColor: '#7D9CAA',
    borderTopLeftRadius: 150,
    borderTopRightRadius: 120,
    height: 62,
    opacity: 0.48,
    position: 'absolute',
    right: 8,
    top: 190,
    width: 178,
  },
  terrace: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    bottom: 0,
    height: 98,
    left: -18,
    position: 'absolute',
    right: -18,
    transform: [{ rotate: '-4deg' }],
  },
  villaBlockTall: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 4,
    height: 98,
    position: 'absolute',
    right: 0,
    top: 160,
    width: 56,
  },
  villaBlockShort: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 4,
    height: 68,
    position: 'absolute',
    right: 46,
    top: 204,
    width: 48,
  },
  trackHeroCopy: {
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 230,
  },
  trackLogoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'center',
    marginBottom: 26,
  },
  trackLogoText: {
    color: ACCENT,
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: 4,
  },
  trackHeroTitle: {
    fontSize: 44,
    fontWeight: '800',
    letterSpacing: -1.25,
    lineHeight: 47,
    textAlign: 'center',
  },
  trackHeroTitleDark: {
    color: TEXT,
  },
  trackHeroTitleGreen: {
    color: ACCENT,
  },
  trackHeroSubtitle: {
    color: TEXT_SECONDARY,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 14,
    maxWidth: 305,
    textAlign: 'center',
  },
  trackNextButton: {
    alignItems: 'center',
    backgroundColor: ACCENT,
    borderRadius: 30,
    flexDirection: 'row',
    height: 60,
    paddingHorizontal: 8,
    width: '100%',
  },
  trackNextIcon: {
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  trackNextArrow: {
    color: ACCENT,
    fontSize: 32,
    fontWeight: '500',
    lineHeight: 34,
  },
  trackNextText: {
    color: CARD,
    flex: 1,
    fontSize: 22,
    fontWeight: '600',
    marginLeft: 44,
    textAlign: 'center',
  },
  trackNextSpacer: {
    width: 44,
  },
  // ── FeatureShell ──
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
  // ── VisualizeDoseStep ──
  visualizeStep: {
    alignItems: 'center',
    gap: 14,
    width: '100%',
  },
  visualizeLogoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  visualizeLogoText: {
    color: ACCENT,
    fontSize: 29,
    fontWeight: '900',
    letterSpacing: 3,
  },
  visualizeHeadlineBlock: {
    alignItems: 'center',
    gap: 2,
  },
  visualizeHeadline: {
    color: TEXT,
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1.2,
    lineHeight: 43,
    textAlign: 'center',
  },
  visualizeHeadlineAccent: {
    color: ACCENT,
  },
  visualizeSubtext: {
    color: TEXT_SECONDARY,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    maxWidth: 290,
    textAlign: 'center',
  },
  chartCard: {
    borderRadius: 20,
    padding: 20,
    width: '100%',
  },
  chartHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  vialThumb: {
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    height: 60,
    width: 40,
  },
  chartHeaderCopy: {
    flex: 1,
    gap: 4,
  },
  peptideName: {
    color: TEXT,
    fontSize: 18,
    fontWeight: '800',
  },
  peptideDose: {
    color: TEXT_SECONDARY,
    fontSize: 15,
    fontWeight: '600',
  },
  activeBadge: {
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  activeBadgeDot: {
    backgroundColor: ACCENT,
    borderRadius: 5,
    height: 9,
    width: 9,
  },
  activeBadgeText: {
    color: ACCENT,
    fontSize: 14,
    fontWeight: '700',
  },
  chartLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
  },
  chartTitle: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '800',
  },
  infoCircle: {
    alignItems: 'center',
    borderColor: '#D1D5DB',
    borderRadius: 9,
    borderWidth: 1,
    height: 18,
    justifyContent: 'center',
    width: 18,
  },
  infoText: {
    color: TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
  },
  chartWrap: {
    flexDirection: 'row',
    gap: 10,
    height: 150,
    marginTop: 14,
  },
  yLabels: {
    justifyContent: 'space-between',
    paddingVertical: 2,
    width: 42,
  },
  chartPlot: {
    flex: 1,
    position: 'relative',
  },
  axisLabel: {
    color: TEXT_SECONDARY,
    fontSize: 10,
    fontWeight: '500',
  },
  xLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 52,
    marginTop: 8,
  },
  tooltip: {
    backgroundColor: CARD,
    borderRadius: 10,
    elevation: 5,
    left: '20%',
    paddingHorizontal: 12,
    paddingVertical: 9,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 9,
    top: -12,
  },
  tooltipDay: {
    color: TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: '600',
  },
  tooltipValue: {
    color: TEXT,
    fontSize: 16,
    fontWeight: '900',
  },
  tooltipPointer: {
    alignSelf: 'center',
    borderLeftColor: 'transparent',
    borderLeftWidth: 6,
    borderRightColor: 'transparent',
    borderRightWidth: 6,
    borderTopColor: CARD,
    borderTopWidth: 7,
    bottom: -7,
    height: 0,
    position: 'absolute',
    width: 0,
  },
  statsRow: {
    borderTopColor: BORDER,
    borderTopWidth: 1,
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
  },
  statColumn: {
    alignItems: 'center',
    flex: 1,
    gap: 3,
  },
  statDivider: {
    borderLeftColor: INPUT_BORDER,
    borderLeftWidth: 1,
  },
  statIcon: {
    color: ACCENT,
    fontSize: 20,
    fontWeight: '900',
  },
  statLabel: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    color: TEXT,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 24,
  },
  statUnit: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    fontWeight: '500',
  },
  disclaimerCard: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderColor: INPUT_BORDER,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 16,
    width: '100%',
  },
  shieldCircle: {
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  disclaimerCopy: {
    flex: 1,
    gap: 3,
  },
  disclaimerTitle: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '800',
  },
  disclaimerText: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 18,
  },
  // ── ReminderStep (copilot) ──
  copilotStep: {
    alignItems: 'center',
    gap: 16,
  },
  mediterraneanBackground: {
    backgroundColor: '#E8F0EE',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    height: 210,
    left: -24,
    position: 'absolute',
    right: -24,
    top: -28,
  },
  copilotLogoBlock: {
    alignItems: 'center',
    gap: 10,
    paddingTop: 4,
  },
  copilotLogoText: {
    color: ACCENT,
  },
  copilotTitle: {
    color: TEXT,
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 43,
    textAlign: 'center',
  },
  copilotTitleAccent: {
    color: ACCENT,
  },
  copilotSubtitle: {
    color: TEXT_SECONDARY,
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 320,
    textAlign: 'center',
  },
  copilotCard: {
    borderRadius: 20,
    gap: 12,
    padding: 20,
    width: '100%',
  },
  chatBubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: ACCENT,
    borderRadius: 999,
    maxWidth: '88%',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  chatBubbleUserText: {
    color: CARD,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  aiRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  aiRowText: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '800',
  },
  logDetailCard: {
    borderColor: INPUT_BORDER,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  logDetailHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  vialPlaceholder: {
    backgroundColor: '#D1D5DB',
    borderRadius: 6,
    height: 44,
    width: 30,
  },
  logPeptideName: {
    color: ACCENT,
    fontSize: 17,
    fontWeight: '800',
  },
  logDetailRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minHeight: 34,
  },
  logDetailRowDivider: {
    borderBottomColor: INPUT_BORDER,
    borderBottomWidth: 1,
  },
  logDetailLabel: {
    color: TEXT_SECONDARY,
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  logDetailValue: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'right',
  },
  confirmButton: {
    alignItems: 'center',
    backgroundColor: ACCENT,
    borderRadius: 10,
    height: 44,
    justifyContent: 'center',
    width: '100%',
  },
  confirmButtonText: {
    color: CARD,
    fontSize: 14,
    fontWeight: '800',
  },
  fakeInputBar: {
    alignItems: 'center',
    backgroundColor: BORDER,
    borderRadius: 14,
    flexDirection: 'row',
    height: 48,
    justifyContent: 'space-between',
    paddingLeft: 14,
    paddingRight: 6,
  },
  fakeInputPlaceholder: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    fontWeight: '600',
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: ACCENT,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  sendButtonText: {
    color: CARD,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 20,
  },
  privacyCard: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    width: '100%',
  },
  privacyCopy: {
    flex: 1,
    gap: 3,
  },
  privacyTitle: {
    color: TEXT,
    fontSize: 15,
    fontWeight: '800',
  },
  privacyBody: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  // ── NameStep ──
  nameScreen: {
    backgroundColor: CARD,
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
    color: ACCENT,
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
    backgroundColor: ACCENT,
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
    color: ACCENT,
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
    color: ACCENT,
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
    borderColor: ACCENT,
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
    backgroundColor: ACCENT,
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    shadowColor: ACCENT,
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
  // ── GoalsStep ──
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
  // ── ExperienceStep ──
  experienceStep: {
    alignItems: 'center',
    flex: 1,
    paddingTop: 42,
    width: '100%',
  },
  experienceLogoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 13,
    justifyContent: 'center',
    marginBottom: 34,
  },
  experienceLogoText: {
    color: ACCENT,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 3,
  },
  experienceHeaderCopy: {
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  experienceTitle: {
    color: TEXT,
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -0.9,
    lineHeight: 42,
    textAlign: 'center',
  },
  experienceTitleAccent: {
    color: ACCENT,
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -0.9,
    lineHeight: 42,
    textAlign: 'center',
  },
  experienceSubtitle: {
    color: TEXT_SECONDARY,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 16,
    maxWidth: 270,
    textAlign: 'center',
  },
  experienceList: {
    gap: 12,
    width: '100%',
  },
  experienceCard: {
    alignItems: 'flex-start',
    backgroundColor: CARD,
    borderColor: 'transparent',
    borderRadius: 16,
    borderWidth: 2,
    flexDirection: 'row',
    gap: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    width: '100%',
    elevation: 2,
  },
  experienceCardSelected: {
    backgroundColor: CARD,
    borderColor: ACCENT,
  },
  radioCircle: {
    alignItems: 'center',
    borderColor: '#D1D5DB',
    borderRadius: 12,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    marginTop: 2,
    width: 24,
  },
  radioCircleSelected: {
    borderColor: ACCENT,
  },
  radioDot: {
    backgroundColor: ACCENT,
    borderRadius: 6,
    height: 12,
    width: 12,
  },
  experienceCopy: {
    flex: 1,
  },
  experienceLabel: {
    color: TEXT,
    fontSize: 16,
    fontWeight: '800',
  },
  experienceDesc: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  experienceInfoCard: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 14,
    marginTop: 20,
    padding: 16,
    width: '100%',
  },
  experienceInfoIconCircle: {
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  experienceInfoCopy: {
    flex: 1,
  },
  experienceInfoTitle: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '800',
  },
  experienceInfoText: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
  },
  // ── Shared ──
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
