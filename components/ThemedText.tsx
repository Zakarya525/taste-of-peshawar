import React from "react";
import { Text, TextProps, StyleSheet } from "react-native";
import { Colors, Theme } from "../constants/Colors";

interface ThemedTextProps extends TextProps {
  type?: "title" | "subtitle" | "body" | "caption" | "link" | "button";
  variant?: "primary" | "secondary" | "muted" | "inverse";
}

export const ThemedText: React.FC<ThemedTextProps> = ({
  type = "body",
  variant = "primary",
  style,
  children,
  ...props
}) => {
  const textStyle = [styles.base, styles[type], styles[variant], style];

  return (
    <Text style={textStyle} {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: Theme.typography.fontFamily.primary,
  },

  // Text types
  title: {
    fontSize: Theme.typography.fontSize["2xl"],
    fontWeight: Theme.typography.fontWeight.bold,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.semibold,
    lineHeight: 28,
  },
  body: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.normal,
    lineHeight: 24,
  },
  caption: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.normal,
    lineHeight: 20,
  },
  link: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.medium,
    lineHeight: 24,
    textDecorationLine: "underline",
  },
  button: {
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.semibold,
    lineHeight: 24,
  },

  // Variants
  primary: {
    color: Colors.text.primary,
  },
  secondary: {
    color: Colors.text.secondary,
  },
  muted: {
    color: Colors.text.muted,
  },
  inverse: {
    color: Colors.text.inverse,
  },
});
