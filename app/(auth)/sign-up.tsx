import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { supabase } from '@/lib/supabase';

export default function SignUpScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onCreate = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      return Alert.alert('Missing fields', 'Please fill in all fields.');
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setLoading(false);
    if (error) return Alert.alert('Sign up failed', error.message);
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName,
        disclaimer_accepted: false,
      });
      router.replace('/(auth)/disclaimer');
    }
  };

  return (
    <SafeAreaView style={styles.c}>
      <Text style={styles.h}>Create account</Text>
      <TextInput placeholder="Full name" style={styles.i} value={fullName} onChangeText={setFullName} />
      <TextInput placeholder="Email" style={styles.i} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput placeholder="Password (min 6 chars)" style={styles.i} value={password} onChangeText={setPassword} secureTextEntry />
      <Pressable style={styles.b} onPress={onCreate} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.bt}>Create Account</Text>}
      </Pressable>
      <Link href="/(auth)/sign-in" style={styles.l}>Already have an account? Sign In</Link>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: Colors.background },
  h: { fontSize: 28, fontWeight: '700', marginBottom: 24, color: Colors.text },
  i: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, padding: 12, marginBottom: 12, fontSize: 16 },
  b: { backgroundColor: Colors.accent, borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 8 },
  bt: { color: '#fff', fontWeight: '700', fontSize: 16 },
  l: { marginTop: 18, color: Colors.accent, textAlign: 'center' },
});
