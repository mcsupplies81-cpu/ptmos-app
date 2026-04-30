import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="insights" options={{ title: 'Insights', tabBarIcon: () => <Text>💡</Text> }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}
