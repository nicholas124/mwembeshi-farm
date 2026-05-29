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
import { getGoats } from "../../lib/api";

const GENDER_ICONS: Record<string, { icon: string; color: string }> = {
  MALE: { icon: "male", color: "#3b82f6" },
  FEMALE: { icon: "female", color: "#ec4899" },
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  SOLD: "bg-yellow-100 text-yellow-700",
  DECEASED: "bg-gray-100 text-gray-500",
  TRANSFERRED: "bg-blue-100 text-blue-700",
};

type FilterType = "all" | "MALE" | "FEMALE" | "kids";

export default function HerdScreen() {
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

  const goats = data?.goats || [];
  const stats = data?.stats;

  function getAge(dob: string) {
    if (!dob) return "Unknown";
    const months = Math.floor(
      (Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 30.44)
    );
    if (months < 1) return "< 1 mo";
    if (months < 12) return `${months} mo`;
    const years = Math.floor(months / 12);
    const rem = months % 12;
    return rem > 0 ? `${years}y ${rem}m` : `${years}y`;
  }

  const renderGoat = useCallback(
    ({ item }: { item: any }) => (
      <TouchableOpacity
        onPress={() => router.push(`/goats/${item.id}`)}
        className="bg-white mx-4 mb-3 rounded-2xl p-4 shadow-sm border border-gray-100"
        activeOpacity={0.7}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Ionicons
                name={
                  (GENDER_ICONS[item.gender]?.icon as any) || "help-circle"
                }
                size={16}
                color={GENDER_ICONS[item.gender]?.color || "#9ca3af"}
              />
              <Text className="text-lg font-bold text-gray-900">
                {item.name || item.tag}
              </Text>
              {item.name && (
                <Text className="text-sm text-gray-400">#{item.tag}</Text>
              )}
            </View>
            <View className="flex-row items-center mt-1.5 gap-3">
              <Text className="text-sm text-gray-500">{item.breed}</Text>
              <Text className="text-sm text-gray-400">
                {getAge(item.dateOfBirth)}
              </Text>
              {item.weight && (
                <Text className="text-sm text-gray-400">
                  {item.weight}kg
                </Text>
              )}
            </View>
            {/* Badges */}
            <View className="flex-row mt-2 gap-2">
              {item._count?.treatments > 0 && (
                <View className="bg-blue-50 px-2 py-0.5 rounded-full">
                  <Text className="text-xs text-blue-600">
                    {item._count.treatments} treatments
                  </Text>
                </View>
              )}
              {item._count?.offspring > 0 && (
                <View className="bg-pink-50 px-2 py-0.5 rounded-full">
                  <Text className="text-xs text-pink-600">
                    {item._count.offspring} offspring
                  </Text>
                </View>
              )}
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
        </View>
      </TouchableOpacity>
    ),
    []
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Stats Bar */}
      {stats && (
        <View className="flex-row bg-white px-4 py-3 gap-1 border-b border-gray-100">
          <View className="flex-1 items-center">
            <Text className="text-lg font-bold text-primary-600">
              {stats.total}
            </Text>
            <Text className="text-xs text-gray-500">Total</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-lg font-bold text-blue-500">
              {stats.bucks}
            </Text>
            <Text className="text-xs text-gray-500">Bucks</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-lg font-bold text-pink-500">
              {stats.does}
            </Text>
            <Text className="text-xs text-gray-500">Does</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-lg font-bold text-purple-500">
              {stats.pregnant}
            </Text>
            <Text className="text-xs text-gray-500">Pregnant</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-lg font-bold text-orange-500">
              {stats.kids}
            </Text>
            <Text className="text-xs text-gray-500">Kids</Text>
          </View>
        </View>
      )}

      {/* Search */}
      <View className="px-4 pt-3 pb-2">
        <View className="flex-row items-center bg-white rounded-xl px-3 py-2.5 border border-gray-200">
          <Ionicons name="search" size={18} color="#9ca3af" />
          <TextInput
            className="flex-1 ml-2 text-base text-gray-900"
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
      <View className="flex-row px-4 pb-3 gap-2">
        {(
          [
            { key: "all", label: "All" },
            { key: "MALE", label: "Bucks" },
            { key: "FEMALE", label: "Does" },
            { key: "kids", label: "Kids" },
          ] as const
        ).map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-full ${
              filter === f.key
                ? "bg-primary-600"
                : "bg-white border border-gray-200"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                filter === f.key ? "text-white" : "text-gray-600"
              }`}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      ) : (
        <FlatList
          data={goats}
          keyExtractor={(item) => item.id}
          renderItem={renderGoat}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#16a34a"
            />
          }
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Ionicons name="paw-outline" size={48} color="#d1d5db" />
              <Text className="text-gray-400 mt-3 text-base">
                No goats found
              </Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        onPress={() => router.push("/goats/new")}
        className="absolute bottom-24 right-5 bg-primary-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}
