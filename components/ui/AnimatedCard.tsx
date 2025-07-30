import React, { useEffect } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';
import { Card } from './Card';
import { Colors, Theme } from '../../constants/Colors';

interface AnimatedCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'flat';
  padding?: 'none' | 'small' | 'medium' | 'large';
  margin?: 'none' | 'small' | 'medium' | 'large';
  style?: ViewStyle;
  delay?: number;
  onPress?: () => void;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  variant = 'default',
  padding = 'medium',
  margin = 'none',
  style,
  delay = 0,
  onPress,
}) => {
  const scaleValue = new Animated.Value(0.95);
  const opacityValue = new Animated.Value(0);

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 300,
        delay: delay * 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 300,
        delay: delay * 100,
        useNativeDriver: true,
      }),
    ]);

    animation.start();
  }, []);

  const handlePressIn = () => {
    if (onPress) {
      Animated.spring(scaleValue, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleValue }],
          opacity: opacityValue,
        },
        style,
      ]}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
    >
      <Card
        variant={variant}
        padding={padding}
        margin={margin}
        style={onPress ? styles.pressable : undefined}
      >
        {children}
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...Theme.shadows.sm,
  },
  pressable: {
    ...Theme.shadows.md,
  },
}); 