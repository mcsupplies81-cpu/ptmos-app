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
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: () => <Text>🏠</Text>,
        }}
      />
      <Tabs.Screen name="protocols" options={{ title: 'Protocols', tabBarIcon: () => <Text>💉</Text> }} />
      <Tabs.Screen name="log" options={{ title: 'Log', tabBarIcon: () => <Text>📋</Text> }} />
      <Tabs.Screen name="research" options={{ title: 'Research', tabBarIcon: () => <Text>🔬</Text> }} />
      <Tabs.Screen name="providers" options={{ title: 'Providers', tabBarIcon: () => <Text>🏥</Text> }} />
      <Tabs.Screen name="more" options={{ title: 'More', tabBarIcon: () => <Text>☰</Text> }} />
      <Tabs.Screen name="insights" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}
