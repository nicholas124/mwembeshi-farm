import { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
  ActivityIndicator, Modal, TextInput, Alert,
} from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getCropTypes, createCropType, updateCropType, deleteCropType } from "../../lib/api";

const CATEGORIES = ["VEGETABLE", "GRAIN", "FRUIT", "LEGUME", "TUBER", "OTHER"];

const emptyForm = { name: "", localName: "", category: "VEGETABLE", growingDays: "", description: "" };

export default function CropTypesScreen() {
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["crop-types"],
    queryFn: getCropTypes,
  });

  const cropTypes: any[] = data?.data || [];

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(c: any) {
    setEditing(c);
    setForm({
      name: c.name,
      localName: c.localName || "",
      category: c.category,
      growingDays: c.growingDays ? String(c.growingDays) : "",
      description: c.description || "",
    });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name.trim()) { Alert.alert("Error", "Name is required"); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        localName: form.localName || null,
        category: form.category,
        growingDays: form.growingDays ? parseInt(form.growingDays, 10) : null,
        description: form.description || null,
      };
      if (editing) {
        await updateCropType(editing.id, { ...payload, isActive: editing.isActive });
      } else {
        await createCropType(payload);
      }
      qc.invalidateQueries({ queryKey: ["crop-types"] });
      setShowModal(false);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (!editing) return;
    Alert.alert("Delete Crop Type", `Remove "${editing.name}"? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setSaving(true);
          try {
            await deleteCropType(editing.id);
            qc.invalidateQueries({ queryKey: ["crop-types"] });
            setShowModal(false);
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
      {/* Header */}
      <View style={{ backgroundColor: "#15803d", paddingTop: insets.top + 12, paddingBottom: 16, paddingHorizontal: 16, flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "white", fontSize: 20, fontWeight: "700" }}>Crop Types</Text>
          <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 1 }}>{cropTypes.length} crop type{cropTypes.length === 1 ? "" : "s"}</Text>
        </View>
        <TouchableOpacity onPress={openCreate} style={{ backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 4 }}>
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
          {cropTypes.length === 0 ? (
            <View style={{ alignItems: "center", paddingTop: 60 }}>
              <Ionicons name="leaf-outline" size={48} color="#d1d5db" />
              <Text style={{ color: "#9ca3af", marginTop: 12, fontSize: 15 }}>No crop types yet</Text>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {cropTypes.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => openEdit(c)}
                  activeOpacity={0.75}
                  style={{ backgroundColor: "white", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#f3f4f6", flexDirection: "row", alignItems: "center" }}
                >
                  <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "#f0fdf4", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                    <Ionicons name="leaf" size={20} color="#16a34a" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827" }}>{c.name}</Text>
                    <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                      {c.category}{c.localName ? ` · ${c.localName}` : ""}{c.growingDays ? ` · ${c.growingDays} days` : ""}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* Create / Edit Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
        <View style={{ flex: 1, backgroundColor: "white" }}>
          <View style={{ flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" }}>
            <TouchableOpacity onPress={() => setShowModal(false)} style={{ marginRight: 12 }}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#111827", flex: 1 }}>{editing ? "Edit Crop Type" : "New Crop Type"}</Text>
            <TouchableOpacity onPress={handleSave} disabled={saving} style={{ backgroundColor: "#16a34a", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 }}>
              {saving ? <ActivityIndicator color="white" size="small" /> : <Text style={{ color: "white", fontWeight: "600" }}>{editing ? "Save" : "Create"}</Text>}
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Name *</Text>
            <TextInput
              style={inputStyle}
              placeholder="e.g. Maize"
              placeholderTextColor="#9ca3af"
              value={form.name}
              onChangeText={v => setForm(f => ({ ...f, name: v }))}
            />
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Local Name</Text>
            <TextInput
              style={inputStyle}
              placeholder="e.g. Mbuto"
              placeholderTextColor="#9ca3af"
              value={form.localName}
              onChangeText={v => setForm(f => ({ ...f, localName: v }))}
            />
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 8 }}>Category *</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity key={cat} onPress={() => setForm(f => ({ ...f, category: cat }))}
                  style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: form.category === cat ? "#16a34a" : "#f3f4f6", borderWidth: 1, borderColor: form.category === cat ? "#16a34a" : "#e5e7eb" }}>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: form.category === cat ? "white" : "#6b7280" }}>{cat.charAt(0) + cat.slice(1).toLowerCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Growing Days</Text>
            <TextInput
              style={inputStyle}
              placeholder="Average days to harvest"
              placeholderTextColor="#9ca3af"
              keyboardType="number-pad"
              value={form.growingDays}
              onChangeText={v => setForm(f => ({ ...f, growingDays: v }))}
            />
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Description</Text>
            <TextInput
              style={[inputStyle, { minHeight: 80, textAlignVertical: "top" }]}
              placeholder="Any additional notes..."
              placeholderTextColor="#9ca3af"
              multiline
              value={form.description}
              onChangeText={v => setForm(f => ({ ...f, description: v }))}
            />
            {editing && (
              <TouchableOpacity
                onPress={handleDelete}
                disabled={saving}
                style={{ marginTop: 8, borderWidth: 1.5, borderColor: "#fee2e2", borderRadius: 12, padding: 14, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}
              >
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
                <Text style={{ color: "#ef4444", fontWeight: "700", fontSize: 14 }}>Delete Crop Type</Text>
              </TouchableOpacity>
            )}
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
