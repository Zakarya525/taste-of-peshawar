import React from "react";
import { View, Text } from "react-native";
import { useNotifications } from "../../hooks/useNotifications";

interface NotificationBadgeProps {
  size?: "small" | "medium" | "large";
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  size = "medium",
}) => {
  const { data: notifications } = useNotifications();

  const unreadCount = notifications?.length || 0;

  if (unreadCount === 0) return null;

  const getBadgeClasses = () => {
    const baseClasses = "bg-error-500 rounded-full justify-center items-center absolute -top-1 -right-1 min-w-4 min-h-4";
    
    switch (size) {
      case "small":
        return `${baseClasses} w-4 h-4`;
      case "large":
        return `${baseClasses} w-6 h-6`;
      default:
        return `${baseClasses} w-5 h-5`;
    }
  };

  const getTextClasses = () => {
    const baseClasses = "text-white font-bold text-center";
    
    switch (size) {
      case "small":
        return `${baseClasses} text-xs`;
      case "large":
        return `${baseClasses} text-sm`;
      default:
        return `${baseClasses} text-xs`;
    }
  };

  return (
    <View className={getBadgeClasses()}>
      <Text className={getTextClasses()}>
        {unreadCount > 99 ? "99+" : unreadCount}
      </Text>
    </View>
  );
};
