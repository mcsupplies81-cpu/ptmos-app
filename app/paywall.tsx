import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'

import { Copy } from '@/constants/Copy'
import Colors from '@/constants/Colors'

const features = [
  'Unlimited active protocols',
  'Unlimited inventory tracking',
  'Unlimited dose logs',
  'Advanced insights and trends',
]

export default function PaywallScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Pressable onPress={() => router.back()}><Text style={styles.back}>Back</Text></Pressable>
      <Text style={styles.title}>Go Pro</Text>
      <View style={styles.featureList}>
        {features.map((feature) => <Text key={feature} style={styles.feature}>• {feature}</Text>)}
      </View>
      <Text style={styles.price}>$6.99/month or $39.99/year</Text>
      <Pressable style={styles.primary} onPress={() => {
        // TODO: Integrate subscription purchase flow
        console.log('subscribe tapped')
      }}><Text style={styles.primaryText}>Subscribe</Text></Pressable>
      <Pressable style={styles.secondary} onPress={() => {
        // TODO: Integrate restore purchases flow
        console.log('subscribe tapped')
      }}><Text style={styles.secondaryText}>Restore Purchases</Text></Pressable>
      <Text style={styles.disclaimer}>{Copy.disclaimerShort}</Text>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: Colors.background, padding: 16 }, back: { color: Colors.accent, marginBottom: 12 }, title: { color: Colors.text, fontSize: 28, fontWeight: '700', marginBottom: 12 }, featureList: { marginBottom: 16, gap: 8 }, feature: { color: Colors.text }, price: { color: Colors.text, fontSize: 18, marginBottom: 16 }, primary: { backgroundColor: Colors.accent, borderRadius: 10, padding: 12, alignItems: 'center', marginBottom: 10 }, primaryText: { color: Colors.background, fontWeight: '700' }, secondary: { backgroundColor: Colors.card, borderRadius: 10, padding: 12, alignItems: 'center', marginBottom: 16 }, secondaryText: { color: Colors.text, fontWeight: '600' }, disclaimer: { color: Colors.textMuted, fontSize: 12 } })
