import { router } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';

import { Copy } from '@/constants/Copy';
import Colors from '@/constants/Colors';

export default function DisclaimerModal() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.close}>Close</Text>
      </Pressable>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.body}>{Copy.disclaimerFull}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background, padding: 16 },
  close: { color: Colors.tabActive, fontWeight: '600', marginBottom: 12 },
  content: { paddingBottom: 24 },
  body: { color: Colors.text, lineHeight: 22 },
});
