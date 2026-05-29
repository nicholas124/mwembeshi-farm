import { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
  ActivityIndicator, Modal, TextInput, Alert, Switch,
} from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getMortality, createMortality, getGoats } from "../../lib/api";

const CAUSES = [
  { value: "DISEASE", label: "Disease", icon: "bug", color: "#dc2626" },
  { value: "PARASITES", label: "Parasites", icon: "cellular", color: "#9333ea" },
  { value: "PREDATOR", label: "Predator", icon: "alert-circle", color: "#ea580c" },
  { value: "ACCIDENT", label: "Accident", icon: "warning", color: "#d97706" },
  { value: "POISONING", label: "Poisoning", icon: "flask", color: "#be185d" },
  { value: "BIRTHING_COMPLICATIONS", label: "Birth Complications", icon: "heart-dislike", color: "#ec4899" },
  { value: "STARVATION", label: "Starvation", icon: "nutrition", color: "#92400e" },
  { value: "DEHYDRATION", label: "Dehydration", icon: "water", color: "#0284c7" },
  { value: "OLD_AGE", label: "Old Age", icon: "time", color: "#4b5563" },
  { value: "UNKNOWN", label: "Unknown", icon: "help-circle", color: "#6b7280" },
];

export default function MortalityScreen() {
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    animalId: "", deathDate: new Date().toISOString().split("T")[0],
    cause: "", causeDetails: "", symptomsDuration: "",
    symptomsDescription: "", treatmentsGiven: "",
    estimatedValue: "", necropsyDone: false, necropsyFindings: "", notes: "",
  });

  const { data, isLoading, refetch, isRefetching } = useQuery({ queryKey: ["mortality"], queryFn: getMortality });
  const { data: goatsData } = useQuery({ queryKey: ["active-goats"], queryFn: () => getGoats({ status: "ACTIVE" }), enabled: showModal });

  const records: any[] = data?.data || [];
  const totalLoss: number = data?.totalLoss || 0;
  const activeGoats: any[] = goatsData?.data || [];

  async function handleCreate() {
    if (!form.animalId || !form.deathDate || !form.cause) { Alert.alert("Error", "Animal, death date, and cause are required"); return; }
    Alert.alert("Confirm", "This will mark the goat as deceased. Continue?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm", style: "destructive",
        onPress: async () => {
          setSaving(true);
          try {
            await createMortality(form);
            qc.invalidateQueries({ queryKey: ["mortality"] });
            qc.invalidateQueries({ queryKey: ["goats-dashboard"] });
            setShowModal(false);
            setForm({ animalId: "", deathDate: new Date().toISOString().split("T")[0], cause: "", causeDetails: "", symptomsDuration: "", symptomsDescription: "", treatmentsGiven: "", estimatedValue: "", necropsyDone: false, necropsyFindings: "", notes: "" });
          } catch (e: any) {
            Alert.alert("Error", e.message);
          } finally {
            setSaving(false);
          }
        },
      },
    ]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <View style={{ backgroundColor: "#374151", paddingTop: insets.top + 12, paddingBottom: 20, paddingHorizontal: 16, flexDirection: "row", alignItems: "flex-start" }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12, marginTop: 4 }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "white", fontSize: 20, fontWeight: "700" }}>Mortality Records</Text>
          <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 1 }}>{records.length} deaths recorded</Text>
          {totalLoss > 0 && (
            <View style={{ backgroundColor: "rgba(220,38,38,0.2)", borderRadius: 10, padding: 10, marginTop: 10, flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="trending-down" size={16} color="#fca5a5" />
              <Text style={{ color: "#fca5a5", fontSize: 13, fontWeight: "600" }}>Total estimated loss: ZMW {totalLoss.toFixed(2)}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={() => setShowModal(true)} style={{ backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
          <Ionicons name="add" size={18} color="white" />
          <Text style={{ color: "white", fontSize: 13, fontWeight: "600" }}>Record</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator size="large" color="#374151" /></View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#374151" />}>
          {records.length === 0 ? (
            <View style={{ alignItems: "center", paddingTop: 60 }}>
              <Ionicons name="checkmark-circle-outline" size={48} color="#d1d5db" />
              <Text style={{ color: "#9ca3af", marginTop: 12, fontSize: 15 }}>No mortality records</Text>
            </View>
          ) : (
            records.map((rec: any) => {
              const cause = CAUSES.find(c => c.value === rec.cause);
              return (
                <View key={rec.id} style={{ backgroundColor: "white", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#f3f4f6", borderLeftWidth: 3, borderLeftColor: cause?.color || "#6b7280", elevation: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#f9fafb", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                      <Ionicons name={cause?.icon as any || "help-circle"} size={22} color={cause?.color || "#6b7280"} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827" }}>{rec.animal?.name || rec.animal?.tag}</Text>
                      <Text style={{ fontSize: 12, color: "#6b7280" }}>{rec.animal?.breed} · {new Date(rec.deathDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}</Text>
                    </View>
                    {rec.estimatedValue && (
                      <Text style={{ fontSize: 13, fontWeight: "700", color: "#dc2626" }}>- ZMW {Number(rec.estimatedValue).toFixed(0)}</Text>
                    )}
                  </View>
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
                    <View style={{ backgroundColor: "#fef2f2", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                      <Text style={{ fontSize: 11, fontWeight: "600", color: cause?.color || "#6b7280" }}>{cause?.label}</Text>
                    </View>
                    {rec.causeDetails && <Text style={{ fontSize: 12, color: "#6b7280", flex: 1 }}>{rec.causeDetails}</Text>}
                  </View>
                  {rec.necropsyDone && (
                    <View style={{ marginTop: 8, backgroundColor: "#f9fafb", borderRadius: 8, padding: 8 }}>
                      <Text style={{ fontSize: 11, color: "#374151", fontWeight: "600" }}>Necropsy done</Text>
                      {rec.necropsyFindings && <Text style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{rec.necropsyFindings}</Text>}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
        <View style={{ flex: 1, backgroundColor: "white" }}>
          <View style={{ flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" }}>
            <TouchableOpacity onPress={() => setShowModal(false)} style={{ marginRight: 12 }}><Ionicons name="close" size={24} color="#6b7280" /></TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: "700", flex: 1 }}>Record Mortality</Text>
            <TouchableOpacity onPress={handleCreate} disabled={saving} style={{ backgroundColor: "#dc2626", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 }}>
              {saving ? <ActivityIndicator color="white" size="small" /> : <Text style={{ color: "white", fontWeight: "600" }}>Record</Text>}
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 8 }}>Select Goat *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {activeGoats.map((g: any) => (
                <TouchableOpacity key={g.id} onPress={() => setForm(f => ({ ...f, animalId: g.id }))}
                  style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, marginRight: 8, minWidth: 90, alignItems: "center", backgroundColor: form.animalId === g.id ? "#dc2626" : "#f3f4f6", borderWidth: 1, borderColor: form.animalId === g.id ? "#dc2626" : "#e5e7eb" }}>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: form.animalId === g.id ? "white" : "#111827" }}>{g.name || g.tag}</Text>
                  <Text style={{ fontSize: 11, color: form.animalId === g.id ? "rgba(255,255,255,0.8)" : "#9ca3af" }}>{g.breed}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Death Date *</Text>
            <TextInput style={{ backgroundColor: "#f9fafb", borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 12, padding: 14, fontSize: 15, color: "#111827", marginBottom: 16 }}
              placeholder="YYYY-MM-DD" value={form.deathDate} onChangeText={v => setForm(f => ({ ...f, deathDate: v }))} />

            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 8 }}>Cause of Death *</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {CAUSES.map(c => (
                <TouchableOpacity key={c.value} onPress={() => setForm(f => ({ ...f, cause: c.value }))}
                  style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: form.cause === c.value ? c.color : "#f3f4f6", borderWidth: 1, borderColor: form.cause === c.value ? c.color : "#e5e7eb" }}>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: form.cause === c.value ? "white" : "#6b7280" }}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Specific Details</Text>
            <TextInput style={{ backgroundColor: "#f9fafb", borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 12, padding: 14, fontSize: 15, color: "#111827", marginBottom: 16 }}
              placeholder="e.g. Foot and mouth disease, snake bite..." placeholderTextColor="#9ca3af" value={form.causeDetails} onChangeText={v => setForm(f => ({ ...f, causeDetails: v }))} />

            <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Symptoms Duration (days)</Text>
                <TextInput style={{ backgroundColor: "#f9fafb", borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 12, padding: 14, fontSize: 15, color: "#111827" }}
                  placeholder="0" placeholderTextColor="#9ca3af" keyboardType="number-pad" value={form.symptomsDuration} onChangeText={v => setForm(f => ({ ...f, symptomsDuration: v }))} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Estimated Value (ZMW)</Text>
                <TextInput style={{ backgroundColor: "#f9fafb", borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 12, padding: 14, fontSize: 15, color: "#111827" }}
                  placeholder="0.00" placeholderTextColor="#9ca3af" keyboardType="decimal-pad" value={form.estimatedValue} onChangeText={v => setForm(f => ({ ...f, estimatedValue: v }))} />
              </View>
            </View>

            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Treatments Given Before Death</Text>
            <TextInput style={{ backgroundColor: "#f9fafb", borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 12, padding: 14, fontSize: 15, color: "#111827", marginBottom: 16 }}
              placeholder="e.g. Penicillin, Ivermectin..." placeholderTextColor="#9ca3af" value={form.treatmentsGiven} onChangeText={v => setForm(f => ({ ...f, treatmentsGiven: v }))} />

            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: form.necropsyDone ? 12 : 16 }}>
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151" }}>Necropsy performed?</Text>
              <Switch value={form.necropsyDone} onValueChange={v => setForm(f => ({ ...f, necropsyDone: v }))} trackColor={{ true: "#374151" }} />
            </View>

            {form.necropsyDone && (
              <>
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Necropsy Findings</Text>
                <TextInput style={{ backgroundColor: "#f9fafb", borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 12, padding: 14, fontSize: 15, color: "#111827", minHeight: 70, textAlignVertical: "top", marginBottom: 16 }}
                  placeholder="Describe findings..." placeholderTextColor="#9ca3af" multiline value={form.necropsyFindings} onChangeText={v => setForm(f => ({ ...f, necropsyFindings: v }))} />
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
