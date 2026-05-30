import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { getBreeding, createBreeding } from "../../lib/api";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  BRED: { bg: "#dbeafe", text: "#1d4ed8" },
  PREGNANT: { bg: "#f3e8ff", text: "#7e22ce" },
  BIRTHED: { bg: "#dcfce7", text: "#15803d" },
  FAILED: { bg: "#fee2e2", text: "#b91c1c" },
};

export default function BreedingScreen() {
  const [filter, setFilter] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["breeding"],
    queryFn: getBreeding,
  });

  const records = data?.records || [];
  const stats = data?.stats;
  const availableBucks = data?.availableBucks || [];
  const availableDoes = data?.availableDoes || [];

  const filtered =
    filter === "all"
      ? records
      : records.filter((r: any) => r.status === filter);

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
    });
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Stats */}
      {stats && (
        <View className="flex-row bg-white px-4 py-3 border-b border-gray-100">
          <View className="flex-1 items-center">
            <Text className="text-lg font-bold text-purple-600">{stats.pregnant}</Text>
            <Text className="text-xs text-gray-500">Pregnant</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-lg font-bold text-blue-600">{stats.totalBred}</Text>
            <Text className="text-xs text-gray-500">Total Bred</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-lg font-bold text-green-600">{stats.totalBirthed}</Text>
            <Text className="text-xs text-gray-500">Birthed</Text>
          </View>
        </View>
      )}

      {/* Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 py-3">
        <View className="flex-row gap-2">
          {[
            { key: "all", label: "All" },
            { key: "PREGNANT", label: "Pregnant" },
            { key: "BRED", label: "Bred" },
            { key: "BIRTHED", label: "Birthed" },
            { key: "FAILED", label: "Failed" },
          ].map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              className={`px-4 py-1.5 rounded-full ${
                filter === f.key ? "bg-primary-600" : "bg-white border border-gray-200"
              }`}
            >
              <Text className={`text-sm font-medium ${
                filter === f.key ? "text-white" : "text-gray-600"
              }`}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#16a34a" />
          }
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => {
            const sc = STATUS_COLORS[item.status] || STATUS_COLORS.BRED;
            return (
              <View className="bg-white mx-4 mb-3 rounded-2xl p-4 border border-gray-100">
                <View className="flex-row items-center justify-between mb-2">
                  <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: sc.bg }}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: sc.text }}>{item.status}</Text>
                  </View>
                  <Text className="text-xs text-gray-400">
                    {item.breedingDate ? formatDate(item.breedingDate) : ""}
                  </Text>
                </View>
                <View className="flex-row items-center gap-3">
                  <View className="flex-1">
                    <Text className="text-xs text-gray-400">Dam (Female)</Text>
                    <Text className="text-base font-semibold text-gray-900">
                      {item.female?.name || item.female?.tag || "Unknown"}
                    </Text>
                  </View>
                  <Ionicons name="heart" size={16} color="#ec4899" />
                  <View className="flex-1">
                    <Text className="text-xs text-gray-400">Sire (Male)</Text>
                    <Text className="text-base font-semibold text-gray-900">
                      {item.male?.name || item.male?.tag || "Unknown"}
                    </Text>
                  </View>
                </View>
                {item.expectedDueDate && (
                  <View className="flex-row items-center mt-2 gap-1">
                    <Ionicons name="calendar-outline" size={14} color="#8b5cf6" />
                    <Text className="text-sm text-purple-600">
                      Due: {formatDate(item.expectedDueDate)}
                    </Text>
                  </View>
                )}
                {item.offspringCount > 0 && (
                  <Text className="text-sm text-green-600 mt-1">
                    {item.offspringCount} kid(s) born
                  </Text>
                )}
              </View>
            );
          }}
          ListEmptyComponent={
            <View className="items-center py-20">
              <Ionicons name="heart-outline" size={48} color="#d1d5db" />
              <Text className="text-gray-400 mt-3">No breeding records</Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        onPress={() => setShowModal(true)}
        className="absolute bottom-24 right-5 bg-primary-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      <NewBreedingModal
        visible={showModal}
        bucks={availableBucks}
        does={availableDoes}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          setShowModal(false);
          queryClient.invalidateQueries({ queryKey: ["breeding"] });
        }}
      />
    </View>
  );
}

function NewBreedingModal({
  visible,
  bucks,
  does,
  onClose,
  onSuccess,
}: {
  visible: boolean;
  bucks: any[];
  does: any[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [sireId, setSireId] = useState("");
  const [damId, setDamId] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!sireId || !damId) {
      Alert.alert("Error", "Select both sire and dam");
      return;
    }
    setLoading(true);
    try {
      const breedingDate = new Date().toISOString();
      const expectedDue = new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toISOString();
      await createBreeding({
        maleId: sireId,
        femaleId: damId,
        breedingDate,
        expectedDueDate: expectedDue,
        status: "BRED",
        notes,
      });
      Alert.alert("Success", "Breeding record created");
      setSireId("");
      setDamId("");
      setNotes("");
      onSuccess();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100">
          <TouchableOpacity onPress={onClose}>
            <Text className="text-primary-600 text-base">Cancel</Text>
          </TouchableOpacity>
          <Text className="text-lg font-bold">Record Breeding</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#16a34a" />
            ) : (
              <Text className="text-primary-600 text-base font-semibold">Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">Select Sire (Buck)</Text>
          {bucks.map((b: any) => (
            <TouchableOpacity
              key={b.id}
              onPress={() => setSireId(b.id)}
              className={`flex-row items-center p-3 rounded-xl mb-2 border ${
                sireId === b.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
              }`}
            >
              <Ionicons
                name={sireId === b.id ? "radio-button-on" : "radio-button-off"}
                size={20}
                color={sireId === b.id ? "#3b82f6" : "#9ca3af"}
              />
              <Text className="ml-3 text-base font-medium">{b.name || b.tag}</Text>
              <Text className="ml-2 text-sm text-gray-400">{b.breed}</Text>
            </TouchableOpacity>
          ))}

          <Text className="text-sm font-medium text-gray-700 mb-2 mt-4">Select Dam (Doe)</Text>
          {does.map((d: any) => (
            <TouchableOpacity
              key={d.id}
              onPress={() => setDamId(d.id)}
              className={`flex-row items-center p-3 rounded-xl mb-2 border ${
                damId === d.id ? "border-pink-500 bg-pink-50" : "border-gray-200"
              }`}
            >
              <Ionicons
                name={damId === d.id ? "radio-button-on" : "radio-button-off"}
                size={20}
                color={damId === d.id ? "#ec4899" : "#9ca3af"}
              />
              <Text className="ml-3 text-base font-medium">{d.name || d.tag}</Text>
              <Text className="ml-2 text-sm text-gray-400">{d.breed}</Text>
            </TouchableOpacity>
          ))}

          <Text className="text-sm font-medium text-gray-700 mb-1.5 mt-4">Notes</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-gray-50"
            placeholder="Optional notes"
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </ScrollView>
      </View>
    </Modal>
  );
}
