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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getHealth, createTreatment, getGoats, deleteTreatments } from "../../lib/api";

const TREATMENT_TYPES = [
  "VACCINATION",
  "DEWORMING",
  "MEDICATION",
  "SURGERY",
  "CHECKUP",
  "INJURY",
  "OTHER",
] as const;

const TYPE_CONFIG: Record<string, { icon: string; color: string }> = {
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
  const insets = useSafeAreaInsets();
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

  function handleDelete(id: string, animalName: string) {
    Alert.alert(
      "Delete Treatment",
      `Remove this treatment record for ${animalName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTreatments([id]);
              queryClient.invalidateQueries({ queryKey: ["health"] });
            } catch (e: any) {
              Alert.alert("Error", e.message);
            }
          },
        },
      ]
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: "#f3f4f6", flexGrow: 0 }}
      >
        <View style={{ flexDirection: "row", paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}>
          {tabs.map((t) => {
            const active = tab === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                onPress={() => setTab(t.key)}
                style={{
                  paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
                  flexDirection: "row", alignItems: "center", gap: 4,
                  backgroundColor: active ? "#16a34a" : "#f3f4f6",
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: "600", color: active ? "white" : "#6b7280" }}>
                  {t.label}
                </Text>
                {t.count !== undefined && t.count > 0 && (
                  <View style={{
                    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10,
                    backgroundColor: active ? "rgba(255,255,255,0.25)" : "#e5e7eb",
                  }}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: active ? "white" : "#6b7280" }}>
                      {t.count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
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
            <View style={{
              backgroundColor: "white", marginHorizontal: 16, marginBottom: 10,
              borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f3f4f6",
            }}>
              <Text style={{ fontSize: 15, fontWeight: "600", color: "#111827" }}>
                {item.name || item.tag}
              </Text>
              <Text style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{item.breed}</Text>
              <Text style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>No treatments recorded</Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 80 }}>
              <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
              <Text style={{ color: "#9ca3af", marginTop: 12, fontSize: 14 }}>All goats have been treated</Text>
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
            const typeInfo = TYPE_CONFIG[item.type] || TYPE_CONFIG.OTHER;
            return (
              <View style={{
                backgroundColor: "white", marginHorizontal: 16, marginBottom: 10,
                borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f3f4f6",
              }}>
                <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
                  <View style={{
                    width: 40, height: 40, borderRadius: 20,
                    alignItems: "center", justifyContent: "center",
                    backgroundColor: typeInfo.color + "20",
                  }}>
                    <Ionicons name={typeInfo.icon as any} size={20} color={typeInfo.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                      <Text style={{ fontSize: 15, fontWeight: "600", color: "#111827", flex: 1 }}>
                        {item.animal?.name || item.animal?.tag}
                      </Text>
                      <Text style={{ fontSize: 12, color: "#9ca3af", marginRight: 10 }}>
                        {item.treatmentDate ? formatDate(item.treatmentDate) : ""}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleDelete(item.id, item.animal?.name || item.animal?.tag || "goat")}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="trash-outline" size={16} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                    <Text style={{ fontSize: 13, color: "#16a34a", fontWeight: "500", marginTop: 2 }}>
                      {item.type}
                    </Text>
                    {item.description && (
                      <Text style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
                        {item.description}
                      </Text>
                    )}
                    {item.medication && (
                      <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                        {item.medication}{item.dosage ? ` — ${item.dosage}` : ""}
                      </Text>
                    )}
                    {item.nextDueDate && (
                      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4, gap: 4 }}>
                        <Ionicons name="time-outline" size={12} color="#f59e0b" />
                        <Text style={{ fontSize: 12, color: "#d97706" }}>
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
            <View style={{ alignItems: "center", paddingTop: 80 }}>
              <Ionicons name="medkit-outline" size={48} color="#d1d5db" />
              <Text style={{ color: "#9ca3af", marginTop: 12, fontSize: 14 }}>No treatments found</Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        onPress={() => setShowBulkModal(true)}
        activeOpacity={0.8}
        style={{
          position: "absolute", bottom: insets.bottom + 74, right: 20,
          backgroundColor: "#16a34a", width: 56, height: 56,
          borderRadius: 28, alignItems: "center", justifyContent: "center",
          shadowColor: "#16a34a", shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
        }}
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

  const goats = goatsData?.data || [];

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
      <View style={{ flex: 1, backgroundColor: "white" }}>
        {/* Header */}
        <View style={{
          flexDirection: "row", alignItems: "center", justifyContent: "space-between",
          paddingHorizontal: 16, paddingVertical: 16,
          borderBottomWidth: 1, borderBottomColor: "#f3f4f6",
        }}>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ color: "#16a34a", fontSize: 16 }}>Cancel</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 17, fontWeight: "700" }}>Bulk Treatment</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={loading}>
            {loading
              ? <ActivityIndicator size="small" color="#16a34a" />
              : <Text style={{ color: "#16a34a", fontSize: 16, fontWeight: "600" }}>Apply</Text>
            }
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          {/* Type Selector */}
          <Text style={formLabel}>Treatment Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {TREATMENT_TYPES.map((t) => {
                const active = type === t;
                return (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setType(t)}
                    style={{
                      paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
                      backgroundColor: active ? "#16a34a" : "#f3f4f6",
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: "600", color: active ? "white" : "#6b7280" }}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <Text style={formLabel}>Description</Text>
          <TextInput
            style={formInput}
            placeholder="e.g. Annual deworming"
            placeholderTextColor="#9ca3af"
            value={description}
            onChangeText={setDescription}
          />

          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={formLabel}>Medication</Text>
              <TextInput
                style={formInput}
                placeholder="Name"
                placeholderTextColor="#9ca3af"
                value={medication}
                onChangeText={setMedication}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={formLabel}>Dosage</Text>
              <TextInput
                style={formInput}
                placeholder="e.g. 5ml"
                placeholderTextColor="#9ca3af"
                value={dosage}
                onChangeText={setDosage}
              />
            </View>
          </View>

          {/* Goat Selection */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10, marginTop: 4 }}>
            <Text style={formLabel}>Select Goats ({selectedGoats.length} selected)</Text>
            <TouchableOpacity
              onPress={() =>
                setSelectedGoats(selectedGoats.length === goats.length ? [] : goats.map((g: any) => g.id))
              }
            >
              <Text style={{ color: "#16a34a", fontSize: 13, fontWeight: "600" }}>
                {selectedGoats.length === goats.length ? "Deselect All" : "Select All"}
              </Text>
            </TouchableOpacity>
          </View>

          {goats.map((goat: any) => {
            const selected = selectedGoats.includes(goat.id);
            return (
              <TouchableOpacity
                key={goat.id}
                onPress={() => toggleGoat(goat.id)}
                style={{
                  flexDirection: "row", alignItems: "center", padding: 12,
                  borderRadius: 12, marginBottom: 8, borderWidth: 1,
                  borderColor: selected ? "#16a34a" : "#e5e7eb",
                  backgroundColor: selected ? "#f0fdf4" : "white",
                }}
              >
                <Ionicons
                  name={selected ? "checkbox" : "square-outline"}
                  size={22}
                  color={selected ? "#16a34a" : "#9ca3af"}
                />
                <View style={{ marginLeft: 12 }}>
                  <Text style={{ fontSize: 15, fontWeight: "500", color: "#111827" }}>
                    {goat.name || goat.tag}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#6b7280" }}>
                    {goat.breed} · {goat.gender}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

const formLabel = { fontSize: 13, fontWeight: "600" as const, color: "#374151", marginBottom: 6 };
const formInput = {
  backgroundColor: "#f9fafb", borderWidth: 1, borderColor: "#e5e7eb",
  borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
  fontSize: 15, color: "#111827", marginBottom: 14,
};
