import { useState } from "react";
import {
  View, Text, ScrollView, TextInput,
  TouchableOpacity, Alert, ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createGoat } from "../../lib/api";

const BREEDS = [
  "Boer", "Kalahari Red", "Savanna", "Indigenous",
  "Boer Cross", "Kalahari Cross", "Anglo Nubian",
  "Saanen", "Toggenburg", "Alpine", "Pygmy", "Other",
];

const ACQUISITION_METHODS = [
  { value: "BORN", label: "Born on Farm" },
  { value: "PURCHASED", label: "Purchased" },
  { value: "DONATED", label: "Donated" },
  { value: "TRADED", label: "Traded" },
] as const;

export default function NewGoatScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [showBreeds, setShowBreeds] = useState(false);
  const [form, setForm] = useState({
    tag: "",
    name: "",
    breed: "",
    gender: "FEMALE" as "MALE" | "FEMALE",
    dateOfBirth: "",
    color: "",
    weight: "",
    acquisitionMethod: "BORN" as typeof ACQUISITION_METHODS[number]["value"],
    purchasePrice: "",
    notes: "",
  });

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function generateTag() {
    const prefix = form.gender === "MALE" ? "B" : "D";
    const num = Math.floor(Math.random() * 900 + 100);
    update("tag", `${prefix}${num}`);
  }

  async function handleSubmit() {
    if (!form.tag.trim()) {
      Alert.alert("Error", "Tag number is required");
      return;
    }
    setLoading(true);
    try {
      await createGoat({
        ...form,
        weight: form.weight ? parseFloat(form.weight) : undefined,
        purchasePrice: form.purchasePrice ? parseFloat(form.purchasePrice) : undefined,
        dateOfBirth: form.dateOfBirth || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["goats"] });
      queryClient.invalidateQueries({ queryKey: ["goats-dashboard"] });
      Alert.alert("Success", "Goat registered successfully", [
        { text: "Add Another", onPress: () => setForm({ tag: "", name: "", breed: "", gender: "FEMALE", dateOfBirth: "", color: "", weight: "", acquisitionMethod: "BORN", purchasePrice: "", notes: "" }) },
        { text: "Done", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
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
          <Text style={{ color: "white", fontSize: 20, fontWeight: "700" }}>Register Goat</Text>
          <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 1 }}>Add a new goat to the herd</Text>
        </View>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={{
            backgroundColor: "rgba(255,255,255,0.2)",
            borderRadius: 10,
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
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
        {/* Gender — first so tag prefix can adapt */}
        <Text style={label}>Gender</Text>
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
          <TouchableOpacity
            onPress={() => update("gender", "MALE")}
            style={[genderBtn, form.gender === "MALE" && { backgroundColor: "#eff6ff", borderColor: "#3b82f6" }]}
            activeOpacity={0.8}
          >
            <Ionicons name="male" size={22} color={form.gender === "MALE" ? "#3b82f6" : "#9ca3af"} />
            <Text style={[genderLabel, form.gender === "MALE" && { color: "#3b82f6" }]}>Buck (Male)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => update("gender", "FEMALE")}
            style={[genderBtn, form.gender === "FEMALE" && { backgroundColor: "#fdf2f8", borderColor: "#ec4899" }]}
            activeOpacity={0.8}
          >
            <Ionicons name="female" size={22} color={form.gender === "FEMALE" ? "#ec4899" : "#9ca3af"} />
            <Text style={[genderLabel, form.gender === "FEMALE" && { color: "#ec4899" }]}>Doe (Female)</Text>
          </TouchableOpacity>
        </View>

        {/* Tag */}
        <Text style={label}>Tag Number *</Text>
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
          <TextInput
            style={[input, { flex: 1 }]}
            placeholder="e.g. B001"
            placeholderTextColor="#9ca3af"
            value={form.tag}
            onChangeText={(v) => update("tag", v)}
            autoCapitalize="characters"
          />
          <TouchableOpacity
            onPress={generateTag}
            style={{
              backgroundColor: "#f0fdf4", borderRadius: 12, paddingHorizontal: 14,
              alignItems: "center", justifyContent: "center",
              borderWidth: 1.5, borderColor: "#bbf7d0",
            }}
          >
            <Ionicons name="dice-outline" size={22} color="#16a34a" />
          </TouchableOpacity>
        </View>

        {/* Name */}
        <Text style={label}>Name (optional)</Text>
        <TextInput
          style={[input, { marginBottom: 20 }]}
          placeholder="e.g. Bella"
          placeholderTextColor="#9ca3af"
          value={form.name}
          onChangeText={(v) => update("name", v)}
        />

        {/* Breed */}
        <Text style={label}>Breed</Text>
        <TouchableOpacity
          onPress={() => setShowBreeds(!showBreeds)}
          style={[input, { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: showBreeds ? 0 : 20 }]}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 15, color: form.breed ? "#111827" : "#9ca3af" }}>
            {form.breed || "Select breed"}
          </Text>
          <Ionicons name={showBreeds ? "chevron-up" : "chevron-down"} size={18} color="#9ca3af" />
        </TouchableOpacity>
        {showBreeds && (
          <View style={{ backgroundColor: "white", borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 12, marginBottom: 20, overflow: "hidden" }}>
            {BREEDS.map((b, i) => (
              <TouchableOpacity
                key={b}
                onPress={() => { update("breed", b); setShowBreeds(false); }}
                style={{
                  paddingHorizontal: 16, paddingVertical: 13,
                  backgroundColor: form.breed === b ? "#f0fdf4" : "white",
                  borderBottomWidth: i < BREEDS.length - 1 ? 1 : 0,
                  borderBottomColor: "#f3f4f6",
                }}
              >
                <Text style={{ fontSize: 15, color: form.breed === b ? "#16a34a" : "#374151", fontWeight: form.breed === b ? "600" : "400" }}>
                  {b}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* DOB */}
        <Text style={label}>Date of Birth</Text>
        <TextInput
          style={[input, { marginBottom: 20 }]}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#9ca3af"
          value={form.dateOfBirth}
          onChangeText={(v) => update("dateOfBirth", v)}
          keyboardType="numbers-and-punctuation"
        />

        {/* Color + Weight */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
          <View style={{ flex: 1 }}>
            <Text style={label}>Color/Markings</Text>
            <TextInput
              style={input}
              placeholder="e.g. Brown & White"
              placeholderTextColor="#9ca3af"
              value={form.color}
              onChangeText={(v) => update("color", v)}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={label}>Weight (kg)</Text>
            <TextInput
              style={input}
              placeholder="e.g. 35"
              placeholderTextColor="#9ca3af"
              value={form.weight}
              onChangeText={(v) => update("weight", v)}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Acquisition */}
        <Text style={label}>How Acquired</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {ACQUISITION_METHODS.map((m) => (
            <TouchableOpacity
              key={m.value}
              onPress={() => update("acquisitionMethod", m.value)}
              style={{
                paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20,
                backgroundColor: form.acquisitionMethod === m.value ? "#16a34a" : "#f3f4f6",
                borderWidth: 1, borderColor: form.acquisitionMethod === m.value ? "#16a34a" : "#e5e7eb",
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: "600", color: form.acquisitionMethod === m.value ? "white" : "#6b7280" }}>
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {form.acquisitionMethod === "PURCHASED" && (
          <>
            <Text style={label}>Purchase Price (ZMW)</Text>
            <TextInput
              style={[input, { marginBottom: 20 }]}
              placeholder="e.g. 1500"
              placeholderTextColor="#9ca3af"
              value={form.purchasePrice}
              onChangeText={(v) => update("purchasePrice", v)}
              keyboardType="decimal-pad"
            />
          </>
        )}

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

        {/* Submit button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
          style={{
            backgroundColor: "#16a34a", borderRadius: 14,
            paddingVertical: 16, alignItems: "center",
          }}
        >
          {loading
            ? <ActivityIndicator color="white" />
            : <Text style={{ color: "white", fontSize: 16, fontWeight: "700" }}>Register Goat</Text>
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

const genderBtn = {
  flex: 1, paddingVertical: 14, borderRadius: 14,
  alignItems: "center" as const, justifyContent: "center" as const,
  borderWidth: 2, borderColor: "#e5e7eb",
  backgroundColor: "#f9fafb", gap: 6,
};

const genderLabel = {
  fontSize: 13, fontWeight: "600" as const, color: "#9ca3af",
};
