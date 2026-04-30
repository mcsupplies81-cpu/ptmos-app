import { useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import Colors from '@/constants/Colors';
import Copy from '@/constants/Copy';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useProfileStore } from '@/stores/profileStore';

export default function DisclaimerScreen() {
  const { session } = useAuthStore();
  const { fetchProfile } = useProfileStore();
  const [loading, setLoading] = useState(false);

  const onAccept = async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    await supabase
      .from('profiles')
      .update({ disclaimer_accepted: true, disclaimer_accepted_at: new Date().toISOString() })
      .eq('id', session.user.id);
    await fetchProfile(session.user.id);
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Disclaimer</Text>
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.body}>{Copy.disclaimerFull}</Text>
      </ScrollView>
      <View style={styles.footer}>
        <Pressable style={styles.button} onPress={onAccept} disabled={loading}>
          {loading
            ? <ActivityIndicator color={Colors.white} />
            : <Text style={styles.buttonText}>I Understand and Accept</Text>
          }
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 12,
  },
  scrollArea: {
    flex: 1,
    marginHorizontal: 24,
    backgroundColor: Colors.card,
    borderRadius: 12,
  },
  scrollContent: {
    padding: 16,
  },
  body: {
    fontSize: 16,
    lineHeight: 26,
    color: Colors.text,
  },
  footer: {
    padding: 24,
  },
  button: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
});
