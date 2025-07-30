import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';

interface GradientBackgroundProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'warm' | 'spice';
  style?: ViewStyle;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
  variant = 'primary',
  style,
}) => {
  const getGradientColors = () => {
    switch (variant) {
      case 'primary':
        return [Colors.primary[100], Colors.primary[50]];
      case 'secondary':
        return [Colors.secondary[100], Colors.secondary[50]];
      case 'warm':
        return [Colors.accent[100], Colors.primary[50]];
      case 'spice':
        return [Colors.restaurant.spice, Colors.restaurant.saffron];
      default:
        return [Colors.primary[100], Colors.primary[50]];
    }
  };

  return (
    <LinearGradient
      colors={getGradientColors()}
      style={[styles.container, style]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 