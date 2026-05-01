import { Tabs } from 'expo-router';
import { Text } from 'react-native';

import Colors from '@/constants/Colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: Colors.tabBar,
          borderTopColor: Colors.tabBarBorder,
        },
        tabBarActiveTintColor: Colors.tabActive,
        tabBarInactiveTintColor: Colors.tabInactive,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarIcon: () => <Text>🏠</Text> }} />
      <Tabs.Screen name="protocols" options={{ title: 'Protocols', tabBarIcon: () => <Text>💊</Text> }} />
      <Tabs.Screen name="log" options={{ title: 'Log', tabBarIcon: () => <Text>➕</Text> }} />
      <Tabs.Screen name="insights" options={{ title: 'Insights', tabBarIcon: () => <Text>📊</Text> }} />
      <Tabs.Screen name="more" options={{ title: 'More', tabBarIcon: () => <Text>☰</Text> }} />
      <Tabs.Screen name="research" options={{ href: null }} />
      <Tabs.Screen name="providers" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}
