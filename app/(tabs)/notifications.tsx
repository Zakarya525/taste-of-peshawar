import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
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

const { width } = Dimensions.get("window");

export default function NotificationsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");

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
      return diffInMinutes < 1 ? "Just now" : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return "Yesterday";
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
        return "receipt-outline";
      case "system":
        return "settings-outline";
      case "alert":
        return "warning-outline";
      case "promotion":
        return "gift-outline";
      case "reminder":
        return "time-outline";
      default:
        return "notifications-outline";
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
      case "promotion":
        return "#f59e0b";
      case "reminder":
        return "#8b5cf6";
      default:
        return "#10b981";
    }
  };

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case "order":
        return "#eff6ff";
      case "system":
        return "#f8fafc";
      case "alert":
        return "#fef2f2";
      case "promotion":
        return "#fffbeb";
      case "reminder":
        return "#f5f3ff";
      default:
        return "#f0fdf4";
    }
  };

  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case "high":
        return { color: "#ef4444", size: 8 };
      case "medium":
        return { color: "#f59e0b", size: 6 };
      case "low":
        return { color: "#10b981", size: 4 };
      default:
        return null;
    }
  };

  const filterTabs = [
    { id: "all", label: "All", icon: "notifications-outline" },
    { id: "order", label: "Orders", icon: "receipt-outline" },
    { id: "system", label: "System", icon: "settings-outline" },
    { id: "alert", label: "Alerts", icon: "warning-outline" },
  ];

  const filteredNotifications =
    notifications?.filter(
      (notification) =>
        selectedFilter === "all" || notification.type === selectedFilter
    ) || [];

  const NotificationCard = ({ notification }: { notification: any }) => {
    const priorityIndicator = getPriorityIndicator(notification.priority);

    return (
      <Card
        variant="default"
        padding="none"
        margin="small"
        style={styles.notificationCard}
      >
        <TouchableOpacity
          style={[
            styles.notificationContainer,
            { backgroundColor: getNotificationBgColor(notification.type) },
          ]}
          activeOpacity={0.7}
          onPress={() => handleMarkRead(notification.id)}
        >
          {priorityIndicator && (
            <View
              style={[
                styles.priorityIndicator,
                {
                  backgroundColor: priorityIndicator.color,
                  width: priorityIndicator.size,
                  height: priorityIndicator.size,
                },
              ]}
            />
          )}

          <View style={styles.notificationHeader}>
            <View
              style={[
                styles.notificationIcon,
                { backgroundColor: getNotificationBgColor(notification.type) },
              ]}
            >
              <Ionicons
                name={getNotificationIcon(notification.type) as any}
                size={24}
                color={getNotificationColor(notification.type)}
              />
            </View>

            <View style={styles.notificationContent}>
              <View style={styles.titleRow}>
                <Text style={styles.notificationTitle} numberOfLines={1}>
                  {notification.title}
                </Text>
                <Text style={styles.notificationTime}>
                  {formatTime(notification.created_at)}
                </Text>
              </View>

              <Text style={styles.notificationMessage} numberOfLines={2}>
                {notification.message}
              </Text>

              {notification.metadata && (
                <View style={styles.metadataContainer}>
                  {notification.metadata.order_id && (
                    <View style={styles.metadataChip}>
                      <Text style={styles.metadataText}>
                        Order #{notification.metadata.order_id}
                      </Text>
                    </View>
                  )}
                  {notification.metadata.amount && (
                    <View style={styles.metadataChip}>
                      <Text style={styles.metadataText}>
                        ${notification.metadata.amount}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.markReadButton}
              onPress={() => handleMarkRead(notification.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Card>
    );
  };

  const FilterTabs = () => (
    <View style={styles.filterContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScrollContent}
      >
        {filterTabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.filterTab,
              selectedFilter === tab.id && styles.filterTabActive,
            ]}
            onPress={() => setSelectedFilter(tab.id)}
          >
            <Ionicons
              name={tab.icon as any}
              size={16}
              color={selectedFilter === tab.id ? "#ffffff" : "#64748b"}
            />
            <Text
              style={[
                styles.filterTabText,
                selectedFilter === tab.id && styles.filterTabTextActive,
              ]}
            >
              {tab.label}
            </Text>
            {tab.id !== "all" && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>
                  {notifications?.filter((n) => n.type === tab.id).length || 0}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const Header = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.subtitle}>
          {filteredNotifications.length} unread
        </Text>
      </View>

      {notifications && notifications.length > 0 && (
        <TouchableOpacity
          style={styles.markAllButton}
          onPress={handleMarkAllRead}
        >
          <Ionicons name="checkmark-done" size={16} color="#ffffff" />
          <Text style={styles.markAllText}>Mark All Read</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const EmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyStateIcon}>
        <Ionicons name="notifications-off-outline" size={64} color="#cbd5e1" />
      </View>
      <Text style={styles.emptyTitle}>All caught up!</Text>
      <Text style={styles.emptySubtitle}>
        {selectedFilter === "all"
          ? "You have no new notifications"
          : `No ${selectedFilter} notifications found`}
      </Text>
    </View>
  );

  const LoadingState = () => (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingSpinner}>
        <Ionicons name="refresh" size={24} color="#e34691" />
      </View>
      <Text style={styles.loadingText}>Loading notifications...</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <FilterTabs />

      <ScrollView
        style={styles.notificationsContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#e34691"]}
            tintColor="#e34691"
          />
        }
      >
        {isLoading ? (
          <LoadingState />
        ) : filteredNotifications.length > 0 ? (
          <View style={styles.notificationsList}>
            {filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
              />
            ))}
          </View>
        ) : (
          <EmptyState />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0f172a",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
  },
  markAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#e34691",
    borderRadius: 12,
    shadowColor: "#e34691",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
    marginLeft: 6,
  },
  filterContainer: {
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  filterScrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 6,
  },
  filterTabActive: {
    backgroundColor: "#e34691",
    borderColor: "#e34691",
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  filterTabTextActive: {
    color: "#ffffff",
  },
  filterBadge: {
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },
  notificationsContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  notificationsList: {
    paddingVertical: 8,
  },
  notificationCard: {
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  notificationContainer: {
    padding: 16,
    borderRadius: 16,
    position: "relative",
  },
  priorityIndicator: {
    position: "absolute",
    top: 12,
    right: 12,
    borderRadius: 4,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  notificationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  notificationContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    flex: 1,
    marginRight: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "500",
  },
  notificationMessage: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
    marginBottom: 8,
  },
  metadataContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  metadataChip: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  metadataText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#475569",
  },
  markReadButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  emptyStateContainer: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingSpinner: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },
});
