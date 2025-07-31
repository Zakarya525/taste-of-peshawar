import React from "react";
import { View, ViewStyle } from "react-native";

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
  const getCardClasses = () => {
    const baseClasses = "bg-background-card rounded-xl";
    
    const variantClasses = {
      default: "shadow-md",
      elevated: "shadow-lg",
      outlined: "border border-border-light shadow-none",
      flat: "bg-background-primary shadow-none",
    };
    
    const paddingClasses = {
      none: "p-0",
      small: "p-4",
      medium: "p-6",
      large: "p-8",
    };
    
    const marginClasses = {
      none: "m-0",
      small: "m-2",
      medium: "m-6",
      large: "m-8",
    };

    return `${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${marginClasses[margin]}`;
  };

  return <View className={getCardClasses()} style={style}>{children}</View>;
};
