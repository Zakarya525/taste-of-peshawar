import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useOrders, useUpdateOrderStatus } from "../../hooks/useOrders";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { OrderStatus } from "../../lib/supabase";

export default function OrdersScreen() {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const { data: orders, isLoading, refetch } = useOrders(selectedStatus === "all" ? undefined : selectedStatus);
  const updateStatusMutation = useUpdateOrderStatus();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const filteredOrders = orders?.filter(order => 
    searchQuery === "" || 
    order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.table_number.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "New": return "#3b82f6";
      case "Preparing": return "#f59e0b";
      case "Ready": return "#10b981";
      default: return "#64748b";
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "New": return "add-circle";
      case "Preparing": return "time";
      case "Ready": return "checkmark-circle";
      default: return "help-circle";
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-GB", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  const formatPrice = (price: number) => {
    return `£${price.toFixed(2)}`;
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ orderId, status: newStatus });
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const StatusFilter = ({ status, label, count }: { status: OrderStatus | "all"; label: string; count?: number }) => (
    <TouchableOpacity
      style={[
        styles.statusFilter,
        selectedStatus === status && styles.statusFilterActive
      ]}
      onPress={() => setSelectedStatus(status)}
    >
      <Text style={[
        styles.statusFilterText,
        selectedStatus === status && styles.statusFilterTextActive
      ]}>
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
          <Text style={styles.orderTime}>{formatTime(order.created_at)}</Text>
        </View>
        <View style={styles.orderStatus}>
          <Ionicons 
            name={getStatusIcon(order.status)} 
            size={20} 
            color={getStatusColor(order.status)} 
          />
          <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
            {order.status}
          </Text>
        </View>
      </View>
      
      <View style={styles.orderDetails}>
        <Text style={styles.itemCount}>{order.item_count} items</Text>
        <Text style={styles.orderTotal}>{formatPrice(order.total_amount)}</Text>
      </View>
      
      {order.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Notes:</Text>
          <Text style={styles.notesText}>{order.notes}</Text>
        </View>
      )}
      
      <View style={styles.orderActions}>
        <Button
          title="View Details"
          variant="outline"
          size="small"
          onPress={() => {/* Navigate to order details */}}
        />
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
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#64748b" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search orders by number or table..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {/* Status Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        <StatusFilter status="all" label="All" count={orders?.length} />
        <StatusFilter status="New" label="New" count={orders?.filter(o => o.status === "New").length} />
        <StatusFilter status="Preparing" label="Preparing" count={orders?.filter(o => o.status === "Preparing").length} />
        <StatusFilter status="Ready" label="Ready" count={orders?.filter(o => o.status === "Ready").length} />
      </ScrollView>

      {/* Orders List */}
      <ScrollView
        style={styles.ordersContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading orders...</Text>
          </View>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))
        ) : (
          <Card variant="flat" padding="large" style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color="#64748b" />
            <Text style={styles.emptyTitle}>No orders found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery 
                ? "No orders match your search" 
                : `No ${selectedStatus.toLowerCase()} orders`
              }
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
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  searchButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 48,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
  },
  filtersContainer: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  filtersContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  statusFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
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
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
  orderTime: {
    fontSize: 12,
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
  orderTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
  },
  notesContainer: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
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