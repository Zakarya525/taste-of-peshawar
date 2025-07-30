import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import {
  useOrders,
  useOrderStats,
  useOrderRealtime,
} from "../../hooks/useOrders";
import { useNotificationRealtime } from "../../hooks/useNotifications";
import { NotificationBadge } from "../../components/ui/NotificationBadge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { OrderStatus } from "../../lib/supabase";

const { width } = Dimensions.get("window");

export default function DashboardScreen() {
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

  // Enable real-time updates
  useOrderRealtime();
  useNotificationRealtime();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchOrders();
    setRefreshing(false);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "New":
        return "#3b82f6";
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
  }) => (
    <TouchableOpacity
      style={[
        styles.statusFilter,
        selectedStatus === status && styles.statusFilterActive,
      ]}
      onPress={() => setSelectedStatus(status)}
    >
      <Text
        style={[
          styles.statusFilterText,
          selectedStatus === status && styles.statusFilterTextActive,
        ]}
      >
        {label}
      </Text>
      {count !== undefined && (
        <View style={styles.statusCount}>
          <Text style={styles.statusCountText}>{count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const OrderCard = ({ order }: { order: any }) => (
    <Card variant="default" padding="medium" margin="small">
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>#{order.order_number}</Text>
          <Text style={styles.tableNumber}>Table {order.table_number}</Text>
        </View>
        <View style={styles.orderStatus}>
          <Ionicons
            name={getStatusIcon(order.status)}
            size={20}
            color={getStatusColor(order.status)}
          />
          <Text
            style={[styles.statusText, { color: getStatusColor(order.status) }]}
          >
            {order.status}
          </Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <Text style={styles.itemCount}>{order.item_count} items</Text>
        <Text style={styles.orderTime}>{formatTime(order.created_at)}</Text>
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>{formatPrice(order.total_amount)}</Text>
        <View style={styles.orderActions}>
          <Button
            title="View"
            variant="outline"
            size="small"
            onPress={() => {
              /* Navigate to order details */
            }}
          />
          {order.status === "New" && (
            <Button
              title="Start"
              variant="primary"
              size="small"
              onPress={() => {
                /* Update status to Preparing */
              }}
              style={styles.actionButton}
            />
          )}
          {order.status === "Preparing" && (
            <Button
              title="Ready"
              variant="primary"
              size="small"
              onPress={() => {
                /* Update status to Ready */
              }}
              style={styles.actionButton}
            />
          )}
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Welcome back!</Text>
          <Text style={styles.branchName}>{branch?.name} Branch</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.notificationButton}>
            <View style={{ position: "relative" }}>
              <Ionicons name="notifications" size={24} color="#64748b" />
              <NotificationBadge size="small" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={signOut} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Card variant="flat" padding="medium" style={styles.statCard}>
            <View style={styles.statContent}>
              <Ionicons name="add-circle" size={24} color="#3b82f6" />
              <Text style={styles.statNumber}>{stats?.new || 0}</Text>
              <Text style={styles.statLabel}>New Orders</Text>
            </View>
          </Card>

          <Card variant="flat" padding="medium" style={styles.statCard}>
            <View style={styles.statContent}>
              <Ionicons name="time" size={24} color="#f59e0b" />
              <Text style={styles.statNumber}>{stats?.preparing || 0}</Text>
              <Text style={styles.statLabel}>Preparing</Text>
            </View>
          </Card>

          <Card variant="flat" padding="medium" style={styles.statCard}>
            <View style={styles.statContent}>
              <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              <Text style={styles.statNumber}>{stats?.ready || 0}</Text>
              <Text style={styles.statLabel}>Ready</Text>
            </View>
          </Card>
        </View>

        {/* Status Filters */}
        <View style={styles.filtersContainer}>
          <StatusFilter status="all" label="All" count={stats?.total} />
          <StatusFilter status="New" label="New" count={stats?.new} />
          <StatusFilter
            status="Preparing"
            label="Preparing"
            count={stats?.preparing}
          />
          <StatusFilter status="Ready" label="Ready" count={stats?.ready} />
        </View>

        {/* Orders List */}
        <View style={styles.ordersContainer}>
          <View style={styles.ordersHeader}>
            <Text style={styles.ordersTitle}>Orders</Text>
            <Text style={styles.ordersCount}>{orders?.length || 0} orders</Text>
          </View>

          {ordersLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading orders...</Text>
            </View>
          ) : orders && orders.length > 0 ? (
            orders.map((order) => <OrderCard key={order.id} order={order} />)
          ) : (
            <Card variant="flat" padding="large" style={styles.emptyState}>
              <Ionicons name="restaurant-outline" size={48} color="#64748b" />
              <Text style={styles.emptyTitle}>No orders</Text>
              <Text style={styles.emptySubtitle}>
                {selectedStatus === "all"
                  ? "No orders yet today"
                  : `No ${selectedStatus.toLowerCase()} orders`}
              </Text>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: "#64748b",
  },
  branchName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
  },
  logoutButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  notificationButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
  },
  statContent: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  statusFilter: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
  },
  statusFilterActive: {
    backgroundColor: "#3b82f6",
  },
  statusFilterText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  statusFilterTextActive: {
    color: "#ffffff",
  },
  statusCount: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
  statusCountText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#3b82f6",
  },
  ordersContainer: {
    paddingHorizontal: 20,
  },
  ordersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  ordersTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
  },
  ordersCount: {
    fontSize: 14,
    color: "#64748b",
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
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
  },
  tableNumber: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
  },
  orderStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  orderDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  itemCount: {
    fontSize: 14,
    color: "#64748b",
  },
  orderTime: {
    fontSize: 14,
    color: "#64748b",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
  },
  orderActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    marginLeft: 8,
  },
});
