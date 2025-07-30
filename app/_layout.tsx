import { Stack } from "expo-router";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { queryClient } from "../lib/queryClient";
import { LoadingScreen } from "../components/ui/LoadingScreen";

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
  const { session, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Initializing..." />;
  }

  return (
    <Stack>
      {!session ? (
        // Auth screens
        <Stack.Screen
          name="login"
          options={{
            headerShown: false,
          }}
        />
      ) : (
        // Main app screens
        <>
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
        </>
      )}
    </Stack>
  );
}
