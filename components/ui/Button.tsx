import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
  const getButtonClasses = () => {
    const baseClasses = "flex-row items-center justify-center rounded-lg min-h-[44px]";
    const sizeClasses = {
      small: "px-4 py-2 min-h-[36px]",
      medium: "px-6 py-4 min-h-[44px]",
      large: "px-8 py-6 min-h-[52px]",
    };
    const variantClasses = {
      primary: "bg-primary-500 border-0",
      secondary: "bg-neutral-100 border-0",
      outline: "bg-transparent border-2 border-primary-500",
      ghost: "bg-transparent border-0",
      danger: "bg-error-500 border-0",
    };
    const stateClasses = disabled ? "opacity-50" : "active:opacity-70";
    const widthClasses = fullWidth ? "w-full" : "";

    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${stateClasses} ${widthClasses}`;
  };

  const getTextClasses = () => {
    const baseClasses = "font-semibold text-center";
    const sizeClasses = {
      small: "text-sm",
      medium: "text-base",
      large: "text-lg",
    };
    const variantClasses = {
      primary: "text-white",
      secondary: "text-text-primary",
      outline: "text-primary-500",
      ghost: "text-primary-500",
      danger: "text-white",
    };
    const stateClasses = disabled ? "opacity-70" : "";

    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${stateClasses}`;
  };

  const getIconSize = () => {
    switch (size) {
      case "large":
        return 20;
      case "small":
        return 14;
      default:
        return 16;
    }
  };

  const getIconColor = () => {
    return variant === "primary" ? "#ffffff" : "#3b82f6";
  };

  const getIconClasses = () => {
    return iconPosition === "left" ? "mr-2" : "ml-2";
  };

  return (
    <TouchableOpacity
      className={getButtonClasses()}
      disabled={disabled || loading}
      style={style}
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
              size={getIconSize()}
              color={getIconColor()}
              className={getIconClasses()}
            />
          )}
          <Text className={getTextClasses()}>{title}</Text>
          {icon && iconPosition === "right" && (
            <Ionicons
              name={icon}
              size={getIconSize()}
              color={getIconColor()}
              className={getIconClasses()}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};
