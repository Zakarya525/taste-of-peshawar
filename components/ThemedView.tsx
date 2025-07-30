import React from "react";
import { View, ViewProps, StyleSheet } from "react-native";
import { Colors, Theme } from "../constants/Colors";

interface ThemedViewProps extends ViewProps {
  variant?: "primary" | "secondary" | "card" | "modal";
}

export const ThemedView: React.FC<ThemedViewProps> = ({
  variant = "primary",
  style,
  children,
  ...props
}) => {
  const viewStyle = [styles.base, styles[variant], style];

  return (
    <View style={viewStyle} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    flex: 1,
  },

  // Variants
  primary: {
    backgroundColor: Colors.background.primary,
  },
  secondary: {
    backgroundColor: Colors.background.secondary,
  },
  card: {
    backgroundColor: Colors.background.card,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    ...Theme.shadows.sm,
  },
  modal: {
    backgroundColor: Colors.background.modal,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    ...Theme.shadows.lg,
  },
});
