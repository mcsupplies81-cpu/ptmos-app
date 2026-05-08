import NetInfo from '@react-native-community/netinfo';
import { useEffect, useRef, useState } from 'react';
import { Animated, StatusBar, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';

const BANNER_CONTENT_HEIGHT = 44;
const HIDDEN_OFFSET = -120;

export default function OfflineBanner() {
  const insets = useSafeAreaInsets();
  const statusBarHeight = Math.max(insets.top, StatusBar.currentHeight ?? 0);
  const bannerHeight = statusBarHeight + BANNER_CONTENT_HEIGHT;
  const [isOffline, setIsOffline] = useState(false);
  const translateY = useRef(new Animated.Value(HIDDEN_OFFSET)).current;

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(state.isConnected === false || state.isInternetReachable === false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: isOffline ? 0 : -bannerHeight,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [bannerHeight, isOffline, translateY]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        {
          height: bannerHeight,
          paddingTop: statusBarHeight,
          transform: [{ translateY }],
        },
      ]}
    >
      <Text style={styles.text}>No internet connection</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 1000,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.warning,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
