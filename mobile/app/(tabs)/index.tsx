import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getGoats, getHealth } from "../../lib/api";
import { useAuth } from "../../lib/auth-context";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getAge(dob: string) {
  if (!dob) return "Unknown";
  const months = Math.floor(
    (Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  );
  if (months < 1) return "< 1 mo";
  if (months < 12) return `${months}mo`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years}y ${rem}m` : `${years}y`;
}

const QUICK_ACTIONS = [
  { label: "Add Goat",    icon: "add-circle",  color: "#16a34a", bg: "#f0fdf4", route: "/goats/new" },
  { label: "Pens",        icon: "grid",         color: "#0ea5e9", bg: "#f0f9ff", route: "/pens" },
  { label: "Feed Log",    icon: "nutrition",    color: "#84cc16", bg: "#f7fee7", route: "/feed" },
  { label: "Health",      icon: "medkit",       color: "#3b82f6", bg: "#eff6ff", route: "/(tabs)/health" },
  { label: "Breeding",    icon: "heart",        color: "#ec4899", bg: "#fdf2f8", route: "/(tabs)/breeding" },
  { label: "Kidding",     icon: "happy",        color: "#f59e0b", bg: "#fffbeb", route: "/kidding" },
  { label: "Sales",       icon: "cash",         color: "#10b981", bg: "#ecfdf5", route: "/sales" },
  { label: "Mortality",   icon: "skull",        color: "#6b7280", bg: "#f9fafb", route: "/mortality" },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const { data: goatData, isLoading: goatsLoading, refetch: refetchGoats, isRefetching } = useQuery({
    queryKey: ["goats-dashboard"],
    queryFn: () => getGoats(),
  });

  const { data: healthData, refetch: refetchHealth } = useQuery({
    queryKey: ["health-dashboard"],
    queryFn: () => getHealth(),
  });

  function refetch() {
    refetchGoats();
    refetchHealth();
  }

  // API returns { success, data: [...], stats: {...} }
  const goats: any[] = goatData?.data || [];
  const stats = goatData?.stats;
  const recent = goats.slice(0, 5);

  // Health alerts
  const overdue: any[] = healthData?.overdueTreatments || [];
  const upcoming: any[] = healthData?.upcomingTreatments?.slice(0, 3) || [];
  const alertCount = overdue.length;

  const firstName = user?.name?.split(" ")[0] || "Farmer";
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f9fafb" }}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor="#16a34a"
          colors={["#16a34a"]}
        />
      }
    >
      {/* Header */}
      <View
        style={{
          backgroundColor: "#15803d",
          paddingTop: insets.top + 16,
          paddingBottom: 28,
          paddingHorizontal: 22,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>{today}</Text>
            <Text style={{ color: "white", fontSize: 22, fontWeight: "700", marginTop: 3 }}>
              {getGreeting()}, {firstName} 👋
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, marginTop: 3 }}>
              Mwembeshi Farm
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/profile")}
            style={{
              width: 42, height: 42, borderRadius: 21,
              backgroundColor: "rgba(255,255,255,0.2)",
              alignItems: "center", justifyContent: "center",
              borderWidth: 1.5, borderColor: "rgba(255,255,255,0.3)",
            }}
          >
            <Ionicons name="person" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats cards */}
      <View style={{ backgroundColor: "#15803d", paddingBottom: 20, paddingHorizontal: 16 }}>
        {goatsLoading ? (
          <View style={{ height: 90, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator color="white" />
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { label: "Total", value: stats?.total ?? 0, icon: "layers", color: "#fff", bg: "rgba(255,255,255,0.18)" },
              { label: "Does", value: stats?.does ?? 0, icon: "female", color: "#fce7f3", bg: "rgba(236,72,153,0.25)" },
              { label: "Bucks", value: stats?.bucks ?? 0, icon: "male", color: "#dbeafe", bg: "rgba(59,130,246,0.25)" },
              { label: "Kids", value: stats?.kids ?? 0, icon: "star", color: "#fef9c3", bg: "rgba(234,179,8,0.25)" },
              { label: "Pregnant", value: stats?.pregnant ?? 0, icon: "heart", color: "#fce7f3", bg: "rgba(236,72,153,0.2)" },
              { label: "Treatments", value: stats?.recentTreatments ?? 0, icon: "medkit", color: "#bbf7d0", bg: "rgba(22,163,74,0.25)" },
            ].map((s) => (
              <View
                key={s.label}
                style={{
                  backgroundColor: s.bg,
                  borderRadius: 16, padding: 14, marginRight: 10,
                  minWidth: 100, alignItems: "center",
                  borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
                }}
              >
                <Ionicons name={s.icon as any} size={18} color={s.color} />
                <Text style={{ color: "white", fontSize: 26, fontWeight: "800", marginTop: 5 }}>
                  {s.value}
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, marginTop: 2 }}>
                  {s.label}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>

        {/* Alerts */}
        {alertCount > 0 && (
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/health")}
            activeOpacity={0.8}
            style={{
              backgroundColor: "#fef2f2",
              borderRadius: 14, padding: 14, marginBottom: 20,
              flexDirection: "row", alignItems: "center",
              borderWidth: 1, borderColor: "#fecaca",
            }}
          >
            <View style={{
              width: 38, height: 38, borderRadius: 10,
              backgroundColor: "#fee2e2", alignItems: "center", justifyContent: "center",
              marginRight: 12,
            }}>
              <Ionicons name="warning" size={20} color="#dc2626" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#dc2626" }}>
                {alertCount} Overdue Treatment{alertCount > 1 ? "s" : ""}
              </Text>
              <Text style={{ fontSize: 12, color: "#ef4444", marginTop: 2 }}>
                {overdue[0]?.animal?.name || overdue[0]?.animal?.tag}
                {alertCount > 1 ? ` + ${alertCount - 1} more` : ""} — tap to review
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#dc2626" />
          </TouchableOpacity>
        )}

        {upcoming.length > 0 && alertCount === 0 && (
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/health")}
            activeOpacity={0.8}
            style={{
              backgroundColor: "#fffbeb",
              borderRadius: 14, padding: 14, marginBottom: 20,
              flexDirection: "row", alignItems: "center",
              borderWidth: 1, borderColor: "#fde68a",
            }}
          >
            <View style={{
              width: 38, height: 38, borderRadius: 10,
              backgroundColor: "#fef3c7", alignItems: "center", justifyContent: "center",
              marginRight: 12,
            }}>
              <Ionicons name="time" size={20} color="#d97706" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#b45309" }}>
                {upcoming.length} Upcoming Treatment{upcoming.length > 1 ? "s" : ""}
              </Text>
              <Text style={{ fontSize: 12, color: "#d97706", marginTop: 2 }}>
                {upcoming[0]?.animal?.name || upcoming[0]?.animal?.tag} — tap to view schedule
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#d97706" />
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 14 }}>
          Quick Actions
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.label}
              onPress={() => router.push(action.route as any)}
              activeOpacity={0.75}
              style={{
                flex: 1, minWidth: "44%",
                backgroundColor: "white", borderRadius: 16, padding: 16,
                alignItems: "center", borderWidth: 1, borderColor: "#f3f4f6",
                shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
              }}
            >
              <View style={{
                width: 48, height: 48, borderRadius: 14,
                backgroundColor: action.bg, alignItems: "center",
                justifyContent: "center", marginBottom: 10,
              }}>
                <Ionicons name={action.icon as any} size={24} color={action.color} />
              </View>
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151" }}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Goats */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}>Recent Goats</Text>
          <TouchableOpacity onPress={() => router.push("/goats/list" as any)}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#16a34a" }}>View all →</Text>
          </TouchableOpacity>
        </View>

        {goatsLoading ? (
          <ActivityIndicator color="#16a34a" style={{ marginTop: 20 }} />
        ) : recent.length === 0 ? (
          <View style={{
            backgroundColor: "white", borderRadius: 16, padding: 32,
            alignItems: "center", borderWidth: 1, borderColor: "#f3f4f6",
          }}>
            <Ionicons name="paw-outline" size={40} color="#d1d5db" />
            <Text style={{ color: "#9ca3af", marginTop: 10, fontSize: 14 }}>No goats added yet</Text>
            <TouchableOpacity
              onPress={() => router.push("/goats/new")}
              style={{
                marginTop: 14, backgroundColor: "#16a34a",
                paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10,
              }}
            >
              <Text style={{ color: "white", fontWeight: "600", fontSize: 13 }}>Add First Goat</Text>
            </TouchableOpacity>
          </View>
        ) : (
          recent.map((goat: any) => (
            <TouchableOpacity
              key={goat.id}
              onPress={() => router.push(`/goats/${goat.id}`)}
              activeOpacity={0.75}
              style={{
                backgroundColor: "white", borderRadius: 14, padding: 14,
                marginBottom: 10, flexDirection: "row", alignItems: "center",
                borderWidth: 1, borderColor: "#f3f4f6",
                shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
              }}
            >
              <View style={{
                width: 44, height: 44, borderRadius: 12,
                backgroundColor: goat.gender === "MALE" ? "#eff6ff" : "#fdf2f8",
                alignItems: "center", justifyContent: "center", marginRight: 12,
              }}>
                <Ionicons
                  name={goat.gender === "MALE" ? "male" : "female"}
                  size={20}
                  color={goat.gender === "MALE" ? "#3b82f6" : "#ec4899"}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827" }}>
                  {goat.name || goat.tag}
                </Text>
                <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                  {[goat.breed, getAge(goat.dateOfBirth), goat.weight ? `${goat.weight}kg` : null]
                    .filter(Boolean).join(" · ")}
                </Text>
                {/* Show tag if name exists */}
                {goat.name && (
                  <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>#{goat.tag}</Text>
                )}
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <View style={{
                  backgroundColor: goat.status === "ACTIVE" ? "#f0fdf4" : "#f9fafb",
                  paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
                }}>
                  <Text style={{
                    fontSize: 11, fontWeight: "600",
                    color: goat.status === "ACTIVE" ? "#16a34a" : "#6b7280",
                  }}>
                    {goat.status}
                  </Text>
                </View>
                {goat._count?.treatments > 0 && (
                  <Text style={{ fontSize: 10, color: "#9ca3af", marginTop: 4 }}>
                    {goat._count.treatments} treatments
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}
