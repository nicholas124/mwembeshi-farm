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
import { getDailyLogs, createDailyLog } from "../../lib/api";

const ACTIVITIES = [
  "FEEDING",
  "WATERING",
  "MILKING",
  "CLEANING",
  "HEALTH_CHECK",
  "VACCINATION",
  "DEWORMING",
  "HOOF_TRIMMING",
  "BREEDING",
  "KIDDING_ASSIST",
  "WEIGHING",
  "MOVING_PASTURE",
  "MEDICATION",
  "OTHER",
] as const;

const ACTIVITY_ICONS: Record<string, string> = {
  FEEDING: "nutrition",
  WATERING: "water",
  MILKING: "beaker",
  CLEANING: "sparkles",
  HEALTH_CHECK: "fitness",
  VACCINATION: "shield-checkmark",
  DEWORMING: "bug",
  HOOF_TRIMMING: "cut",
  BREEDING: "heart",
  KIDDING_ASSIST: "hand-left",
  WEIGHING: "scale",
  MOVING_PASTURE: "swap-horizontal",
  MEDICATION: "medkit",
  OTHER: "ellipsis-horizontal",
};

const STATUS_ICONS: Record<string, { icon: string; color: string }> = {
  COMPLETED: { icon: "checkmark-circle", color: "#22c55e" },
  IN_PROGRESS: { icon: "time", color: "#f59e0b" },
  PLANNED: { icon: "calendar", color: "#3b82f6" },
  SKIPPED: { icon: "close-circle", color: "#ef4444" },
};

export default function TrackerScreen() {
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split("T")[0];

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["daily-logs", today],
    queryFn: () => getDailyLogs({ date: today }),
  });

  const logs = data?.logs || [];

  function formatTime(d: string) {
    return new Date(d).toLocaleTimeString("en-GB", {
      hour: "2-digit", minute: "2-digit",
    });
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Date Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-100">
        <Text className="text-base font-semibold text-gray-900">
          Today - {new Date().toLocaleDateString("en-GB", {
            weekday: "long", day: "numeric", month: "long",
          })}
        </Text>
        <Text className="text-sm text-gray-500 mt-0.5">
          {logs.length} activit{logs.length === 1 ? "y" : "ies"} logged
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
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
            const si = STATUS_ICONS[item.status] || STATUS_ICONS.COMPLETED;
            return (
              <View className="bg-white mx-4 mb-3 rounded-2xl p-4 border border-gray-100">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center gap-2">
                    <Ionicons
                      name={(ACTIVITY_ICONS[item.activityType] || "ellipsis-horizontal") as any}
                      size={18}
                      color="#16a34a"
                    />
                    <Text className="text-base font-semibold text-gray-900">
                      {item.activityType.replace(/_/g, " ")}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <Ionicons name={si.icon as any} size={14} color={si.color} />
                    <Text style={{ color: si.color }} className="text-xs font-medium">
                      {item.status}
                    </Text>
                  </View>
                </View>
                {item.description && (
                  <Text className="text-sm text-gray-600 mb-1">{item.description}</Text>
                )}
                <View className="flex-row items-center gap-4 mt-1">
                  {item.goatsAffected > 0 && (
                    <Text className="text-xs text-gray-400">
                      {item.goatsAffected} goat(s)
                    </Text>
                  )}
                  {item.timeSpent > 0 && (
                    <Text className="text-xs text-gray-400">
                      {item.timeSpent}h
                    </Text>
                  )}
                  {item.worker && (
                    <Text className="text-xs text-gray-400">
                      by {item.worker.name}
                    </Text>
                  )}
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View className="items-center py-20">
              <Ionicons name="calendar-outline" size={48} color="#d1d5db" />
              <Text className="text-gray-400 mt-3">No activities logged today</Text>
              <Text className="text-gray-300 text-sm mt-1">Tap + to log an activity</Text>
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
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100">
          <TouchableOpacity onPress={onClose}>
            <Text className="text-primary-600 text-base">Cancel</Text>
          </TouchableOpacity>
          <Text className="text-lg font-bold">Log Activity</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#16a34a" />
            ) : (
              <Text className="text-primary-600 text-base font-semibold">Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">Activity Type</Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {ACTIVITIES.map((a) => (
              <TouchableOpacity
                key={a}
                onPress={() => setActivityType(a)}
                className={`px-3 py-2 rounded-lg ${
                  activityType === a ? "bg-primary-600" : "bg-gray-100"
                }`}
              >
                <Text className={`text-xs font-medium ${
                  activityType === a ? "text-white" : "text-gray-600"
                }`}>{a.replace(/_/g, " ")}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-sm font-medium text-gray-700 mb-1.5">Description</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 mb-3 text-base bg-gray-50"
            placeholder="What was done?"
            value={description}
            onChangeText={setDescription}
          />

          <View className="flex-row gap-3 mb-3">
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 mb-1.5">Goats Affected</Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-gray-50"
                placeholder="0"
                value={goatsAffected}
                onChangeText={setGoatsAffected}
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 mb-1.5">Time (hours)</Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-gray-50"
                placeholder="0"
                value={timeSpent}
                onChangeText={setTimeSpent}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <Text className="text-sm font-medium text-gray-700 mb-2">Status</Text>
          <View className="flex-row gap-2 mb-4">
            {["COMPLETED", "IN_PROGRESS", "PLANNED", "SKIPPED"].map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setStatus(s)}
                className={`px-3 py-2 rounded-lg ${
                  status === s ? "bg-primary-600" : "bg-gray-100"
                }`}
              >
                <Text className={`text-xs font-medium ${
                  status === s ? "text-white" : "text-gray-600"
                }`}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-sm font-medium text-gray-700 mb-1.5">Notes</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-gray-50"
            placeholder="Additional notes"
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
