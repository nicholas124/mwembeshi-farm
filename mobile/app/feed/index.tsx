import { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
  ActivityIndicator, Modal, TextInput, Alert,
} from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getFeedRecords, createFeedRecord, getPens } from "../../lib/api";

const FEED_TIMES = ["MORNING", "MIDDAY", "EVENING"] as const;
const COMMON_FEEDS = ["Maize bran", "Grass hay", "Lucerne", "Concentrates", "Maize grain", "Wheat bran", "Sorghum", "Grazing", "Mineral lick", "Other"];

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    feedType: "", quantity: "", unit: "kg", costPerUnit: "",
    timeOfDay: "MORNING" as typeof FEED_TIMES[number],
    penId: "", date: new Date().toISOString().split("T")[0], notes: "",
  });

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["feed", "7"],
    queryFn: () => getFeedRecords({ days: "7" }),
  });

  const { data: pensData } = useQuery({ queryKey: ["pens"], queryFn: getPens, enabled: showModal });

  const records: any[] = data?.data || [];
  const totalCost: number = data?.totalCost || 0;
  const pens: any[] = pensData?.data || [];

  // Group by date
  const byDate: Record<string, any[]> = {};
  records.forEach(r => {
    const d = new Date(r.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(r);
  });

  async function handleCreate() {
    if (!form.feedType || !form.quantity) { Alert.alert("Error", "Feed type and quantity are required"); return; }
    if (!form.penId) { Alert.alert("Error", "Select a pen"); return; }
    setSaving(true);
    try {
      await createFeedRecord(form);
      qc.invalidateQueries({ queryKey: ["feed"] });
      setShowModal(false);
      setForm({ feedType: "", quantity: "", unit: "kg", costPerUnit: "", timeOfDay: "MORNING", penId: "", date: new Date().toISOString().split("T")[0], notes: "" });
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
          <Text style={{ color: "white", fontSize: 20, fontWeight: "700" }}>Feed Records</Text>
          <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 1 }}>
            Last 7 days · ZMW {totalCost.toFixed(2)} total cost
          </Text>
        </View>
        <TouchableOpacity onPress={() => setShowModal(true)} style={{ backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Ionicons name="add" size={18} color="white" />
          <Text style={{ color: "white", fontSize: 13, fontWeight: "600" }}>Log Feed</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator size="large" color="#16a34a" /></View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#16a34a" colors={["#16a34a"]} />}
        >
          {Object.keys(byDate).length === 0 ? (
            <View style={{ alignItems: "center", paddingTop: 60 }}>
              <Ionicons name="nutrition-outline" size={48} color="#d1d5db" />
              <Text style={{ color: "#9ca3af", marginTop: 12, fontSize: 15 }}>No feed records this week</Text>
              <TouchableOpacity onPress={() => setShowModal(true)} style={{ marginTop: 16, backgroundColor: "#16a34a", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 }}>
                <Text style={{ color: "white", fontWeight: "600" }}>Log First Feed</Text>
              </TouchableOpacity>
            </View>
          ) : (
            Object.entries(byDate).map(([date, items]) => (
              <View key={date} style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#6b7280", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>{date}</Text>
                {items.map((item: any) => (
                  <View key={item.id} style={{ backgroundColor: "white", borderRadius: 14, padding: 14, marginBottom: 8, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#f3f4f6", elevation: 1 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "#f0fdf4", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                      <Ionicons name="nutrition" size={20} color="#16a34a" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827" }}>{item.feedType}</Text>
                      <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                        {item.pen?.name || item.animal?.name || "Unknown"} · {item.quantity} {item.unit} · {item.timeOfDay.toLowerCase()}
                      </Text>
                    </View>
                    {item.totalCost && (
                      <Text style={{ fontSize: 13, fontWeight: "700", color: "#16a34a" }}>ZMW {Number(item.totalCost).toFixed(2)}</Text>
                    )}
                  </View>
                ))}
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Log Feed Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
        <View style={{ flex: 1, backgroundColor: "white" }}>
          <View style={{ flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" }}>
            <TouchableOpacity onPress={() => setShowModal(false)} style={{ marginRight: 12 }}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: "700", flex: 1 }}>Log Feeding</Text>
            <TouchableOpacity onPress={handleCreate} disabled={saving} style={{ backgroundColor: "#16a34a", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 }}>
              {saving ? <ActivityIndicator color="white" size="small" /> : <Text style={{ color: "white", fontWeight: "600" }}>Save</Text>}
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 8 }}>Feed Type *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
              {COMMON_FEEDS.map(f => (
                <TouchableOpacity key={f} onPress={() => setForm(x => ({ ...x, feedType: f }))}
                  style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: form.feedType === f ? "#16a34a" : "#f3f4f6", borderWidth: 1, borderColor: form.feedType === f ? "#16a34a" : "#e5e7eb" }}>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: form.feedType === f ? "white" : "#6b7280" }}>{f}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TextInput style={{ backgroundColor: "#f9fafb", borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 12, padding: 14, fontSize: 15, color: "#111827", marginBottom: 16 }}
              placeholder="Or type feed name..." placeholderTextColor="#9ca3af" value={form.feedType} onChangeText={v => setForm(f => ({ ...f, feedType: v }))} />

            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 8 }}>Time of Day</Text>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
              {FEED_TIMES.map(t => (
                <TouchableOpacity key={t} onPress={() => setForm(f => ({ ...f, timeOfDay: t }))}
                  style={{ flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: "center", backgroundColor: form.timeOfDay === t ? "#16a34a" : "#f3f4f6", borderWidth: 1, borderColor: form.timeOfDay === t ? "#16a34a" : "#e5e7eb" }}>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: form.timeOfDay === t ? "white" : "#6b7280" }}>{t.charAt(0) + t.slice(1).toLowerCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 8 }}>Pen *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {pens.map((p: any) => (
                <TouchableOpacity key={p.id} onPress={() => setForm(f => ({ ...f, penId: p.id }))}
                  style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: form.penId === p.id ? "#16a34a" : "#f3f4f6", borderWidth: 1, borderColor: form.penId === p.id ? "#16a34a" : "#e5e7eb" }}>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: form.penId === p.id ? "white" : "#6b7280" }}>{p.name} ({p.currentCount})</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
              <View style={{ flex: 2 }}>
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Quantity *</Text>
                <TextInput style={{ backgroundColor: "#f9fafb", borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 12, padding: 14, fontSize: 15, color: "#111827" }}
                  placeholder="0.0" placeholderTextColor="#9ca3af" keyboardType="decimal-pad" value={form.quantity} onChangeText={v => setForm(f => ({ ...f, quantity: v }))} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Unit</Text>
                <TextInput style={{ backgroundColor: "#f9fafb", borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 12, padding: 14, fontSize: 15, color: "#111827" }}
                  placeholder="kg" placeholderTextColor="#9ca3af" value={form.unit} onChangeText={v => setForm(f => ({ ...f, unit: v }))} />
              </View>
            </View>

            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Cost per unit (ZMW, optional)</Text>
            <TextInput style={{ backgroundColor: "#f9fafb", borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 12, padding: 14, fontSize: 15, color: "#111827", marginBottom: 16 }}
              placeholder="0.00" placeholderTextColor="#9ca3af" keyboardType="decimal-pad" value={form.costPerUnit} onChangeText={v => setForm(f => ({ ...f, costPerUnit: v }))} />

            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Notes (optional)</Text>
            <TextInput style={{ backgroundColor: "#f9fafb", borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 12, padding: 14, fontSize: 15, color: "#111827", minHeight: 70, textAlignVertical: "top" }}
              placeholder="Any notes..." placeholderTextColor="#9ca3af" multiline value={form.notes} onChangeText={v => setForm(f => ({ ...f, notes: v }))} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
