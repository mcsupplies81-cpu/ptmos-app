import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';

export default function ProtocolDetailScreen() {
  return (
    <SafeAreaView style={{ flex: 1, paddingHorizontal: 16 }}>
      <Text>Protocol Detail</Text>
      <View style={{ borderRadius: 12, padding: 12 }}>
        <Text>Next dose countdown: --</Text>
        <Text>Adherence: --%</Text>
        <Text>Last 10 dose logs</Text>
      </View>
    </SafeAreaView>
  );
}
