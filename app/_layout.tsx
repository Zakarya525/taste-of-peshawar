import { QueryClientProvider } from "@tanstack/react-query";
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

  // Handle authentication redirects
  useEffect(() => {
    if (!loading) {
      const isAuthenticated = session && user && branchUser;
      
      console.log("Auth state:", {
        session: !!session,
        user: !!user,
        branchUser: !!branchUser,
        isAuthenticated,
      });

      if (isAuthenticated) {
        // User is authenticated, redirect to dashboard
        console.log("Redirecting to dashboard...");
        router.replace("/(tabs)/dashboard");
      } else {
        // User is not authenticated, redirect to login
        console.log("Redirecting to login...");
        router.replace("/login");
      }
    }
  }, [session, user, branchUser, loading, router]);

  if (loading) {
    return <LoadingScreen message="Initializing..." />;
  }

  // Check if we have a complete authenticated state
  const isAuthenticated = session && user && branchUser;

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
