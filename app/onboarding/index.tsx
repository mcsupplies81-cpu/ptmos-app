import { router, useRouter } from "expo-router";
import { useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Svg, { Circle, Line, Path, Rect } from "react-native-svg";

import { supabase } from "@/lib/supabase";

const ACCENT = "#2563EB";
const BACKGROUND = "#FFFFFF";
const TEXT = "#0A0A0F";
const TEXT_SECONDARY = "#6B7280";
const TEXT_TERTIARY = "#9CA3AF";
const BORDER = "#F3F4F6";
const INPUT_BORDER = "#E5E7EB";
const CARD = "#FFFFFF";

const SCHEDULE_ROWS = [
  { compound: "BPC-157", time: "9:00 AM" },
  { compound: "TB-500", time: "1:00 PM" },
  { compound: "Retatrutide", time: "8:00 PM" },
];

const DAYS = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"];

const GOAL_OPTIONS = [
  "Fat loss",
  "Recovery",
  "Muscle gain",
  "Sleep",
  "Energy",
  "Longevity",
  "Research",
  "Custom",
];
const EXPERIENCE_OPTIONS = [
  {
    value: "New",
    description: "I'm new to peptide tracking and want a guided start.",
  },
  {
    value: "Intermediate",
    description: "I have some experience and want more flexibility.",
  },
  {
    value: "Advanced",
    description: "I'm experienced and want full control and customization.",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [experience, setExperience] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nameError, setNameError] = useState("");
  const [goalsError, setGoalsError] = useState("");
  const [experienceError, setExperienceError] = useState("");
  const [accountError, setAccountError] = useState("");
  const [creatingAccount, setCreatingAccount] = useState(false);

  const clearErrors = () => {
    setNameError("");
    setGoalsError("");
    setExperienceError("");
    setAccountError("");
  };

  const goBack = () => {
    clearErrors();
    setStep((currentStep) => Math.max(currentStep - 1, 0));
  };

  const toggleGoal = (goal: string) => {
    setGoalsError("");
    setSelectedGoals((currentGoals) =>
      currentGoals.includes(goal)
        ? currentGoals.filter((currentGoal) => currentGoal !== goal)
        : [...currentGoals, goal],
    );
  };

  const createAccount = async () => {
    if (creatingAccount) return;

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setAccountError("Please enter your email and password.");
      return;
    }

    setCreatingAccount(true);
    setAccountError("");

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          full_name: trimmedName,
          first_name: trimmedName,
          goals: selectedGoals,
          experience,
        },
      },
    });

    if (signUpError) {
      setAccountError(signUpError.message);
      setCreatingAccount(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: trimmedName,
        goal: selectedGoals.join(", "),
        goals: selectedGoals,
        experience,
        onboarding_complete: false,
      });

      if (profileError) {
        setAccountError(profileError.message);
        setCreatingAccount(false);
        return;
      }
    }

    setCreatingAccount(false);
    router.push({
      pathname: "/onboarding/paywall",
      params: { name: trimmedName },
    });
  };

  const goNext = () => {
    if (step === 4) {
      const trimmedName = name.trim();

      if (!trimmedName) {
        setNameError("Please enter your first name.");
        return;
      }
    }

    if (step === 5 && selectedGoals.length === 0) {
      setGoalsError("Choose at least one focus area.");
      return;
    }

    if (step === 6 && !experience) {
      setExperienceError("Choose your experience level.");
      return;
    }

    if (step === 7) {
      void createAccount();
      return;
    }

    clearErrors();
    setStep((currentStep) => Math.min(currentStep + 1, 7));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.progressHeader}>
          {step > 0 ? (
            <Pressable
              onPress={goBack}
              style={styles.backButton}
              accessibilityRole="button"
            >
              <Text style={styles.backButtonText}>←</Text>
            </Pressable>
          ) : (
            <View style={styles.backButtonPlaceholder} />
          )}

          <View style={styles.dots}>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((dot) => (
              <View
                key={dot}
                style={[styles.dot, dot === step && styles.dotActive]}
              />
            ))}
          </View>

          <View style={styles.backButtonPlaceholder} />
        </View>

        <View style={styles.content}>
          {renderStep({
            step,
            name,
            setName,
            nameError,
            setNameError,
            selectedGoals,
            toggleGoal,
            goalsError,
            experience,
            setExperience,
            experienceError,
            setExperienceError,
            email,
            setEmail,
            password,
            setPassword,
            accountError,
          })}
        </View>

        <View style={styles.footer}>
          <Pressable
            style={styles.primaryButton}
            onPress={goNext}
            accessibilityRole="button"
          >
            {creatingAccount ? (
              <ActivityIndicator color={CARD} />
            ) : (
              <Text style={styles.primaryButtonText}>
                {step === 0
                  ? "Get started"
                  : step === 7
                    ? "Create account"
                    : "Next"}
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type RenderStepProps = {
  step: number;
  name: string;
  setName: (name: string) => void;
  nameError: string;
  setNameError: (error: string) => void;
  selectedGoals: string[];
  toggleGoal: (goal: string) => void;
  goalsError: string;
  experience: string;
  setExperience: (experience: string) => void;
  experienceError: string;
  setExperienceError: (error: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  accountError: string;
};

function renderStep({
  step,
  name,
  setName,
  nameError,
  setNameError,
  selectedGoals,
  toggleGoal,
  goalsError,
  experience,
  setExperience,
  experienceError,
  setExperienceError,
  email,
  setEmail,
  password,
  setPassword,
  accountError,
}: RenderStepProps) {
  switch (step) {
    case 0:
      return <WelcomeStep />;
    case 1:
      return <TrackDoseStep />;
    case 2:
      return <VisualizeDoseStep />;
    case 3:
      return <ChatCopilotStep />;
    case 4:
      return (
        <NameStep
          name={name}
          nameError={nameError}
          onChangeName={(value) => {
            setName(value);
            if (nameError) setNameError("");
          }}
        />
      );
    case 5:
      return (
        <GoalsStep
          selectedGoals={selectedGoals}
          onToggleGoal={toggleGoal}
          error={goalsError}
        />
      );
    case 6:
      return (
        <ExperienceStep
          experience={experience}
          experienceError={experienceError}
          onSelectExperience={(value) => {
            setExperience(value);
            if (experienceError) setExperienceError("");
          }}
        />
      );
    case 7:
      return (
        <CreateAccountStep
          email={email}
          password={password}
          accountError={accountError}
          onChangeEmail={setEmail}
          onChangePassword={setPassword}
        />
      );
    default:
      return null;
  }
}

function WelcomeStep() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        marginHorizontal: -24,
        paddingHorizontal: 28,
      }}
    >
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <View style={{ alignItems: "center" }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              justifyContent: "center",
            }}
          >
            <Svg width={18} height={22} viewBox="0 0 18 22" fill="none">
              <Rect x={0} y={10} width={4} height={12} rx={2} fill="#2563EB" />
              <Rect x={7} y={4} width={4} height={18} rx={2} fill="#2563EB" />
              <Rect x={14} y={8} width={4} height={14} rx={2} fill="#2563EB" />
            </Svg>
            <Text style={{ color: "#2563EB", fontSize: 18, fontWeight: "900" }}>
              PT-OS
            </Text>
          </View>

          <Text
            style={{
              color: "#6B7280",
              fontSize: 13,
              marginTop: 6,
              textAlign: "center",
            }}
          >
            Your peptide operating system
          </Text>
        </View>

        <Text
          style={{
            color: "#0A0A0F",
            fontSize: 40,
            fontWeight: "900",
            lineHeight: 46,
            marginTop: 40,
            textAlign: "center",
          }}
        >
          Track peptides{`\n`}with{" "}
          <Text style={{ color: "#2563EB" }}>clarity.</Text>
        </Text>

        <Text
          style={{
            color: "#6B7280",
            fontSize: 16,
            lineHeight: 24,
            marginTop: 16,
            maxWidth: 320,
            textAlign: "center",
          }}
        >
          Log doses, monitor protocols, and understand your routine in one
          place.
        </Text>

        <View
          style={{
            alignItems: "center",
            backgroundColor: "#F0F6FF",
            borderRadius: 24,
            height: 200,
            justifyContent: "center",
            marginBottom: 40,
            marginTop: 40,
            width: "100%",
          }}
        >
          <Text style={{ fontSize: 64 }}>🧪</Text>
        </View>
      </View>

      <Pressable
        onPress={() => router.push("/(auth)/sign-in")}
        accessibilityRole="button"
      >
        <Text style={{ color: "#6B7280", fontSize: 14, textAlign: "center" }}>
          Already have an account?{" "}
          <Text style={{ color: "#2563EB", fontWeight: "700" }}>Sign in</Text>
        </Text>
      </Pressable>
    </View>
  );
}

