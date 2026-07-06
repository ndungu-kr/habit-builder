import { useEffect, useRef } from 'react';
import { Animated, AccessibilityInfo, Easing, ViewStyle, StyleProp } from 'react-native';

interface FadeInViewProps {
  delay?: number;
  duration?: number;
  slideDistance?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export default function FadeInView({
  delay = 0,
  duration = 500,
  slideDistance = 30,
  style,
  children,
}: FadeInViewProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(slideDistance)).current;
  const scale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (enabled) {
        translateY.setValue(0);
        scale.setValue(1);
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          delay: delay + 350,
          useNativeDriver: true,
        }).start();
        return;
      }

      // Wait for screen transition to finish before animating
      const totalDelay = delay + 350;

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          delay: totalDelay,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration,
          delay: totalDelay,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration,
          delay: totalDelay,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }, { scale }] }]}>
      {children}
    </Animated.View>
  );
}