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
          <Stack.Screen name="goats/list" />
          <Stack.Screen name="goats/[id]" />
          <Stack.Screen name="goats/new" />
          <Stack.Screen name="goats/edit/[id]" />
          <Stack.Screen name="pens" />
          <Stack.Screen name="pens/[id]" />
          <Stack.Screen name="feed" />
          <Stack.Screen name="kidding" />
          <Stack.Screen name="sales" />
          <Stack.Screen name="mortality" />
        </Stack>
      </AuthProvider>
    </QueryClientProvider>
  );
}
