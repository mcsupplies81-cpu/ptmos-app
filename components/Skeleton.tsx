import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import type { DimensionValue, LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';

import Colors from '@/constants/Colors';

type SkeletonProps = {
  width: DimensionValue;
  height: DimensionValue;
  borderRadius: number;
  style?: StyleProp<ViewStyle>;
};

const lightenHex = (hex: string, amount = 0.45) => {
  const normalized = hex.replace('#', '');
  const value = Number.parseInt(normalized, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  const lighten = (channel: number) => Math.round(channel + (255 - channel) * amount);

  return `rgb(${lighten(r)}, ${lighten(g)}, ${lighten(b)})`;
};

const BASE_COLOR = Colors.card;
const HIGHLIGHT_COLOR = lightenHex(Colors.card);

export default function Skeleton({ width, height, borderRadius, style }: SkeletonProps) {
  const shimmer = useRef(new Animated.Value(0)).current;
  const [layoutWidth, setLayoutWidth] = useState(typeof width === 'number' ? width : 0);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1400,
        useNativeDriver: true,
      }),
    );

    loop.start();

    return () => {
      loop.stop();
    };
  }, [shimmer]);

  const handleLayout = (event: LayoutChangeEvent) => {
    setLayoutWidth(event.nativeEvent.layout.width);
  };

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-layoutWidth, layoutWidth],
  });

  return (
    <View
      onLayout={handleLayout}
      style={[styles.container, { width, height, borderRadius }, style]}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading content"
    >
      {layoutWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.shimmer,
            {
              borderRadius,
              width: layoutWidth * 2,
              transform: [{ translateX }],
            },
          ]}
        >
          <LinearGradient
            colors={[BASE_COLOR, HIGHLIGHT_COLOR, BASE_COLOR]}
            locations={[0.25, 0.5, 0.75]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: BASE_COLOR,
    overflow: 'hidden',
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
  },
});
