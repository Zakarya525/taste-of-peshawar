import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Device from "expo-device";
import * as Haptics from "expo-haptics";
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { OrderStatus, supabase } from "../lib/supabase";

// Query keys
export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (filters: string, branchId?: string) =>
    [...orderKeys.lists(), { filters, branchId }] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
};

// Fetch orders with filters
export const useOrders = (status?: OrderStatus) => {
  const { branch } = useAuth();

  return useQuery({
    queryKey: orderKeys.list(status || "all", branch?.id),
    queryFn: async () => {
      if (!branch?.id) return [];

      let query = supabase
        .from("orders")
        .select(
          `
          *,
          order_items (
            id,
            quantity,
            unit_price,
            total_price,
            special_instructions,
            menu_items (
              name,
              description
            )
          )
        `
        )
        .eq("branch_id", branch.id);

      if (status && status !== "all") {
        query = query.eq("status", status);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) throw error;

      console.log(
        `[useOrders] Fetched ${data?.length || 0} orders for branch ${
          branch.id
        }`
      );

      // Transform data to match expected format
      return (
        data?.map((order) => ({
          ...order,
          item_count: order.order_items?.length || 0,
          total_amount: order.total_amount || 0,
        })) || []
      );
    },
    enabled: !!branch?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

// Fetch single order with items
export const useOrder = (orderId: string) => {
  const { branch } = useAuth();

  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: async () => {
      if (!branch?.id) throw new Error("No branch context");

      const [orderResult, itemsResult] = await Promise.all([
        supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .eq("branch_id", branch.id)
          .single(),
        supabase
          .from("order_items")
          .select(
            `
            *,
            menu_items (
              name,
              description,
              price
            )
          `
          )
          .eq("order_id", orderId),
      ]);

      if (orderResult.error) throw orderResult.error;
      if (itemsResult.error) throw itemsResult.error;

      return {
        order: orderResult.data,
        items: itemsResult.data,
      };
    },
    enabled: !!orderId && !!branch?.id,
  });
};

// Create new order
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  const { branch, user } = useAuth();

  return useMutation({
    mutationFn: async (orderData: {
      table_number: string;
      items: Array<{
        menu_item_id: string;
        quantity: number;
        unit_price: number;
        special_instructions?: string;
      }>;
      notes?: string;
    }) => {
      // Check if we have valid branch and user data
      if (!branch?.id) {
        throw new Error(
          "No valid branch found. Please ensure you're logged in to a valid branch."
        );
      }

      if (!user?.id) {
        throw new Error(
          "No valid user found. Please ensure you're properly authenticated."
        );
      }

      // Always use real database - no mock data
      if (
        !process.env.EXPO_PUBLIC_SUPABASE_URL ||
        !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
      ) {
        throw new Error(
          "Supabase configuration missing. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file."
        );
      }

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          branch_id: branch.id,
          table_number: orderData.table_number,
          notes: orderData.notes,
          created_by: user.id,
          status: "New",
          total_amount: orderData.items.reduce(
            (sum, item) => sum + item.quantity * item.unit_price,
            0
          ),
        })
        .select()
        .single();

      if (orderError) {
        console.error("Order creation error:", orderError);
        throw orderError;
      }

      // Insert order items
      const orderItems = orderData.items.map((item) => ({
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
        special_instructions: item.special_instructions,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("Order items creation error:", itemsError);
        throw itemsError;
      }

      // Create notification for new order
      const deviceId =
        Device.osInternalBuildId || Device.deviceName || "unknown";

      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          branch_id: branch.id,
          title: "New Order Received",
          message: `Order #${order.order_number} for table ${orderData.table_number} has been placed.`,
          type: "order",
          order_id: order.id,
          is_read: false,
          device_id: deviceId,
        });

      if (notificationError) {
        console.error("Error creating notification:", notificationError);
        // Don't throw - order was created successfully, notification is just a bonus
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
    onError: (error) => {
      console.error("Error creating order:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });
};

// Update order status
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  const { branch } = useAuth();

  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: string;
      status: OrderStatus;
    }) => {
      if (!branch?.id) {
        throw new Error("No valid branch found");
      }

      const { data, error } = await supabase
        .from("orders")
        .update({
          status,
          ready_at: status === "Ready" ? new Date().toISOString() : null,
        })
        .eq("id", orderId)
        .eq("branch_id", branch.id)
        .select()
        .single();

      if (error) throw error;

      // Create notification for status updates
      let notificationTitle = "";
      let notificationMessage = "";

      switch (status) {
        case "Preparing":
          notificationTitle = "Order Being Prepared";
          notificationMessage = `Order #${data.order_number} for table ${data.table_number} is now being prepared.`;
          break;
        case "Ready":
          notificationTitle = "Order Ready";
          notificationMessage = `Order #${data.order_number} for table ${data.table_number} is ready for pickup!`;
          break;
        default:
          // No notification for "New" status as it's handled in order creation
          break;
      }

      if (notificationTitle && notificationMessage) {
        const deviceId =
          Device.osInternalBuildId || Device.deviceName || "unknown";

        const { error: notificationError } = await supabase
          .from("notifications")
          .insert({
            branch_id: branch.id,
            title: notificationTitle,
            message: notificationMessage,
            type: "order",
            order_id: data.id,
            is_read: false,
            device_id: deviceId,
          });

        if (notificationError) {
          console.error(
            "Error creating status notification:",
            notificationError
          );
          // Don't throw - order was updated successfully, notification is just a bonus
        }
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.id) });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (error) => {
      console.error("Error updating order status:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });
};

// Real-time order updates
export const useOrderRealtime = () => {
  const queryClient = useQueryClient();
  const { branch } = useAuth();

  useEffect(() => {
    if (!branch) return;

    const channel = supabase
      .channel("orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `branch_id=eq.${branch.id}`,
        },
        (payload) => {
          console.log(
            `[useOrderRealtime] Order change for branch ${branch.id}:`,
            payload
          );

          // Invalidate queries to refetch data
          queryClient.invalidateQueries({ queryKey: orderKeys.lists() });

          // If it's an update to a specific order, invalidate that order's query
          if (payload.eventType === "UPDATE" && payload.new?.id) {
            queryClient.invalidateQueries({
              queryKey: orderKeys.detail(payload.new.id),
            });
          }

          // Haptic feedback for new orders
          if (payload.eventType === "INSERT") {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [branch, queryClient]);
};

// Get order statistics
export const useOrderStats = () => {
  const { branch } = useAuth();

  return useQuery({
    queryKey: ["order-stats", branch?.id],
    queryFn: async () => {
      if (!branch?.id) return { total: 0, new: 0, preparing: 0, ready: 0 };

      const { data, error } = await supabase
        .from("orders")
        .select("status, created_at")
        .eq("branch_id", branch.id)
        .gte(
          "created_at",
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        ); // Last 24 hours

      if (error) throw error;

      const stats = {
        total: data.length,
        new: data.filter((o) => o.status === "New").length,
        preparing: data.filter((o) => o.status === "Preparing").length,
        ready: data.filter((o) => o.status === "Ready").length,
      };

      return stats;
    },
    enabled: !!branch?.id,
    refetchInterval: 60000, // Refetch every minute
  });
};
