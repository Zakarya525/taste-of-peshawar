import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { Colors, Theme } from "../../constants/Colors";

interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "outlined" | "flat";
  padding?: "none" | "small" | "medium" | "large";
  margin?: "none" | "small" | "medium" | "large";
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  padding = "medium",
  margin = "none",
  style,
}) => {
  const cardStyle = [
    styles.base,
    styles[variant],
    styles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}`],
    styles[`margin${margin.charAt(0).toUpperCase() + margin.slice(1)}`],
    style,
  ];

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.background.card,
    borderRadius: Theme.borderRadius.xl,
  },

  // Variants
  default: {
    ...Theme.shadows.md,
  },
  elevated: {
    ...Theme.shadows.lg,
  },
  outlined: {
    borderWidth: 1,
    borderColor: Colors.border.light,
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  flat: {
    backgroundColor: Colors.background.primary,
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  // Padding
  paddingNone: {
    padding: 0,
  },
  paddingSmall: {
    padding: Theme.spacing.md,
  },
  paddingMedium: {
    padding: Theme.spacing.lg,
  },
  paddingLarge: {
    padding: Theme.spacing.xl,
  },

  // Margin
  marginNone: {
    margin: 0,
  },
  marginSmall: {
    margin: Theme.spacing.sm,
  },
  marginMedium: {
    margin: Theme.spacing.lg,
  },
  marginLarge: {
    margin: Theme.spacing.xl,
  },
});
