import { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TextInput,
  TouchableOpacity, Alert, ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getGoat, updateGoat } from "../../../lib/api";

const BREEDS = [
  "Boer", "Kalahari Red", "Savanna", "Indigenous", "Boer Cross",
  "Kalahari Cross", "Anglo Nubian", "Saanen", "Toggenburg",
  "Alpine", "Pygmy", "Other",
];

const STATUSES = [
  { value: "ACTIVE", color: "#16a34a" },
  { value: "SOLD", color: "#0ea5e9" },
  { value: "DECEASED", color: "#6b7280" },
  { value: "TRANSFERRED", color: "#8b5cf6" },
];

export default function EditGoatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", breed: "", color: "", weight: "", notes: "", status: "ACTIVE",
  });

  const { data: goatResponse, isLoading } = useQuery({
    queryKey: ["goat", id],
    queryFn: () => getGoat(id!),
    enabled: !!id,
  });

  const goat = goatResponse?.data;

  useEffect(() => {
    if (goat) {
      setForm({
        name: goat.name || "",
        breed: goat.breed || "",
        color: goat.color || "",
        weight: goat.weight?.toString() || "",
        notes: goat.notes || "",
        status: goat.status || "ACTIVE",
      });
    }
  }, [goat]);

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      await updateGoat(id!, {
        ...goat,
        ...form,
        weight: form.weight ? parseFloat(form.weight) : undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["goat", id] });
      queryClient.invalidateQueries({ queryKey: ["goats-dashboard"] });
      Alert.alert("Saved", "Goat updated successfully");
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "white" }}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* Header */}
      <View style={{
        backgroundColor: "#15803d",
        paddingTop: insets.top + 12,
        paddingBottom: 16,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginRight: 12 }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "white", fontSize: 20, fontWeight: "700" }}>Edit Goat</Text>
          <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 1 }}>
            {goat?.name || goat?.tag || "Loading..."}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={{ backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 }}
        >
          {loading
            ? <ActivityIndicator color="white" size="small" />
            : <Text style={{ color: "white", fontSize: 14, fontWeight: "700" }}>Save</Text>
          }
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Name */}
        <Text style={label}>Name</Text>
        <TextInput
          style={[input, { marginBottom: 20 }]}
          placeholder="e.g. Bella"
          placeholderTextColor="#9ca3af"
          value={form.name}
          onChangeText={(v) => update("name", v)}
        />

        {/* Breed */}
        <Text style={label}>Breed</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {BREEDS.map((b) => (
            <TouchableOpacity
              key={b}
              onPress={() => update("breed", b)}
              style={{
                paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                backgroundColor: form.breed === b ? "#16a34a" : "#f3f4f6",
                borderWidth: 1, borderColor: form.breed === b ? "#16a34a" : "#e5e7eb",
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: "600", color: form.breed === b ? "white" : "#6b7280" }}>{b}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Color + Weight */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
          <View style={{ flex: 1 }}>
            <Text style={label}>Color/Markings</Text>
            <TextInput
              style={input}
              placeholder="e.g. Brown"
              placeholderTextColor="#9ca3af"
              value={form.color}
              onChangeText={(v) => update("color", v)}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={label}>Weight (kg)</Text>
            <TextInput
              style={input}
              placeholder="e.g. 45"
              placeholderTextColor="#9ca3af"
              value={form.weight}
              onChangeText={(v) => update("weight", v)}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Status */}
        <Text style={label}>Status</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {STATUSES.map((s) => (
            <TouchableOpacity
              key={s.value}
              onPress={() => update("status", s.value)}
              style={{
                paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20,
                backgroundColor: form.status === s.value ? s.color : "#f3f4f6",
                borderWidth: 1, borderColor: form.status === s.value ? s.color : "#e5e7eb",
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: "600", color: form.status === s.value ? "white" : "#6b7280" }}>
                {s.value}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notes */}
        <Text style={label}>Notes</Text>
        <TextInput
          style={[input, { minHeight: 80, textAlignVertical: "top", marginBottom: 24 }]}
          placeholder="Any additional notes..."
          placeholderTextColor="#9ca3af"
          value={form.notes}
          onChangeText={(v) => update("notes", v)}
          multiline
        />

        {/* Save button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
          style={{ backgroundColor: "#16a34a", borderRadius: 14, paddingVertical: 16, alignItems: "center" }}
        >
          {loading
            ? <ActivityIndicator color="white" />
            : <Text style={{ color: "white", fontSize: 16, fontWeight: "700" }}>Save Changes</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const label = {
  fontSize: 13,
  fontWeight: "600" as const,
  color: "#374151",
  marginBottom: 7,
};

const input = {
  backgroundColor: "#f9fafb",
  borderWidth: 1.5,
  borderColor: "#e5e7eb",
  borderRadius: 12,
  padding: 14,
  fontSize: 15,
  color: "#111827",
};
