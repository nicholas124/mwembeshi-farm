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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { getCrops, getCropTypes, getFields, createCrop } from "../../lib/api";

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string; icon: string }> = {
  PLANNED:    { color: "#3b82f6", bg: "#eff6ff", label: "Planned",    icon: "calendar-outline" },
  PLANTED:    { color: "#8b5cf6", bg: "#f5f3ff", label: "Planted",    icon: "leaf-outline" },
  GROWING:    { color: "#16a34a", bg: "#f0fdf4", label: "Growing",    icon: "trending-up-outline" },
  HARVESTING: { color: "#f59e0b", bg: "#fffbeb", label: "Harvesting", icon: "basket-outline" },
  COMPLETED:  { color: "#6b7280", bg: "#f9fafb", label: "Completed",  icon: "checkmark-circle-outline" },
  FAILED:     { color: "#ef4444", bg: "#fef2f2", label: "Failed",     icon: "close-circle-outline" },
};

const HEALTH_COLORS: Record<string, string> = {
  EXCELLENT: "#16a34a",
  GOOD:      "#22c55e",
  FAIR:      "#f59e0b",
  POOR:      "#ef4444",
  CRITICAL:  "#b91c1c",
};

const FILTERS = [
  { key: "all",        label: "All" },
  { key: "GROWING",   label: "Growing" },
  { key: "PLANTED",   label: "Planted" },
  { key: "PLANNED",   label: "Planned" },
  { key: "HARVESTING",label: "Harvesting" },
  { key: "COMPLETED", label: "Completed" },
];

export default function CropsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["crops"],
    queryFn: () => getCrops(),
  });

  const plantings = data?.data || [];

  const filtered =
    filter === "all" ? plantings : plantings.filter((p: any) => p.status === filter);

  // Stats
  const growing   = plantings.filter((p: any) => p.status === "GROWING").length;
  const harvesting = plantings.filter((p: any) => p.status === "HARVESTING").length;
  const planned   = plantings.filter((p: any) => p.status === "PLANNED" || p.status === "PLANTED").length;

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
    });
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* Stats */}
      <View style={{
        flexDirection: "row", backgroundColor: "white",
        paddingHorizontal: 16, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: "#f3f4f6",
      }}>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ fontSize: 22, fontWeight: "800", color: "#16a34a" }}>{growing}</Text>
          <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>Growing</Text>
        </View>
        <View style={{ width: 1, backgroundColor: "#f3f4f6" }} />
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ fontSize: 22, fontWeight: "800", color: "#f59e0b" }}>{harvesting}</Text>
          <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>Harvesting</Text>
        </View>
        <View style={{ width: 1, backgroundColor: "#f3f4f6" }} />
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ fontSize: 22, fontWeight: "800", color: "#3b82f6" }}>{planned}</Text>
          <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>Planned</Text>
        </View>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}
      >
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={{
                paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
                backgroundColor: active ? "#16a34a" : "white",
                borderWidth: 1, borderColor: active ? "#16a34a" : "#e5e7eb",
                marginRight: 8,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: "600", color: active ? "white" : "#6b7280" }}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#16a34a" />
          }
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 100 }}
          renderItem={({ item }) => {
            const sc = STATUS_CONFIG[item.status] || STATUS_CONFIG.PLANNED;
            const healthColor = HEALTH_COLORS[item.health] || "#22c55e";
            const daysLeft = item.expectedHarvest
              ? Math.ceil((new Date(item.expectedHarvest).getTime() - Date.now()) / 86400000)
              : null;

            return (
              <TouchableOpacity
                onPress={() => router.push(`/crops/${item.id}` as any)}
                activeOpacity={0.85}
                style={{
                  backgroundColor: "white",
                  marginHorizontal: 16, marginBottom: 10,
                  borderRadius: 16, padding: 16,
                  borderWidth: 1, borderColor: "#f3f4f6",
                }}
              >
                {/* Top row: crop name + status badge */}
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}>
                      {item.cropType?.name}
                      {item.variety ? ` · ${item.variety}` : ""}
                    </Text>
                    <Text style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
                      {item.field?.name} · {parseFloat(item.areaPlanted).toFixed(2)} ha
                    </Text>
                  </View>
                  <View style={{
                    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
                    backgroundColor: sc.bg, flexDirection: "row", alignItems: "center", gap: 4,
                  }}>
                    <Ionicons name={sc.icon as any} size={12} color={sc.color} />
                    <Text style={{ fontSize: 11, fontWeight: "700", color: sc.color }}>{sc.label}</Text>
                  </View>
                </View>

                {/* Info row */}
                <View style={{ flexDirection: "row", gap: 16, flexWrap: "wrap" }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Ionicons name="calendar-outline" size={13} color="#9ca3af" />
                    <Text style={{ fontSize: 12, color: "#6b7280" }}>
                      Planted {formatDate(item.plantingDate)}
                    </Text>
                  </View>
                  {item.season && (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <Ionicons name="partly-sunny-outline" size={13} color="#9ca3af" />
                      <Text style={{ fontSize: 12, color: "#6b7280" }}>{item.season}</Text>
                    </View>
                  )}
                </View>

                {/* Bottom row: health dot + expected harvest */}
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: healthColor }} />
                    <Text style={{ fontSize: 12, color: "#6b7280" }}>{item.health}</Text>
                  </View>
                  {daysLeft !== null && (
                    <Text style={{
                      fontSize: 12, fontWeight: "600",
                      color: daysLeft < 0 ? "#ef4444" : daysLeft < 14 ? "#f59e0b" : "#6b7280",
                    }}>
                      {daysLeft < 0
                        ? `${Math.abs(daysLeft)}d overdue`
                        : daysLeft === 0
                        ? "Due today"
                        : `${daysLeft}d to harvest`}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 80 }}>
              <Ionicons name="leaf-outline" size={48} color="#d1d5db" />
              <Text style={{ color: "#9ca3af", marginTop: 12, fontSize: 14 }}>No plantings found</Text>
              <Text style={{ color: "#d1d5db", fontSize: 13, marginTop: 4 }}>Tap + to record a planting</Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        onPress={() => setShowModal(true)}
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

      <NewPlantingModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          setShowModal(false);
          queryClient.invalidateQueries({ queryKey: ["crops"] });
        }}
      />
    </View>
  );
}

