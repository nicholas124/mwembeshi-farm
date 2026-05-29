import { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
  ActivityIndicator, Modal, TextInput, Alert, Switch,
} from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getKiddingRecords, createKiddingRecord, getGoats, getBreeding } from "../../lib/api";

const BIRTH_TYPES = ["UNASSISTED", "ASSISTED", "CAESAREAN"] as const;

export default function KiddingScreen() {
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    animalId: "", breedingRecordId: "",
    birthDate: new Date().toISOString().split("T")[0],
    totalBorn: "1", liveBorn: "1", stillBorn: "0",
    birthType: "UNASSISTED" as typeof BIRTH_TYPES[number],
    complications: "", doesCondition: "",
    placentaExpelled: false, placentaMinutes: "", notes: "",
  });

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["kidding"],
    queryFn: () => getKiddingRecords(),
  });

  const { data: doesData } = useQuery({
    queryKey: ["does-for-kidding"],
    queryFn: () => getGoats({ gender: "FEMALE", status: "ACTIVE" }),
    enabled: showModal,
  });

  const { data: breedingData } = useQuery({
    queryKey: ["breeding-pregnant"],
    queryFn: getBreeding,
    enabled: showModal,
  });

  const records: any[] = data?.data || [];
  const does: any[] = doesData?.data || [];
  const pregnantRecords: any[] = (breedingData?.records || []).filter((r: any) => r.status === "PREGNANT");

  async function handleCreate() {
    if (!form.animalId || !form.birthDate) { Alert.alert("Error", "Doe and birth date are required"); return; }
    setSaving(true);
    try {
      await createKiddingRecord(form);
      qc.invalidateQueries({ queryKey: ["kidding"] });
      qc.invalidateQueries({ queryKey: ["goats-dashboard"] });
      setShowModal(false);
      setForm({ animalId: "", breedingRecordId: "", birthDate: new Date().toISOString().split("T")[0], totalBorn: "1", liveBorn: "1", stillBorn: "0", birthType: "UNASSISTED", complications: "", doesCondition: "", placentaExpelled: false, placentaMinutes: "", notes: "" });
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  }

  const selectedDoe = does.find((d: any) => d.id === form.animalId);

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <View style={{ backgroundColor: "#15803d", paddingTop: insets.top + 12, paddingBottom: 16, paddingHorizontal: 16, flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "white", fontSize: 20, fontWeight: "700" }}>Kidding Records</Text>
          <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 1 }}>{records.length} birth events recorded</Text>
        </View>
        <TouchableOpacity onPress={() => setShowModal(true)} style={{ backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Ionicons name="add" size={18} color="white" />
          <Text style={{ color: "white", fontSize: 13, fontWeight: "600" }}>Record Birth</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator size="large" color="#16a34a" /></View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#16a34a" colors={["#16a34a"]} />}
        >
          {records.length === 0 ? (
            <View style={{ alignItems: "center", paddingTop: 60 }}>
              <Ionicons name="happy-outline" size={48} color="#d1d5db" />
              <Text style={{ color: "#9ca3af", marginTop: 12, fontSize: 15 }}>No kidding records yet</Text>
              <TouchableOpacity onPress={() => setShowModal(true)} style={{ marginTop: 16, backgroundColor: "#16a34a", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 }}>
                <Text style={{ color: "white", fontWeight: "600" }}>Record First Birth</Text>
              </TouchableOpacity>
            </View>
          ) : (
            records.map((rec: any) => (
              <View key={rec.id} style={{ backgroundColor: "white", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#f3f4f6", elevation: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "#fdf2f8", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                    <Ionicons name="happy" size={20} color="#ec4899" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827" }}>{rec.animal?.name || rec.animal?.tag}</Text>
                    <Text style={{ fontSize: 12, color: "#6b7280" }}>{new Date(rec.birthDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}</Text>
                  </View>
                  <View style={{ backgroundColor: rec.birthType === "UNASSISTED" ? "#f0fdf4" : "#fff7ed", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                    <Text style={{ fontSize: 11, fontWeight: "600", color: rec.birthType === "UNASSISTED" ? "#16a34a" : "#ea580c" }}>{rec.birthType}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <View style={{ flex: 1, backgroundColor: "#f0fdf4", borderRadius: 10, padding: 10, alignItems: "center" }}>
                    <Text style={{ fontSize: 20, fontWeight: "800", color: "#16a34a" }}>{rec.liveBorn}</Text>
                    <Text style={{ fontSize: 11, color: "#16a34a" }}>Live</Text>
                  </View>
                  {rec.stillBorn > 0 && (
                    <View style={{ flex: 1, backgroundColor: "#fef2f2", borderRadius: 10, padding: 10, alignItems: "center" }}>
                      <Text style={{ fontSize: 20, fontWeight: "800", color: "#dc2626" }}>{rec.stillBorn}</Text>
                      <Text style={{ fontSize: 11, color: "#dc2626" }}>Stillborn</Text>
                    </View>
                  )}
                  <View style={{ flex: 1, backgroundColor: "#f9fafb", borderRadius: 10, padding: 10, alignItems: "center" }}>
                    <Text style={{ fontSize: 20, fontWeight: "800", color: "#6b7280" }}>{rec.totalBorn}</Text>
                    <Text style={{ fontSize: 11, color: "#6b7280" }}>Total</Text>
                  </View>
                </View>
                {rec.complications && (
                  <View style={{ marginTop: 10, backgroundColor: "#fff7ed", borderRadius: 8, padding: 8, flexDirection: "row", gap: 6 }}>
                    <Ionicons name="warning-outline" size={14} color="#ea580c" />
                    <Text style={{ fontSize: 12, color: "#ea580c", flex: 1 }}>{rec.complications}</Text>
                  </View>
                )}
                {rec.kids?.length > 0 && (
                  <View style={{ marginTop: 10 }}>
                    <Text style={{ fontSize: 12, color: "#6b7280", fontWeight: "600" }}>Kids registered: {rec.kids.length}</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Record Birth Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
        <View style={{ flex: 1, backgroundColor: "white" }}>
          <View style={{ flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" }}>
            <TouchableOpacity onPress={() => setShowModal(false)} style={{ marginRight: 12 }}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: "700", flex: 1 }}>Record Kidding Event</Text>
            <TouchableOpacity onPress={handleCreate} disabled={saving} style={{ backgroundColor: "#16a34a", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 }}>
              {saving ? <ActivityIndicator color="white" size="small" /> : <Text style={{ color: "white", fontWeight: "600" }}>Save</Text>}
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 8 }}>Select Doe *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {does.map((d: any) => (
                <TouchableOpacity key={d.id} onPress={() => setForm(f => ({ ...f, animalId: d.id, breedingRecordId: "" }))}
                  style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, marginRight: 8, minWidth: 100, alignItems: "center", backgroundColor: form.animalId === d.id ? "#16a34a" : "#f3f4f6", borderWidth: 1, borderColor: form.animalId === d.id ? "#16a34a" : "#e5e7eb" }}>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: form.animalId === d.id ? "white" : "#111827" }}>{d.name || d.tag}</Text>
                  <Text style={{ fontSize: 11, color: form.animalId === d.id ? "rgba(255,255,255,0.8)" : "#9ca3af" }}>{d.breed}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {selectedDoe && pregnantRecords.filter((r: any) => r.animalId === form.animalId).length > 0 && (
              <>
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 8 }}>Link to Breeding Record (optional)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                  {pregnantRecords.filter((r: any) => r.animalId === form.animalId).map((r: any) => (
                    <TouchableOpacity key={r.id} onPress={() => setForm(f => ({ ...f, breedingRecordId: r.id }))}
                      style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, marginRight: 8, backgroundColor: form.breedingRecordId === r.id ? "#16a34a" : "#f3f4f6", borderWidth: 1, borderColor: form.breedingRecordId === r.id ? "#16a34a" : "#e5e7eb" }}>
                      <Text style={{ fontSize: 13, color: form.breedingRecordId === r.id ? "white" : "#6b7280" }}>
                        Bred {new Date(r.breedingDate).toLocaleDateString()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Birth Date *</Text>
            <TextInput style={{ backgroundColor: "#f9fafb", borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 12, padding: 14, fontSize: 15, color: "#111827", marginBottom: 16 }}
              placeholder="YYYY-MM-DD" value={form.birthDate} onChangeText={v => setForm(f => ({ ...f, birthDate: v }))} />

            <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
              {[{ label: "Total Born", key: "totalBorn" }, { label: "Live Born", key: "liveBorn" }, { label: "Stillborn", key: "stillBorn" }].map(({ label, key }) => (
                <View key={key} style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: "#374151", marginBottom: 6 }}>{label}</Text>
                  <TextInput style={{ backgroundColor: "#f9fafb", borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 12, padding: 12, fontSize: 16, color: "#111827", textAlign: "center" }}
                    keyboardType="number-pad" value={(form as any)[key]} onChangeText={v => setForm(f => ({ ...f, [key]: v }))} />
                </View>
              ))}
            </View>

            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 8 }}>Birth Type</Text>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
              {BIRTH_TYPES.map(t => (
                <TouchableOpacity key={t} onPress={() => setForm(f => ({ ...f, birthType: t }))}
                  style={{ flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: "center", backgroundColor: form.birthType === t ? "#16a34a" : "#f3f4f6", borderWidth: 1, borderColor: form.birthType === t ? "#16a34a" : "#e5e7eb" }}>
                  <Text style={{ fontSize: 11, fontWeight: "600", color: form.birthType === t ? "white" : "#6b7280" }}>{t.charAt(0) + t.slice(1).toLowerCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Complications (if any)</Text>
            <TextInput style={{ backgroundColor: "#f9fafb", borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 12, padding: 14, fontSize: 15, color: "#111827", marginBottom: 16 }}
              placeholder="e.g. Dystocia, retained placenta..." placeholderTextColor="#9ca3af" value={form.complications} onChangeText={v => setForm(f => ({ ...f, complications: v }))} />

            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Doe condition post-birth</Text>
            <TextInput style={{ backgroundColor: "#f9fafb", borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 12, padding: 14, fontSize: 15, color: "#111827", marginBottom: 16 }}
              placeholder="e.g. Good, weak, eating well..." placeholderTextColor="#9ca3af" value={form.doesCondition} onChangeText={v => setForm(f => ({ ...f, doesCondition: v }))} />

            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151" }}>Placenta expelled?</Text>
              <Switch value={form.placentaExpelled} onValueChange={v => setForm(f => ({ ...f, placentaExpelled: v }))} trackColor={{ true: "#16a34a" }} />
            </View>

            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Notes</Text>
            <TextInput style={{ backgroundColor: "#f9fafb", borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 12, padding: 14, fontSize: 15, color: "#111827", minHeight: 70, textAlignVertical: "top" }}
              placeholder="Any additional notes..." placeholderTextColor="#9ca3af" multiline value={form.notes} onChangeText={v => setForm(f => ({ ...f, notes: v }))} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
