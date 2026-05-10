import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { supabase } from '@/lib/supabase';
import { useProfileStore } from '@/stores/profileStore';

const ACCENT = '#2563EB';
const BACKGROUND = '#FFFFFF';
const TEXT = '#0A0A0F';
const TEXT_SECONDARY = '#6B7280';
const TEXT_TERTIARY = '#9CA3AF';
const BORDER = '#E5E7EB';
const CARD = '#FFFFFF';
const SELECTED_BACKGROUND = '#EFF6FF';
const ERROR = '#DC2626';

const FEATURE_STEPS = 6;

const GOALS = ['Fat loss', 'Recovery', 'Muscle gain', 'Sleep', 'Energy', 'Longevity', 'Research', 'Custom'];

const EXPERIENCE_OPTIONS = [
  { value: 'new', title: 'New', description: "I'm new to peptide tracking and want a guided start." },
  { value: 'intermediate', title: 'Intermediate', description: 'I have some experience and want more flexibility.' },
  { value: 'advanced', title: 'Advanced', description: 'I’m experienced and want full control and customization.' },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [goals, setGoals] = useState<string[]>([]);
  const [experience, setExperience] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isCreateAccountStep = step === 7;

  const goBack = () => {
    setError('');
    setStep((currentStep) => Math.max(currentStep - 1, 0));
  };

  const goNext = () => {
    setError('');

    if (step === 0) {
      setStep(1);
      return;
    }

    if (step === 4 && !name.trim()) {
      setError('Please enter your first name.');
      return;
    }

    if (step === 5 && goals.length === 0) {
      setError('Choose at least one focus area to continue.');
      return;
    }

    if (step === 6 && !experience) {
      setError('Choose your experience level to continue.');
      return;
    }

    setStep((currentStep) => Math.min(currentStep + 1, 7));
  };

  const toggleGoal = (goal: string) => {
    setError('');
    setGoals((currentGoals) =>
      currentGoals.includes(goal) ? currentGoals.filter((item) => item !== goal) : [...currentGoals, goal],
    );
  };

  const handleCreateAccount = async () => {
    if (loading) return;

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setError('Enter your email and password to create your account.');
      return;
    }

    setLoading(true);
    setError('');

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          full_name: trimmedName,
          onboarding_goals: goals,
          onboarding_experience: experience,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const baseProfile = {
        id: data.user.id,
        full_name: trimmedName,
        email: trimmedEmail,
        goal: goals.join(', '),
        disclaimer_accepted: true,
        onboarding_complete: false,
      };

      const { error: profileError } = await supabase.from('profiles').upsert(baseProfile);

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      const { error: metadataError } = await supabase
        .from('profiles')
        .update({ onboarding_goals: goals, onboarding_experience: experience })
        .eq('id', data.user.id);

      if (metadataError) {
        console.warn('[Onboarding] Optional onboarding profile fields were not saved', metadataError.message);
      }

      await useProfileStore.getState().fetchProfile(data.user.id);
    }

    setLoading(false);
    router.push({ pathname: '/onboarding/paywall', params: { name: trimmedName } });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {step > 0 ? (
          <View style={styles.progressHeader}>
            <Pressable onPress={goBack} style={styles.backButton} accessibilityRole="button">
              <Text style={styles.backButtonText}>‹</Text>
            </Pressable>

            <View style={styles.dots}>
              {Array.from({ length: FEATURE_STEPS }).map((_, index) => (
                <View key={index} style={[styles.dot, index === Math.min(step - 1, FEATURE_STEPS - 1) && styles.dotActive]} />
              ))}
            </View>

            <View style={styles.backButtonPlaceholder} />
          </View>
        ) : null}

        <View style={styles.content}>
          {renderStep({
            step,
            name,
            goals,
            experience,
            email,
            password,
            error,
            loading,
            onChangeName: (value) => {
              setName(value);
              if (error) setError('');
            },
            onToggleGoal: toggleGoal,
            onSelectExperience: (value) => {
              setExperience(value);
              if (error) setError('');
            },
            onChangeEmail: setEmail,
            onChangePassword: setPassword,
            onCreateAccount: handleCreateAccount,
          })}
        </View>

        {!isCreateAccountStep ? (
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
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type RenderStepProps = {
  step: number;
  name: string;
  goals: string[];
  experience: string;
  email: string;
  password: string;
  error: string;
  loading: boolean;
  onChangeName: (name: string) => void;
  onToggleGoal: (goal: string) => void;
  onSelectExperience: (experience: string) => void;
  onChangeEmail: (email: string) => void;
  onChangePassword: (password: string) => void;
  onCreateAccount: () => Promise<void>;
};

function renderStep(props: RenderStepProps) {
  switch (props.step) {
    case 0:
      return <WelcomeStep />;
    case 1:
      return <TrackProtocolsStep />;
    case 2:
      return <VisualizeProgressStep />;
    case 3:
      return <ChatCopilotStep />;
    case 4:
      return <NameStep name={props.name} error={props.error} onChangeName={props.onChangeName} />;
    case 5:
      return <GoalsStep selectedGoals={props.goals} error={props.error} onToggleGoal={props.onToggleGoal} />;
    case 6:
      return (
        <ExperienceStep
          selectedExperience={props.experience}
          error={props.error}
          onSelectExperience={props.onSelectExperience}
        />
      );
    case 7:
      return (
        <CreateAccountStep
          name={props.name}
          email={props.email}
          password={props.password}
          error={props.error}
          loading={props.loading}
          onChangeEmail={props.onChangeEmail}
          onChangePassword={props.onChangePassword}
          onCreateAccount={props.onCreateAccount}
        />
      );
    default:
      return null;
  }
}

function LogoRow({ dark = false }: { dark?: boolean }) {
  return (
    <View style={styles.logoRow}>
      <Svg width={25} height={22} viewBox="0 0 25 22" fill="none">
        <Rect x={2} y={8} width={4} height={12} rx={2} fill={ACCENT} />
        <Rect x={9} y={2} width={4} height={18} rx={2} fill={ACCENT} />
        <Rect x={16} y={6} width={4} height={14} rx={2} fill={ACCENT} />
      </Svg>
      <Text style={[styles.logoText, dark && styles.logoTextDark]}>PT-OS</Text>
    </View>
  );
}

function WelcomeStep() {
  return (
    <View style={styles.welcomeStep}>
      <LogoRow dark />
      <View style={styles.vialRow}>
        {['#2563EB', '#22C55E', '#A855F7', '#EC4899', '#F97316'].map((color, index) => (
          <View key={color} style={[styles.vial, { borderColor: color, transform: [{ translateY: index % 2 === 0 ? 0 : -8 }] }]}>
            <View style={[styles.vialCap, { backgroundColor: color }]} />
          </View>
        ))}
      </View>
      <Text style={styles.heroTitle}>Track peptides{`\n`}with <Text style={styles.heroAccent}>clarity.</Text></Text>
      <Text style={styles.heroSubtitle}>Log doses, monitor protocols, and understand your routine in one place.</Text>
    </View>
  );
}

function TrackProtocolsStep() {
  return (
    <FeatureShell title="Track your\nprotocols" subtitle="Log injections, set schedules, and never miss a dose again.">
      <View style={styles.protocolCardStack}>
        {['BPC-157', 'TB-500', 'Retatrutide'].map((compound, index) => (
          <View key={compound} style={[styles.protocolCard, { transform: [{ rotate: `${-3 + index * 2}deg` }] }]}>
            <View style={styles.protocolIcon}>
              <Text style={styles.protocolIconText}>{index === 2 ? '✓' : '◷'}</Text>
            </View>
            <View style={styles.protocolCopy}>
              <Text style={styles.protocolTitle}>{compound}</Text>
              <Text style={styles.protocolSubtitle}>{index === 2 ? '4 mg · 9:00 PM' : index === 1 ? '2 mg · 12:00 PM' : '500 mcg · 8:00 AM'}</Text>
            </View>
            <View style={[styles.logDosePill, index === 2 && styles.loggedPill]}>
              <Text style={[styles.logDoseText, index === 2 && styles.loggedText]}>{index === 2 ? 'Logged' : 'Log Dose'}</Text>
            </View>
          </View>
        ))}
      </View>
    </FeatureShell>
  );
}

function VisualizeProgressStep() {
  return (
    <FeatureShell title="Visualize your\npeptide life" subtitle="See active levels, progress, and your routine at a glance.">
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <View style={styles.vialSmall} />
          <View>
            <Text style={styles.chartTitle}>BPC-157</Text>
            <Text style={styles.chartSubtitle}>500 mcg</Text>
          </View>
          <View style={styles.activePill}><Text style={styles.activePillText}>• Active</Text></View>
        </View>
        <View style={styles.chartBody}>
          <Svg width="100%" height="130" viewBox="0 0 300 130" fill="none">
            <Path d="M8 112 C42 104, 48 34, 90 34 C118 34, 136 56, 162 63 C202 75, 230 84, 292 100" stroke={ACCENT} strokeWidth={3} fill="none" />
            <Circle cx={90} cy={34} r={6} fill={ACCENT} />
          </Svg>
        </View>
      </View>
    </FeatureShell>
  );
}

function ChatCopilotStep() {
  return (
    <FeatureShell title="Chat with your\npeptide copilot" subtitle="Ask questions, log actions, and get guided support in natural language.">
      <View style={styles.chatCard}>
        <View style={styles.chatHeader}>
          <LogoRow dark />
          <Text style={styles.chatStatus}>Always here to help</Text>
        </View>
        <View style={styles.userBubble}><Text style={styles.userBubbleText}>I just took 300 mcg BPC in my right arm.</Text></View>
        <View style={styles.botBubble}><Text style={styles.botBubbleText}>Got it — here’s what I’ll log:</Text></View>
        {['Peptide  BPC-157', 'Dose  300 mcg', 'Site  Right Arm'].map((row) => (
          <Text key={row} style={styles.logPreview}>{row}</Text>
        ))}
        <View style={styles.confirmButton}><Text style={styles.confirmButtonText}>Confirm & Log</Text></View>
      </View>
    </FeatureShell>
  );
}

function NameStep({ name, error, onChangeName }: { name: string; error: string; onChangeName: (name: string) => void }) {
  return (
    <View style={styles.centerStep}>
      <LogoRow dark />
      <Text style={styles.featureTitle}>What’s your{`\n`}first name?</Text>
      <Text style={styles.featureSubtitle}>We’ll use this to personalize your PT-OS experience.</Text>
      <TextInput
        value={name}
        onChangeText={onChangeName}
        placeholder="First name"
        placeholderTextColor={TEXT_TERTIARY}
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType="done"
        style={[styles.input, error ? styles.inputError : null]}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

function GoalsStep({ selectedGoals, error, onToggleGoal }: { selectedGoals: string[]; error: string; onToggleGoal: (goal: string) => void }) {
  return (
    <View style={styles.centerStep}>
      <Text style={styles.featureTitle}>What are you{`\n`}focused on?</Text>
      <Text style={styles.featureSubtitle}>We’ll tailor PT-OS around your goals.</Text>
      <View style={styles.goalList}>
        {GOALS.map((goal) => {
          const selected = selectedGoals.includes(goal);
          return (
            <Pressable key={goal} style={[styles.goalCard, selected && styles.optionSelected]} onPress={() => onToggleGoal(goal)} accessibilityRole="button">
              <Text style={styles.goalIcon}>{goalIcon(goal)}</Text>
              <Text style={styles.goalText}>{goal}</Text>
              <View style={[styles.checkCircle, selected && styles.checkCircleSelected]}>
                {selected ? <Text style={styles.checkText}>✓</Text> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

function ExperienceStep({ selectedExperience, error, onSelectExperience }: { selectedExperience: string; error: string; onSelectExperience: (experience: string) => void }) {
  return (
    <View style={styles.centerStep}>
      <Text style={styles.featureTitle}>How experienced{`\n`}are you?</Text>
      <Text style={styles.featureSubtitle}>This helps us customize your setup and guidance.</Text>
      <View style={styles.experienceList}>
        {EXPERIENCE_OPTIONS.map((option) => {
          const selected = selectedExperience === option.value;
          return (
            <Pressable key={option.value} style={[styles.experienceCard, selected && styles.optionSelected]} onPress={() => onSelectExperience(option.value)} accessibilityRole="button">
              <View style={[styles.radio, selected && styles.radioSelected]}>{selected ? <View style={styles.radioDot} /> : null}</View>
              <View style={styles.experienceCopy}>
                <Text style={styles.experienceTitle}>{option.title}</Text>
                <Text style={styles.experienceDescription}>{option.description}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

function CreateAccountStep({
  name,
  email,
  password,
  error,
  loading,
  onChangeEmail,
  onChangePassword,
  onCreateAccount,
}: {
  name: string;
  email: string;
  password: string;
  error: string;
  loading: boolean;
  onChangeEmail: (email: string) => void;
  onChangePassword: (password: string) => void;
  onCreateAccount: () => Promise<void>;
}) {
  return (
    <ScrollView contentContainerStyle={styles.createAccountContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <LogoRow dark />
      <Text style={styles.featureTitle}>Create your{`\n`}PT-OS account</Text>
      <Text style={styles.featureSubtitle}>Almost done, {name}. Save your protocols, logs, and progress securely.</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={onChangeEmail}
        placeholder="Email"
        placeholderTextColor={TEXT_TERTIARY}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="next"
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={onChangePassword}
        placeholder="Password"
        placeholderTextColor={TEXT_TERTIARY}
        secureTextEntry
        returnKeyType="done"
        onSubmitEditing={() => void onCreateAccount()}
      />
      <Pressable style={[styles.primaryButton, loading && styles.disabledButton]} onPress={() => void onCreateAccount()} disabled={loading} accessibilityRole="button">
        {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Create account</Text>}
      </Pressable>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <Pressable onPress={() => router.push('/(auth)/sign-in')} accessibilityRole="button">
        <Text style={styles.signInText}>Already have an account? <Text style={styles.signInLink}>Sign in</Text></Text>
      </Pressable>
      <Text style={styles.privacyText}>Your protocol data stays private. PT-OS does not sell your health data.</Text>
    </ScrollView>
  );
}

function FeatureShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <View style={styles.featureStep}>
      <LogoRow dark />
      {children}
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureSubtitle}>{subtitle}</Text>
    </View>
  );
}

function goalIcon(goal: string) {
  switch (goal) {
    case 'Fat loss':
      return '♨';
    case 'Recovery':
      return '◒';
    case 'Muscle gain':
      return '⌁';
    case 'Sleep':
      return '☾';
    case 'Energy':
      return '⚡';
    case 'Longevity':
      return '⧖';
    case 'Research':
      return '⌕';
    default:
      return '☷';
  }
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BACKGROUND },
  container: { flex: 1, paddingHorizontal: 24 },
  progressHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    width: 44,
  },
  backButtonPlaceholder: { height: 44, width: 44 },
  backButtonText: { color: ACCENT, fontSize: 28, lineHeight: 30 },
  dots: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  dot: { backgroundColor: '#BFDBFE', borderRadius: 3, height: 6, width: 6 },
  dotActive: { backgroundColor: ACCENT },
  content: { flex: 1, justifyContent: 'center' },
  footer: { paddingBottom: 28, paddingTop: 16 },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: ACCENT,
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    width: '100%',
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  disabledButton: { opacity: 0.72 },
  signInText: { color: TEXT_SECONDARY, fontSize: 14, marginTop: 16, textAlign: 'center' },
  signInLink: { color: ACCENT, fontWeight: '700' },
  logoRow: { alignItems: 'center', flexDirection: 'row', gap: 8, justifyContent: 'center' },
  logoText: { color: ACCENT, fontSize: 18, fontWeight: '900', letterSpacing: 0.4 },
  logoTextDark: { color: TEXT },
  welcomeStep: { alignItems: 'center', gap: 18 },
  vialRow: { alignItems: 'flex-end', flexDirection: 'row', gap: 10, height: 132, marginTop: 30 },
  vial: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 9,
    borderWidth: 2,
    height: 82,
    justifyContent: 'flex-start',
    width: 34,
  },
  vialCap: { borderRadius: 4, height: 12, marginTop: -10, width: 24 },
  heroTitle: {
    color: TEXT,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -0.8,
    lineHeight: 40,
    maxWidth: 320,
    textAlign: 'center',
  },
  heroAccent: { color: ACCENT },
  heroSubtitle: { color: TEXT_SECONDARY, fontSize: 15, lineHeight: 22, maxWidth: 290, textAlign: 'center' },
  featureStep: { alignItems: 'center', gap: 22 },
  centerStep: { alignItems: 'center', gap: 16 },
  featureTitle: {
    color: TEXT,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 35,
    maxWidth: 330,
    textAlign: 'center',
  },
  featureSubtitle: { color: TEXT_SECONDARY, fontSize: 15, lineHeight: 22, maxWidth: 310, textAlign: 'center' },
  protocolCardStack: { gap: 0, marginVertical: 8, width: '100%' },
  protocolCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#DBEAFE',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginTop: -4,
    minHeight: 72,
    padding: 14,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
  },
  protocolIcon: {
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  protocolIconText: { color: '#0F766E', fontSize: 17, fontWeight: '900' },
  protocolCopy: { flex: 1 },
  protocolTitle: { color: TEXT, fontSize: 14, fontWeight: '800' },
  protocolSubtitle: { color: TEXT_SECONDARY, fontSize: 11, marginTop: 4 },
  logDosePill: { backgroundColor: '#064E3B', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  loggedPill: { backgroundColor: '#DCFCE7' },
  logDoseText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  loggedText: { color: '#15803D' },
  chartCard: {
    backgroundColor: CARD,
    borderRadius: 22,
    padding: 18,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    width: '100%',
  },
  chartHeader: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  vialSmall: { backgroundColor: '#DBEAFE', borderColor: ACCENT, borderRadius: 8, borderWidth: 1.5, height: 36, width: 24 },
  chartTitle: { color: TEXT, fontSize: 18, fontWeight: '800' },
  chartSubtitle: { color: ACCENT, fontSize: 12, fontWeight: '700' },
  activePill: { backgroundColor: '#EFF6FF', borderRadius: 999, marginLeft: 'auto', paddingHorizontal: 10, paddingVertical: 6 },
  activePillText: { color: ACCENT, fontSize: 11, fontWeight: '700' },
  chartBody: { marginTop: 10 },
  chatCard: {
    backgroundColor: CARD,
    borderColor: '#DBEAFE',
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    width: '100%',
  },
  chatHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  chatStatus: { color: '#16A34A', fontSize: 10, fontWeight: '700' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#064E3B', borderRadius: 16, maxWidth: '78%', padding: 12 },
  userBubbleText: { color: '#FFFFFF', fontSize: 12, lineHeight: 17 },
  botBubble: { alignSelf: 'flex-start', backgroundColor: '#F8FAFC', borderRadius: 16, marginTop: 12, padding: 12 },
  botBubbleText: { color: TEXT, fontSize: 12, fontWeight: '700' },
  logPreview: { color: TEXT_SECONDARY, fontSize: 12, marginTop: 10 },
  confirmButton: { alignItems: 'center', backgroundColor: '#0F766E', borderRadius: 10, height: 36, justifyContent: 'center', marginTop: 14 },
  confirmButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  input: {
    backgroundColor: CARD,
    borderColor: BORDER,
    borderRadius: 14,
    borderWidth: 1.5,
    color: TEXT,
    fontSize: 16,
    height: 52,
    paddingHorizontal: 16,
    width: '100%',
  },
  inputError: { borderColor: ERROR },
  errorText: { color: ERROR, fontSize: 13, fontWeight: '600', lineHeight: 18, textAlign: 'center' },
  goalList: { gap: 10, width: '100%' },
  goalCard: {
    alignItems: 'center',
    backgroundColor: CARD,
    borderColor: BORDER,
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 12,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  optionSelected: { backgroundColor: SELECTED_BACKGROUND, borderColor: ACCENT },
  goalIcon: { color: ACCENT, fontSize: 18, width: 22 },
  goalText: { color: TEXT, flex: 1, fontSize: 14, fontWeight: '700' },
  checkCircle: {
    alignItems: 'center',
    borderColor: '#D1D5DB',
    borderRadius: 9,
    borderWidth: 1,
    height: 18,
    justifyContent: 'center',
    width: 18,
  },
  checkCircleSelected: { backgroundColor: ACCENT, borderColor: ACCENT },
  checkText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  experienceList: { gap: 12, width: '100%' },
  experienceCard: {
    alignItems: 'center',
    backgroundColor: CARD,
    borderColor: BORDER,
    borderRadius: 16,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 14,
    minHeight: 92,
    padding: 16,
  },
  radio: {
    alignItems: 'center',
    borderColor: '#D1D5DB',
    borderRadius: 10,
    borderWidth: 1.5,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  radioSelected: { borderColor: ACCENT },
  radioDot: { backgroundColor: ACCENT, borderRadius: 5, height: 10, width: 10 },
  experienceCopy: { flex: 1 },
  experienceTitle: { color: TEXT, fontSize: 15, fontWeight: '800' },
  experienceDescription: { color: TEXT_SECONDARY, fontSize: 12, lineHeight: 17, marginTop: 5 },
  createAccountContent: { alignItems: 'center', gap: 14, paddingBottom: 28, paddingTop: 18 },
  privacyText: { color: TEXT_TERTIARY, fontSize: 12, lineHeight: 17, marginTop: 12, textAlign: 'center' },
});
