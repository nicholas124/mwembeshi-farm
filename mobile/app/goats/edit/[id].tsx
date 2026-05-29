import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getGoat, updateGoat } from "../../../lib/api";

const BREEDS = [
  "Boer", "Kalahari Red", "Savanna", "Indigenous", "Boer Cross",
  "Kalahari Cross", "Anglo Nubian", "Saanen", "Toggenburg",
  "Alpine", "LaMancha", "Pygmy", "Other",
];

export default function EditGoatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    breed: "",
    color: "",
    weight: "",
    notes: "",
    status: "ACTIVE",
  });

  const { data: goat, isLoading } = useQuery({
    queryKey: ["goat", id],
    queryFn: () => getGoat(id!),
    enabled: !!id,
  });

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
        ...form,
        weight: form.weight ? parseFloat(form.weight) : undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["goat", id] });
      queryClient.invalidateQueries({ queryKey: ["goats"] });
      Alert.alert("Success", "Goat updated");
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white" keyboardShouldPersistTaps="handled">
      <View className="p-5">
        <Text className="text-sm font-medium text-gray-700 mb-1.5">Name</Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 mb-4 text-base bg-gray-50"
          value={form.name}
          onChangeText={(v) => update("name", v)}
        />

        <Text className="text-sm font-medium text-gray-700 mb-1.5">Breed</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {BREEDS.map((b) => (
            <TouchableOpacity
              key={b}
              onPress={() => update("breed", b)}
              className={`px-3 py-1.5 rounded-lg ${
                form.breed === b ? "bg-primary-600" : "bg-gray-100"
              }`}
            >
              <Text className={`text-xs font-medium ${
                form.breed === b ? "text-white" : "text-gray-600"
              }`}>{b}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="flex-row gap-3 mb-4">
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-1.5">Color</Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-gray-50"
              value={form.color}
              onChangeText={(v) => update("color", v)}
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-1.5">Weight (kg)</Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-gray-50"
              value={form.weight}
              onChangeText={(v) => update("weight", v)}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <Text className="text-sm font-medium text-gray-700 mb-2">Status</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {["ACTIVE", "SOLD", "DECEASED", "TRANSFERRED"].map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => update("status", s)}
              className={`px-4 py-2 rounded-xl ${
                form.status === s ? "bg-primary-600" : "bg-gray-100"
              }`}
            >
              <Text className={`text-sm font-medium ${
                form.status === s ? "text-white" : "text-gray-600"
              }`}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="text-sm font-medium text-gray-700 mb-1.5">Notes</Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 mb-6 text-base bg-gray-50"
          value={form.notes}
          onChangeText={(v) => update("notes", v)}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className="bg-primary-600 rounded-xl py-4 items-center mb-10"
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
