import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { getHealth, createTreatment, getGoats } from "../../lib/api";

const TREATMENT_TYPES = [
  "VACCINATION",
  "DEWORMING",
  "MEDICATION",
  "SURGERY",
  "CHECKUP",
  "INJURY",
  "OTHER",
] as const;

const TYPE_ICONS: Record<string, { icon: string; color: string }> = {
  VACCINATION: { icon: "shield-checkmark", color: "#8b5cf6" },
  DEWORMING: { icon: "bug", color: "#f59e0b" },
  MEDICATION: { icon: "medkit", color: "#3b82f6" },
  SURGERY: { icon: "cut", color: "#ef4444" },
  CHECKUP: { icon: "fitness", color: "#10b981" },
  INJURY: { icon: "bandage", color: "#f97316" },
  OTHER: { icon: "ellipsis-horizontal", color: "#6b7280" },
};

type Tab = "overdue" | "upcoming" | "recent" | "untreated";

export default function HealthScreen() {
  const [tab, setTab] = useState<Tab>("recent");
  const [showBulkModal, setShowBulkModal] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
  });

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "overdue", label: "Overdue", count: data?.overdueTreatments?.length },
    { key: "upcoming", label: "Upcoming", count: data?.upcomingTreatments?.length },
    { key: "recent", label: "Recent", count: data?.recentTreatments?.length },
    { key: "untreated", label: "Untreated", count: data?.untreatedGoats?.length },
  ];

  function getItems() {
    switch (tab) {
      case "overdue": return data?.overdueTreatments || [];
      case "upcoming": return data?.upcomingTreatments || [];
      case "recent": return data?.recentTreatments || [];
      case "untreated": return data?.untreatedGoats || [];
    }
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
    });
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="bg-white border-b border-gray-100">
        <View className="flex-row px-4 py-2 gap-2">
          {tabs.map((t) => (
            <TouchableOpacity
              key={t.key}
              onPress={() => setTab(t.key)}
              className={`px-4 py-2 rounded-full flex-row items-center gap-1 ${
                tab === t.key ? "bg-primary-600" : "bg-gray-100"
              }`}
            >
              <Text className={`text-sm font-medium ${
                tab === t.key ? "text-white" : "text-gray-600"
              }`}>{t.label}</Text>
              {t.count !== undefined && t.count > 0 && (
                <View className={`px-1.5 py-0.5 rounded-full ${
                  tab === t.key ? "bg-white/20" : "bg-gray-200"
                }`}>
                  <Text className={`text-xs font-bold ${
                    tab === t.key ? "text-white" : "text-gray-600"
                  }`}>{t.count}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      ) : tab === "untreated" ? (
        <FlatList
          data={getItems()}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#16a34a" />
          }
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <View className="bg-white mx-4 mb-3 rounded-2xl p-4 border border-gray-100">
              <Text className="text-base font-semibold text-gray-900">
                {item.name || item.tag}
              </Text>
              <Text className="text-sm text-gray-500 mt-0.5">{item.breed}</Text>
              <Text className="text-xs text-red-500 mt-1">No treatments recorded</Text>
            </View>
          )}
          ListEmptyComponent={
            <View className="items-center py-20">
              <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
              <Text className="text-gray-400 mt-3">All goats have been treated</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={getItems()}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#16a34a" />
          }
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 100 }}
          renderItem={({ item }) => {
            const typeInfo = TYPE_ICONS[item.type] || TYPE_ICONS.OTHER;
            return (
              <View className="bg-white mx-4 mb-3 rounded-2xl p-4 border border-gray-100">
                <View className="flex-row items-start gap-3">
                  <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: typeInfo.color + "20" }}>
                    <Ionicons name={typeInfo.icon as any} size={20} color={typeInfo.color} />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-base font-semibold text-gray-900">
                        {item.animal?.name || item.animal?.tag}
                      </Text>
                      <Text className="text-xs text-gray-400">
                        {item.treatmentDate ? formatDate(item.treatmentDate) : ""}
                      </Text>
                    </View>
                    <Text className="text-sm text-primary-600 font-medium">{item.type}</Text>
                    {item.description && (
                      <Text className="text-sm text-gray-500 mt-0.5">{item.description}</Text>
                    )}
                    {item.medication && (
                      <Text className="text-xs text-gray-400 mt-0.5">
                        {item.medication} {item.dosage ? `- ${item.dosage}` : ""}
                      </Text>
                    )}
                    {item.nextDueDate && (
                      <View className="flex-row items-center mt-1 gap-1">
                        <Ionicons name="time-outline" size={12} color="#f59e0b" />
                        <Text className="text-xs text-amber-600">
                          Next: {formatDate(item.nextDueDate)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View className="items-center py-20">
              <Ionicons name="medkit-outline" size={48} color="#d1d5db" />
              <Text className="text-gray-400 mt-3">No treatments found</Text>
            </View>
          }
        />
      )}

      {/* Bulk Treatment FAB */}
      <TouchableOpacity
        onPress={() => setShowBulkModal(true)}
        className="absolute bottom-24 right-5 bg-primary-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      <BulkTreatmentModal
        visible={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onSuccess={() => {
          setShowBulkModal(false);
          queryClient.invalidateQueries({ queryKey: ["health"] });
        }}
      />
    </View>
  );
}

