import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Colors from '@/constants/Colors';
import { supabase } from '@/lib/supabase';

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return Alert.alert('Sign in failed', error.message);
    const { data: profile } = await supabase.from('profiles').select('disclaimer_accepted').eq('id', data.user.id).maybeSingle();
    router.replace(profile?.disclaimer_accepted ? '/(tabs)/' : '/(auth)/disclaimer');
  };

  return <View style={styles.c}><Text style={styles.h}>Sign in</Text><TextInput placeholder="Email" style={styles.i} value={email} onChangeText={setEmail} autoCapitalize="none"/><TextInput placeholder="Password" style={styles.i} value={password} onChangeText={setPassword} secureTextEntry/><Pressable style={styles.b} onPress={onSignIn}><Text style={styles.bt}>Sign In</Text></Pressable><Link href="/(auth)/forgot-password" style={styles.l}>Forgot password?</Link><Link href="/(auth)/sign-up" style={styles.l}>Need an account? Create one</Link></View>;
}
const styles=StyleSheet.create({c:{flex:1,padding:24,justifyContent:'center',backgroundColor:Colors.background},h:{fontSize:28,fontWeight:'700',marginBottom:24,color:Colors.text},i:{borderWidth:1,borderColor:Colors.border,borderRadius:10,padding:12,marginBottom:12},b:{backgroundColor:Colors.accent,borderRadius:10,padding:14,alignItems:'center',marginTop:8},bt:{color:'#fff',fontWeight:'700'},l:{marginTop:14,color:Colors.accent}});
