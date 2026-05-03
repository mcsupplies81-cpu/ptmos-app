import { Tabs } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import PlusMenu from '@/components/PlusMenu';
import Colors from '@/constants/Colors';

function HomeIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <Path d="M9 21V12h6v9" />
    </Svg>
  );
}

function ProtocolsIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M10.5 6.5a4 4 0 010 8H7a4 4 0 010-8h3.5z" />
      <Path d="M10.5 6.5H14a4 4 0 010 8h-3.5" />
      <Path d="M10.5 10.5h3" />
    </Svg>
  );
}

function ChatIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </Svg>
  );
}

function InsightsIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4 20V14M8 20V10M12 20V4M16 20V8M20 20V12" />
    </Svg>
  );
}

function MoreIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4 6h16M4 12h16M4 18h16" />
    </Svg>
  );
}

export default function TabsLayout() {
  const [plusOpen, setPlusOpen] = useState(false);

  return (
    <>
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
        <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <HomeIcon color={color} /> }} />
        <Tabs.Screen name="protocols" options={{ title: 'Protocols', tabBarIcon: ({ color }) => <ProtocolsIcon color={color} /> }} />
        <Tabs.Screen
          name="plus"
          options={{
            title: '',
            tabBarIcon: () => (
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: Colors.accent,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 4,
                  shadowColor: Colors.accent,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.4,
                  shadowRadius: 6,
                  elevation: 6,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 28, lineHeight: 32, fontWeight: '300' }}>+</Text>
              </View>
            ),
            tabBarButton: (props) => <Pressable {...(props as any)} onPress={() => setPlusOpen(true)} />,
          }}
        />
        <Tabs.Screen name="chat" options={{ title: 'Chat', tabBarIcon: ({ color }) => <ChatIcon color={color} /> }} />
        <Tabs.Screen name="insights" options={{ title: 'Insights', tabBarIcon: ({ color }) => <InsightsIcon color={color} /> }} />
        <Tabs.Screen name="more" options={{ title: 'More', tabBarIcon: ({ color }) => <MoreIcon color={color} /> }} />
        <Tabs.Screen name="log" options={{ href: null }} />
        <Tabs.Screen name="research" options={{ href: null }} />
        <Tabs.Screen name="providers" options={{ href: null }} />
        <Tabs.Screen name="settings" options={{ href: null }} />
      </Tabs>
      <PlusMenu visible={plusOpen} onClose={() => setPlusOpen(false)} />
    </>
  );
}
