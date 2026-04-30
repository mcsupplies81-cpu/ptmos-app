import React from 'react';
import { Pressable, SafeAreaView, Text } from 'react-native';
import { useRouter } from 'expo-router';

export default function LogTabScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1, paddingHorizontal: 16 }}>
      <Pressable onPress={() => router.push('/log/dose')}><Text>Log a Dose</Text></Pressable>
      <Pressable onPress={() => router.push('/log/calculator')}><Text>Use Calculator</Text></Pressable>
    </SafeAreaView>
  );
}
