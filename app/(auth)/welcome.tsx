import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Colors from '@/constants/Colors';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.brandWrap}>
        <Text style={styles.logo}>PTMOS</Text>
        <Text style={styles.tag}>Peptide Tracking</Text>
      </View>
      <Link href="/(auth)/sign-up" style={styles.primary}>Get Started</Link>
      <Link href="/(auth)/sign-in" style={styles.secondary}>Sign In</Link>
    </View>
  );
}
const styles = StyleSheet.create({ container:{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:Colors.background,padding:24}, brandWrap:{alignItems:'center',marginBottom:36}, logo:{fontSize:44,fontWeight:'800',color:Colors.accent}, tag:{marginTop:8,color:Colors.mutedText}, primary:{backgroundColor:Colors.accent,color:'#fff',paddingVertical:14,paddingHorizontal:24,borderRadius:12,overflow:'hidden',marginBottom:12}, secondary:{color:Colors.accent,fontWeight:'700'} });
