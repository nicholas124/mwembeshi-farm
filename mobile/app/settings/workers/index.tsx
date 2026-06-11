import { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
  ActivityIndicator, Modal, TextInput, Alert,
} from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getWorkers, createWorker } from "../../../lib/api";

const WORKER_TYPES = [
  { value: "PERMANENT", label: "Permanent" },
  { value: "CASUAL", label: "Casual" },
  { value: "SEASONAL", label: "Seasonal" },
  { value: "CONTRACT", label: "Contract" },
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  ACTIVE: { bg: "#f0fdf4", text: "#16a34a" },
  ON_LEAVE: { bg: "#fffbeb", text: "#d97706" },
  INACTIVE: { bg: "#f3f4f6", text: "#6b7280" },
  TERMINATED: { bg: "#fef2f2", text: "#dc2626" },
};

const emptyForm = { firstName: "", lastName: "", phone: "", position: "", workerType: "PERMANENT", dailyRate: "", monthlyRate: "" };

export default function WorkersScreen() {
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["workers"],
    queryFn: () => getWorkers({ pageSize: "100" }),
  });

  const workers: any[] = data?.data || [];

  async function handleCreate() {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.position.trim()) {
      Alert.alert("Error", "First name, last name and position are required");
      return;
    }
    setSaving(true);
    try {
      await createWorker({
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || undefined,
        position: form.position,
        workerType: form.workerType,
        dailyRate: form.dailyRate ? parseFloat(form.dailyRate) : undefined,
        monthlyRate: form.monthlyRate ? parseFloat(form.monthlyRate) : undefined,
      });
      qc.invalidateQueries({ queryKey: ["workers"] });
      setShowModal(false);
      setForm(emptyForm);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* Header */}
      <View style={{ backgroundColor: "#15803d", paddingTop: insets.top + 12, paddingBottom: 16, paddingHorizontal: 16, flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "white", fontSize: 20, fontWeight: "700" }}>Workers</Text>
          <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 1 }}>{workers.length} worker{workers.length === 1 ? "" : "s"}</Text>
        </View>
        <TouchableOpacity onPress={() => setShowModal(true)} style={{ backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Ionicons name="add" size={18} color="white" />
          <Text style={{ color: "white", fontSize: 13, fontWeight: "600" }}>New</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#16a34a" colors={["#16a34a"]} />}
        >
          {workers.length === 0 ? (
            <View style={{ alignItems: "center", paddingTop: 60 }}>
              <Ionicons name="people-outline" size={48} color="#d1d5db" />
              <Text style={{ color: "#9ca3af", marginTop: 12, fontSize: 15 }}>No workers yet</Text>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {workers.map((w) => {
                const statusStyle = STATUS_COLORS[w.status] || STATUS_COLORS.ACTIVE;
                const presentToday = w.attendances?.[0]?.status === "PRESENT";
                return (
                  <TouchableOpacity
                    key={w.id}
                    onPress={() => router.push(`/settings/workers/${w.id}` as any)}
                    activeOpacity={0.75}
                    style={{ backgroundColor: "white", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#f3f4f6", flexDirection: "row", alignItems: "center" }}
                  >
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                      <Text style={{ color: "#2563eb", fontWeight: "700", fontSize: 14 }}>
                        {`${w.firstName[0]}${w.lastName[0]}`.toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827" }} numberOfLines={1}>{w.firstName} {w.lastName}</Text>
                      <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }} numberOfLines={1}>{w.position} · {w.employeeId}</Text>
                      <View style={{ flexDirection: "row", gap: 6, marginTop: 6 }}>
                        <View style={{ backgroundColor: statusStyle.bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                          <Text style={{ fontSize: 11, fontWeight: "700", color: statusStyle.text }}>{w.status.replace("_", " ")}</Text>
                        </View>
                        {presentToday && (
                          <View style={{ backgroundColor: "#f0fdf4", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, flexDirection: "row", alignItems: "center", gap: 3 }}>
                            <Ionicons name="checkmark-circle" size={11} color="#16a34a" />
                            <Text style={{ fontSize: 11, fontWeight: "700", color: "#16a34a" }}>Present</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      {/* Create Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
        <View style={{ flex: 1, backgroundColor: "white" }}>
          <View style={{ flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" }}>
            <TouchableOpacity onPress={() => setShowModal(false)} style={{ marginRight: 12 }}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#111827", flex: 1 }}>New Worker</Text>
            <TouchableOpacity onPress={handleCreate} disabled={saving} style={{ backgroundColor: "#16a34a", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 }}>
              {saving ? <ActivityIndicator color="white" size="small" /> : <Text style={{ color: "white", fontWeight: "600" }}>Create</Text>}
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>First Name *</Text>
            <TextInput
              style={inputStyle}
              placeholder="e.g. John"
              placeholderTextColor="#9ca3af"
              value={form.firstName}
              onChangeText={v => setForm(f => ({ ...f, firstName: v }))}
            />
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Last Name *</Text>
            <TextInput
              style={inputStyle}
              placeholder="e.g. Banda"
              placeholderTextColor="#9ca3af"
              value={form.lastName}
              onChangeText={v => setForm(f => ({ ...f, lastName: v }))}
            />
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Phone</Text>
            <TextInput
              style={inputStyle}
              placeholder="+260 97 123 4567"
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={v => setForm(f => ({ ...f, phone: v }))}
            />
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Position *</Text>
            <TextInput
              style={inputStyle}
              placeholder="e.g. Herd Attendant"
              placeholderTextColor="#9ca3af"
              value={form.position}
              onChangeText={v => setForm(f => ({ ...f, position: v }))}
            />
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 8 }}>Worker Type *</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {WORKER_TYPES.map(t => (
                <TouchableOpacity key={t.value} onPress={() => setForm(f => ({ ...f, workerType: t.value }))}
                  style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: form.workerType === t.value ? "#16a34a" : "#f3f4f6", borderWidth: 1, borderColor: form.workerType === t.value ? "#16a34a" : "#e5e7eb" }}>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: form.workerType === t.value ? "white" : "#6b7280" }}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Daily Rate (ZMW)</Text>
            <TextInput
              style={inputStyle}
              placeholder="0.00"
              placeholderTextColor="#9ca3af"
              keyboardType="decimal-pad"
              value={form.dailyRate}
              onChangeText={v => setForm(f => ({ ...f, dailyRate: v }))}
            />
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Monthly Rate (ZMW)</Text>
            <TextInput
              style={inputStyle}
              placeholder="0.00"
              placeholderTextColor="#9ca3af"
              keyboardType="decimal-pad"
              value={form.monthlyRate}
              onChangeText={v => setForm(f => ({ ...f, monthlyRate: v }))}
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const inputStyle = {
  backgroundColor: "#f9fafb", borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 12,
  padding: 14, fontSize: 15, color: "#111827", marginBottom: 16,
} as const;
