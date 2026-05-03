import { useCallback, useRef, useState } from 'react';
import {
  FlatList,
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

import Colors from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import useChatStore, { type ChatMessage, type ParsedIntent } from '@/stores/chatStore';
import { useDoseLogStore } from '@/stores/doseLogStore';
import { useLifestyleStore } from '@/stores/lifestyleStore';
import { useProtocolStore } from '@/stores/protocolStore';
import { SymptomType, useSymptomStore } from '@/stores/symptomStore';

const QUICK_CHIPS = [
  { label: 'Log Dose 💉', hint: 'I just took ' },
  { label: 'Log Weight ⚖️', hint: 'My weight is ' },
  { label: 'Log Sleep 😴', hint: 'I slept ' },
  { label: 'Log Symptom 🩺', hint: "I'm feeling " },
];

function mockParse(text: string): ParsedIntent {
  const lower = text.toLowerCase();
  const amountMatch = text.match(/\d+(?:\.\d+)?/);
  const amount = amountMatch ? Number(amountMatch[0]) : null;

  if (/(took|dosed|injected|log dose|administered)/i.test(text)) {
    const unit = (lower.match(/\b(mcg|mg|iu|ml)\b/)?.[1] ?? 'mcg') as 'mcg' | 'mg' | 'iu' | 'ml';
    const tokens = text.split(/\s+/);
    const amountIndex = tokens.findIndex((token) => token.match(/\d+(?:\.\d+)?/));
    let peptide: string | null = null;

    if (amountIndex > 0) peptide = tokens[amountIndex - 1];
    if (!peptide && amountIndex >= 0 && amountIndex < tokens.length - 1) peptide = tokens[amountIndex + 1];

    if (!peptide) {
      const afterVerb = text.match(/(?:took|dosed|injected)\s+([a-z0-9-]+)/i);
      peptide = afterVerb?.[1] ?? null;
    }

    const site =
      lower.match(
        /left abdomen|right abdomen|left thigh|right thigh|left glute|right glute|left arm|right arm/,
      )?.[0] ?? null;

    return {
      intent: 'log_dose',
      payload: { amount, unit, peptide, site },
      confidence: amount !== null ? 'high' : 'medium',
      displaySummary: `Log ${amount ?? '?'}${unit} ${peptide ?? 'dose'}${site ? `, ${site}` : ''}`,
    };
  }

  if (/(feeling|feel|symptom|side effect|tired|headache|nausea|fatigue)/i.test(text)) {
    const symptomKeywords = ['tired', 'headache', 'nausea', 'fatigue', 'symptom', 'side effect'];
    const keyword = symptomKeywords.find((k) => lower.includes(k));
    const feelMatch = lower.match(/(?:feeling|feel)\s+([a-z-]+)/);
    const severity = Number(text.match(/\b([1-9]|10)\b/)?.[1] ?? '') || null;
    const symptom = keyword ?? feelMatch?.[1] ?? 'symptom';

    return {
      intent: 'log_symptom',
      payload: { symptom, severity },
      confidence: 'medium',
      displaySummary: `Log symptom: ${symptom}${severity ? ` (${severity}/10)` : ''}`,
    };
  }

  if (/(weight|weighed|scale)/i.test(text)) {
    const value = Number(text.match(/\d+(?:\.\d+)?/)?.[0] ?? '') || null;
    return {
      intent: 'log_weight',
      payload: { value },
      confidence: value ? 'high' : 'medium',
      displaySummary: `Log weight: ${value ?? '?'} lbs`,
    };
  }

  if (/(slept|sleep|hours of sleep|bed)/i.test(text)) {
    const hours = Number(text.match(/\d+(?:\.\d+)?/)?.[0] ?? '') || null;
    return {
      intent: 'log_sleep',
      payload: { hours },
      confidence: hours ? 'high' : 'medium',
      displaySummary: `Log sleep: ${hours ?? '?'} hours`,
    };
  }

  if (/(last dose|last time i took|when did i last)/i.test(text)) {
    return {
      intent: 'ask_last_dose',
      payload: {},
      confidence: 'high',
      displaySummary: 'When was my last dose?',
    };
  }

  if (/(adherence|how am i doing|on track)/i.test(text)) {
    return {
      intent: 'ask_adherence',
      payload: {},
      confidence: 'high',
      displaySummary: 'Check adherence',
    };
  }

  return {
    intent: 'unknown',
    payload: {},
    confidence: 'low',
    displaySummary: "I'm not sure how to handle that yet.",
  };
}

function buildSummary(intent: string, payload: Record<string, string | number | null>): string {
  if (intent === 'log_dose') return `Log ${payload.amount ?? '?'}${payload.unit ?? 'mcg'} ${payload.peptide ?? 'dose'}${payload.site ? ', ' + payload.site : ''}`;
  if (intent === 'log_weight') return `Log weight: ${payload.value ?? '?'} lbs`;
  if (intent === 'log_sleep') return `Log sleep: ${payload.hours ?? '?'} hours`;
  if (intent === 'log_symptom') return `Log symptom: ${payload.symptom ?? '?'}${payload.severity ? ' (' + payload.severity + '/10)' : ''}`;
  return String(payload);
}

export default function ChatScreen() {
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList<ChatMessage>>(null);
  const textInputRef = useRef<TextInput>(null);
  const { messages, addMessage, updateMessageStatus } = useChatStore();
  const doseLogs = useDoseLogStore((s) => s.doseLogs);
  const protocols = useProtocolStore((s) => s.protocols);
  const user = useAuthStore((s) => s.user);
  const fetchDoseLogs = useDoseLogStore((s) => s.fetchDoseLogs);
  const upsertLifestyle = useLifestyleStore((s) => s.upsertLog);
  const addSymptom = useSymptomStore((s) => s.addLog);

  const handleConfirm = useCallback(async (message: ChatMessage) => {
    if (!user?.id || !message.parsedIntent) return;
    updateMessageStatus(message.id, 'confirmed');
    const { intent, payload } = message.parsedIntent;

    try {
      if (intent === 'log_dose') {
        await supabase.from('dose_logs').insert({
          user_id: user.id,
          peptide_name: payload.peptide ?? null,
          amount: Number(payload.amount) || 0,
          unit: payload.unit ?? 'mcg',
          injection_site: payload.site ?? null,
          logged_at: new Date().toISOString(),
          protocol_id: null,
          notes: null,
        });
        await fetchDoseLogs(user.id);
        addMessage({ role: 'success', text: `${payload.peptide ?? 'Dose'} logged ✓` });
      }

      else if (intent === 'log_weight') {
        const today = new Date().toISOString().slice(0, 10);
        await upsertLifestyle(
          { date: today, weight_lbs: Number(payload.value) || null, water_oz: null, calories: null, protein_g: null, sleep_hours: null, steps: null, workout_notes: null, mood: null, energy: null, meal_notes: null },
          user.id
        );
        addMessage({ role: 'success', text: `Weight logged: ${payload.value} lbs ✓` });
      }

      else if (intent === 'log_sleep') {
        const today = new Date().toISOString().slice(0, 10);
        await upsertLifestyle(
          { date: today, sleep_hours: Number(payload.hours) || null, weight_lbs: null, water_oz: null, calories: null, protein_g: null, steps: null, workout_notes: null, mood: null, energy: null, meal_notes: null },
          user.id
        );
        addMessage({ role: 'success', text: `Sleep logged: ${payload.hours} hours ✓` });
      }

      else if (intent === 'log_symptom') {
        const normalized = (payload.symptom as string ?? '').toLowerCase().trim();
        const symptomType: SymptomType =
          normalized === 'fatigue' ? 'fatigue' :
          normalized === 'headache' ? 'headache' :
          normalized === 'nausea' ? 'nausea' :
          normalized === 'joint pain' ? 'joint pain' : 'other';
        await addSymptom(
          {
            symptom_type: symptomType,
            severity: Number(payload.severity) || 5,
            notes: symptomType === 'other' ? (payload.symptom as string) : null,
            logged_at: new Date().toISOString(),
          },
          user.id
        );
        addMessage({ role: 'success', text: `Symptom logged ✓` });
      }

      else {
        addMessage({ role: 'success', text: 'Logged ✓' });
      }

    } catch (e) {
      addMessage({ role: 'error', text: 'Something went wrong. Try again.' });
    }
  }, [user?.id, updateMessageStatus, addMessage, fetchDoseLogs, upsertLifestyle, addSymptom]);

  const callAI = useCallback(async (text: string): Promise<{ type: string; intent?: string; payload?: Record<string, unknown>; text?: string; reason?: string } | null> => {
    try {
      const last7 = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(); d.setDate(d.getDate() - i);
        return d.toISOString().slice(0, 10);
      });
      const logged = new Set(doseLogs.map(l => l.logged_at.slice(0, 10)));
      const adherencePct = Math.round(last7.filter(d => logged.has(d)).length / 7 * 100);
      let streakDays = 0;
      const s = new Date(); s.setDate(s.getDate() - 1);
      while (logged.has(s.toISOString().slice(0, 10))) { streakDays++; s.setDate(s.getDate() - 1); }

      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: text,
          context: {
            protocols: protocols.map(p => ({ name: p.name, dose_amount: p.dose_amount, dose_unit: p.dose_unit, frequency: p.frequency, status: p.status })),
            recentDoses: [...doseLogs].sort((a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()).slice(0, 5),
            adherencePct,
            streakDays,
          },
        },
      });
      if (error) return null;
      return data as { type: string; intent?: string; payload?: Record<string, unknown>; text?: string; reason?: string };
    } catch {
      return null;
    }
  }, [doseLogs, protocols]);

  const handleSend = useCallback(async () => {
    if (!inputText.trim()) return;
    const text = inputText.trim();
    setInputText('');
    addMessage({ role: 'user', text });

    // Try AI first, fall back to mock parser
    const aiResult = await callAI(text);

    if (aiResult && aiResult.type === 'message' && aiResult.text) {
      addMessage({ role: 'assistant', text: aiResult.text });
      return;
    }

    if (aiResult && aiResult.type === 'action' && aiResult.intent) {
      const intents = ['log_dose','log_symptom','log_weight','log_sleep','log_lifestyle','update_inventory','ask_adherence','ask_last_dose','ask_next_dose','ask_inventory'] as const;
      type IntentType = typeof intents[number] | 'unknown';
      const intent = intents.includes(aiResult.intent as IntentType) ? aiResult.intent as IntentType : 'unknown';
      const parsed: ParsedIntent = {
        intent: intent as ParsedIntent['intent'],
        payload: (aiResult.payload ?? {}) as Record<string, string | number | null>,
        confidence: 'high',
        displaySummary: buildSummary(intent, (aiResult.payload ?? {}) as Record<string, string | number | null>),
      };
      addMessage({ role: 'confirmation', text: parsed.displaySummary, parsedIntent: parsed, status: 'pending' });
      return;
    }

    // Fallback: mock parser (AI not configured or failed)
    const parsed = mockParse(text);

    if (parsed.intent === 'unknown') {
      addMessage({ role: 'assistant', text: "I'm not sure how to handle that yet. Try: 'Log 250mcg BPC-157' or 'I slept 7 hours'." });
      return;
    }

    if (parsed.intent === 'ask_last_dose') {
      const last = [...doseLogs].sort(
        (a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime(),
      )[0];
      if (!last) {
        addMessage({ role: 'assistant', text: 'No doses logged yet.' });
        return;
      }
      const days = Math.floor((Date.now() - new Date(last.logged_at).getTime()) / 86400000);
      const when = days === 0 ? 'today' : days === 1 ? 'yesterday' : `${days} days ago`;
      addMessage({
        role: 'assistant',
        text: `Last dose: ${last.peptide_name ?? 'Unknown'} ${last.amount}${last.unit}, ${when}.`,
      });
      return;
    }

    if (parsed.intent === 'ask_adherence') {
      const active = protocols.filter((p) => p.status === 'active');
      if (active.length === 0) {
        addMessage({ role: 'assistant', text: 'No active protocols found.' });
        return;
      }
      const last7 = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().slice(0, 10);
      });
      const logged = new Set(doseLogs.map((l) => l.logged_at.slice(0, 10)));
      const pct = Math.round((last7.filter((d) => logged.has(d)).length / 7) * 100);
      addMessage({
        role: 'assistant',
        text: `Your 7-day adherence is ${pct}%. ${pct >= 80 ? 'Great work! 🔥' : 'Keep going — every dose counts.'}`,
      });
      return;
    }

    addMessage({ role: 'confirmation', text: parsed.displaySummary, parsedIntent: parsed, status: 'pending' });
  }, [inputText, addMessage, callAI, doseLogs, mockParse, protocols]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Text style={styles.title}>PTMOS</Text>
          <Text style={styles.subtitle}>AI Assistant</Text>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          inverted
          keyExtractor={(item) => item.id}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>💬</Text>
              <Text style={styles.emptyText}>Ask anything or log a dose</Text>
            </View>
          }
          renderItem={({ item: message }) => {
            if (message.role === 'user') {
              return <View style={styles.userBubble}><Text style={styles.userText}>{message.text}</Text></View>;
            }
            if (message.role === 'assistant') {
              return <View style={styles.assistantBubble}><Text style={styles.assistantText}>{message.text}</Text></View>;
            }
            if (message.role === 'success') {
              return <View style={styles.successPill}><Text style={styles.successText}>✓ {message.text}</Text></View>;
            }
            if (message.role === 'error') {
              return <View style={styles.errorPill}><Text style={styles.errorText}>✕ {message.text}</Text></View>;
            }
            if (message.role === 'confirmation') {
              const isPending = message.status === 'pending';
              const isCancelled = message.status === 'cancelled';
              return (
                <View style={[styles.confirmCard, isCancelled && styles.cancelledCard]}>
                  <Text style={styles.parsedLabel}>💬 Parsed Intent</Text>
                  <Text style={styles.summaryText}>{message.parsedIntent?.displaySummary ?? message.text}</Text>
                  {message.status === 'confirmed' && <Text style={styles.confirmedBadge}>✓ Confirmed</Text>}
                  {isPending && (
                    <View style={styles.buttonRow}>
                      <Pressable style={styles.confirmButton} onPress={() => { void handleConfirm(message); }}>
                        <Text style={styles.confirmButtonText}>Confirm</Text>
                      </Pressable>
                      <Pressable
                        style={styles.cancelButton}
                        onPress={() => {
                          updateMessageStatus(message.id, 'cancelled');
                          addMessage({ role: 'assistant', text: 'Got it, cancelled.' });
                        }}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              );
            }
            return null;
          }}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          {QUICK_CHIPS.map((chip) => (
            <Pressable
              key={chip.label}
              style={styles.chip}
              onPress={() => {
                setInputText(chip.hint);
                textInputRef.current?.focus();
              }}
            >
              <Text style={styles.chipText}>{chip.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.inputBar}>
          <TextInput
            ref={textInputRef}
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Log a dose, ask a question..."
            placeholderTextColor={Colors.textSecondary}
            returnKeyType="send"
            multiline
            onSubmitEditing={() => { void handleSend(); }}
          />
          <Pressable
            style={[styles.sendButton, { opacity: inputText.trim() ? 1 : 0.4 }]}
            onPress={() => { void handleSend(); }}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendText}>↑</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  title: { fontSize: 17, fontWeight: '700', color: Colors.text },
  subtitle: { fontSize: 12, color: Colors.textSecondary },
  messages: { flex: 1 },
  messagesContent: { paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 32 },
  emptyText: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center' },
  userBubble: { backgroundColor: Colors.accent, borderRadius: 18, borderBottomRightRadius: 4, padding: 12, maxWidth: '80%', alignSelf: 'flex-end' },
  userText: { color: '#FFFFFF', fontSize: 15 },
  assistantBubble: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    padding: 12,
    maxWidth: '80%',
    borderWidth: 1,
    borderColor: Colors.border,
    alignSelf: 'flex-start',
  },
  assistantText: { color: Colors.text, fontSize: 15 },
  confirmCard: { backgroundColor: Colors.card, borderRadius: 14, borderWidth: 1.5, borderColor: Colors.accent, padding: 14, marginVertical: 4 },
  cancelledCard: { opacity: 0.5 },
  parsedLabel: { fontSize: 10, color: Colors.textSecondary, letterSpacing: 1, fontWeight: '600' },
  summaryText: { fontSize: 16, fontWeight: '700', color: Colors.text, marginTop: 4, marginBottom: 12 },
  buttonRow: { gap: 8, flexDirection: 'row' },
  confirmButton: { flex: 1, backgroundColor: Colors.accent, borderRadius: 10, height: 40, justifyContent: 'center', alignItems: 'center' },
  confirmButtonText: { color: '#FFFFFF', fontWeight: '700' },
  cancelButton: { flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, height: 40, justifyContent: 'center', alignItems: 'center' },
  cancelButtonText: { color: Colors.textSecondary },
  confirmedBadge: { color: Colors.success, fontSize: 12, fontWeight: '600' },
  successPill: { backgroundColor: Colors.accentLight, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start' },
  successText: { color: Colors.accent, fontSize: 13, fontWeight: '600' },
  errorPill: { backgroundColor: '#FEE2E2', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start' },
  errorText: { color: '#DC2626', fontSize: 13, fontWeight: '600' },
  chipsRow: { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  chip: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  chipText: { color: Colors.text, fontSize: 13 },
  inputBar: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, gap: 8, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.background },
  input: { flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: Colors.text, backgroundColor: Colors.card, maxHeight: 100 },
  sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.accent, justifyContent: 'center', alignItems: 'center' },
  sendText: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
});