function NewPlantingModal({
  visible,
  onClose,
  onSuccess,
}: {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [cropTypeId, setCropTypeId] = useState("");
  const [fieldId, setFieldId] = useState("");
  const [variety, setVariety] = useState("");
  const [areaPlanted, setAreaPlanted] = useState("");
  const [season, setSeason] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: typesData } = useQuery({ queryKey: ["crop-types"], queryFn: getCropTypes });
  const { data: fieldsData } = useQuery({ queryKey: ["fields"], queryFn: getFields });

  const cropTypes = typesData?.data || [];
  const fields = fieldsData?.data || [];

  async function handleSubmit() {
    if (!cropTypeId || !fieldId || !areaPlanted) {
      Alert.alert("Error", "Crop type, field, and area are required");
      return;
    }
    setLoading(true);
    try {
      await createCrop({
        cropTypeId,
        fieldId,
        plantingDate: new Date().toISOString(),
        areaPlanted: parseFloat(areaPlanted),
        variety: variety || undefined,
        season: season || undefined,
        notes: notes || undefined,
        status: "PLANTED",
      });
      Alert.alert("Success", "Planting recorded");
      setCropTypeId("");
      setFieldId("");
      setVariety("");
      setAreaPlanted("");
      setSeason("");
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
          <Text style={{ fontSize: 17, fontWeight: "700" }}>New Planting</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={loading}>
            {loading
              ? <ActivityIndicator size="small" color="#16a34a" />
              : <Text style={{ color: "#16a34a", fontSize: 16, fontWeight: "600" }}>Save</Text>
            }
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          {/* Crop Type */}
          <Text style={formLabel}>Crop Type</Text>
          {cropTypes.length === 0 && (
            <Text style={{ color: "#9ca3af", fontSize: 13, marginBottom: 12 }}>Loading...</Text>
          )}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {cropTypes.map((ct: any) => {
              const active = cropTypeId === ct.id;
              return (
                <TouchableOpacity
                  key={ct.id}
                  onPress={() => setCropTypeId(ct.id)}
                  style={{
                    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                    backgroundColor: active ? "#16a34a" : "#f3f4f6",
                    borderWidth: 1, borderColor: active ? "#16a34a" : "transparent",
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: "600", color: active ? "white" : "#374151" }}>
                    {ct.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Field */}
          <Text style={formLabel}>Field</Text>
          {fields.map((f: any) => {
            const active = fieldId === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                onPress={() => setFieldId(f.id)}
                style={{
                  flexDirection: "row", alignItems: "center", padding: 12,
                  borderRadius: 12, marginBottom: 8, borderWidth: 1,
                  borderColor: active ? "#16a34a" : "#e5e7eb",
                  backgroundColor: active ? "#f0fdf4" : "white",
                }}
              >
                <Ionicons
                  name={active ? "radio-button-on" : "radio-button-off"}
                  size={20}
                  color={active ? "#16a34a" : "#9ca3af"}
                />
                <View style={{ marginLeft: 12 }}>
                  <Text style={{ fontSize: 15, fontWeight: "500", color: "#111827" }}>{f.name}</Text>
                  <Text style={{ fontSize: 12, color: "#9ca3af" }}>
                    {parseFloat(f.size).toFixed(2)} ha · {f.irrigation}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}

          <View style={{ flexDirection: "row", gap: 12, marginTop: 4 }}>
            <View style={{ flex: 1 }}>
              <Text style={formLabel}>Area (ha)</Text>
              <TextInput
                style={formInput}
                placeholder="e.g. 0.5"
                placeholderTextColor="#9ca3af"
                value={areaPlanted}
                onChangeText={setAreaPlanted}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={formLabel}>Season</Text>
              <TextInput
                style={formInput}
                placeholder="e.g. 2025/26 Rainy"
                placeholderTextColor="#9ca3af"
                value={season}
                onChangeText={setSeason}
              />
            </View>
          </View>

          <Text style={formLabel}>Variety</Text>
          <TextInput
            style={formInput}
            placeholder="e.g. SC513, Roma"
            placeholderTextColor="#9ca3af"
            value={variety}
            onChangeText={setVariety}
          />

          <Text style={formLabel}>Notes</Text>
          <TextInput
            style={[formInput, { minHeight: 80, textAlignVertical: "top" }]}
            placeholder="Additional notes"
            placeholderTextColor="#9ca3af"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
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
