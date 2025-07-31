import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useOrder, useUpdateOrderStatus } from "../hooks/useOrders";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { OrderStatus } from "../lib/supabase";

export default function OrderDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const orderId = params.id as string;

  const { data: orderData, isLoading } = useOrder(orderId);
  const updateStatusMutation = useUpdateOrderStatus();

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ orderId, status: newStatus });
    } catch (error) {
      console.error("Error updating order status:", error);
    }
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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!orderData?.order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Order not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { order, items } = orderData;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button
          title="Back"
          variant="ghost"
          size="small"
          icon="arrow-back"
          onPress={() => router.back()}
        />
        <Text style={styles.title}>Order #{order.order_number}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Order Status */}
        <Card variant="default" padding="medium" margin="medium">
          <View style={styles.statusContainer}>
            <Ionicons
              name={getStatusIcon(order.status)}
              size={24}
              color={getStatusColor(order.status)}
            />
            <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
              {order.status}
            </Text>
          </View>
          
          <View style={styles.orderInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Table:</Text>
              <Text style={styles.infoValue}>Table {order.table_number}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Created:</Text>
              <Text style={styles.infoValue}>{formatTime(order.created_at)}</Text>
            </View>
            {order.ready_at && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Ready:</Text>
                <Text style={styles.infoValue}>{formatTime(order.ready_at)}</Text>
              </View>
            )}
          </View>
        </Card>

        {/* Order Items */}
        <Card variant="default" padding="medium" margin="medium">
          <Text style={styles.sectionTitle}>Order Items</Text>
          {items?.map((item, index) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.menu_items?.name}</Text>
                <Text style={styles.itemQuantity}>x{item.quantity}</Text>
              </View>
              <View style={styles.itemPrice}>
                <Text style={styles.priceText}>{formatPrice(item.total_price)}</Text>
                {item.special_instructions && (
                  <Text style={styles.specialInstructions}>
                    Note: {item.special_instructions}
                  </Text>
                )}
              </View>
            </View>
          ))}
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalPrice}>{formatPrice(order.total_amount)}</Text>
          </View>
        </Card>

        {/* Notes */}
        {order.notes && (
          <Card variant="default" padding="medium" margin="medium">
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{order.notes}</Text>
          </Card>
        )}

        {/* Actions */}
        <Card variant="default" padding="medium" margin="medium">
          <Text style={styles.sectionTitle}>Actions</Text>
          <View style={styles.actionsContainer}>
            {order.status === "New" && (
              <Button
                title="Start Preparing"
                variant="primary"
                size="large"
                fullWidth
                onPress={() => handleStatusUpdate("Preparing")}
                style={styles.actionButton}
              />
            )}
            {order.status === "Preparing" && (
              <Button
                title="Mark Ready"
                variant="primary"
                size="large"
                fullWidth
                onPress={() => handleStatusUpdate("Ready")}
                style={styles.actionButton}
              />
            )}
            {order.status === "Ready" && (
              <View style={styles.readyContainer}>
                <Ionicons name="checkmark-circle" size={48} color="#10b981" />
                <Text style={styles.readyText}>Order is ready for pickup!</Text>
              </View>
            )}
          </View>
        </Card>
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
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#64748b",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#ef4444",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  statusText: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 8,
  },
  orderInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoLabel: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  itemInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1e293b",
    flex: 1,
  },
  itemQuantity: {
    fontSize: 14,
    color: "#64748b",
    marginLeft: 8,
  },
  itemPrice: {
    alignItems: "flex-end",
  },
  priceText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  specialInstructions: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
    fontStyle: "italic",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
  },
  notesText: {
    fontSize: 16,
    color: "#1e293b",
    lineHeight: 24,
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
  readyContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  readyText: {
    fontSize: 16,
    color: "#10b981",
    fontWeight: "600",
    marginTop: 8,
  },
}); 