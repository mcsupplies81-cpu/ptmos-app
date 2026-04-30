import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Colors from '@/constants/Colors';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const onSend = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) return Alert.alert('Error', error.message);
    Alert.alert('Success', 'Reset link sent');
  };

  return <View style={styles.c}><Text style={styles.h}>Reset password</Text><TextInput placeholder="Email" style={styles.i} value={email} onChangeText={setEmail} autoCapitalize="none"/><Pressable style={styles.b} onPress={onSend}><Text style={styles.bt}>Send Reset Link</Text></Pressable><Link href="/(auth)/sign-in" style={styles.l}>Back to sign in</Link></View>;
}
const styles=StyleSheet.create({c:{flex:1,padding:24,justifyContent:'center',backgroundColor:Colors.background},h:{fontSize:28,fontWeight:'700',marginBottom:24,color:Colors.text},i:{borderWidth:1,borderColor:Colors.border,borderRadius:10,padding:12,marginBottom:12},b:{backgroundColor:Colors.accent,borderRadius:10,padding:14,alignItems:'center',marginTop:8},bt:{color:'#fff',fontWeight:'700'},l:{marginTop:14,color:Colors.accent}});
