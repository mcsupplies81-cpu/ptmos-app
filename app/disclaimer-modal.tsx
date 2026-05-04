import { router } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

import Colors from '@/constants/Colors';

export default function DisclaimerModal() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 120 }}>
          <Text style={{ fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: 16 }}>Medical Disclaimer</Text>
          <Text style={paragraphStyle}>
            The information in this app is provided for educational and informational purposes only and is not intended to diagnose, treat, cure, or prevent any medical condition.
          </Text>
          <Text style={paragraphStyle}>
            Content such as protocols, suggestions, and wellness guidance may not be appropriate for your personal health needs, medical history, medications, or risk factors.
          </Text>
          <Text style={paragraphStyle}>
            Always consult a licensed physician or qualified healthcare professional before making changes to your treatment plan, supplements, exercise routine, or lifestyle.
          </Text>
          <Text style={paragraphStyle}>
            By continuing, you acknowledge that your use of this app is voluntary and that you are solely responsible for any decisions you make based on the content provided.
          </Text>
        </ScrollView>

        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: Colors.background,
            borderTopWidth: 1,
            borderTopColor: Colors.border,
            padding: 16,
            paddingBottom: 16,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            style={{
              height: 52,
              borderRadius: 16,
              backgroundColor: Colors.accent,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: Colors.white, fontSize: 16, fontWeight: '700' }}>I Understand</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const paragraphStyle = {
  fontSize: 14,
  lineHeight: 22,
  color: Colors.text,
  marginBottom: 12,
} as const;
