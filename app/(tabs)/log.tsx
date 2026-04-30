import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';

const links=[['Log a Dose','/log/dose'],['Use Calculator','/log/calculator'],['Log Symptoms','/log/symptoms'],['Log Lifestyle','/log/lifestyle']] as const;
export default function LogTab(){return <View style={styles.c}>{links.map(([label,path])=><Pressable key={path} style={styles.i} onPress={()=>router.push(path as any)}><Text style={styles.t}>{label}</Text></Pressable>)}</View>;}
const styles=StyleSheet.create({c:{flex:1,padding:16,gap:10,backgroundColor:Colors.background},i:{padding:14,backgroundColor:Colors.card,borderRadius:10,borderWidth:1,borderColor:Colors.border},t:{color:Colors.text,fontWeight:'600'}});
