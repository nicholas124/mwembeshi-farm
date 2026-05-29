import { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
  ActivityIndicator, Modal, Alert, FlatList,
} from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getPen, getGoats, assignGoatsToPen, removeGoatsFromPen } from "../../lib/api";

function getAge(dob: string) {
  if (!dob) return "";
  const months = Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 30.44));
  if (months < 12) return `${months}mo`;
  const y = Math.floor(months / 12); const m = months % 12;
  return m > 0 ? `${y}y ${m}m` : `${y}y`;
}

export default function PenDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const [showAssign, setShowAssign] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const { data: penData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["pen", id],
    queryFn: () => getPen(id!),
    enabled: !!id,
  });

  const { data: allGoatsData } = useQuery({
    queryKey: ["goats-for-assign"],
    queryFn: () => getGoats({ status: "ACTIVE" }),
    enabled: showAssign,
  });

  const pen = penData?.data;
  const currentAnimals = pen?.assignments?.filter((a: any) => !a.removedAt).map((a: any) => a.animal) || [];
  const currentIds = new Set(currentAnimals.map((a: any) => a.id));
  const availableGoats = (allGoatsData?.data || []).filter((g: any) => !currentIds.has(g.id) && g.status === "ACTIVE");

  async function handleAssign() {
    if (!selected.length) return;
    setSaving(true);
    try {
      await assignGoatsToPen(id!, selected);
      qc.invalidateQueries({ queryKey: ["pen", id] });
      setShowAssign(false);
      setSelected([]);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(animalId: string, name: string) {
    Alert.alert("Remove Goat", `Remove ${name} from this pen?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove", style: "destructive",
        onPress: async () => {
          try {
            await removeGoatsFromPen(id!, [animalId]);
            qc.invalidateQueries({ queryKey: ["pen", id] });
          } catch (e: any) {
            Alert.alert("Error", e.message);
          }
        },
      },
    ]);
  }

  if (isLoading) return <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator size="large" color="#16a34a" /></View>;

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* Header */}
      <View style={{ backgroundColor: "#15803d", paddingTop: insets.top + 12, paddingBottom: 20, paddingHorizontal: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={{ color: "white", fontSize: 20, fontWeight: "700", flex: 1 }}>{pen?.name}</Text>
          <TouchableOpacity onPress={() => setShowAssign(true)} style={{ backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Ionicons name="add" size={18} color="white" />
            <Text style={{ color: "white", fontSize: 13, fontWeight: "600" }}>Assign</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: "row", gap: 16 }}>
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: "white", fontSize: 22, fontWeight: "800" }}>{currentAnimals.length}</Text>
            <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>Current</Text>
          </View>
          {pen?.capacity && (
            <View style={{ alignItems: "center" }}>
              <Text style={{ color: "white", fontSize: 22, fontWeight: "800" }}>{pen.capacity}</Text>
              <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>Capacity</Text>
            </View>
          )}
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: "white", fontSize: 22, fontWeight: "800" }}>{pen?.capacity ? pen.capacity - currentAnimals.length : "—"}</Text>
            <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>Available</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#16a34a" colors={["#16a34a"]} />}
      >
        {pen?.location && (
          <View style={{ backgroundColor: "white", borderRadius: 12, padding: 14, marginBottom: 14, flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: "#f3f4f6" }}>
            <Ionicons name="location-outline" size={18} color="#16a34a" />
            <Text style={{ color: "#374151", fontSize: 14 }}>{pen.location}</Text>
          </View>
        )}

        <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 12 }}>
          Goats in this pen ({currentAnimals.length})
        </Text>

        {currentAnimals.length === 0 ? (
          <View style={{ backgroundColor: "white", borderRadius: 16, padding: 32, alignItems: "center", borderWidth: 1, borderColor: "#f3f4f6" }}>
            <Ionicons name="paw-outline" size={40} color="#d1d5db" />
            <Text style={{ color: "#9ca3af", marginTop: 10 }}>No goats assigned yet</Text>
            <TouchableOpacity onPress={() => setShowAssign(true)} style={{ marginTop: 14, backgroundColor: "#16a34a", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 }}>
              <Text style={{ color: "white", fontWeight: "600", fontSize: 13 }}>Assign Goats</Text>
            </TouchableOpacity>
          </View>
        ) : (
          currentAnimals.map((animal: any) => (
            <TouchableOpacity
              key={animal.id}
              onPress={() => router.push(`/goats/${animal.id}`)}
              activeOpacity={0.75}
              style={{ backgroundColor: "white", borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#f3f4f6", elevation: 1 }}
            >
              <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: animal.gender === "MALE" ? "#eff6ff" : "#fdf2f8", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                <Ionicons name={animal.gender === "MALE" ? "male" : "female"} size={18} color={animal.gender === "MALE" ? "#3b82f6" : "#ec4899"} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827" }}>{animal.name || animal.tag}</Text>
                <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{[animal.breed, getAge(animal.dateOfBirth)].filter(Boolean).join(" · ")}</Text>
              </View>
              <TouchableOpacity onPress={() => handleRemove(animal.id, animal.name || animal.tag)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="remove-circle-outline" size={22} color="#ef4444" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Assign Goats Modal */}
      <Modal visible={showAssign} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAssign(false)}>
        <View style={{ flex: 1, backgroundColor: "white" }}>
          <View style={{ flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" }}>
            <TouchableOpacity onPress={() => { setShowAssign(false); setSelected([]); }} style={{ marginRight: 12 }}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: "700", flex: 1 }}>Assign Goats</Text>
            <TouchableOpacity onPress={handleAssign} disabled={saving || !selected.length} style={{ backgroundColor: selected.length ? "#16a34a" : "#d1d5db", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 }}>
              {saving ? <ActivityIndicator color="white" size="small" /> : <Text style={{ color: "white", fontWeight: "600" }}>Assign {selected.length > 0 ? `(${selected.length})` : ""}</Text>}
            </TouchableOpacity>
          </View>
          <FlatList
            data={availableGoats}
            keyExtractor={(item: any) => item.id}
            contentContainerStyle={{ padding: 16 }}
            ListEmptyComponent={<View style={{ alignItems: "center", paddingTop: 40 }}><Text style={{ color: "#9ca3af" }}>All active goats are already assigned</Text></View>}
            renderItem={({ item }: { item: any }) => {
              const isSelected = selected.includes(item.id);
              return (
                <TouchableOpacity
                  onPress={() => setSelected(s => isSelected ? s.filter(x => x !== item.id) : [...s, item.id])}
                  style={{ flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 12, marginBottom: 8, backgroundColor: isSelected ? "#f0fdf4" : "white", borderWidth: 1.5, borderColor: isSelected ? "#16a34a" : "#e5e7eb" }}
                >
                  <View style={{ width: 36, height: 36, borderRadius: 9, backgroundColor: item.gender === "MALE" ? "#eff6ff" : "#fdf2f8", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                    <Ionicons name={item.gender === "MALE" ? "male" : "female"} size={16} color={item.gender === "MALE" ? "#3b82f6" : "#ec4899"} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827" }}>{item.name || item.tag}</Text>
                    <Text style={{ fontSize: 12, color: "#6b7280" }}>{item.breed || "Unknown breed"}</Text>
                  </View>
                  <Ionicons name={isSelected ? "checkmark-circle" : "ellipse-outline"} size={22} color={isSelected ? "#16a34a" : "#d1d5db"} />
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>
    </View>
  );
}