function TrackDoseStep() {
  return (
    <FeatureShell
      title="Track every dose."
      subtitle="Track protocols, log doses, and stay consistent."
    >
      <View style={[styles.premiumCard, styles.scheduleCard]}>
        {SCHEDULE_ROWS.map((row, index) => (
          <View
            key={row.compound}
            style={[
              styles.scheduleRow,
              index === SCHEDULE_ROWS.length - 1 && styles.scheduleRowLast,
            ]}
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
    <FeatureShell
      title="See what's active."
      subtitle="Understand estimated active levels at a glance."
    >
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

function ChatCopilotStep() {
  return (
    <FeatureShell
      title={<>Chat with your{`\n`}peptide copilot</>}
      subtitle="Ask questions, log actions, and get guided support in natural language."
    >
      <View style={[styles.premiumCard, styles.chatCard]}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatLogo}>PT</Text>
          <View>
            <Text style={styles.chatTitle}>PT-OS Copilot</Text>
            <Text style={styles.chatStatus}>Always here to help</Text>
          </View>
        </View>
        <View style={styles.chatBubbleUser}>
          <Text style={styles.chatBubbleUserText}>
            I just took 300 mcg BPC in my right arm.
          </Text>
        </View>
        <View style={styles.chatBubbleBot}>
          <Text style={styles.chatBubbleBotText}>
            Got it — here's what I'll log.
          </Text>
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
      <Text style={styles.featureSubtitle}>
        We'll personalize your experience.
      </Text>
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
  selectedGoals,
  onToggleGoal,
  error,
}: {
  selectedGoals: string[];
  onToggleGoal: (goal: string) => void;
  error: string;
}) {
  return (
    <View style={styles.goalsStep}>
      <Text style={styles.featureTitle}>
        What are you
        {`
`}
        focused on?
      </Text>
      <Text style={styles.featureSubtitle}>
        We'll tailor PT-OS around your goals.
      </Text>
      <ScrollView
        style={styles.goalsScroll}
        contentContainerStyle={styles.goalsList}
        showsVerticalScrollIndicator={false}
      >
        {GOAL_OPTIONS.map((goal) => {
          const selected = selectedGoals.includes(goal);
          return (
            <Pressable
              key={goal}
              style={[styles.optionCard, selected && styles.optionCardSelected]}
              onPress={() => onToggleGoal(goal)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text style={styles.optionIcon}>{selected ? "✓" : "○"}</Text>
              <Text style={styles.optionTitle}>{goal}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
    <View style={styles.experienceStep}>
      <Text style={styles.featureTitle}>
        How experienced
        {`
`}
        are you?
      </Text>
      <Text style={styles.featureSubtitle}>
        This helps us customize your setup and guidance.
      </Text>
      <View style={styles.experienceList}>
        {EXPERIENCE_OPTIONS.map((option) => {
          const selected = experience === option.value;
          return (
            <Pressable
              key={option.value}
              style={[
                styles.experienceCard,
                selected && styles.optionCardSelected,
              ]}
              onPress={() => onSelectExperience(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <View
                style={[
                  styles.radioOuter,
                  selected && styles.radioOuterSelected,
                ]}
              >
                {selected ? <View style={styles.radioInner} /> : null}
              </View>
              <View style={styles.experienceCopy}>
                <Text style={styles.optionTitle}>{option.value}</Text>
                <Text style={styles.optionSubtitle}>{option.description}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      {experienceError ? (
        <Text style={styles.errorText}>{experienceError}</Text>
      ) : null}
    </View>
  );
}

function CreateAccountStep({
  email,
  password,
  accountError,
  onChangeEmail,
  onChangePassword,
}: {
  email: string;
  password: string;
  accountError: string;
  onChangeEmail: (email: string) => void;
  onChangePassword: (password: string) => void;
}) {
  return (
    <View style={styles.createAccountStep}>
      <View style={styles.logoRowSmall}>
        <Svg width={18} height={22} viewBox="0 0 18 22" fill="none">
          <Rect x={0} y={10} width={4} height={12} rx={2} fill={ACCENT} />
          <Rect x={7} y={4} width={4} height={18} rx={2} fill={ACCENT} />
          <Rect x={14} y={8} width={4} height={14} rx={2} fill={ACCENT} />
        </Svg>
        <Text style={styles.logoText}>PT-OS</Text>
      </View>
      <Text style={styles.featureTitle}>
        Create your
        {`
`}
        PT-OS account
      </Text>
      <Text style={styles.featureSubtitle}>
        Save your protocols, logs, and progress securely.
      </Text>
      <View style={styles.accountForm}>
        <TextInput
          value={email}
          onChangeText={onChangeEmail}
          placeholder="Email"
          placeholderTextColor={TEXT_TERTIARY}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          returnKeyType="next"
          style={styles.nameInput}
        />
        <TextInput
          value={password}
          onChangeText={onChangePassword}
          placeholder="Password"
          placeholderTextColor={TEXT_TERTIARY}
          secureTextEntry
          returnKeyType="done"
          style={styles.nameInput}
        />
        {accountError ? (
          <Text style={styles.errorText}>{accountError}</Text>
        ) : null}
      </View>
      <Pressable
        onPress={() => router.push("/(auth)/sign-in")}
        accessibilityRole="button"
      >
        <Text style={styles.signInText}>
          Already have an account?{" "}
          <Text style={styles.signInLink}>Sign in</Text>
        </Text>
      </Pressable>
    </View>
  );
}

function FeatureShell({
  title,
  subtitle,
  children,
}: {
  title: ReactNode;
  subtitle: string;
  children: ReactNode;
}) {
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
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
  },
  backButton: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  backButtonPlaceholder: {
    height: 44,
    width: 44,
  },
  backButtonText: {
    color: TEXT,
    fontSize: 22,
    fontWeight: "700",
  },
  dots: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    backgroundColor: "#D1D5DB",
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
    justifyContent: "center",
  },
  footer: {
    paddingBottom: 28,
    paddingTop: 16,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: ACCENT,
    borderRadius: 16,
    height: 56,
    justifyContent: "center",
    width: "100%",
  },
  primaryButtonText: {
    color: CARD,
    fontSize: 17,
    fontWeight: "700",
  },
  welcomeStep: {
    alignItems: "center",
    gap: 18,
  },
  logoRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
    justifyContent: "center",
    marginBottom: 14,
  },
  logoText: {
    color: ACCENT,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  heroTitle: {
    color: TEXT,
    fontSize: 40,
    fontWeight: "900",
    letterSpacing: -1.1,
    lineHeight: 44,
    maxWidth: 340,
    textAlign: "center",
  },
  heroSubtitle: {
    color: TEXT_SECONDARY,
    fontSize: 17,
    lineHeight: 25,
    maxWidth: 310,
    textAlign: "center",
  },
  featureStep: {
    alignItems: "center",
    gap: 24,
  },
  featureTitle: {
    color: TEXT,
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: -0.8,
    lineHeight: 42,
    maxWidth: 340,
    textAlign: "center",
  },
  featureSubtitle: {
    color: TEXT_SECONDARY,
    fontSize: 17,
    lineHeight: 25,
    maxWidth: 320,
    textAlign: "center",
  },
  premiumCard: {
    backgroundColor: CARD,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  scheduleCard: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    width: "100%",
  },
  scheduleRow: {
    alignItems: "center",
    borderBottomColor: BORDER,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 66,
  },
  scheduleRowLast: {
    borderBottomWidth: 0,
  },
  scheduleCompound: {
    color: TEXT,
    fontSize: 17,
    fontWeight: "800",
  },
  scheduleTime: {
    color: ACCENT,
    fontSize: 16,
    fontWeight: "800",
  },
  activeCard: {
    alignItems: "center",
    height: 220,
    justifyContent: "center",
    overflow: "hidden",
    paddingHorizontal: 20,
    width: "100%",
  },
  activeLine: {
    backgroundColor: ACCENT,
    height: 2,
    left: 20,
    position: "absolute",
    right: 20,
    top: "30%",
  },
  activeLabel: {
    color: TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.9,
    marginBottom: 10,
  },
  activeValue: {
    color: TEXT,
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: -1.5,
    lineHeight: 56,
    marginBottom: 32,
  },
  dayRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  dayLabel: {
    color: TEXT_TERTIARY,
    fontSize: 11,
    fontWeight: "600",
  },
  chatCard: {
    gap: 14,
    padding: 18,
    width: "100%",
  },
  chatHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  chatLogo: {
    color: ACCENT,
    fontSize: 12,
    fontWeight: "900",
  },
  chatTitle: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "800",
  },
  chatStatus: {
    color: "#16A34A",
    fontSize: 12,
    marginTop: 2,
  },
  chatBubbleUser: {
    alignSelf: "flex-end",
    backgroundColor: "#064E3B",
    borderRadius: 14,
    maxWidth: "78%",
    padding: 12,
  },
  chatBubbleUserText: {
    color: CARD,
    fontSize: 13,
    lineHeight: 18,
  },
  chatBubbleBot: {
    alignSelf: "flex-start",
    backgroundColor: "#F8FAFC",
    borderColor: INPUT_BORDER,
    borderRadius: 14,
    borderWidth: 1,
    maxWidth: "82%",
    padding: 12,
  },
  chatBubbleBotText: {
    color: TEXT,
    fontSize: 13,
    lineHeight: 18,
  },
  notificationCard: {
    alignItems: "center",
    flexDirection: "row",
    gap: 16,
    minHeight: 104,
    padding: 20,
    width: "100%",
  },
  bellCircle: {
    alignItems: "center",
    borderColor: BORDER,
    borderRadius: 24,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  notificationCopy: {
    flex: 1,
    gap: 5,
  },
  notificationTitle: {
    color: TEXT,
    fontSize: 18,
    fontWeight: "800",
  },
  notificationSubtitle: {
    color: TEXT_SECONDARY,
    fontSize: 16,
    fontWeight: "600",
  },
  goalsStep: {
    alignItems: "center",
    flex: 1,
    gap: 14,
    justifyContent: "center",
    width: "100%",
  },
  goalsScroll: {
    maxHeight: 360,
    width: "100%",
  },
  goalsList: {
    gap: 10,
    paddingVertical: 6,
  },
  optionCard: {
    alignItems: "center",
    backgroundColor: CARD,
    borderColor: INPUT_BORDER,
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: "row",
    gap: 12,
    minHeight: 54,
    paddingHorizontal: 16,
  },
  optionCardSelected: {
    backgroundColor: "#EFF6FF",
    borderColor: ACCENT,
  },
  optionIcon: {
    color: ACCENT,
    fontSize: 18,
    fontWeight: "800",
    width: 24,
  },
  optionTitle: {
    color: TEXT,
    fontSize: 16,
    fontWeight: "800",
  },
  optionSubtitle: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  experienceStep: {
    alignItems: "center",
    gap: 18,
    width: "100%",
  },
  experienceList: {
    gap: 12,
    width: "100%",
  },
  experienceCard: {
    alignItems: "center",
    backgroundColor: CARD,
    borderColor: INPUT_BORDER,
    borderRadius: 16,
    borderWidth: 1.5,
    flexDirection: "row",
    minHeight: 86,
    padding: 18,
  },
  radioOuter: {
    alignItems: "center",
    borderColor: "#CBD5E1",
    borderRadius: 11,
    borderWidth: 1.5,
    height: 22,
    justifyContent: "center",
    width: 22,
  },
  radioOuterSelected: {
    borderColor: ACCENT,
  },
  radioInner: {
    backgroundColor: ACCENT,
    borderRadius: 6,
    height: 12,
    width: 12,
  },
  experienceCopy: {
    flex: 1,
    marginLeft: 14,
  },
  createAccountStep: {
    alignItems: "center",
    gap: 16,
    width: "100%",
  },
  logoRowSmall: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginBottom: 4,
  },
  accountForm: {
    gap: 8,
    marginTop: 10,
    width: "100%",
  },
  signInText: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    textAlign: "center",
  },
  signInLink: {
    color: ACCENT,
    fontWeight: "700",
  },
  nameStep: {
    alignItems: "center",
    gap: 18,
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
    width: "100%",
  },
  nameInputError: {
    borderColor: "#EF4444",
  },
  errorText: {
    alignSelf: "flex-start",
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "600",
    marginTop: -6,
  },
});
