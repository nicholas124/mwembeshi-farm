import { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TextInput,
  TouchableOpacity, Alert, ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getCrop, updateCrop, getCropTypes, getFields } from "../../../lib/api";

const PLANTING_METHODS = [
  { value: "DIRECT_SEEDING", label: "Direct Seeding" },
  { value: "TRANSPLANTING",  label: "Transplanting" },
  { value: "BROADCASTING",   label: "Broadcasting" },
  { value: "DIBBLING",       label: "Dibbling" },
];

const PLANTING_STATUSES = [
  { value: "PLANNED",    color: "#3b82f6" },
  { value: "PLANTED",    color: "#8b5cf6" },
  { value: "GROWING",    color: "#16a34a" },
  { value: "HARVESTING", color: "#f59e0b" },
  { value: "COMPLETED",  color: "#6b7280" },
  { value: "FAILED",     color: "#ef4444" },
];

const HEALTH_OPTIONS = [
  { value: "EXCELLENT", color: "#16a34a" },
  { value: "GOOD",      color: "#22c55e" },
  { value: "FAIR",      color: "#f59e0b" },
  { value: "POOR",      color: "#ef4444" },
  { value: "CRITICAL",  color: "#b91c1c" },
];

export default function EditCropScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    cropTypeId: "",
    fieldId: "",
    variety: "",
    season: "",
    areaPlanted: "",
    expectedHarvest: "",
    plantingMethod: "DIRECT_SEEDING",
    status: "GROWING",
    health: "GOOD",
    seedSource: "",
    seedTreatment: "",
    seedQuantity: "",
    seedUnit: "",
    seedCost: "",
    spacingRows: "",
    spacingPlants: "",
    basalFertilizer: "",
    topDressFertilizer: "",
    expectedYield: "",
    notes: "",
  });

  const { data: cropData, isLoading } = useQuery({
    queryKey: ["crop", id],
    queryFn: () => getCrop(id!),
    enabled: !!id,
  });

  const { data: typesData } = useQuery({ queryKey: ["crop-types"], queryFn: getCropTypes });
  const { data: fieldsData } = useQuery({ queryKey: ["fields"], queryFn: getFields });

  const planting = cropData?.data;
  const cropTypes = typesData?.data || [];
  const fields = fieldsData?.data || [];

  useEffect(() => {
    if (planting) {
      setForm({
        cropTypeId:        planting.cropTypeId || "",
        fieldId:           planting.fieldId || "",
        variety:           planting.variety || "",
        season:            planting.season || "",
        areaPlanted:       planting.areaPlanted?.toString() || "",
        expectedHarvest:   planting.expectedHarvest
                             ? new Date(planting.expectedHarvest).toISOString().split("T")[0]
                             : "",
        plantingMethod:    planting.plantingMethod || "DIRECT_SEEDING",
        status:            planting.status || "GROWING",
        health:            planting.health || "GOOD",
        seedSource:        planting.seedSource || "",
        seedTreatment:     planting.seedTreatment || "",
        seedQuantity:      planting.seedQuantity?.toString() || "",
        seedUnit:          planting.seedUnit || "",
        seedCost:          planting.seedCost?.toString() || "",
        spacingRows:       planting.spacingRows?.toString() || "",
        spacingPlants:     planting.spacingPlants?.toString() || "",
        basalFertilizer:   planting.basalFertilizer || "",
        topDressFertilizer:planting.topDressFertilizer || "",
        expectedYield:     planting.expectedYield?.toString() || "",
        notes:             planting.notes || "",
      });
    }
  }, [planting]);

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    if (!form.areaPlanted) {
      Alert.alert("Error", "Area planted is required");
      return;
    }
    setLoading(true);
    try {
      await updateCrop(id!, {
        cropTypeId:         form.cropTypeId || undefined,
        fieldId:            form.fieldId || undefined,
        variety:            form.variety || null,
        season:             form.season || null,
        areaPlanted:        parseFloat(form.areaPlanted),
        expectedHarvest:    form.expectedHarvest || null,
        plantingMethod:     form.plantingMethod,
        status:             form.status,
        health:             form.health,
        seedSource:         form.seedSource || null,
        seedTreatment:      form.seedTreatment || null,
        seedQuantity:       form.seedQuantity ? parseFloat(form.seedQuantity) : null,
        seedUnit:           form.seedUnit || null,
        seedCost:           form.seedCost ? parseFloat(form.seedCost) : null,
        spacingRows:        form.spacingRows ? parseFloat(form.spacingRows) : null,
        spacingPlants:      form.spacingPlants ? parseFloat(form.spacingPlants) : null,
        basalFertilizer:    form.basalFertilizer || null,
        topDressFertilizer: form.topDressFertilizer || null,
        expectedYield:      form.expectedYield ? parseFloat(form.expectedYield) : null,
        notes:              form.notes || null,
      });
      queryClient.invalidateQueries({ queryKey: ["crop", id] });
      queryClient.invalidateQueries({ queryKey: ["crops"] });
      Alert.alert("Saved", "Planting updated successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f9fafb" }}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* Header */}
      <View style={{
        backgroundColor: "#16a34a",
        paddingTop: insets.top + 8,
        paddingBottom: 16,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "700", color: "white" }}>Edit Planting</Text>
        <TouchableOpacity onPress={handleSubmit} disabled={loading}>
          {loading
            ? <ActivityIndicator size="small" color="white" />
            : <Text style={{ color: "white", fontSize: 16, fontWeight: "700" }}>Save</Text>
          }
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>

        {/* Crop Type */}
        <SectionHeader title="CROP TYPE" />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {cropTypes.map((ct: any) => {
            const active = form.cropTypeId === ct.id;
            return (
              <TouchableOpacity
                key={ct.id}
                onPress={() => update("cropTypeId", ct.id)}
                style={{
                  paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                  backgroundColor: active ? "#16a34a" : "white",
                  borderWidth: 1, borderColor: active ? "#16a34a" : "#e5e7eb",
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: "600", color: active ? "white" : "#374151" }}>
                  {ct.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Field */}
        <SectionHeader title="FIELD" />
        <View style={{ gap: 8, marginBottom: 16 }}>
          {fields.map((f: any) => {
            const active = form.fieldId === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                onPress={() => update("fieldId", f.id)}
                style={{
                  flexDirection: "row", alignItems: "center", padding: 12,
                  borderRadius: 12, borderWidth: 1,
                  borderColor: active ? "#16a34a" : "#e5e7eb",
                  backgroundColor: active ? "#f0fdf4" : "white",
                }}
              >
                <Ionicons
                  name={active ? "radio-button-on" : "radio-button-off"}
                  size={20} color={active ? "#16a34a" : "#9ca3af"}
                />
                <View style={{ marginLeft: 12 }}>
                  <Text style={{ fontSize: 14, fontWeight: "500", color: "#111827" }}>{f.name}</Text>
                  <Text style={{ fontSize: 12, color: "#9ca3af" }}>
                    {parseFloat(f.size).toFixed(2)} ha · {f.irrigation}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Status & Health */}
        <SectionHeader title="STATUS" />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {PLANTING_STATUSES.map(({ value, color }) => {
            const active = form.status === value;
            return (
              <TouchableOpacity
                key={value}
                onPress={() => update("status", value)}
                style={{
                  paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                  backgroundColor: active ? color : "white",
                  borderWidth: 1, borderColor: active ? color : "#e5e7eb",
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: "600", color: active ? "white" : "#374151" }}>
                  {value.replace(/_/g, " ")}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <SectionHeader title="HEALTH" />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {HEALTH_OPTIONS.map(({ value, color }) => {
            const active = form.health === value;
            return (
              <TouchableOpacity
                key={value}
                onPress={() => update("health", value)}
                style={{
                  paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                  backgroundColor: active ? color : "white",
                  borderWidth: 1, borderColor: active ? color : "#e5e7eb",
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: "600", color: active ? "white" : "#374151" }}>
                  {value}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Basic Details */}
        <SectionHeader title="BASIC DETAILS" />
        <Card>
          <Row label="Variety">
            <TextInput
              style={inp}
              placeholder="e.g. SC513, Roma, Chalimbana"
              placeholderTextColor="#9ca3af"
              value={form.variety}
              onChangeText={(v) => update("variety", v)}
            />
          </Row>
          <Row label="Season">
            <TextInput
              style={inp}
              placeholder="e.g. 2025/26 Rainy"
              placeholderTextColor="#9ca3af"
              value={form.season}
              onChangeText={(v) => update("season", v)}
            />
          </Row>
          <Row label="Area (ha)">
            <TextInput
              style={inp}
              placeholder="0.00"
              placeholderTextColor="#9ca3af"
              value={form.areaPlanted}
              onChangeText={(v) => update("areaPlanted", v)}
              keyboardType="decimal-pad"
            />
          </Row>
          <Row label="Expected Harvest" last>
            <TextInput
              style={inp}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9ca3af"
              value={form.expectedHarvest}
              onChangeText={(v) => update("expectedHarvest", v)}
            />
          </Row>
        </Card>

        {/* Planting Method */}
        <SectionHeader title="PLANTING METHOD" />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {PLANTING_METHODS.map(({ value, label }) => {
            const active = form.plantingMethod === value;
            return (
              <TouchableOpacity
                key={value}
                onPress={() => update("plantingMethod", value)}
                style={{
                  paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                  backgroundColor: active ? "#16a34a" : "white",
                  borderWidth: 1, borderColor: active ? "#16a34a" : "#e5e7eb",
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: "600", color: active ? "white" : "#374151" }}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Seed Details */}
        <SectionHeader title="SEED DETAILS" />
        <Card>
          <Row label="Source">
            <TextInput
              style={inp}
              placeholder="e.g. Zamseed, SeedCo"
              placeholderTextColor="#9ca3af"
              value={form.seedSource}
              onChangeText={(v) => update("seedSource", v)}
            />
          </Row>
          <Row label="Treatment">
            <TextInput
              style={inp}
              placeholder="e.g. Apron Star"
              placeholderTextColor="#9ca3af"
              value={form.seedTreatment}
              onChangeText={(v) => update("seedTreatment", v)}
            />
          </Row>
          <Row label="Quantity">
            <TextInput
              style={inp}
              placeholder="0"
              placeholderTextColor="#9ca3af"
              value={form.seedQuantity}
              onChangeText={(v) => update("seedQuantity", v)}
              keyboardType="decimal-pad"
            />
          </Row>
          <Row label="Unit">
            <TextInput
              style={inp}
              placeholder="kg / packets"
              placeholderTextColor="#9ca3af"
              value={form.seedUnit}
              onChangeText={(v) => update("seedUnit", v)}
            />
          </Row>
          <Row label="Seed Cost (ZMW)" last>
            <TextInput
              style={inp}
              placeholder="0.00"
              placeholderTextColor="#9ca3af"
              value={form.seedCost}
              onChangeText={(v) => update("seedCost", v)}
              keyboardType="decimal-pad"
            />
          </Row>
        </Card>

        {/* Spacing */}
        <SectionHeader title="SPACING (cm)" />
        <Card>
          <Row label="Row spacing">
            <TextInput
              style={inp}
              placeholder="e.g. 75"
              placeholderTextColor="#9ca3af"
              value={form.spacingRows}
              onChangeText={(v) => update("spacingRows", v)}
              keyboardType="decimal-pad"
            />
          </Row>
          <Row label="Plant spacing" last>
            <TextInput
              style={inp}
              placeholder="e.g. 25"
              placeholderTextColor="#9ca3af"
              value={form.spacingPlants}
              onChangeText={(v) => update("spacingPlants", v)}
              keyboardType="decimal-pad"
            />
          </Row>
        </Card>

        {/* Fertilizer */}
        <SectionHeader title="FERTILIZER" />
        <Card>
          <Row label="Basal">
            <TextInput
              style={inp}
              placeholder="e.g. D-Compound"
              placeholderTextColor="#9ca3af"
              value={form.basalFertilizer}
              onChangeText={(v) => update("basalFertilizer", v)}
            />
          </Row>
          <Row label="Top Dress">
            <TextInput
              style={inp}
              placeholder="e.g. Urea, CAN"
              placeholderTextColor="#9ca3af"
              value={form.topDressFertilizer}
              onChangeText={(v) => update("topDressFertilizer", v)}
            />
          </Row>
          <Row label="Expected Yield (kg)" last>
            <TextInput
              style={inp}
              placeholder="0"
              placeholderTextColor="#9ca3af"
              value={form.expectedYield}
              onChangeText={(v) => update("expectedYield", v)}
              keyboardType="decimal-pad"
            />
          </Row>
        </Card>

        {/* Notes */}
        <SectionHeader title="NOTES" />
        <TextInput
          style={{
            backgroundColor: "white", borderWidth: 1, borderColor: "#e5e7eb",
            borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
            fontSize: 14, color: "#111827", minHeight: 90, textAlignVertical: "top",
          }}
          placeholder="Additional notes"
          placeholderTextColor="#9ca3af"
          value={form.notes}
          onChangeText={(v) => update("notes", v)}
          multiline
          numberOfLines={4}
        />

      </ScrollView>
    </View>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <Text style={{ fontSize: 11, fontWeight: "700", color: "#9ca3af", marginTop: 16, marginBottom: 8, letterSpacing: 0.8 }}>
      {title}
    </Text>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ backgroundColor: "white", borderRadius: 14, borderWidth: 1, borderColor: "#e5e7eb", marginBottom: 4, overflow: "hidden" }}>
      {children}
    </View>
  );
}

function Row({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <View style={{
      flexDirection: "row", alignItems: "center",
      paddingHorizontal: 14, paddingVertical: 4,
      borderBottomWidth: last ? 0 : 1, borderBottomColor: "#f3f4f6",
    }}>
      <Text style={{ width: 130, fontSize: 13, color: "#6b7280", fontWeight: "500" }}>{label}</Text>
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

const inp = {
  fontSize: 14,
  color: "#111827",
  paddingVertical: 10,
  flex: 1,
};
