import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

import Colors from '@/constants/Colors';
import { supabase } from '@/lib/supabase';

export default function SignUpScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const onCreate = async () => {
    setError('');

    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: { data: { full_name: trimmedFullName } },
    });

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: trimmedFullName,
        email: trimmedEmail,
        disclaimer_accepted: false,
      });

      if (profileError) {
        setError(profileError.message);
        return;
      }
    }

    // Let _layout.tsx handle routing — it will redirect to /(auth)/disclaimer
    // once it detects the new session + profile with disclaimer_accepted: false
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={styles.heading}>Create account</Text>
        <Text style={styles.subheading}>Start tracking your peptide protocols</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor={Colors.textSecondary}
          value={fullName}
          onChangeText={setFullName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={Colors.textSecondary}
          autoCapitalize="none"
          keyboardType="email-address"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={Colors.textSecondary}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <Pressable style={styles.primaryButton} onPress={onCreate}>
          <Text style={styles.primaryButtonText}>Create Account</Text>
        </Pressable>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      <Pressable onPress={() => router.replace('/(auth)/sign-in')}>
        <Text style={styles.linkText}>Already have an account? Sign in</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 24,
    justifyContent: 'center',
    gap: 24,
  },
  heading: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  form: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    color: Colors.text,
  },
  primaryButton: {
    backgroundColor: '#2D6A4F',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    color: '#B42318',
    fontSize: 14,
    marginTop: 2,
  },
  linkText: {
    color: '#2D6A4F',
    textAlign: 'center',
    fontWeight: '600',
  },
});
