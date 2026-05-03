import { router } from 'expo-router';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import Colors from '@/constants/Colors';

interface Props {
  visible: boolean;
  onClose: () => void;
}

type Action = {
  label: string;
  emoji: string;
  route?: string;
  chatMsg?: string;
};

const ACTIONS: Action[] = [
  { label: 'Log Dose', emoji: '💉', route: '/log/dose' },
  { label: 'Add Protocol', emoji: '📋', route: '/protocol/create' },
  { label: 'Add Inventory', emoji: '🧪', route: '/more/inventory' },
  { label: 'Log Weight', emoji: '⚖️', chatMsg: 'log my weight' },
  { label: 'Log Water', emoji: '💧', chatMsg: 'log water' },
  { label: 'Log Symptom', emoji: '🩺', route: '/log/symptoms' },
  { label: 'Daily Check-in', emoji: '✅', route: '/log/lifestyle' },
  { label: 'Calculator', emoji: '🧮', route: '/log/calculator' },
];

export default function PlusMenu({ visible, onClose }: Props) {
  const handleAction = (action: Action) => {
    onClose();
    if (action.route) {
      router.push(action.route as any);
      return;
    }

    if (action.chatMsg) {
      router.push({ pathname: '/(tabs)/chat', params: { prefill: action.chatMsg } } as any);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>Quick Actions</Text>
        <View style={styles.grid}>
          {ACTIONS.map((action) => (
            <Pressable key={action.label} style={styles.action} onPress={() => handleAction(action)}>
              <Text style={styles.emoji}>{action.emoji}</Text>
              <Text style={styles.label}>{action.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  action: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  emoji: { fontSize: 22 },
  label: { fontSize: 10, color: Colors.textSecondary, textAlign: 'center', fontWeight: '600' },
});
