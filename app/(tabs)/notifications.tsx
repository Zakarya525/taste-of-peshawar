import { Ionicons } from "@expo/vector-icons";
import * as Device from "expo-device";
import React, { useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../components/ui/Card";
import { useAuth } from "../../contexts/AuthContext";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationRealtime,
  useNotifications,
} from "../../hooks/useNotifications";
import { supabase } from "../../lib/supabase";

export default function NotificationsScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const { data: notifications, isLoading, refetch } = useNotifications();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const { branch } = useAuth();

  // Enable real-time updates
  useNotificationRealtime();

  // Debug: Log current state
  console.log("[NotificationsScreen] Current state:", {
    isLoading,
    notificationsCount: notifications?.length || 0,
    hasNotifications: !!notifications && notifications.length > 0,
  });

  // Test function to create a notification
  const createTestNotification = async () => {
    try {
      if (!branch?.id) {
        console.error("No branch found for test notification");
        return;
      }

      const deviceId =
        Device.osInternalBuildId || Device.deviceName || "unknown";

      const { error } = await supabase.from("notifications").insert({
        branch_id: branch.id,
        title: "Test Notification",
        message:
          "This is a test notification created at " +
          new Date().toLocaleTimeString(),
        type: "test",
        is_read: false,
        device_id: deviceId,
      });

      if (error) {
        console.error("Error creating test notification:", error);
      } else {
        console.log("Test notification created successfully");
      }
    } catch (error) {
      console.error("Error in createTestNotification:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleMarkRead = async (notificationId: string) => {
    try {
      await markReadMutation.mutateAsync(notificationId);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllRead = () => {
    Alert.alert(
      "Mark All as Read",
      "Are you sure you want to mark all notifications as read?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Mark All Read",
          onPress: async () => {
            try {
              await markAllReadMutation.mutateAsync();
            } catch (error) {
              console.error("Error marking all notifications as read:", error);
            }
          },
        },
      ]
    );
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60)
      );
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return "receipt";
      case "system":
        return "settings";
      case "alert":
        return "warning";
      default:
        return "notifications";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "order":
        return "#3b82f6";
      case "system":
        return "#64748b";
      case "alert":
        return "#ef4444";
      default:
        return "#10b981";
    }
  };

  const NotificationCard = ({ notification }: { notification: any }) => (
    <Card variant="default" padding="medium" margin="small">
      <View style={styles.notificationHeader}>
        <View style={styles.notificationIcon}>
          <Ionicons
            name={getNotificationIcon(notification.type) as any}
            size={20}
            color={getNotificationColor(notification.type)}
          />
        </View>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <Text style={styles.notificationMessage}>{notification.message}</Text>
          <Text style={styles.notificationTime}>
            {formatTime(notification.created_at)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.markReadButton}
          onPress={() => handleMarkRead(notification.id)}
        >
          <Ionicons name="checkmark-circle" size={20} color="#10b981" />
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.testButton}
            onPress={createTestNotification}
          >
            <Text style={styles.testButtonText}>Test</Text>
          </TouchableOpacity>
          {notifications && notifications.length > 0 && (
            <TouchableOpacity
              style={styles.markAllButton}
              onPress={handleMarkAllRead}
            >
              <Text style={styles.markAllText}>Mark All Read</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.notificationsContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading notifications...</Text>
          </View>
        ) : notifications && notifications.length > 0 ? (
          <>
            <View style={styles.debugInfo}>
              <Text style={styles.debugText}>
                Found {notifications.length} unread notifications
              </Text>
            </View>
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
              />
            ))}
          </>
        ) : (
          <Card variant="flat" padding="large" style={styles.emptyState}>
            <Ionicons name="notifications-off" size={48} color="#64748b" />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptySubtitle}>
              You're all caught up! New notifications will appear here.
            </Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#f1f5f9",
    borderRadius: 6,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#3b82f6",
  },
  notificationsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#64748b",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
    textAlign: "center",
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: "#94a3b8",
  },
  markReadButton: {
    padding: 4,
  },
  debugInfo: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "#f0f9ff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0f2fe",
  },
  debugText: {
    fontSize: 12,
    color: "#0369a1",
    textAlign: "center",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  testButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#fef3c7",
    borderRadius: 6,
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#d97706",
  },
});
