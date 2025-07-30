import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { Notification } from "../lib/supabase";
import { useEffect } from "react";
import * as Haptics from "expo-haptics";

export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (branchId: string) => [...notificationKeys.lists(), branchId] as const,
  detail: (id: string) => [...notificationKeys.all, "detail", id] as const,
};

// Fetch notifications for current branch
export const useNotifications = () => {
  const { branch } = useAuth();

  return useQuery({
    queryKey: notificationKeys.list(branch?.id || ""),
    queryFn: async () => {
      if (!branch?.id) return [];

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("branch_id", branch.id)
        .eq("is_read", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!branch?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

// Mark notification as read
export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  const { branch } = useAuth();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId)
        .eq("branch_id", branch?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate notifications query to refetch
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
  });
};

// Mark all notifications as read for current branch
export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  const { branch } = useAuth();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("branch_id", branch?.id)
        .eq("is_read", false);

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate notifications query to refetch
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
  });
};

// Real-time notification updates
export const useNotificationRealtime = () => {
  const queryClient = useQueryClient();
  const { branch } = useAuth();

  useEffect(() => {
    if (!branch) return;

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `branch_id=eq.${branch.id}`,
        },
        (payload) => {
          console.log("Notification change:", payload);

          // Invalidate queries to refetch data
          queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });

          // If it's a new notification, invalidate that notification's query
          if (payload.eventType === "INSERT" && payload.new?.id) {
            queryClient.invalidateQueries({
              queryKey: notificationKeys.detail(payload.new.id),
            });
          }

          // Haptic feedback for new notifications
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