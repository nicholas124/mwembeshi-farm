import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { createGoat } from "../../lib/api";

const BREEDS = [
  "Boer",
  "Kalahari Red",
  "Savanna",
  "Indigenous",
  "Boer Cross",
  "Kalahari Cross",
  "Anglo Nubian",
  "Saanen",
  "Toggenburg",
  "Alpine",
  "LaMancha",
  "Pygmy",
  "Other",
];

const ACQUISITION_METHODS = ["BORN", "PURCHASED", "DONATED", "TRADED"] as const;

export default function NewGoatScreen() {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    tag: "",
    name: "",
    breed: "",
    gender: "FEMALE" as "MALE" | "FEMALE",
    dateOfBirth: "",
    color: "",
    weight: "",
    acquisitionMethod: "BORN" as (typeof ACQUISITION_METHODS)[number],
    purchasePrice: "",
    notes: "",
  });
  const [showBreeds, setShowBreeds] = useState(false);

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
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
      Alert.alert("Success", "Goat registered successfully");
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  }

  function generateTag() {
    const prefix = form.gender === "MALE" ? "B" : "D";
    const num = Math.floor(Math.random() * 900 + 100);
    update("tag", `${prefix}${num}`);
  }

  return (
    <ScrollView className="flex-1 bg-white" keyboardShouldPersistTaps="handled">
      <View className="p-5">
        {/* Tag */}
        <Text className="text-sm font-medium text-gray-700 mb-1.5">Tag Number *</Text>
        <View className="flex-row gap-2 mb-4">
          <TextInput
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-base bg-gray-50"
            placeholder="e.g. B001"
            value={form.tag}
            onChangeText={(v) => update("tag", v)}
          />
          <TouchableOpacity
            onPress={generateTag}
            className="bg-primary-50 px-4 rounded-xl items-center justify-center"
          >
            <Ionicons name="dice-outline" size={22} color="#16a34a" />
          </TouchableOpacity>
        </View>

        {/* Name */}
        <Text className="text-sm font-medium text-gray-700 mb-1.5">Name</Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 mb-4 text-base bg-gray-50"
          placeholder="e.g. Bella"
          value={form.name}
          onChangeText={(v) => update("name", v)}
        />

        {/* Gender Toggle */}
        <Text className="text-sm font-medium text-gray-700 mb-1.5">Gender</Text>
        <View className="flex-row gap-3 mb-4">
          <TouchableOpacity
            onPress={() => update("gender", "MALE")}
            className={`flex-1 py-3 rounded-xl items-center border ${
              form.gender === "MALE" ? "bg-blue-50 border-blue-500" : "border-gray-200"
            }`}
          >
            <Ionicons name="male" size={20} color={form.gender === "MALE" ? "#3b82f6" : "#9ca3af"} />
            <Text className={`text-sm mt-1 font-medium ${
              form.gender === "MALE" ? "text-blue-600" : "text-gray-400"
            }`}>Buck (Male)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => update("gender", "FEMALE")}
            className={`flex-1 py-3 rounded-xl items-center border ${
              form.gender === "FEMALE" ? "bg-pink-50 border-pink-500" : "border-gray-200"
            }`}
          >
            <Ionicons name="female" size={20} color={form.gender === "FEMALE" ? "#ec4899" : "#9ca3af"} />
            <Text className={`text-sm mt-1 font-medium ${
              form.gender === "FEMALE" ? "text-pink-600" : "text-gray-400"
            }`}>Doe (Female)</Text>
          </TouchableOpacity>
        </View>

        {/* Breed */}
        <Text className="text-sm font-medium text-gray-700 mb-1.5">Breed</Text>
        <TouchableOpacity
          onPress={() => setShowBreeds(!showBreeds)}
          className="border border-gray-300 rounded-xl px-4 py-3 mb-1 bg-gray-50 flex-row items-center justify-between"
        >
          <Text className={form.breed ? "text-base text-gray-900" : "text-base text-gray-400"}>
            {form.breed || "Select breed"}
          </Text>
          <Ionicons name={showBreeds ? "chevron-up" : "chevron-down"} size={18} color="#9ca3af" />
        </TouchableOpacity>
        {showBreeds && (
          <View className="border border-gray-200 rounded-xl mb-4 overflow-hidden">
            {BREEDS.map((b) => (
              <TouchableOpacity
                key={b}
                onPress={() => { update("breed", b); setShowBreeds(false); }}
                className={`px-4 py-3 border-b border-gray-100 ${
                  form.breed === b ? "bg-primary-50" : ""
                }`}
              >
                <Text className={`text-base ${form.breed === b ? "text-primary-600 font-medium" : "text-gray-700"}`}>
                  {b}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {!showBreeds && <View className="mb-3" />}

        {/* DOB */}
        <Text className="text-sm font-medium text-gray-700 mb-1.5">Date of Birth</Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 mb-4 text-base bg-gray-50"
          placeholder="YYYY-MM-DD"
          value={form.dateOfBirth}
          onChangeText={(v) => update("dateOfBirth", v)}
        />

        {/* Color & Weight */}
        <View className="flex-row gap-3 mb-4">
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-1.5">Color/Markings</Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-gray-50"
              placeholder="e.g. Brown"
              value={form.color}
              onChangeText={(v) => update("color", v)}
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-1.5">Weight (kg)</Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-gray-50"
              placeholder="e.g. 35"
              value={form.weight}
              onChangeText={(v) => update("weight", v)}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Acquisition */}
        <Text className="text-sm font-medium text-gray-700 mb-2">How Acquired</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {ACQUISITION_METHODS.map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => update("acquisitionMethod", m)}
              className={`px-4 py-2 rounded-xl ${
                form.acquisitionMethod === m ? "bg-primary-600" : "bg-gray-100"
              }`}
            >
              <Text className={`text-sm font-medium ${
                form.acquisitionMethod === m ? "text-white" : "text-gray-600"
              }`}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {form.acquisitionMethod === "PURCHASED" && (
          <>
            <Text className="text-sm font-medium text-gray-700 mb-1.5">Purchase Price (K)</Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 mb-4 text-base bg-gray-50"
              placeholder="e.g. 1500"
              value={form.purchasePrice}
              onChangeText={(v) => update("purchasePrice", v)}
              keyboardType="decimal-pad"
            />
          </>
        )}

        {/* Notes */}
        <Text className="text-sm font-medium text-gray-700 mb-1.5">Notes</Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 mb-6 text-base bg-gray-50"
          placeholder="Additional notes..."
          value={form.notes}
          onChangeText={(v) => update("notes", v)}
          multiline
          numberOfLines={3}
        />

        {/* Submit */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className="bg-primary-600 rounded-xl py-4 items-center mb-10"
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">Register Goat</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
