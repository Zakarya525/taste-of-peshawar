import React from "react";
import { View, Text, StyleSheet } from "react-native";
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

  const getBadgeSize = () => {
    switch (size) {
      case "small":
        return { width: 16, height: 16, fontSize: 10 };
      case "large":
        return { width: 24, height: 24, fontSize: 14 };
      default:
        return { width: 20, height: 20, fontSize: 12 };
    }
  };

  const badgeStyle = getBadgeSize();

  return (
    <View style={[styles.badge, badgeStyle]}>
      <Text style={[styles.badgeText, { fontSize: badgeStyle.fontSize }]}>
        {unreadCount > 99 ? "99+" : unreadCount}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: "#ef4444",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: -5,
    right: -5,
    minWidth: 16,
    minHeight: 16,
  },
  badgeText: {
    color: "#ffffff",
    fontWeight: "bold",
    textAlign: "center",
  },
});
