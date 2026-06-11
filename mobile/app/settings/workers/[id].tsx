import { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Modal, TextInput, Alert,
} from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getWorker, updateWorker, deleteWorker } from "../../../lib/api";

const WORKER_TYPES = [
  { value: "PERMANENT", label: "Permanent" },
  { value: "CASUAL", label: "Casual" },
  { value: "SEASONAL", label: "Seasonal" },
  { value: "CONTRACT", label: "Contract" },
];

const STATUSES = [
  { value: "ACTIVE", label: "Active" },
  { value: "ON_LEAVE", label: "On Leave" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "TERMINATED", label: "Terminated" },
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  ACTIVE: { bg: "#f0fdf4", text: "#16a34a" },
  ON_LEAVE: { bg: "#fffbeb", text: "#d97706" },
  INACTIVE: { bg: "#f3f4f6", text: "#6b7280" },
  TERMINATED: { bg: "#fef2f2", text: "#dc2626" },
};

const emptyForm = {
  firstName: "", lastName: "", phone: "", address: "", nrc: "",
  position: "", workerType: "PERMANENT", status: "ACTIVE",
  dailyRate: "", monthlyRate: "", emergencyContact: "", emergencyPhone: "", notes: "",
};

export default function WorkerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ["worker", id],
    queryFn: () => getWorker(id!),
    enabled: !!id,
  });

  const worker = data?.data;

  useEffect(() => {
    if (worker) {
      setForm({
        firstName: worker.firstName || "",
        lastName: worker.lastName || "",
        phone: worker.phone || "",
        address: worker.address || "",
        nrc: worker.nrc || "",
        position: worker.position || "",
        workerType: worker.workerType,
        status: worker.status,
        dailyRate: worker.dailyRate != null ? String(worker.dailyRate) : "",
        monthlyRate: worker.monthlyRate != null ? String(worker.monthlyRate) : "",
        emergencyContact: worker.emergencyContact || "",
        emergencyPhone: worker.emergencyPhone || "",
        notes: worker.notes || "",
      });
    }
  }, [worker]);

  async function handleSave() {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.position.trim()) {
      Alert.alert("Error", "First name, last name and position are required");
      return;
    }
    setSaving(true);
    try {
      await updateWorker(id!, {
        ...form,
        dailyRate: form.dailyRate || null,
        monthlyRate: form.monthlyRate || null,
      });
      qc.invalidateQueries({ queryKey: ["worker", id] });
      qc.invalidateQueries({ queryKey: ["workers"] });
      setShowModal(false);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  }

  function handleTerminate() {
    if (!worker) return;
    Alert.alert("Terminate Worker", `Terminate ${worker.firstName} ${worker.lastName}? The record will be kept but marked as terminated.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Terminate",
        style: "destructive",
        onPress: async () => {
          setSaving(true);
          try {
            await deleteWorker(id!);
            qc.invalidateQueries({ queryKey: ["worker", id] });
            qc.invalidateQueries({ queryKey: ["workers"] });
          } catch (e: any) {
            Alert.alert("Error", e.message);
          } finally {
            setSaving(false);
          }
        },
      },
    ]);
  }

  if (isLoading || !worker) {
    return (
      <View style={{ flex: 1, backgroundColor: "#f9fafb", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  const statusStyle = STATUS_COLORS[worker.status] || STATUS_COLORS.ACTIVE;

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* Header */}
      <View style={{ backgroundColor: "#15803d", paddingTop: insets.top + 12, paddingBottom: 16, paddingHorizontal: 16, flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "white", fontSize: 20, fontWeight: "700" }} numberOfLines={1}>{worker.firstName} {worker.lastName}</Text>
          <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 1 }}>{worker.employeeId} · {worker.position}</Text>
        </View>
        <TouchableOpacity onPress={() => setShowModal(true)} style={{ backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Ionicons name="create-outline" size={18} color="white" />
          <Text style={{ color: "white", fontSize: 13, fontWeight: "600" }}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Status & Type */}
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
          <View style={{ backgroundColor: statusStyle.bg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }}>
            <Text style={{ fontSize: 12, fontWeight: "700", color: statusStyle.text }}>{worker.status.replace("_", " ")}</Text>
          </View>
          <View style={{ backgroundColor: "#eff6ff", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }}>
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#2563eb" }}>{worker.workerType}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
          <StatCard label="Recent Attendance" value={worker.attendances?.length ?? 0} icon="calendar-outline" />
          <StatCard label="Recent Payments" value={worker.payments?.length ?? 0} icon="cash-outline" />
        </View>

        {/* Personal Info */}
        <SectionLabel label="Personal Information" />
        <View style={{ backgroundColor: "white", borderRadius: 16, borderWidth: 1, borderColor: "#f3f4f6", overflow: "hidden", marginBottom: 16 }}>
          <InfoRow icon="call-outline" label="Phone" value={worker.phone || "—"} />
          <InfoRow icon="location-outline" label="Address" value={worker.address || "—"} />
          <InfoRow icon="card-outline" label="NRC" value={worker.nrc || "—"} last />
        </View>

        {/* Employment */}
        <SectionLabel label="Employment" />
        <View style={{ backgroundColor: "white", borderRadius: 16, borderWidth: 1, borderColor: "#f3f4f6", overflow: "hidden", marginBottom: 16 }}>
          <InfoRow icon="briefcase-outline" label="Position" value={worker.position} />
          <InfoRow icon="cash-outline" label="Daily Rate" value={worker.dailyRate != null ? `ZMW ${Number(worker.dailyRate).toFixed(2)}` : "—"} />
          <InfoRow icon="wallet-outline" label="Monthly Rate" value={worker.monthlyRate != null ? `ZMW ${Number(worker.monthlyRate).toFixed(2)}` : "—"} last />
        </View>

        {/* Emergency Contact */}
        <SectionLabel label="Emergency Contact" />
        <View style={{ backgroundColor: "white", borderRadius: 16, borderWidth: 1, borderColor: "#f3f4f6", overflow: "hidden", marginBottom: 16 }}>
          <InfoRow icon="person-outline" label="Contact Name" value={worker.emergencyContact || "—"} />
          <InfoRow icon="call-outline" label="Contact Phone" value={worker.emergencyPhone || "—"} last />
        </View>

        {worker.notes ? (
          <>
            <SectionLabel label="Notes" />
            <View style={{ backgroundColor: "white", borderRadius: 16, borderWidth: 1, borderColor: "#f3f4f6", padding: 14, marginBottom: 16 }}>
              <Text style={{ fontSize: 14, color: "#374151", lineHeight: 20 }}>{worker.notes}</Text>
            </View>
          </>
        ) : null}

        {worker.status !== "TERMINATED" && (
          <TouchableOpacity
            onPress={handleTerminate}
            disabled={saving}
            style={{ borderWidth: 1.5, borderColor: "#fee2e2", borderRadius: 12, padding: 14, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}
          >
            <Ionicons name="person-remove-outline" size={18} color="#ef4444" />
            <Text style={{ color: "#ef4444", fontWeight: "700", fontSize: 14 }}>Terminate Worker</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
        <View style={{ flex: 1, backgroundColor: "white" }}>
          <View style={{ flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" }}>
            <TouchableOpacity onPress={() => setShowModal(false)} style={{ marginRight: 12 }}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#111827", flex: 1 }}>Edit Worker</Text>
            <TouchableOpacity onPress={handleSave} disabled={saving} style={{ backgroundColor: "#16a34a", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 }}>
              {saving ? <ActivityIndicator color="white" size="small" /> : <Text style={{ color: "white", fontWeight: "600" }}>Save</Text>}
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>First Name *</Text>
            <TextInput style={inputStyle} value={form.firstName} onChangeText={v => setForm(f => ({ ...f, firstName: v }))} placeholderTextColor="#9ca3af" />
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Last Name *</Text>
            <TextInput style={inputStyle} value={form.lastName} onChangeText={v => setForm(f => ({ ...f, lastName: v }))} placeholderTextColor="#9ca3af" />
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Phone</Text>
            <TextInput style={inputStyle} value={form.phone} onChangeText={v => setForm(f => ({ ...f, phone: v }))} keyboardType="phone-pad" placeholderTextColor="#9ca3af" />
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Address</Text>
            <TextInput style={inputStyle} value={form.address} onChangeText={v => setForm(f => ({ ...f, address: v }))} placeholderTextColor="#9ca3af" />
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>NRC Number</Text>
            <TextInput style={inputStyle} value={form.nrc} onChangeText={v => setForm(f => ({ ...f, nrc: v }))} placeholderTextColor="#9ca3af" />
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Position *</Text>
            <TextInput style={inputStyle} value={form.position} onChangeText={v => setForm(f => ({ ...f, position: v }))} placeholderTextColor="#9ca3af" />

            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 8 }}>Worker Type *</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {WORKER_TYPES.map(t => (
                <TouchableOpacity key={t.value} onPress={() => setForm(f => ({ ...f, workerType: t.value }))}
                  style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: form.workerType === t.value ? "#16a34a" : "#f3f4f6", borderWidth: 1, borderColor: form.workerType === t.value ? "#16a34a" : "#e5e7eb" }}>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: form.workerType === t.value ? "white" : "#6b7280" }}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 8 }}>Status *</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {STATUSES.map(s => (
                <TouchableOpacity key={s.value} onPress={() => setForm(f => ({ ...f, status: s.value }))}
                  style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: form.status === s.value ? "#16a34a" : "#f3f4f6", borderWidth: 1, borderColor: form.status === s.value ? "#16a34a" : "#e5e7eb" }}>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: form.status === s.value ? "white" : "#6b7280" }}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Daily Rate (ZMW)</Text>
            <TextInput style={inputStyle} value={form.dailyRate} onChangeText={v => setForm(f => ({ ...f, dailyRate: v }))} keyboardType="decimal-pad" placeholderTextColor="#9ca3af" />
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Monthly Rate (ZMW)</Text>
            <TextInput style={inputStyle} value={form.monthlyRate} onChangeText={v => setForm(f => ({ ...f, monthlyRate: v }))} keyboardType="decimal-pad" placeholderTextColor="#9ca3af" />
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Emergency Contact Name</Text>
            <TextInput style={inputStyle} value={form.emergencyContact} onChangeText={v => setForm(f => ({ ...f, emergencyContact: v }))} placeholderTextColor="#9ca3af" />
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Emergency Contact Phone</Text>
            <TextInput style={inputStyle} value={form.emergencyPhone} onChangeText={v => setForm(f => ({ ...f, emergencyPhone: v }))} keyboardType="phone-pad" placeholderTextColor="#9ca3af" />
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Notes</Text>
            <TextInput style={[inputStyle, { minHeight: 80, textAlignVertical: "top" }]} value={form.notes} onChangeText={v => setForm(f => ({ ...f, notes: v }))} multiline placeholderTextColor="#9ca3af" />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <Text style={{ fontSize: 11, fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
      {label}
    </Text>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: "white", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#f3f4f6" }}>
      <Ionicons name={icon as any} size={18} color="#16a34a" />
      <Text style={{ fontSize: 20, fontWeight: "800", color: "#111827", marginTop: 8 }}>{value}</Text>
      <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function InfoRow({ icon, label, value, last }: { icon: string; label: string; value: string; last?: boolean }) {
  return (
    <View style={{
      flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 13,
      borderBottomWidth: last ? 0 : 1, borderBottomColor: "#f3f4f6",
    }}>
      <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#f0fdf4", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
        <Ionicons name={icon as any} size={16} color="#16a34a" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 11, color: "#9ca3af" }}>{label}</Text>
        <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827", marginTop: 1 }}>{value}</Text>
      </View>
    </View>
  );
}

const inputStyle = {
  backgroundColor: "#f9fafb", borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 12,
  padding: 14, fontSize: 15, color: "#111827", marginBottom: 16,
} as const;
