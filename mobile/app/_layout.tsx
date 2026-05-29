import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../lib/auth-context";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 30_000 },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="goats/[id]"
            options={{ headerShown: true, title: "Goat Details", headerTintColor: "#16a34a" }}
          />
          <Stack.Screen
            name="goats/new"
            options={{ headerShown: true, title: "Register Goat", headerTintColor: "#16a34a" }}
          />
          <Stack.Screen
            name="goats/edit/[id]"
            options={{ headerShown: true, title: "Edit Goat", headerTintColor: "#16a34a" }}
          />
        </Stack>
      </AuthProvider>
    </QueryClientProvider>
  );
}
