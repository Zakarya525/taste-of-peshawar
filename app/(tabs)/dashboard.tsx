import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import {
  useOrders,
  useOrderStats,
  useOrderRealtime,
  useUpdateOrderStatus,
} from "../../hooks/useOrders";
import { useNotificationRealtime } from "../../hooks/useNotifications";
import { NotificationBadge } from "../../components/ui/NotificationBadge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
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

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
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
      className={`flex-1 p-2 rounded-lg ${
        selectedStatus === status
          ? "bg-blue-600"
          : "bg-gray-100"
      } items-center`}
      onPress={() => setSelectedStatus(status)}
    >
      <Text
        className={`text-base font-medium ${
          selectedStatus === status
            ? "text-white"
            : "text-gray-700"
        }`}
      >
        {label}
      </Text>
      {count !== undefined && (
        <View className="bg-white rounded-5 px-2 py-1 mt-1">
          <Text className="text-xs font-bold text-blue-600">
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const OrderCard = ({ order }: { order: any }) => (
    <Card variant="default" padding="medium" margin="small">
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-1">
          <Text className="text-base font-bold text-gray-900">
            #{order.order_number}
          </Text>
          <Text className="text-sm text-gray-700 mt-1">
            Table {order.table_number}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Ionicons
            name={getStatusIcon(order.status)}
            size={20}
            color={getStatusColor(order.status)}
          />
                      <Text
              style={{ color: getStatusColor(order.status) }}
              className="text-base font-medium"
            >
              {order.status}
            </Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-base text-gray-700">
          {order.item_count} items
        </Text>
        <Text className="text-base text-gray-700">
          {formatTime(order.created_at)}
        </Text>
      </View>

      <View className="flex-row justify-between items-center">
        <Text className="text-base font-bold text-gray-900">
          {formatPrice(order.total_amount)}
        </Text>
        <View className="flex-row gap-2">
          <Button
            title="View"
            variant="outline"
            size="small"
            onPress={() => router.push(`/order-details?id=${order.id}`)}
          />
          {order.status === "New" && (
            <Button
              title="Start"
              variant="primary"
              size="small"
              onPress={() => handleStatusUpdate(order.id, "Preparing")}
              className="ml-2"
            />
          )}
          {order.status === "Preparing" && (
            <Button
              title="Ready"
              variant="primary"
              size="small"
              onPress={() => handleStatusUpdate(order.id, "Ready")}
              className="ml-2"
            />
          )}
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row justify-between items-center px-4 py-3 bg-white border-b border-gray-200">
        <View className="flex-1">
          <Text className="text-base text-gray-700">Welcome back!</Text>
          <Text className="text-xl font-bold text-gray-900">
            {branch?.name} Branch
          </Text>
        </View>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity className="p-2">
            <View className="relative">
              <Ionicons name="notifications" size={24} color="#64748b" />
              <NotificationBadge size="small" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={signOut} className="p-2">
            <Ionicons name="log-out-outline" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Cards */}
        <View className="flex-row px-4 py-3 gap-3">
          <Card variant="flat" padding="medium" className="flex-1">
            <View className="items-center">
              <Ionicons name="add-circle" size={24} color="#3b82f6" />
              <Text className="text-2xl font-bold text-gray-900 mt-2">
                {stats?.new || 0}
              </Text>
              <Text className="text-sm text-gray-700 mt-1">
                New Orders
              </Text>
            </View>
          </Card>

          <Card variant="flat" padding="medium" className="flex-1">
            <View className="items-center">
              <Ionicons name="time" size={24} color="#f59e0b" />
              <Text className="text-2xl font-bold text-gray-900 mt-2">
                {stats?.preparing || 0}
              </Text>
              <Text className="text-sm text-gray-700 mt-1">
                Preparing
              </Text>
            </View>
          </Card>

          <Card variant="flat" padding="medium" className="flex-1">
            <View className="items-center">
              <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              <Text className="text-2xl font-bold text-gray-900 mt-2">
                {stats?.ready || 0}
              </Text>
              <Text className="text-sm text-gray-700 mt-1">
                Ready
              </Text>
            </View>
          </Card>
        </View>

        {/* Status Filters */}
        <View className="flex-row px-4 pb-3 gap-2">
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
        <View className="px-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-900">Orders</Text>
            <Text className="text-base text-gray-700">
              {orders?.length || 0} orders
            </Text>
          </View>

          {ordersLoading ? (
            <View className="items-center py-10">
              <Text className="text-base text-gray-700">Loading orders...</Text>
            </View>
          ) : orders && orders.length > 0 ? (
            orders.map((order) => <OrderCard key={order.id} order={order} />)
          ) : (
            <Card variant="flat" padding="large" className="items-center py-10">
              <Ionicons name="restaurant-outline" size={48} color="#64748b" />
              <Text className="text-2xl font-bold text-gray-900 mt-4">
                No orders
              </Text>
              <Text className="text-base text-gray-700 mt-2">
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
