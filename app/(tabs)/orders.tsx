import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Colors } from "../../constants/Colors";
import { useNotificationRealtime } from "../../hooks/useNotifications";
import { useOrders, useUpdateOrderStatus } from "../../hooks/useOrders";
import { OrderStatus } from "../../lib/supabase";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

export default function OrdersScreen() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "all">(
    "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: orders,
    isLoading,
    refetch,
  } = useOrders(selectedStatus === "all" ? undefined : selectedStatus);
  const updateStatusMutation = useUpdateOrderStatus();

  // Enable real-time notification updates
  useNotificationRealtime();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const filteredOrders =
    orders?.filter(
      (order) =>
        searchQuery === "" ||
        order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.table_number.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const getStatusConfig = (status: OrderStatus) => {
    const configs = {
      New: {
        color: Colors.primary[500], // Brand pink
        backgroundColor: Colors.primary[50],
        icon: "flash" as const,
      },
      Preparing: {
        color: Colors.warning[500], // Warm amber
        backgroundColor: Colors.warning[50],
        icon: "timer" as const,
      },
      Ready: {
        color: Colors.success[500], // Fresh green
        backgroundColor: Colors.success[50],
        icon: "checkmark-circle" as const,
      },
    };
    return (
      configs[status] || {
        color: Colors.neutral[500],
        backgroundColor: Colors.neutral[50],
        icon: "help-circle" as const,
      }
    );
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return `£${price.toFixed(2)}`;
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
    const config =
      status !== "all" ? getStatusConfig(status as OrderStatus) : null;

    return (
      <TouchableOpacity
        style={[
          styles.statusFilter,
          isActive && [
            styles.statusFilterActive,
            { backgroundColor: Colors.primary[500] },
          ],
        ]}
        onPress={() => setSelectedStatus(status)}
        activeOpacity={0.8}
      >
        <View style={styles.statusFilterContent}>
          {config && (
            <Ionicons
              name={config.icon}
              size={16}
              color={isActive ? Colors.text.inverse : config.color}
              style={styles.statusFilterIcon}
            />
          )}
          <Text
            style={[
              styles.statusFilterText,
              isActive
                ? styles.statusFilterTextActive
                : config
                ? { color: config.color }
                : { color: Colors.primary[500] },
            ]}
          >
            {label}
          </Text>
          {count !== undefined && (
            <View
              style={[styles.statusBadge, isActive && styles.statusBadgeActive]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  isActive && styles.statusBadgeTextActive,
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

  const OrderCard = ({ order }: { order: any }) => {
    const statusConfig = getStatusConfig(order.status);
    const timeAgo = formatTime(order.created_at);
    const isUrgent =
      order.status === "New" &&
      new Date().getTime() - new Date(order.created_at).getTime() >
        15 * 60 * 1000; // 15 minutes

    return (
      <TouchableOpacity
        onPress={() => router.push(`/order-details?id=${order.id}`)}
        activeOpacity={0.7}
      >
        <Card
          variant="default"
          padding="none"
          margin="small"
          style={[styles.orderCard, isUrgent && styles.urgentCard]}
        >
          {/* Status Bar */}
          <View
            style={[styles.statusBar, { backgroundColor: statusConfig.color }]}
          />

          <View style={styles.cardContent}>
            {/* Header Section */}
            <View style={styles.orderHeader}>
              <View style={styles.orderMeta}>
                <Text style={styles.orderNumber}>#{order.order_number}</Text>
                <View style={styles.orderSubMeta}>
                  <View style={styles.tableInfo}>
                    <Ionicons
                      name="restaurant"
                      size={14}
                      color={Colors.text.tertiary}
                    />
                    <Text style={styles.tableNumber}>
                      Table {order.table_number}
                    </Text>
                  </View>
                  <View style={styles.timeInfo}>
                    <Ionicons
                      name="time"
                      size={14}
                      color={
                        isUrgent ? Colors.error[500] : Colors.text.tertiary
                      }
                    />
                    <Text
                      style={[
                        styles.orderTime,
                        isUrgent && {
                          color: Colors.error[500],
                          fontWeight: "600",
                        },
                      ]}
                    >
                      {timeAgo}
                    </Text>
                  </View>
                </View>
              </View>

              <View
                style={[
                  styles.statusChip,
                  { backgroundColor: statusConfig.backgroundColor },
                ]}
              >
                <Ionicons
                  name={statusConfig.icon}
                  size={16}
                  color={statusConfig.color}
                />
                <Text
                  style={[styles.statusText, { color: statusConfig.color }]}
                >
                  {order.status}
                </Text>
              </View>
            </View>

            {/* Order Summary */}
            <View style={styles.orderSummary}>
              <View style={styles.summaryItem}>
                <Ionicons name="list" size={16} color={Colors.text.tertiary} />
                <Text style={styles.itemCount}>{order.item_count} items</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Ionicons name="card" size={16} color={Colors.success[500]} />
                <Text style={styles.orderTotal}>
                  {formatPrice(order.total_amount)}
                </Text>
              </View>
            </View>

            {/* Notes Section */}
            {order.notes && (
              <View style={styles.notesContainer}>
                <View style={styles.notesHeader}>
                  <Ionicons
                    name="document-text"
                    size={14}
                    color={Colors.warning[600]}
                  />
                  <Text style={styles.notesLabel}>Special Instructions</Text>
                </View>
                <Text style={styles.notesText}>{order.notes}</Text>
              </View>
            )}

            {/* Action Buttons */}
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
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.background.secondary}
      />

      {/* Search Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons
              name="search"
              size={20}
              color={Colors.text.tertiary}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by order # or table..."
              placeholderTextColor={Colors.text.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={Colors.text.muted}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Status Filters */}
      <View style={styles.filtersSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          <StatusFilter
            status="all"
            label="All Orders"
            count={orders?.length || 0}
          />
          <StatusFilter
            status="New"
            label="New"
            count={orders?.filter((o) => o.status === "New").length || 0}
          />
          <StatusFilter
            status="Preparing"
            label="Preparing"
            count={orders?.filter((o) => o.status === "Preparing").length || 0}
          />
          <StatusFilter
            status="Ready"
            label="Ready"
            count={orders?.filter((o) => o.status === "Ready").length || 0}
          />
        </ScrollView>
      </View>

      {/* Orders List */}
      <ScrollView
        style={styles.ordersContainer}
        contentContainerStyle={styles.ordersContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary[500]]}
            tintColor={Colors.primary[500]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingSpinner}>
              <Ionicons name="refresh" size={32} color={Colors.primary[500]} />
            </View>
            <Text style={styles.loadingText}>Loading orders...</Text>
          </View>
        ) : filteredOrders.length > 0 ? (
          <>
            <View style={styles.ordersGrid}>
              {filteredOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </View>
            <View style={styles.bottomSpacer} />
          </>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons
                name="receipt-outline"
                size={64}
                color={Colors.neutral[300]}
              />
            </View>
            <Text style={styles.emptyTitle}>
              {searchQuery ? "No matching orders" : "No orders yet"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? "Try adjusting your search terms"
                : selectedStatus === "all"
                ? "New orders will appear here"
                : `No ${selectedStatus.toLowerCase()} orders at the moment`}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },

  // Search Section
  searchSection: {
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  searchContainer: {
    position: "relative",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.neutral[50],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: "400",
  },

  // Filters Section
  filtersSection: {
    backgroundColor: Colors.background.secondary,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statusFilter: {
    borderRadius: 20,
    backgroundColor: Colors.neutral[50],
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  statusFilterActive: {
    borderColor: "transparent",
  },
  statusFilterContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  statusFilterIcon: {
    marginRight: 4,
  },
  statusFilterText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.secondary,
  },
  statusFilterTextActive: {
    color: Colors.text.inverse,
  },
  statusBadge: {
    backgroundColor: Colors.border.light,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 4,
    minWidth: 20,
    alignItems: "center",
  },
  statusBadgeActive: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.text.secondary,
  },
  statusBadgeTextActive: {
    color: Colors.text.inverse,
  },

  // Orders Container
  ordersContainer: {
    flex: 1,
  },
  ordersContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  ordersGrid: {
    gap: 12,
  },
  bottomSpacer: {
    height: 20,
  },

  // Order Card
  orderCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  urgentCard: {
    borderColor: Colors.error[200],
  },
  statusBar: {
    height: 4,
    width: "100%",
  },
  cardContent: {
    padding: 20,
  },

  // Order Header
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  orderMeta: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text.primary,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  orderSubMeta: {
    flexDirection: "row",
    gap: 16,
  },
  tableInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tableNumber: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
  timeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  orderTime: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },

  // Order Summary
  orderSummary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.neutral[50],
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  summaryDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.border.light,
    marginHorizontal: 16,
  },
  itemCount: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text.primary,
  },

  // Notes
  notesContainer: {
    backgroundColor: Colors.warning[50],
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning[500],
  },
  notesHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.warning[700],
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  notesText: {
    fontSize: 14,
    color: Colors.warning[800],
    lineHeight: 20,
  },

  // Actions
  orderActions: {
    flexDirection: "row",
    gap: 12,
  },
  detailsButton: {
    flex: 1,
  },
  actionButton: {
    flex: 1,
  },

  // Loading State
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingSpinner: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
    fontWeight: "500",
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    marginBottom: 24,
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
  },
});
