import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Colors from '@/constants/Colors';
import Copy from '@/constants/Copy';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useProfileStore } from '@/stores/profileStore';

export default function DisclaimerScreen() {
  const router = useRouter();
  const { session } = useAuthStore();
  const { fetchProfile } = useProfileStore();

  const onAccept = async () => {
    if (!session?.user?.id) return;
    await supabase.from('profiles').update({ disclaimer_accepted: true, disclaimer_accepted_at: new Date().toISOString() }).eq('id', session.user.id);
    await fetchProfile(session.user.id);
    router.replace('/(auth)/profile-setup');
  };

  return <View style={styles.c}><Text style={styles.h}>Disclaimer</Text><ScrollView style={styles.box}><Text style={styles.t}>{Copy.disclaimerFull}</Text></ScrollView><Pressable style={styles.b} onPress={onAccept}><Text style={styles.bt}>I Understand and Accept</Text></Pressable></View>;
}
const styles=StyleSheet.create({c:{flex:1,padding:24,backgroundColor:Colors.background},h:{fontSize:28,fontWeight:'700',marginVertical:16,color:Colors.text},box:{flex:1,backgroundColor:Colors.card,borderRadius:12,padding:16},t:{fontSize:16,lineHeight:24,color:Colors.text},b:{backgroundColor:Colors.accent,borderRadius:10,padding:14,alignItems:'center',marginTop:16},bt:{color:'#fff',fontWeight:'700'}});
