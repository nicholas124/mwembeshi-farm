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
import { getBreeding, createBreeding } from "../../lib/api";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  BRED:      { bg: "#dbeafe", text: "#1d4ed8" },
  PREGNANT:  { bg: "#f3e8ff", text: "#7e22ce" },
  BIRTHED:   { bg: "#dcfce7", text: "#15803d" },
  FAILED:    { bg: "#fee2e2", text: "#b91c1c" },
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "PREGNANT", label: "Pregnant" },
  { key: "BRED", label: "Bred" },
  { key: "BIRTHED", label: "Birthed" },
  { key: "FAILED", label: "Failed" },
];

export default function BreedingScreen() {
  const insets = useSafeAreaInsets();
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
    filter === "all" ? records : records.filter((r: any) => r.status === filter);

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
    });
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* Stats */}
      {stats && (
        <View style={{
          flexDirection: "row", backgroundColor: "white",
          paddingHorizontal: 16, paddingVertical: 14,
          borderBottomWidth: 1, borderBottomColor: "#f3f4f6",
        }}>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 22, fontWeight: "800", color: "#7e22ce" }}>{stats.pregnant}</Text>
            <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>Pregnant</Text>
          </View>
          <View style={{ width: 1, backgroundColor: "#f3f4f6" }} />
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 22, fontWeight: "800", color: "#1d4ed8" }}>{stats.totalBred}</Text>
            <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>Total Bred</Text>
          </View>
          <View style={{ width: 1, backgroundColor: "#f3f4f6" }} />
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 22, fontWeight: "800", color: "#15803d" }}>{stats.totalBirthed}</Text>
            <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>Birthed</Text>
          </View>
        </View>
      )}

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
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => {
            const sc = STATUS_COLORS[item.status] || STATUS_COLORS.BRED;
            return (
              <View style={{
                backgroundColor: "white", marginHorizontal: 16, marginBottom: 10,
                borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f3f4f6",
              }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <View style={{
                    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
                    backgroundColor: sc.bg,
                  }}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: sc.text }}>
                      {item.status}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 12, color: "#9ca3af" }}>
                    {item.breedingDate ? formatDate(item.breedingDate) : ""}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, color: "#9ca3af" }}>Dam (Female)</Text>
                    <Text style={{ fontSize: 15, fontWeight: "600", color: "#111827", marginTop: 2 }}>
                      {item.female?.name || item.female?.tag || "Unknown"}
                    </Text>
                  </View>
                  <Ionicons name="heart" size={16} color="#ec4899" />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, color: "#9ca3af" }}>Sire (Male)</Text>
                    <Text style={{ fontSize: 15, fontWeight: "600", color: "#111827", marginTop: 2 }}>
                      {item.male?.name || item.male?.tag || "Unknown"}
                    </Text>
                  </View>
                </View>

                {item.expectedDueDate && (
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8, gap: 4 }}>
                    <Ionicons name="calendar-outline" size={14} color="#8b5cf6" />
                    <Text style={{ fontSize: 13, color: "#7e22ce" }}>
                      Due: {formatDate(item.expectedDueDate)}
                    </Text>
                  </View>
                )}
                {item.offspringCount > 0 && (
                  <Text style={{ fontSize: 13, color: "#16a34a", marginTop: 4 }}>
                    {item.offspringCount} kid(s) born
                  </Text>
                )}
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 80 }}>
              <Ionicons name="heart-outline" size={48} color="#d1d5db" />
              <Text style={{ color: "#9ca3af", marginTop: 12, fontSize: 14 }}>No breeding records</Text>
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
          <Text style={{ fontSize: 17, fontWeight: "700" }}>Record Breeding</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={loading}>
            {loading
              ? <ActivityIndicator size="small" color="#16a34a" />
              : <Text style={{ color: "#16a34a", fontSize: 16, fontWeight: "600" }}>Save</Text>
            }
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          {/* Sire (Buck) */}
          <Text style={formLabel}>Select Sire (Buck)</Text>
          {bucks.length === 0 && (
            <Text style={{ color: "#9ca3af", fontSize: 13, marginBottom: 12 }}>No bucks available</Text>
          )}
          {bucks.map((b: any) => {
            const selected = sireId === b.id;
            return (
              <TouchableOpacity
                key={b.id}
                onPress={() => setSireId(b.id)}
                style={{
                  flexDirection: "row", alignItems: "center", padding: 12,
                  borderRadius: 12, marginBottom: 8, borderWidth: 1,
                  borderColor: selected ? "#3b82f6" : "#e5e7eb",
                  backgroundColor: selected ? "#eff6ff" : "white",
                }}
              >
                <Ionicons
                  name={selected ? "radio-button-on" : "radio-button-off"}
                  size={20}
                  color={selected ? "#3b82f6" : "#9ca3af"}
                />
                <Text style={{ marginLeft: 12, fontSize: 15, fontWeight: "500", color: "#111827" }}>
                  {b.name || b.tag}
                </Text>
                <Text style={{ marginLeft: 8, fontSize: 13, color: "#9ca3af" }}>{b.breed}</Text>
              </TouchableOpacity>
            );
          })}

          {/* Dam (Doe) */}
          <Text style={[formLabel, { marginTop: 12 }]}>Select Dam (Doe)</Text>
          {does.length === 0 && (
            <Text style={{ color: "#9ca3af", fontSize: 13, marginBottom: 12 }}>No does available</Text>
          )}
          {does.map((d: any) => {
            const selected = damId === d.id;
            return (
              <TouchableOpacity
                key={d.id}
                onPress={() => setDamId(d.id)}
                style={{
                  flexDirection: "row", alignItems: "center", padding: 12,
                  borderRadius: 12, marginBottom: 8, borderWidth: 1,
                  borderColor: selected ? "#ec4899" : "#e5e7eb",
                  backgroundColor: selected ? "#fdf2f8" : "white",
                }}
              >
                <Ionicons
                  name={selected ? "radio-button-on" : "radio-button-off"}
                  size={20}
                  color={selected ? "#ec4899" : "#9ca3af"}
                />
                <Text style={{ marginLeft: 12, fontSize: 15, fontWeight: "500", color: "#111827" }}>
                  {d.name || d.tag}
                </Text>
                <Text style={{ marginLeft: 8, fontSize: 13, color: "#9ca3af" }}>{d.breed}</Text>
              </TouchableOpacity>
            );
          })}

          {/* Notes */}
          <Text style={[formLabel, { marginTop: 12 }]}>Notes</Text>
          <TextInput
            style={{
              backgroundColor: "#f9fafb", borderWidth: 1, borderColor: "#e5e7eb",
              borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
              fontSize: 15, color: "#111827", minHeight: 80, textAlignVertical: "top",
            }}
            placeholder="Optional notes"
            placeholderTextColor="#9ca3af"
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </ScrollView>
      </View>
    </Modal>
  );
}

const formLabel = { fontSize: 13, fontWeight: "600" as const, color: "#374151", marginBottom: 8 };
