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
import { getDailyLogs, createDailyLog } from "../../lib/api";

const ACTIVITIES = [
  "FEEDING", "WATERING", "MILKING", "CLEANING", "HEALTH_CHECK",
  "VACCINATION", "DEWORMING", "HOOF_TRIMMING", "BREEDING",
  "KIDDING_ASSIST", "WEIGHING", "MOVING_PASTURE", "MEDICATION", "OTHER",
] as const;

const ACTIVITY_ICONS: Record<string, string> = {
  FEEDING: "nutrition", WATERING: "water", MILKING: "beaker",
  CLEANING: "sparkles", HEALTH_CHECK: "fitness", VACCINATION: "shield-checkmark",
  DEWORMING: "bug", HOOF_TRIMMING: "cut", BREEDING: "heart",
  KIDDING_ASSIST: "hand-left", WEIGHING: "scale", MOVING_PASTURE: "swap-horizontal",
  MEDICATION: "medkit", OTHER: "ellipsis-horizontal",
};

const STATUS_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  COMPLETED:   { icon: "checkmark-circle", color: "#22c55e", label: "Completed" },
  IN_PROGRESS: { icon: "time",             color: "#f59e0b", label: "In Progress" },
  PLANNED:     { icon: "calendar",         color: "#3b82f6", label: "Planned" },
  SKIPPED:     { icon: "close-circle",     color: "#ef4444", label: "Skipped" },
};

export default function TrackerScreen() {
  const insets = useSafeAreaInsets();
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split("T")[0];

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["daily-logs", today],
    queryFn: () => getDailyLogs({ date: today }),
  });

  const logs = data?.logs || [];

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* Date Header */}
      <View style={{
        backgroundColor: "white", paddingHorizontal: 16, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: "#f3f4f6",
      }}>
        <Text style={{ fontSize: 15, fontWeight: "600", color: "#111827" }}>
          Today — {new Date().toLocaleDateString("en-GB", {
            weekday: "long", day: "numeric", month: "long",
          })}
        </Text>
        <Text style={{ fontSize: 13, color: "#9ca3af", marginTop: 2 }}>
          {logs.length} activit{logs.length === 1 ? "y" : "ies"} logged
        </Text>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#16a34a" />
          }
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 100 }}
          renderItem={({ item }) => {
            const si = STATUS_CONFIG[item.status] || STATUS_CONFIG.COMPLETED;
            return (
              <View style={{
                backgroundColor: "white", marginHorizontal: 16, marginBottom: 10,
                borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f3f4f6",
              }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: "#f0fdf4", alignItems: "center", justifyContent: "center" }}>
                      <Ionicons
                        name={(ACTIVITY_ICONS[item.activityType] || "ellipsis-horizontal") as any}
                        size={18}
                        color="#16a34a"
                      />
                    </View>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}>
                      {item.activityType.replace(/_/g, " ")}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Ionicons name={si.icon as any} size={14} color={si.color} />
                    <Text style={{ fontSize: 12, fontWeight: "600", color: si.color }}>
                      {si.label}
                    </Text>
                  </View>
                </View>

                {item.description && (
                  <Text style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>{item.description}</Text>
                )}

                <View style={{ flexDirection: "row", gap: 12, marginTop: 4 }}>
                  {item.goatsAffected > 0 && (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                      <Ionicons name="paw-outline" size={12} color="#9ca3af" />
                      <Text style={{ fontSize: 12, color: "#9ca3af" }}>{item.goatsAffected} goat(s)</Text>
                    </View>
                  )}
                  {item.timeSpent > 0 && (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                      <Ionicons name="time-outline" size={12} color="#9ca3af" />
                      <Text style={{ fontSize: 12, color: "#9ca3af" }}>{item.timeSpent}h</Text>
                    </View>
                  )}
                  {item.worker && (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                      <Ionicons name="person-outline" size={12} color="#9ca3af" />
                      <Text style={{ fontSize: 12, color: "#9ca3af" }}>{item.worker.name}</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 80 }}>
              <Ionicons name="calendar-outline" size={48} color="#d1d5db" />
              <Text style={{ color: "#9ca3af", marginTop: 12, fontSize: 14 }}>No activities logged today</Text>
              <Text style={{ color: "#d1d5db", fontSize: 13, marginTop: 4 }}>Tap + to log an activity</Text>
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

      <NewLogModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          setShowModal(false);
          queryClient.invalidateQueries({ queryKey: ["daily-logs"] });
        }}
      />
    </View>
  );
}

function NewLogModal({
  visible,
  onClose,
  onSuccess,
}: {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [activityType, setActivityType] = useState<string>("FEEDING");
  const [description, setDescription] = useState("");
  const [goatsAffected, setGoatsAffected] = useState("");
  const [timeSpent, setTimeSpent] = useState("");
  const [status, setStatus] = useState("COMPLETED");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    try {
      await createDailyLog({
        date: new Date().toISOString(),
        activityType,
        description,
        goatsAffected: parseInt(goatsAffected) || 0,
        timeSpent: parseFloat(timeSpent) || 0,
        status,
        notes,
      });
      Alert.alert("Success", "Activity logged");
      setDescription("");
      setGoatsAffected("");
      setTimeSpent("");
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
          <Text style={{ fontSize: 17, fontWeight: "700" }}>Log Activity</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={loading}>
            {loading
              ? <ActivityIndicator size="small" color="#16a34a" />
              : <Text style={{ color: "#16a34a", fontSize: 16, fontWeight: "600" }}>Save</Text>
            }
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          {/* Activity Type */}
          <Text style={formLabel}>Activity Type</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {ACTIVITIES.map((a) => {
              const active = activityType === a;
              return (
                <TouchableOpacity
                  key={a}
                  onPress={() => setActivityType(a)}
                  style={{
                    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
                    backgroundColor: active ? "#16a34a" : "#f3f4f6",
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: "600", color: active ? "white" : "#6b7280" }}>
                    {a.replace(/_/g, " ")}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={formLabel}>Description</Text>
          <TextInput
            style={formInput}
            placeholder="What was done?"
            placeholderTextColor="#9ca3af"
            value={description}
            onChangeText={setDescription}
          />

          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={formLabel}>Goats Affected</Text>
              <TextInput
                style={formInput}
                placeholder="0"
                placeholderTextColor="#9ca3af"
                value={goatsAffected}
                onChangeText={setGoatsAffected}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={formLabel}>Time (hours)</Text>
              <TextInput
                style={formInput}
                placeholder="0"
                placeholderTextColor="#9ca3af"
                value={timeSpent}
                onChangeText={setTimeSpent}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Status */}
          <Text style={formLabel}>Status</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {(["COMPLETED", "IN_PROGRESS", "PLANNED", "SKIPPED"] as const).map((s) => {
              const active = status === s;
              const cfg = STATUS_CONFIG[s];
              return (
                <TouchableOpacity
                  key={s}
                  onPress={() => setStatus(s)}
                  style={{
                    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
                    backgroundColor: active ? cfg.color : "#f3f4f6",
                    flexDirection: "row", alignItems: "center", gap: 5,
                  }}
                >
                  <Ionicons name={cfg.icon as any} size={14} color={active ? "white" : "#9ca3af"} />
                  <Text style={{ fontSize: 12, fontWeight: "600", color: active ? "white" : "#6b7280" }}>
                    {cfg.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

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
