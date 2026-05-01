import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';

interface Props {
  title: string;
  /** Show a right-side action button (e.g. Save) */
  rightLabel?: string;
  onRightPress?: () => void;
  /** Hide back arrow (e.g. root screens) */
  hideBack?: boolean;
}

export default function ScreenHeader({ title, rightLabel, onRightPress, hideBack }: Props) {
  return (
    <View style={styles.container}>
      {hideBack ? (
        <View style={styles.side} />
      ) : (
        <Pressable style={styles.side} onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
      )}

      <Text style={styles.title} numberOfLines={1}>{title}</Text>

      <View style={styles.side}>
        {rightLabel && onRightPress ? (
          <Pressable onPress={onRightPress} hitSlop={12}>
            <Text style={styles.right}>{rightLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  side: { width: 80 },
  back: { color: Colors.accent, fontSize: 17, fontWeight: '500' },
  title: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '600', color: Colors.text },
  right: { color: Colors.accent, fontSize: 17, fontWeight: '600', textAlign: 'right' },
});
