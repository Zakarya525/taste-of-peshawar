import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";
import { Colors, Theme } from "../../constants/Colors";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "small" | "medium" | "large";
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = "primary",
  size = "medium",
  loading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  style,
  disabled,
  ...props
}) => {
  const buttonStyle = [
    styles.base,
    styles[size],
    styles[variant],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.text,
    styles[`${size}Text`],
    styles[`${variant}Text`],
    disabled && styles.disabledText,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? "#ffffff" : "#3b82f6"}
        />
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <Ionicons
              name={icon}
              size={size === "large" ? 20 : size === "small" ? 14 : 16}
              color={variant === "primary" ? "#ffffff" : "#3b82f6"}
              style={styles.leftIcon}
            />
          )}
          <Text style={textStyle}>{title}</Text>
          {icon && iconPosition === "right" && (
            <Ionicons
              name={icon}
              size={size === "large" ? 20 : size === "small" ? 14 : 16}
              color={variant === "primary" ? "#ffffff" : "#3b82f6"}
              style={styles.rightIcon}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Theme.borderRadius.lg,
    minHeight: 44, // Touch target minimum
  },

  // Sizes
  small: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    minHeight: 44,
  },
  large: {
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.lg,
    minHeight: 52,
  },

  // Variants
  primary: {
    backgroundColor: Colors.primary[500],
    borderWidth: 0,
  },
  secondary: {
    backgroundColor: Colors.neutral[100],
    borderWidth: 0,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: Colors.primary[500],
  },
  ghost: {
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  danger: {
    backgroundColor: Colors.error[500],
    borderWidth: 0,
  },

  // Text styles
  text: {
    fontWeight: Theme.typography.fontWeight.semibold,
    textAlign: "center",
  },
  smallText: {
    fontSize: Theme.typography.fontSize.sm,
  },
  mediumText: {
    fontSize: Theme.typography.fontSize.md,
  },
  largeText: {
    fontSize: Theme.typography.fontSize.lg,
  },

  primaryText: {
    color: Colors.text.inverse,
  },
  secondaryText: {
    color: Colors.text.primary,
  },
  outlineText: {
    color: Colors.primary[500],
  },
  ghostText: {
    color: Colors.primary[500],
  },
  dangerText: {
    color: Colors.text.inverse,
  },

  // Icons
  leftIcon: {
    marginRight: Theme.spacing.sm,
  },
  rightIcon: {
    marginLeft: Theme.spacing.sm,
  },

  // States
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },

  fullWidth: {
    width: "100%",
  },
});
