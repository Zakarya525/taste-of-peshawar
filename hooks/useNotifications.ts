import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { NotificationService } from "../lib/notifications";
import { supabase } from "../lib/supabase";

export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (branchId: string) => [...notificationKeys.lists(), branchId] as const,
  detail: (id: string) => [...notificationKeys.all, "detail", id] as const,
};

// Fetch notifications for current branch
export const useNotifications = () => {
  const { branch } = useAuth();

  console.log("[useNotifications] Branch state:", {
    branchId: branch?.id,
    branchName: branch?.name,
    hasBranch: !!branch,
  });

  return useQuery({
    queryKey: notificationKeys.list(branch?.id || ""),
    staleTime: 0, // Always refetch
    queryFn: async () => {
      if (!branch?.id) return [];

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("branch_id", branch.id)
        .eq("is_read", false)
        .order("created_at", { ascending: false });

      if (error) throw error;

      console.log(
        `[useNotifications] Found ${
          data?.length || 0
        } unread notifications for branch ${branch.id}`
      );
      if (data && data.length > 0) {
        console.log("[useNotifications] Sample notification:", {
          id: data[0].id,
          title: data[0].title,
          message: data[0].message,
          created_at: data[0].created_at,
        });
      }

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
        async (payload) => {
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

            // Show push notification for new notifications
            if (payload.new) {
              const notification = payload.new;

              // Get current device ID
              const currentDeviceId = NotificationService.getCurrentDeviceId();
              const notificationDeviceId = (notification as any).device_id;

              console.log("Device check:", {
                currentDevice: currentDeviceId,
                notificationDevice: notificationDeviceId,
                isSameDevice: currentDeviceId === notificationDeviceId,
              });

              // Only show push notification if it's not a test notification and not from the same device
              if (
                notification.type !== "test" &&
                currentDeviceId !== notificationDeviceId
              ) {
                console.log(
                  "Showing push notification for:",
                  notification.title
                );

                await NotificationService.scheduleLocalNotification(
                  notification.title,
                  notification.message,
                  { notificationId: notification.id, type: notification.type }
                );
              } else {
                console.log(
                  "Skipping notification:",
                  notification.type === "test"
                    ? "test notification"
                    : "same device"
                );
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [branch, queryClient]);
};
