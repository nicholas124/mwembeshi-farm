import { View, Text, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../lib/auth-context";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  async function handleLogout() {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* User Card */}
      <View className="bg-white m-4 rounded-2xl p-6 items-center border border-gray-100">
        <View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center mb-3">
          <Text className="text-3xl font-bold text-primary-600">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </Text>
        </View>
        <Text className="text-xl font-bold text-gray-900">{user?.name}</Text>
        <Text className="text-sm text-gray-500 mt-0.5">{user?.email}</Text>
        <View className="bg-primary-50 px-3 py-1 rounded-full mt-2">
          <Text className="text-xs font-semibold text-primary-700">
            {user?.role}
          </Text>
        </View>
      </View>

      {/* Menu Items */}
      <View className="bg-white mx-4 rounded-2xl border border-gray-100">
        <MenuItem
          icon="notifications-outline"
          label="Notifications"
          onPress={() => Alert.alert("Coming Soon", "Notifications will be available in a future update")}
        />
        <View className="h-px bg-gray-100 mx-4" />
        <MenuItem
          icon="settings-outline"
          label="Settings"
          onPress={() => Alert.alert("Coming Soon", "Settings will be available in a future update")}
        />
        <View className="h-px bg-gray-100 mx-4" />
        <MenuItem
          icon="help-circle-outline"
          label="Help & Support"
          onPress={() => Alert.alert("Support", "Contact admin for help")}
        />
      </View>

      {/* Logout */}
      <TouchableOpacity
        onPress={handleLogout}
        className="bg-white mx-4 mt-4 rounded-2xl p-4 flex-row items-center justify-center border border-red-100"
        activeOpacity={0.7}
      >
        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        <Text className="text-red-500 font-semibold ml-2">Sign Out</Text>
      </TouchableOpacity>

      <Text className="text-center text-xs text-gray-300 mt-6">
        Mwembeshi Farm v1.0.0
      </Text>
    </View>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center px-4 py-3.5"
      activeOpacity={0.7}
    >
      <Ionicons name={icon as any} size={22} color="#6b7280" />
      <Text className="flex-1 ml-3 text-base text-gray-700">{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
    </TouchableOpacity>
  );
}
