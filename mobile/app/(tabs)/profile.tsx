import { View, Text, TouchableOpacity, Alert, ScrollView } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { getGoats } from "../../lib/api";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const { data: goatData } = useQuery({
    queryKey: ["goats-dashboard"],
    queryFn: () => getGoats(),
  });

  const stats = goatData?.stats;

  const initials = user?.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  async function handleLogout() {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f9fafb" }} showsVerticalScrollIndicator={false}>
      {/* Profile Hero */}
      <View style={{ backgroundColor: "#15803d", paddingTop: 24, paddingBottom: 40, paddingHorizontal: 20, alignItems: "center" }}>
        <View style={{
          width: 80, height: 80, borderRadius: 40,
          backgroundColor: "rgba(255,255,255,0.2)",
          borderWidth: 3, borderColor: "rgba(255,255,255,0.4)",
          alignItems: "center", justifyContent: "center", marginBottom: 12,
        }}>
          <Text style={{ fontSize: 28, fontWeight: "800", color: "white" }}>{initials}</Text>
        </View>
        <Text style={{ fontSize: 20, fontWeight: "800", color: "white" }}>{user?.name}</Text>
        <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 3 }}>{user?.email}</Text>
        <View style={{
          backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 20,
          paddingHorizontal: 14, paddingVertical: 4, marginTop: 8,
        }}>
          <Text style={{ fontSize: 12, fontWeight: "700", color: "white" }}>
            {user?.role === "ADMIN" ? "Administrator" : user?.role || "Farm User"}
          </Text>
        </View>
      </View>

      {/* Farm Stats Card */}
      <View style={{ marginHorizontal: 16, marginTop: -20, marginBottom: 16 }}>
        <View style={{
          backgroundColor: "white", borderRadius: 16, padding: 16,
          borderWidth: 1, borderColor: "#f3f4f6",
          shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
        }}>
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>
            Mwembeshi Farm — Herd Overview
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
            {[
              { label: "Total", value: stats?.total ?? "—", color: "#111827" },
              { label: "Does", value: stats?.does ?? "—", color: "#ec4899" },
              { label: "Bucks", value: stats?.bucks ?? "—", color: "#3b82f6" },
              { label: "Kids", value: stats?.kids ?? "—", color: "#f59e0b" },
            ].map((s) => (
              <View key={s.label} style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 22, fontWeight: "800", color: s.color }}>{s.value}</Text>
                <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Account Info */}
      <View style={{ marginHorizontal: 16, marginBottom: 14 }}>
        <Text style={{ fontSize: 11, fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Account</Text>
        <View style={{ backgroundColor: "white", borderRadius: 16, borderWidth: 1, borderColor: "#f3f4f6", overflow: "hidden" }}>
          <InfoRow icon="person-outline" label="Full Name" value={user?.name || "—"} />
          <InfoRow icon="mail-outline" label="Email" value={user?.email || "—"} />
          <InfoRow icon="shield-outline" label="Role" value={user?.role === "ADMIN" ? "Administrator" : "Farm User"} last />
        </View>
      </View>

      {/* App Menu */}
      <View style={{ marginHorizontal: 16, marginBottom: 14 }}>
        <Text style={{ fontSize: 11, fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>App</Text>
        <View style={{ backgroundColor: "white", borderRadius: 16, borderWidth: 1, borderColor: "#f3f4f6", overflow: "hidden" }}>
          <MenuItem
            icon="notifications-outline"
            label="Notifications"
            onPress={() => Alert.alert("Coming Soon", "Push notifications will be available in the next update.")}
          />
          <MenuItem
            icon="settings-outline"
            label="Settings"
            onPress={() => router.push("/settings" as any)}
          />
          <MenuItem
            icon="help-circle-outline"
            label="Help & Support"
            onPress={() => Alert.alert("Support", "For help, contact your farm administrator.")}
            last
          />
        </View>
      </View>

      {/* Sign Out */}
      <View style={{ marginHorizontal: 16, marginBottom: 32 }}>
        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.8}
          style={{
            backgroundColor: "white", borderRadius: 16, padding: 16,
            flexDirection: "row", alignItems: "center", justifyContent: "center",
            borderWidth: 1, borderColor: "#fee2e2", gap: 8,
          }}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={{ fontSize: 15, fontWeight: "700", color: "#ef4444" }}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={{ textAlign: "center", fontSize: 12, color: "#d1d5db", marginTop: 20 }}>
          Mwembeshi Farm App · v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

function InfoRow({ icon, label, value, last }: { icon: string; label: string; value: string; last?: boolean }) {
  return (
    <View style={{
      flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 13,
      borderBottomWidth: last ? 0 : 1, borderBottomColor: "#f3f4f6",
    }}>
      <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#f0fdf4", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
        <Ionicons name={icon as any} size={16} color="#16a34a" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 11, color: "#9ca3af" }}>{label}</Text>
        <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827", marginTop: 1 }}>{value}</Text>
      </View>
    </View>
  );
}

function MenuItem({ icon, label, onPress, last }: { icon: string; label: string; onPress: () => void; last?: boolean }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14,
        borderBottomWidth: last ? 0 : 1, borderBottomColor: "#f3f4f6",
      }}
    >
      <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#f9fafb", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
        <Ionicons name={icon as any} size={18} color="#6b7280" />
      </View>
      <Text style={{ flex: 1, fontSize: 15, color: "#374151", fontWeight: "500" }}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
    </TouchableOpacity>
  );
}
