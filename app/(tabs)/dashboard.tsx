import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useAuth } from "../../contexts/AuthContext";
import { useNotificationRealtime } from "../../hooks/useNotifications";
import {
  useOrderRealtime,
  useOrders,
  useOrderStats,
  useUpdateOrderStatus,
} from "../../hooks/useOrders";
import { OrderStatus } from "../../lib/supabase";

const { width } = Dimensions.get("window");

export default function DashboardScreen() {
  const router = useRouter();
  const { branch, signOut } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "all">(
    "all"
  );
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: orders,
    isLoading: ordersLoading,
    refetch: refetchOrders,
  } = useOrders(selectedStatus === "all" ? undefined : selectedStatus);
  const { data: stats, isLoading: statsLoading } = useOrderStats();
  const updateStatusMutation = useUpdateOrderStatus();

  // Enable real-time updates
  useOrderRealtime();
  useNotificationRealtime();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchOrders();
    setRefreshing(false);
  };

  const handleStatusUpdate = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    try {
      await updateStatusMutation.mutateAsync({ orderId, status: newStatus });
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "New":
        return "#e34691";
      case "Preparing":
        return "#f59e0b";
      case "Ready":
        return "#10b981";
      default:
        return "#64748b";
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "New":
        return "add-circle";
      case "Preparing":
        return "time";
      case "Ready":
        return "checkmark-circle";
      default:
        return "help-circle";
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return `£${price.toFixed(2)}`;
  };

  const StatusFilter = ({
    status,
    label,
    count,
  }: {
    status: OrderStatus | "all";
    label: string;
    count?: number;
  }) => {
    const isActive = selectedStatus === status;
    return (
      <TouchableOpacity
        style={[styles.statusFilter, isActive && styles.statusFilterActive]}
        onPress={() => setSelectedStatus(status)}
        activeOpacity={0.8}
      >
        <View style={styles.statusFilterContent}>
          <Text
            style={[
              styles.statusFilterText,
              isActive && styles.statusFilterTextActive,
            ]}
          >
            {label}
          </Text>
          {count !== undefined && (
            <View
              style={[styles.statusCount, isActive && styles.statusCountActive]}
            >
              <Text
                style={[
                  styles.statusCountText,
                  isActive && styles.statusCountTextActive,
                ]}
              >
                {count}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const OrderCard = ({ order }: { order: any }) => (
    <TouchableOpacity
      style={styles.orderCardContainer}
      onPress={() => router.push(`/order-details?id=${order.id}`)}
      activeOpacity={0.7}
    >
      <Card variant="default" padding="none" style={styles.orderCard}>
        <View style={styles.orderCardInner}>
          <View style={styles.orderHeader}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderNumber}>#{order.order_number}</Text>
              <View style={styles.tableNumberContainer}>
                <Ionicons name="restaurant" size={14} color="#64748b" />
                <Text style={styles.tableNumber}>
                  Table {order.table_number}
                </Text>
              </View>
            </View>
            <View style={styles.orderStatus}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: `${getStatusColor(order.status)}15` },
                ]}
              >
                <Ionicons
                  name={getStatusIcon(order.status)}
                  size={16}
                  color={getStatusColor(order.status)}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(order.status) },
                  ]}
                >
                  {order.status}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.orderMetrics}>
            <View style={styles.metricItem}>
              <Ionicons name="bag" size={14} color="#64748b" />
              <Text style={styles.metricText}>{order.item_count} items</Text>
            </View>
            <View style={styles.metricItem}>
              <Ionicons name="time-outline" size={14} color="#64748b" />
              <Text style={styles.metricText}>
                {formatTime(order.created_at)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.orderFooter}>
            <View style={styles.orderTotalContainer}>
              <Text style={styles.orderTotalLabel}>Total</Text>
              <Text style={styles.orderTotal}>
                {formatPrice(order.total_amount)}
              </Text>
            </View>
            <View style={styles.orderActions}>
              {order.status === "New" && (
                <Button
                  title="Start Preparing"
                  variant="primary"
                  size="small"
                  onPress={() => handleStatusUpdate(order.id, "Preparing")}
                  style={styles.actionButton}
                />
              )}
              {order.status === "Preparing" && (
                <Button
                  title="Mark Ready"
                  variant="primary"
                  size="small"
                  onPress={() => handleStatusUpdate(order.id, "Ready")}
                  style={styles.actionButton}
                />
              )}
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Enhanced Header */}
      <View style={styles.header}>
        <View style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.greetingContainer}>
                <Text style={styles.greeting}>Welcome back!</Text>
                <View style={styles.branchContainer}>
                  <Text style={styles.branchName}>
                    Taste of Peshawar -{" "}
                    {branch?.name === "Wembley" ? "BlackBurn" : branch?.name}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={() => router.push("/(tabs)/settings")}
              >
                <Ionicons name="settings-outline" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Decorative background elements */}
          <View style={styles.decoration1} />
          <View style={styles.decoration2} />
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Stats Cards */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.statsContainer}>
            <TouchableOpacity
              style={styles.statCard}
              onPress={() => router.push("/(tabs)/menu")}
            >
              <View style={styles.statContent}>
                <View
                  style={[
                    styles.statIconContainer,
                    { backgroundColor: "#e3469115" },
                  ]}
                >
                  <Ionicons name="add-circle" size={30} color="#e34691" />
                </View>
                <Text style={styles.statNumber}>Take New Order</Text>
                <Text style={styles.statLabel}>
                  {stats?.new || 0} New Orders
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.statCard}
              onPress={() => router.push("/(tabs)/orders")}
            >
              <View style={styles.statContent}>
                <View
                  style={[
                    styles.statIconContainer,
                    { backgroundColor: "#e3469115" },
                  ]}
                >
                  <Ionicons name="restaurant" size={30} color="#e34691" />
                </View>
                <Text style={styles.statNumber}>Kitchen View</Text>
                <Text style={styles.statLabel}>{stats?.total || 0} Orders</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Enhanced Status Filters */}
        <View style={styles.filtersSection}>
          <Text style={styles.sectionTitle}>Filter Orders</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContainer}
          >
            <StatusFilter
              status="all"
              label="All Orders"
              count={stats?.total}
            />
            <StatusFilter status="New" label="New" count={stats?.new} />
            <StatusFilter
              status="Preparing"
              label="Preparing"
              count={stats?.preparing}
            />
            <StatusFilter status="Ready" label="Ready" count={stats?.ready} />
          </ScrollView>
        </View>

        {/* Enhanced Orders List */}
        <View style={styles.ordersSection}>
          <View style={styles.ordersHeader}>
            <Text style={styles.sectionTitle}>
              {selectedStatus === "all"
                ? "All Orders"
                : `${selectedStatus} Orders`}
            </Text>
            <View style={styles.ordersCountContainer}>
              <Text style={styles.ordersCount}>{orders?.length || 0}</Text>
              <Text style={styles.ordersCountLabel}>Orders</Text>
            </View>
          </View>

          {ordersLoading ? (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingSpinner}>
                <Ionicons name="hourglass" size={24} color="#3b82f6" />
              </View>
              <Text style={styles.loadingText}>Loading orders...</Text>
            </View>
          ) : orders && orders.length > 0 ? (
            <View style={styles.ordersList}>
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </View>
          ) : (
            <Card variant="flat" padding="none" style={styles.emptyState}>
              <View style={styles.emptyContent}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons
                    name="restaurant-outline"
                    size={32}
                    color="#94a3b8"
                  />
                </View>
                <Text style={styles.emptyTitle}>No orders found</Text>
                <Text style={styles.emptySubtitle}>
                  {selectedStatus === "all"
                    ? "No orders have been placed yet today"
                    : `No ${selectedStatus.toLowerCase()} orders at the moment`}
                </Text>
              </View>
            </Card>
          )}
        </View>
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
    position: "relative",
    overflow: "hidden",
  },
  headerGradient: {
    backgroundColor: "#e34691",
    paddingVertical: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    zIndex: 2,
  },
  headerLeft: {
    flex: 1,
  },
  greetingContainer: {
    gap: 8,
  },
  timeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  timeText: {
    fontSize: 11,
    color: "#ffffff",
    fontWeight: "600",
  },
  greeting: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  branchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  branchIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  branchName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    flex: 1,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10b981",
    ...Platform.select({
      ios: {
        shadowColor: "#10b981",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 6,
      },
    }),
  },
  headerRight: {
    alignItems: "center",
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  decoration1: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    top: -40,
    right: -20,
    zIndex: 1,
  },
  decoration2: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    bottom: -25,
    left: -15,
    zIndex: 1,
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 12,
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statContent: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
    textAlign: "center",
  },
  filtersSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filtersContainer: {
    paddingRight: 20,
    gap: 12,
  },
  statusFilter: {
    minWidth: 120,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  statusFilterActive: {
    backgroundColor: "#e34691",
    borderColor: "#e34691",
    ...Platform.select({
      ios: {
        shadowColor: "#e34691",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  statusFilterContent: {
    alignItems: "center",
  },
  statusFilterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  statusFilterTextActive: {
    color: "#ffffff",
  },
  statusCount: {
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 6,
    minWidth: 24,
  },
  statusCountActive: {
    backgroundColor: "#ffffff",
  },
  statusCountText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
  },
  statusCountTextActive: {
    color: "#000",
  },
  ordersSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  ordersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  ordersCountContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  ordersCount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  ordersCountLabel: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  ordersList: {
    gap: 16,
  },
  orderCardContainer: {
    // Container for individual order cards
  },
  orderCard: {
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  orderCardInner: {
    padding: 20,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 6,
  },
  tableNumberContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tableNumber: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  orderStatus: {
    alignItems: "flex-end",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  orderMetrics: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 16,
  },
  metricItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metricText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginBottom: 16,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderTotalContainer: {
    flex: 1,
  },
  orderTotalLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
    marginBottom: 2,
  },
  orderTotal: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e293b",
  },
  orderActions: {
    flexDirection: "row",
    gap: 12,
  },
  viewButton: {
    paddingHorizontal: 16,
  },
  actionButton: {
    paddingHorizontal: 16,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 48,
  },
  loadingSpinner: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },
  emptyState: {
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  emptyContent: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
    fontWeight: "500",
  },
});
