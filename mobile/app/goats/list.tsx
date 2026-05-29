import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getGoats } from "../../lib/api";

type FilterType = "all" | "MALE" | "FEMALE" | "kids";

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

export default function GoatListScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["goats", search, filter],
    queryFn: () => {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (filter === "MALE" || filter === "FEMALE") params.gender = filter;
      if (filter === "kids") params.ageGroup = "kid";
      return getGoats(params);
    },
  });

  // API returns { success, data: [...], stats: {...} }
  const goats: any[] = data?.data || [];
  const stats = data?.stats;

  const renderGoat = useCallback(
    ({ item }: { item: any }) => (
      <TouchableOpacity
        onPress={() => router.push(`/goats/${item.id}`)}
        activeOpacity={0.75}
        style={{
          backgroundColor: "white",
          marginHorizontal: 16, marginBottom: 10,
          borderRadius: 14, padding: 14,
          flexDirection: "row", alignItems: "center",
          borderWidth: 1, borderColor: "#f3f4f6",
          shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
        }}
      >
        <View style={{
          width: 44, height: 44, borderRadius: 12,
          backgroundColor: item.gender === "MALE" ? "#eff6ff" : "#fdf2f8",
          alignItems: "center", justifyContent: "center", marginRight: 12,
        }}>
          <Ionicons
            name={item.gender === "MALE" ? "male" : "female"}
            size={20}
            color={item.gender === "MALE" ? "#3b82f6" : "#ec4899"}
          />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827" }}>
              {item.name || item.tag}
            </Text>
            {item.name && (
              <Text style={{ fontSize: 12, color: "#9ca3af" }}>#{item.tag}</Text>
            )}
          </View>
          <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
            {[item.breed, getAge(item.dateOfBirth), item.weight ? `${item.weight}kg` : null]
              .filter(Boolean).join(" · ")}
          </Text>
          <View style={{ flexDirection: "row", marginTop: 5, gap: 6 }}>
            {item._count?.treatments > 0 && (
              <View style={{ backgroundColor: "#eff6ff", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 }}>
                <Text style={{ fontSize: 10, color: "#3b82f6", fontWeight: "600" }}>
                  {item._count.treatments} treatments
                </Text>
              </View>
            )}
            {(item._count?.offspringAsMother > 0 || item._count?.offspringAsFather > 0) && (
              <View style={{ backgroundColor: "#fdf2f8", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 }}>
                <Text style={{ fontSize: 10, color: "#ec4899", fontWeight: "600" }}>
                  {(item._count.offspringAsMother || 0) + (item._count.offspringAsFather || 0)} offspring
                </Text>
              </View>
            )}
          </View>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <View style={{
            backgroundColor: item.status === "ACTIVE" ? "#f0fdf4" : "#f9fafb",
            paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginBottom: 6,
          }}>
            <Text style={{
              fontSize: 11, fontWeight: "600",
              color: item.status === "ACTIVE" ? "#16a34a" : "#6b7280",
            }}>
              {item.status}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
        </View>
      </TouchableOpacity>
    ),
    []
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* Header */}
      <View style={{
        backgroundColor: "#15803d",
        paddingTop: insets.top + 12,
        paddingBottom: 16,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginRight: 12, padding: 4 }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "white", fontSize: 20, fontWeight: "700" }}>All Goats</Text>
          {stats && (
            <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 1 }}>
              {stats.total} total · {stats.does} does · {stats.bucks} bucks · {stats.kids} kids
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={() => router.push("/goats/new")}
          style={{
            backgroundColor: "rgba(255,255,255,0.2)",
            borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
            flexDirection: "row", alignItems: "center", gap: 4,
          }}
        >
          <Ionicons name="add" size={18} color="white" />
          <Text style={{ color: "white", fontSize: 13, fontWeight: "600" }}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
        <View style={{
          flexDirection: "row", alignItems: "center",
          backgroundColor: "white", borderRadius: 12,
          paddingHorizontal: 12, paddingVertical: 10,
          borderWidth: 1, borderColor: "#e5e7eb",
        }}>
          <Ionicons name="search" size={18} color="#9ca3af" />
          <TextInput
            style={{ flex: 1, marginLeft: 8, fontSize: 14, color: "#111827", paddingVertical: 0 }}
            placeholder="Search by name, tag, or breed..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <View style={{ flexDirection: "row", paddingHorizontal: 16, paddingBottom: 12, gap: 8 }}>
        {(["all", "MALE", "FEMALE", "kids"] as const).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={{
              paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
              backgroundColor: filter === f ? "#16a34a" : "white",
              borderWidth: 1, borderColor: filter === f ? "#16a34a" : "#e5e7eb",
            }}
          >
            <Text style={{
              fontSize: 13, fontWeight: "600",
              color: filter === f ? "white" : "#6b7280",
            }}>
              {f === "all" ? "All" : f === "MALE" ? "Bucks" : f === "FEMALE" ? "Does" : "Kids"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      ) : (
        <FlatList
          data={goats}
          keyExtractor={(item) => item.id}
          renderItem={renderGoat}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#16a34a" colors={["#16a34a"]} />
          }
          contentContainerStyle={{ paddingTop: 4, paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", justifyContent: "center", paddingTop: 60 }}>
              <Ionicons name="paw-outline" size={48} color="#d1d5db" />
              <Text style={{ color: "#9ca3af", marginTop: 12, fontSize: 15 }}>No goats found</Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        onPress={() => router.push("/goats/new")}
        activeOpacity={0.85}
        style={{
          position: "absolute", bottom: insets.bottom + 20, right: 20,
          backgroundColor: "#16a34a", width: 56, height: 56,
          borderRadius: 28, alignItems: "center", justifyContent: "center",
          shadowColor: "#16a34a", shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
        }}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}
