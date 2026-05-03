import { ActivityIndicator, SafeAreaView, Text } from 'react-native';
import Colors from '@/constants/Colors';

export default function LoadingScreen({ message = 'Loading...' }: { message?: string }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={Colors.accent} />
      <Text style={{ color: Colors.textSecondary, fontSize: 14, marginTop: 12 }}>{message}</Text>
    </SafeAreaView>
  );
}
