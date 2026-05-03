import { Pressable, Text, View } from 'react-native';
import Colors from '@/constants/Colors';

interface Props {
  emoji: string;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ emoji, title, subtitle, actionLabel, onAction }: Props) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <Text style={{ fontSize: 48 }}>{emoji}</Text>
      <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.text, marginTop: 16, textAlign: 'center' }}>{title}</Text>
      <Text style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 8, textAlign: 'center', lineHeight: 22 }}>{subtitle}</Text>
      {actionLabel && onAction && (
        <Pressable onPress={onAction} style={{ marginTop: 24, backgroundColor: Colors.accent, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 }}>
          <Text style={{ color: Colors.white, fontWeight: '700', fontSize: 15 }}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}
