import { useEffect, useRef, useState } from 'react';
import { Animated, View, AccessibilityInfo, TextStyle, StyleProp } from 'react-native';

interface OdometerNumberProps {
  value: number;
  style: StyleProp<TextStyle>;
  duration?: number;
}

export default function OdometerNumber({ value, style, duration = 350 }: OdometerNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const slideOut = useRef(new Animated.Value(0)).current;
  const slideIn = useRef(new Animated.Value(0)).current;
  const opacityOut = useRef(new Animated.Value(1)).current;
  const opacityIn = useRef(new Animated.Value(0)).current;
  const isFirst = useRef(true);
  const prevValue = useRef(value);

  useEffect(() => {
    // Skip animation on first render
    if (isFirst.current) {
      isFirst.current = false;
      prevValue.current = value;
      setDisplayValue(value);
      return;
    }

    // Skip if value hasn't actually changed
    if (value === prevValue.current) return;

    const goingUp = value > prevValue.current;
    prevValue.current = value;

    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (enabled) {
        setDisplayValue(value);
        return;
      }

      // Reset positions
      const slideDistance = 24;
      slideOut.setValue(0);
      opacityOut.setValue(1);
      slideIn.setValue(goingUp ? slideDistance : -slideDistance);
      opacityIn.setValue(0);

      // Old number slides away
      Animated.parallel([
        Animated.timing(slideOut, {
          toValue: goingUp ? -slideDistance : slideDistance,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(opacityOut, {
          toValue: 0,
          duration: duration * 0.6,
          useNativeDriver: true,
        }),
      ]).start();

      // New number slides in after a brief overlap
      setTimeout(() => {
        setDisplayValue(value);
        Animated.parallel([
          Animated.timing(slideIn, {
            toValue: 0,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(opacityIn, {
            toValue: 1,
            duration: duration * 0.6,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Reset for next animation
          slideOut.setValue(0);
          opacityOut.setValue(1);
          opacityIn.setValue(1);
        });
      }, duration * 0.3);
    });
  }, [value]);

  return (
    <View style={{ overflow: 'hidden' }}>
      <Animated.Text
        style={[style, { opacity: opacityIn, transform: [{ translateY: slideIn }] }]}
      >
        {displayValue}
      </Animated.Text>
    </View>
  );
}