import { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
  ActivityIndicator, Modal, TextInput, Alert,
} from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getSales, createSale, getGoats } from "../../lib/api";

const SALE_TYPES = [
  { value: "DIRECT", label: "Direct Sale" },
  { value: "MARKET", label: "Market" },
  { value: "ABATTOIR", label: "Abattoir" },
  { value: "BREEDING_STOCK", label: "Breeding Stock" },
  { value: "AUCTION", label: "Auction" },
];

export default function SalesScreen() {
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    animalId: "", saleDate: new Date().toISOString().split("T")[0],
    salePrice: "", saleType: "DIRECT",
    buyerName: "", buyerPhone: "", buyerLocation: "",
    weightAtSale: "", transportCost: "", marketFee: "",
    paymentMethod: "Cash", paymentStatus: "PAID", reason: "", notes: "",
  });

  const { data, isLoading, refetch, isRefetching } = useQuery({ queryKey: ["sales"], queryFn: () => getSales() });
  const { data: goatsData } = useQuery({ queryKey: ["active-goats"], queryFn: () => getGoats({ status: "ACTIVE" }), enabled: showModal });

  const records: any[] = data?.data || [];
  const totalRevenue: number = data?.totalRevenue || 0;
  const totalNet: number = data?.totalNet || 0;
  const activeGoats: any[] = goatsData?.data || [];

  async function handleCreate() {
    if (!form.animalId || !form.salePrice) { Alert.alert("Error", "Select a goat and enter sale price"); return; }
    setSaving(true);
    try {
      await createSale(form);
      qc.invalidateQueries({ queryKey: ["sales"] });
      qc.invalidateQueries({ queryKey: ["goats-dashboard"] });
      setShowModal(false);
      setForm({ animalId: "", saleDate: new Date().toISOString().split("T")[0], salePrice: "", saleType: "DIRECT", buyerName: "", buyerPhone: "", buyerLocation: "", weightAtSale: "", transportCost: "", marketFee: "", paymentMethod: "Cash", paymentStatus: "PAID", reason: "", notes: "" });
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  }

  const netPreview = form.salePrice ? (parseFloat(form.salePrice || "0") - parseFloat(form.transportCost || "0") - parseFloat(form.marketFee || "0")).toFixed(2) : null;

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <View style={{ backgroundColor: "#15803d", paddingTop: insets.top + 12, paddingBottom: 20, paddingHorizontal: 16, flexDirection: "row", alignItems: "flex-start" }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12, marginTop: 4 }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "white", fontSize: 20, fontWeight: "700" }}>Sales Records</Text>
          <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 1 }}>{records.length} sales · ZMW {totalRevenue.toFixed(2)} gross</Text>
          <View style={{ flexDirection: "row", gap: 16, marginTop: 12 }}>
            <View style={{ backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 12, padding: 12, flex: 1 }}>
              <Text style={{ color: "white", fontSize: 20, fontWeight: "800" }}>ZMW {totalRevenue.toFixed(0)}</Text>
              <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, marginTop: 2 }}>Gross Revenue</Text>
            </View>
            <View style={{ backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 12, padding: 12, flex: 1 }}>
              <Text style={{ color: "white", fontSize: 20, fontWeight: "800" }}>ZMW {totalNet.toFixed(0)}</Text>
              <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, marginTop: 2 }}>Net Revenue</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={() => setShowModal(true)} style={{ backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
          <Ionicons name="add" size={18} color="white" />
          <Text style={{ color: "white", fontSize: 13, fontWeight: "600" }}>Record Sale</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator size="large" color="#16a34a" /></View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#16a34a" colors={["#16a34a"]} />}>
          {records.length === 0 ? (
            <View style={{ alignItems: "center", paddingTop: 60 }}>
              <Ionicons name="cash-outline" size={48} color="#d1d5db" />
              <Text style={{ color: "#9ca3af", marginTop: 12, fontSize: 15 }}>No sales recorded yet</Text>
            </View>
          ) : (
            records.map((rec: any) => (
              <View key={rec.id} style={{ backgroundColor: "white", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#f3f4f6", elevation: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#f0fdf4", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                    <Ionicons name="cash" size={22} color="#16a34a" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827" }}>{rec.animal?.name || rec.animal?.tag}</Text>
                    <Text style={{ fontSize: 12, color: "#6b7280" }}>{rec.animal?.breed} · {new Date(rec.saleDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ fontSize: 16, fontWeight: "800", color: "#16a34a" }}>ZMW {Number(rec.salePrice).toFixed(2)}</Text>
                    {rec.netAmount && Number(rec.netAmount) !== Number(rec.salePrice) && (
                      <Text style={{ fontSize: 11, color: "#6b7280" }}>Net: ZMW {Number(rec.netAmount).toFixed(2)}</Text>
                    )}
                  </View>
                </View>
                <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
                  <View style={{ backgroundColor: "#f0fdf4", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                    <Text style={{ fontSize: 11, fontWeight: "600", color: "#16a34a" }}>{SALE_TYPES.find(t => t.value === rec.saleType)?.label}</Text>
                  </View>
                  {rec.buyerName && (
                    <View style={{ backgroundColor: "#f9fafb", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                      <Text style={{ fontSize: 11, color: "#6b7280" }}>{rec.buyerName}</Text>
                    </View>
                  )}
                  <View style={{ backgroundColor: rec.paymentStatus === "PAID" ? "#f0fdf4" : "#fff7ed", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                    <Text style={{ fontSize: 11, fontWeight: "600", color: rec.paymentStatus === "PAID" ? "#16a34a" : "#ea580c" }}>{rec.paymentStatus}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
        <View style={{ flex: 1, backgroundColor: "white" }}>
          <View style={{ flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" }}>
            <TouchableOpacity onPress={() => setShowModal(false)} style={{ marginRight: 12 }}><Ionicons name="close" size={24} color="#6b7280" /></TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: "700", flex: 1 }}>Record Sale</Text>
            <TouchableOpacity onPress={handleCreate} disabled={saving} style={{ backgroundColor: "#16a34a", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 }}>
              {saving ? <ActivityIndicator color="white" size="small" /> : <Text style={{ color: "white", fontWeight: "600" }}>Save</Text>}
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 8 }}>Select Goat *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {activeGoats.map((g: any) => (
                <TouchableOpacity key={g.id} onPress={() => setForm(f => ({ ...f, animalId: g.id }))}
                  style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, marginRight: 8, minWidth: 90, alignItems: "center", backgroundColor: form.animalId === g.id ? "#16a34a" : "#f3f4f6", borderWidth: 1, borderColor: form.animalId === g.id ? "#16a34a" : "#e5e7eb" }}>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: form.animalId === g.id ? "white" : "#111827" }}>{g.name || g.tag}</Text>
                  <Text style={{ fontSize: 11, color: form.animalId === g.id ? "rgba(255,255,255,0.8)" : "#9ca3af" }}>{g.breed}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 8 }}>Sale Type</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {SALE_TYPES.map(t => (
                <TouchableOpacity key={t.value} onPress={() => setForm(f => ({ ...f, saleType: t.value }))}
                  style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: form.saleType === t.value ? "#16a34a" : "#f3f4f6", borderWidth: 1, borderColor: form.saleType === t.value ? "#16a34a" : "#e5e7eb" }}>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: form.saleType === t.value ? "white" : "#6b7280" }}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Sale Price (ZMW) *</Text>
                <TextInput style={{ backgroundColor: "#f9fafb", borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 12, padding: 14, fontSize: 15, color: "#111827" }}
                  placeholder="0.00" placeholderTextColor="#9ca3af" keyboardType="decimal-pad" value={form.salePrice} onChangeText={v => setForm(f => ({ ...f, salePrice: v }))} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Weight at Sale (kg)</Text>
                <TextInput style={{ backgroundColor: "#f9fafb", borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 12, padding: 14, fontSize: 15, color: "#111827" }}
                  placeholder="0.0" placeholderTextColor="#9ca3af" keyboardType="decimal-pad" value={form.weightAtSale} onChangeText={v => setForm(f => ({ ...f, weightAtSale: v }))} />
              </View>
            </View>

            {["buyerName", "buyerPhone", "buyerLocation"].map((key, i) => (
              <View key={key} style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>{["Buyer Name", "Buyer Phone", "Buyer Location"][i]}</Text>
                <TextInput style={{ backgroundColor: "#f9fafb", borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 12, padding: 14, fontSize: 15, color: "#111827" }}
                  placeholder={["e.g. John Banda", "+260 97...", "e.g. Lusaka"][i]} placeholderTextColor="#9ca3af"
                  keyboardType={key === "buyerPhone" ? "phone-pad" : "default"}
                  value={(form as any)[key]} onChangeText={v => setForm(f => ({ ...f, [key]: v }))} />
              </View>
            ))}

            <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Transport Cost</Text>
                <TextInput style={{ backgroundColor: "#f9fafb", borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 12, padding: 14, fontSize: 15, color: "#111827" }}
                  placeholder="0.00" placeholderTextColor="#9ca3af" keyboardType="decimal-pad" value={form.transportCost} onChangeText={v => setForm(f => ({ ...f, transportCost: v }))} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Market Fee</Text>
                <TextInput style={{ backgroundColor: "#f9fafb", borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 12, padding: 14, fontSize: 15, color: "#111827" }}
                  placeholder="0.00" placeholderTextColor="#9ca3af" keyboardType="decimal-pad" value={form.marketFee} onChangeText={v => setForm(f => ({ ...f, marketFee: v }))} />
              </View>
            </View>

            {netPreview && (
              <View style={{ backgroundColor: "#f0fdf4", borderRadius: 12, padding: 14, marginBottom: 16, flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 14, color: "#15803d", fontWeight: "600" }}>Net Amount</Text>
                <Text style={{ fontSize: 16, color: "#15803d", fontWeight: "800" }}>ZMW {netPreview}</Text>
              </View>
            )}

            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Reason for Sale</Text>
            <TextInput style={{ backgroundColor: "#f9fafb", borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 12, padding: 14, fontSize: 15, color: "#111827", marginBottom: 16 }}
              placeholder="e.g. Cash need, overstock, culling..." placeholderTextColor="#9ca3af" value={form.reason} onChangeText={v => setForm(f => ({ ...f, reason: v }))} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
