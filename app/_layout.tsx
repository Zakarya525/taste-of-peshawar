import { QueryClientProvider } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { LoadingScreen } from "../components/ui/LoadingScreen";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { NotificationService } from "../lib/notifications";
import { queryClient } from "../lib/queryClient";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function RootLayoutNav() {
  const { session, user, branchUser, loading } = useAuth();
  const router = useRouter();

  // Initialize push notifications
  useEffect(() => {
    const initNotifications = async () => {
      try {
        await NotificationService.registerForPushNotificationsAsync();
        console.log("Push notifications initialized");
      } catch (error) {
        console.error("Error initializing push notifications:", error);
      }
    };

    if (session && user) {
      initNotifications();
    }
  }, [session, user]);

  // Set up notification listeners
  useEffect(() => {
    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received in foreground:", notification);
      }
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response received:", response);
        // Handle notification tap here if needed
      });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  // Handle authentication redirects
  useEffect(() => {
    if (!loading) {
      // Check if user has a valid session and user data
      const hasValidSession = session && user;
      const hasCompleteAuth = session && user && branchUser;

      console.log("Auth state:", {
        session: !!session,
        user: !!user,
        branchUser: !!branchUser,
        hasValidSession,
        hasCompleteAuth,
      });

      if (hasCompleteAuth) {
        // User is fully authenticated, redirect to dashboard
        console.log("Redirecting to dashboard...");
        router.replace("/(tabs)/dashboard");
      } else if (hasValidSession) {
        // User has valid session but branch user data is still loading
        // Don't redirect to login - let the branch user data load
        console.log("Valid session found, waiting for branch user data...");
      } else {
        // No valid session, redirect to login
        console.log("No valid session, redirecting to login...");
        router.replace("/login");
      }
    }
  }, [session, user, branchUser, loading, router]);

  if (loading) {
    return <LoadingScreen message="Initializing..." />;
  }

  return (
    <Stack>
      <Stack.Screen
        name="login"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="create-order"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="order-details"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