function BulkTreatmentModal({
  visible,
  onClose,
  onSuccess,
}: {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [type, setType] = useState<string>("VACCINATION");
  const [description, setDescription] = useState("");
  const [medication, setMedication] = useState("");
  const [dosage, setDosage] = useState("");
  const [selectedGoats, setSelectedGoats] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const { data: goatsData } = useQuery({
    queryKey: ["goats-for-treatment"],
    queryFn: () => getGoats({ status: "ACTIVE" }),
    enabled: visible,
  });

  const goats = goatsData?.goats || [];

  function toggleGoat(id: string) {
    setSelectedGoats((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  }

  async function handleSubmit() {
    if (selectedGoats.length === 0) {
      Alert.alert("Error", "Select at least one goat");
      return;
    }
    setLoading(true);
    try {
      await createTreatment({
        animalIds: selectedGoats,
        type,
        description,
        medication,
        dosage,
        treatmentDate: new Date().toISOString(),
      });
      Alert.alert("Success", `Treatment applied to ${selectedGoats.length} goat(s)`);
      setSelectedGoats([]);
      setDescription("");
      setMedication("");
      setDosage("");
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
          <Text className="text-lg font-bold">Bulk Treatment</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#16a34a" />
            ) : (
              <Text className="text-primary-600 text-base font-semibold">Apply</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
          {/* Type Selector */}
          <Text className="text-sm font-medium text-gray-700 mb-2">Treatment Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            <View className="flex-row gap-2">
              {TREATMENT_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setType(t)}
                  className={`px-3 py-2 rounded-lg ${
                    type === t ? "bg-primary-600" : "bg-gray-100"
                  }`}
                >
                  <Text className={`text-xs font-medium ${
                    type === t ? "text-white" : "text-gray-600"
                  }`}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <Text className="text-sm font-medium text-gray-700 mb-1.5">Description</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 mb-3 text-base bg-gray-50"
            placeholder="e.g. Annual deworming"
            value={description}
            onChangeText={setDescription}
          />

          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 mb-1.5">Medication</Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-gray-50"
                placeholder="Name"
                value={medication}
                onChangeText={setMedication}
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 mb-1.5">Dosage</Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-gray-50"
                placeholder="e.g. 5ml"
                value={dosage}
                onChangeText={setDosage}
              />
            </View>
          </View>

          {/* Goat Selection */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm font-medium text-gray-700">
              Select Goats ({selectedGoats.length} selected)
            </Text>
            <TouchableOpacity
              onPress={() =>
                setSelectedGoats(
                  selectedGoats.length === goats.length
                    ? []
                    : goats.map((g: any) => g.id)
                )
              }
            >
              <Text className="text-primary-600 text-sm font-medium">
                {selectedGoats.length === goats.length ? "Deselect All" : "Select All"}
              </Text>
            </TouchableOpacity>
          </View>

          {goats.map((goat: any) => (
            <TouchableOpacity
              key={goat.id}
              onPress={() => toggleGoat(goat.id)}
              className={`flex-row items-center p-3 rounded-xl mb-2 border ${
                selectedGoats.includes(goat.id)
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <Ionicons
                name={selectedGoats.includes(goat.id) ? "checkbox" : "square-outline"}
                size={22}
                color={selectedGoats.includes(goat.id) ? "#16a34a" : "#9ca3af"}
              />
              <View className="ml-3">
                <Text className="text-base font-medium text-gray-900">
                  {goat.name || goat.tag}
                </Text>
                <Text className="text-xs text-gray-500">{goat.breed} - {goat.gender}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}
