import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../lib/auth-context";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const isSupervisor = user?.role === "SUPERVISOR" || isAdmin;

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* Header */}
      <View style={{ backgroundColor: "#15803d", paddingTop: insets.top + 12, paddingBottom: 16, paddingHorizontal: 16, flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "white", fontSize: 20, fontWeight: "700" }}>Settings</Text>
          <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 1 }}>Farm management & admin</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {isSupervisor ? (
          <>
            <SectionLabel label="Farm Setup" />
            <View style={{ backgroundColor: "white", borderRadius: 16, borderWidth: 1, borderColor: "#f3f4f6", overflow: "hidden", marginBottom: 20 }}>
              <SettingsRow
                icon="leaf-outline"
                iconBg="#f0fdf4"
                iconColor="#16a34a"
                label="Crop Types"
                description="Manage crop varieties for planting"
                onPress={() => router.push("/settings/crop-types" as any)}
              />
              <SettingsRow
                icon="map-outline"
                iconBg="#fffbeb"
                iconColor="#d97706"
                label="Fields"
                description="Manage farm fields and plots"
                onPress={() => router.push("/settings/fields" as any)}
                last={!isSupervisor}
              />
              <SettingsRow
                icon="people-outline"
                iconBg="#eff6ff"
                iconColor="#2563eb"
                label="Workers"
                description="Manage farm workers and employment details"
                onPress={() => router.push("/settings/workers" as any)}
                last
              />
            </View>
          </>
        ) : null}

        {isAdmin ? (
          <>
            <SectionLabel label="Administration" />
            <View style={{ backgroundColor: "white", borderRadius: 16, borderWidth: 1, borderColor: "#f3f4f6", overflow: "hidden", marginBottom: 20 }}>
              <SettingsRow
                icon="people-circle-outline"
                iconBg="#f5f3ff"
                iconColor="#7c3aed"
                label="User Accounts"
                description="Manage user accounts, roles & access"
                onPress={() => router.push("/settings/users" as any)}
                last
              />
            </View>
          </>
        ) : null}

        {!isSupervisor && !isAdmin ? (
          <View style={{ alignItems: "center", paddingTop: 60 }}>
            <Ionicons name="lock-closed-outline" size={48} color="#d1d5db" />
            <Text style={{ color: "#9ca3af", marginTop: 12, fontSize: 14, textAlign: "center", paddingHorizontal: 32 }}>
              Settings are managed by your farm administrator or supervisor.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <Text style={{ fontSize: 11, fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10, marginTop: 4 }}>
      {label}
    </Text>
  );
}

function SettingsRow({
  icon, iconBg, iconColor, label, description, onPress, last,
}: {
  icon: string; iconBg: string; iconColor: string; label: string; description: string; onPress: () => void; last?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: "row", alignItems: "center", padding: 16,
        borderBottomWidth: last ? 0 : 1, borderBottomColor: "#f3f4f6",
      }}
    >
      <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: iconBg, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
        <Ionicons name={icon as any} size={20} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: "600", color: "#111827" }}>{label}</Text>
        <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
    </TouchableOpacity>
  );
}
