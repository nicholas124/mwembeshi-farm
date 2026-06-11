import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  FlatList,
} from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../lib/auth-context";
import {
  getCrop,
  getCropSprayPlans,
  createCropActivity,
  createCropInput,
  createCropHarvest,
  createCropSprayPlan,
  updateSprayPlan,
  deleteSprayPlan,
  updateCrop,
} from "../../lib/api";

type TabType = "overview" | "activities" | "inputs" | "sprays" | "harvests";

const TABS: { key: TabType; label: string; icon: string }[] = [
  { key: "overview",    label: "Overview",    icon: "information-circle-outline" },
  { key: "activities", label: "Activities",  icon: "list-outline" },
  { key: "inputs",     label: "Inputs",      icon: "flask-outline" },
  { key: "sprays",     label: "Sprays",      icon: "water-outline" },
  { key: "harvests",   label: "Harvests",    icon: "basket-outline" },
];

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  PLANNED:    { color: "#3b82f6", bg: "#eff6ff", label: "Planned" },
  PLANTED:    { color: "#8b5cf6", bg: "#f5f3ff", label: "Planted" },
  GROWING:    { color: "#16a34a", bg: "#f0fdf4", label: "Growing" },
  HARVESTING: { color: "#f59e0b", bg: "#fffbeb", label: "Harvesting" },
  COMPLETED:  { color: "#6b7280", bg: "#f9fafb", label: "Completed" },
  FAILED:     { color: "#ef4444", bg: "#fef2f2", label: "Failed" },
};

const HEALTH_COLORS: Record<string, string> = {
  EXCELLENT: "#16a34a",
  GOOD:      "#22c55e",
  FAIR:      "#f59e0b",
  POOR:      "#ef4444",
  CRITICAL:  "#b91c1c",
};

const SPRAY_STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  PENDING:     { color: "#3b82f6", bg: "#eff6ff", label: "Pending" },
  IN_PROGRESS: { color: "#f59e0b", bg: "#fffbeb", label: "In Progress" },
  COMPLETED:   { color: "#16a34a", bg: "#f0fdf4", label: "Done" },
  SKIPPED:     { color: "#9ca3af", bg: "#f9fafb", label: "Skipped" },
  OVERDUE:     { color: "#ef4444", bg: "#fef2f2", label: "Overdue" },
};

const ACTIVITY_TYPES = [
  "LAND_PREP", "PLANTING", "WEEDING", "FERTILIZING",
  "SPRAYING", "IRRIGATION", "INSPECTION", "OTHER",
];

const INPUT_TYPES = ["FERTILIZER", "PESTICIDE", "HERBICIDE", "FUNGICIDE", "SEED", "OTHER"];
const HARVEST_QUALITY = ["EXCELLENT", "GOOD", "FAIR", "POOR"];
const PLANTING_STATUSES = ["PLANNED", "PLANTED", "GROWING", "HARVESTING", "COMPLETED", "FAILED"];
const HEALTH_OPTIONS = ["EXCELLENT", "GOOD", "FAIR", "POOR", "CRITICAL"];

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function CropDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showInputModal, setShowInputModal] = useState(false);
  const [showHarvestModal, setShowHarvestModal] = useState(false);
  const [showSprayModal, setShowSprayModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["crop", id],
    queryFn: () => getCrop(id!),
  });

  const { data: spraysData, refetch: refetchSprays } = useQuery({
    queryKey: ["crop-sprays", id],
    queryFn: () => getCropSprayPlans(id!),
    enabled: activeTab === "sprays",
  });

  const planting = data?.data;
  const sprayPlans = spraysData?.data || [];

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["crop", id] });
    queryClient.invalidateQueries({ queryKey: ["crops"] });
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f9fafb" }}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  if (!planting) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#f9fafb" }}>
        <Text style={{ color: "#9ca3af" }}>Planting not found</Text>
      </View>
    );
  }

  const sc = STATUS_CONFIG[planting.status] || STATUS_CONFIG.PLANNED;
  const healthColor = HEALTH_COLORS[planting.health] || "#22c55e";

  function getFABForTab() {
    switch (activeTab) {
      case "activities": return { label: "Log Activity", onPress: () => setShowActivityModal(true) };
      case "inputs":     return { label: "Record Input", onPress: () => setShowInputModal(true) };
      case "harvests":   return { label: "Record Harvest", onPress: () => setShowHarvestModal(true) };
      case "sprays":     return { label: "Add Spray Plan", onPress: () => setShowSprayModal(true) };
      default:           return null;
    }
  }

  const fab = getFABForTab();

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* Header */}
      <View style={{
        backgroundColor: "#16a34a",
        paddingTop: insets.top + 8,
        paddingBottom: 16,
        paddingHorizontal: 16,
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: "800", color: "white" }}>
              {planting.cropType?.name}
              {planting.variety ? ` · ${planting.variety}` : ""}
            </Text>
            <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>
              {planting.field?.name} · {parseFloat(planting.areaPlanted).toFixed(2)} ha
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push(`/crops/edit/${id}` as any)}
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: 10, padding: 8,
            }}
          >
            <Ionicons name="pencil" size={18} color="white" />
          </TouchableOpacity>
        </View>

        {/* Status + Health row */}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity
            onPress={() => setShowStatusModal(true)}
            style={{
              paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
              backgroundColor: sc.bg, flexDirection: "row", alignItems: "center", gap: 5,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: "700", color: sc.color }}>{sc.label}</Text>
            <Ionicons name="chevron-down" size={12} color={sc.color} />
          </TouchableOpacity>
          <View style={{
            paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
            backgroundColor: "rgba(255,255,255,0.2)", flexDirection: "row", alignItems: "center", gap: 5,
          }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: healthColor }} />
            <Text style={{ fontSize: 12, fontWeight: "600", color: "white" }}>{planting.health}</Text>
          </View>
          {planting.season && (
            <View style={{
              paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
              backgroundColor: "rgba(255,255,255,0.2)",
            }}>
              <Text style={{ fontSize: 12, fontWeight: "600", color: "white" }}>{planting.season}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Tab bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ backgroundColor: "white", flexGrow: 0, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" }}
        contentContainerStyle={{ paddingHorizontal: 8 }}
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={{
                paddingHorizontal: 14, paddingVertical: 12,
                borderBottomWidth: 2,
                borderBottomColor: active ? "#16a34a" : "transparent",
                flexDirection: "row", alignItems: "center", gap: 5,
              }}
            >
              <Ionicons name={tab.icon as any} size={14} color={active ? "#16a34a" : "#9ca3af"} />
              <Text style={{ fontSize: 13, fontWeight: "600", color: active ? "#16a34a" : "#9ca3af" }}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Tab content */}
      <View style={{ flex: 1 }}>
        {activeTab === "overview" && <OverviewTab planting={planting} />}
        {activeTab === "activities" && <ActivitiesTab activities={planting.activities || []} />}
        {activeTab === "inputs" && <InputsTab inputs={planting.inputs || []} />}
        {activeTab === "sprays" && (
          <SpraysTab
            sprayPlans={sprayPlans}
            plantingId={id!}
            onUpdate={() => {
              refetchSprays();
              invalidate();
            }}
          />
        )}
        {activeTab === "harvests" && <HarvestsTab harvests={planting.harvests || []} />}
      </View>

      {/* FAB */}
      {fab && (
        <TouchableOpacity
          onPress={fab.onPress}
          activeOpacity={0.8}
          style={{
            position: "absolute", bottom: insets.bottom + 24, right: 20,
            backgroundColor: "#16a34a", borderRadius: 28,
            flexDirection: "row", alignItems: "center",
            paddingHorizontal: 20, paddingVertical: 14,
            shadowColor: "#16a34a", shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
          }}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={{ color: "white", fontWeight: "700", fontSize: 14, marginLeft: 6 }}>
            {fab.label}
          </Text>
        </TouchableOpacity>
      )}

      {/* Modals */}
      <ActivityModal
        visible={showActivityModal}
        plantingId={id!}
        onClose={() => setShowActivityModal(false)}
        onSuccess={() => { setShowActivityModal(false); invalidate(); refetch(); }}
      />
      <InputModal
        visible={showInputModal}
        plantingId={id!}
        onClose={() => setShowInputModal(false)}
        onSuccess={() => { setShowInputModal(false); invalidate(); refetch(); }}
      />
      <HarvestModal
        visible={showHarvestModal}
        plantingId={id!}
        onClose={() => setShowHarvestModal(false)}
        onSuccess={() => { setShowHarvestModal(false); invalidate(); refetch(); }}
      />
      <SprayModal
        visible={showSprayModal}
        plantingId={id!}
        onClose={() => setShowSprayModal(false)}
        onSuccess={() => { setShowSprayModal(false); refetchSprays(); }}
      />
      <StatusModal
        visible={showStatusModal}
        current={planting.status}
        currentHealth={planting.health}
        plantingId={id!}
        onClose={() => setShowStatusModal(false)}
        onSuccess={() => { setShowStatusModal(false); invalidate(); refetch(); }}
      />
    </View>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ planting }: { planting: any }) {
  function row(label: string, value: string | null | undefined) {
    if (!value) return null;
    return (
      <View style={{ flexDirection: "row", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f9fafb" }}>
        <Text style={{ width: 140, fontSize: 13, color: "#9ca3af", fontWeight: "500" }}>{label}</Text>
        <Text style={{ flex: 1, fontSize: 13, color: "#111827", fontWeight: "500" }}>{value}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
      <View style={{ backgroundColor: "white", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#f3f4f6" }}>
        <Text style={{ fontSize: 13, fontWeight: "700", color: "#374151", marginBottom: 8 }}>CROP INFO</Text>
        {row("Crop Type", planting.cropType?.name)}
        {row("Variety", planting.variety)}
        {row("Category", planting.cropType?.category)}
        {row("Field", planting.field?.name)}
        {row("Area Planted", `${parseFloat(planting.areaPlanted).toFixed(2)} ha`)}
        {row("Season", planting.season)}
        {row("Planting Method", planting.plantingMethod?.replace(/_/g, " "))}
      </View>

      <View style={{ backgroundColor: "white", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#f3f4f6" }}>
        <Text style={{ fontSize: 13, fontWeight: "700", color: "#374151", marginBottom: 8 }}>DATES</Text>
        {row("Planted", fmt(planting.plantingDate))}
        {planting.expectedHarvest && row("Expected Harvest", fmt(planting.expectedHarvest))}
      </View>

      <View style={{ backgroundColor: "white", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#f3f4f6" }}>
        <Text style={{ fontSize: 13, fontWeight: "700", color: "#374151", marginBottom: 8 }}>SEED DETAILS</Text>
        {row("Source", planting.seedSource)}
        {row("Treatment", planting.seedTreatment)}
        {planting.seedQuantity && row("Quantity", `${planting.seedQuantity} ${planting.seedUnit || ""}`)}
        {planting.seedCost && row("Seed Cost", `ZMW ${parseFloat(planting.seedCost).toFixed(2)}`)}
        {planting.spacingRows && row("Row Spacing", `${planting.spacingRows} cm`)}
        {planting.spacingPlants && row("Plant Spacing", `${planting.spacingPlants} cm`)}
      </View>

      <View style={{ backgroundColor: "white", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#f3f4f6" }}>
        <Text style={{ fontSize: 13, fontWeight: "700", color: "#374151", marginBottom: 8 }}>FERTILIZER</Text>
        {row("Basal", planting.basalFertilizer)}
        {row("Top Dress", planting.topDressFertilizer)}
        {planting.expectedYield && row("Expected Yield", `${planting.expectedYield} kg`)}
      </View>

      {planting.notes && (
        <View style={{ backgroundColor: "white", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f3f4f6" }}>
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#374151", marginBottom: 8 }}>NOTES</Text>
          <Text style={{ fontSize: 13, color: "#6b7280", lineHeight: 20 }}>{planting.notes}</Text>
        </View>
      )}
    </ScrollView>
  );
}

// ─── Activities Tab ───────────────────────────────────────────────────────────

function ActivitiesTab({ activities }: { activities: any[] }) {
  const ACTIVITY_COLORS: Record<string, string> = {
    LAND_PREP: "#8b5cf6", PLANTING: "#16a34a", WEEDING: "#f59e0b",
    FERTILIZING: "#3b82f6", SPRAYING: "#ef4444", IRRIGATION: "#06b6d4",
    INSPECTION: "#6b7280", OTHER: "#9ca3af",
  };

  if (activities.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Ionicons name="list-outline" size={48} color="#d1d5db" />
        <Text style={{ color: "#9ca3af", marginTop: 12, fontSize: 14 }}>No activities logged</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={activities}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      renderItem={({ item }) => {
        const color = ACTIVITY_COLORS[item.type] || "#9ca3af";
        return (
          <View style={{
            backgroundColor: "white", borderRadius: 14, padding: 14,
            marginBottom: 10, borderWidth: 1, borderColor: "#f3f4f6",
            flexDirection: "row", gap: 12,
          }}>
            <View style={{
              width: 36, height: 36, borderRadius: 10,
              backgroundColor: `${color}18`, alignItems: "center", justifyContent: "center",
            }}>
              <Ionicons name="leaf" size={16} color={color} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}>
                  {item.type.replace(/_/g, " ")}
                </Text>
                <Text style={{ fontSize: 12, color: "#9ca3af" }}>{fmt(item.activityDate)}</Text>
              </View>
              {item.description && (
                <Text style={{ fontSize: 13, color: "#6b7280", marginTop: 3 }}>{item.description}</Text>
              )}
              {item.cost && (
                <Text style={{ fontSize: 12, color: "#16a34a", marginTop: 3 }}>
                  ZMW {parseFloat(item.cost).toFixed(2)}
                </Text>
              )}
            </View>
          </View>
        );
      }}
    />
  );
}

// ─── Inputs Tab ───────────────────────────────────────────────────────────────

function InputsTab({ inputs }: { inputs: any[] }) {
  const INPUT_COLORS: Record<string, string> = {
    FERTILIZER: "#3b82f6", PESTICIDE: "#ef4444", HERBICIDE: "#f59e0b",
    FUNGICIDE: "#8b5cf6", SEED: "#16a34a", OTHER: "#9ca3af",
  };

  if (inputs.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Ionicons name="flask-outline" size={48} color="#d1d5db" />
        <Text style={{ color: "#9ca3af", marginTop: 12, fontSize: 14 }}>No inputs recorded</Text>
      </View>
    );
  }

  const totalCost = inputs.reduce((sum: number, i: any) => sum + (parseFloat(i.cost) || 0), 0);

  return (
    <FlatList
      data={inputs}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      ListHeaderComponent={
        totalCost > 0 ? (
          <View style={{
            backgroundColor: "#f0fdf4", borderRadius: 12, padding: 14,
            marginBottom: 12, flexDirection: "row", justifyContent: "space-between",
          }}>
            <Text style={{ fontSize: 13, color: "#16a34a", fontWeight: "600" }}>Total Input Cost</Text>
            <Text style={{ fontSize: 15, color: "#16a34a", fontWeight: "800" }}>
              ZMW {totalCost.toFixed(2)}
            </Text>
          </View>
        ) : null
      }
      renderItem={({ item }) => {
        const color = INPUT_COLORS[item.type] || "#9ca3af";
        return (
          <View style={{
            backgroundColor: "white", borderRadius: 14, padding: 14,
            marginBottom: 10, borderWidth: 1, borderColor: "#f3f4f6",
          }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View style={{
                  paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
                  backgroundColor: `${color}18`,
                }}>
                  <Text style={{ fontSize: 11, fontWeight: "700", color }}>{item.type}</Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}>{item.name}</Text>
              </View>
              <Text style={{ fontSize: 12, color: "#9ca3af" }}>{fmt(item.appliedDate)}</Text>
            </View>
            <View style={{ flexDirection: "row", gap: 16, marginTop: 8 }}>
              <Text style={{ fontSize: 13, color: "#6b7280" }}>
                {item.quantity} {item.unit}
              </Text>
              {item.cost && (
                <Text style={{ fontSize: 13, color: "#16a34a", fontWeight: "600" }}>
                  ZMW {parseFloat(item.cost).toFixed(2)}
                </Text>
              )}
            </View>
            {item.notes && (
              <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>{item.notes}</Text>
            )}
          </View>
        );
      }}
    />
  );
}

// ─── Sprays Tab ───────────────────────────────────────────────────────────────

function SpraysTab({
  sprayPlans,
  plantingId,
  onUpdate,
}: {
  sprayPlans: any[];
  plantingId: string;
  onUpdate: () => void;
}) {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERVISOR";
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  async function markDone(plan: any) {
    Alert.alert("Mark Complete", `Mark "${plan.name}" as completed?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Complete",
        onPress: async () => {
          try {
            await updateSprayPlan(plantingId, plan.id, { status: "COMPLETED" });
            setSelectedPlan(null);
            onUpdate();
          } catch (e: any) {
            Alert.alert("Error", e.message);
          }
        },
      },
    ]);
  }

  function handleDelete(plan: any) {
    Alert.alert("Delete Spray Plan", `Delete "${plan.name}"? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteSprayPlan(plantingId, plan.id);
            setSelectedPlan(null);
            onUpdate();
          } catch (e: any) {
            Alert.alert("Error", e.message);
          }
        },
      },
    ]);
  }

  if (sprayPlans.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Ionicons name="water-outline" size={48} color="#d1d5db" />
        <Text style={{ color: "#9ca3af", marginTop: 12, fontSize: 14 }}>No spray plans</Text>
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={sprayPlans}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        renderItem={({ item }) => {
          const sc = SPRAY_STATUS_CONFIG[item.status] || SPRAY_STATUS_CONFIG.PENDING;
          const isOverdue = item.status === "PENDING" &&
            new Date(item.scheduledDate) < new Date();

          return (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setSelectedPlan(item)}
              style={{
                backgroundColor: "white", borderRadius: 14, padding: 14,
                marginBottom: 10, borderWidth: 1,
                borderColor: isOverdue ? "#fecaca" : "#f3f4f6",
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827" }}>{item.name}</Text>
                  <Text style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{item.pesticide}</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <View style={{
                    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
                    backgroundColor: isOverdue ? "#fef2f2" : sc.bg,
                  }}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: isOverdue ? "#ef4444" : sc.color }}>
                      {isOverdue ? "OVERDUE" : sc.label}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
                </View>
              </View>

              <View style={{ flexDirection: "row", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Ionicons name="calendar-outline" size={13} color="#9ca3af" />
                  <Text style={{ fontSize: 12, color: "#6b7280" }}>{fmt(item.scheduledDate)}</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Ionicons name="beaker-outline" size={13} color="#9ca3af" />
                  <Text style={{ fontSize: 12, color: "#6b7280" }}>{item.dosage}</Text>
                </View>
              </View>

              {item.targetPest && (
                <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
                  Target: {item.targetPest}
                </Text>
              )}
              {item.completedDate && (
                <Text style={{ fontSize: 12, color: "#16a34a", marginTop: 4 }}>
                  Completed: {fmt(item.completedDate)}
                </Text>
              )}
            </TouchableOpacity>
          );
        }}
      />

      <SprayDetailModal
        visible={!!selectedPlan}
        plan={selectedPlan}
        isAdmin={isAdmin}
        onClose={() => setSelectedPlan(null)}
        onMarkDone={() => markDone(selectedPlan)}
        onEdit={() => {
          setEditingPlan(selectedPlan);
          setSelectedPlan(null);
          setShowEditModal(true);
        }}
        onDelete={() => handleDelete(selectedPlan)}
      />

      <SprayModal
        visible={showEditModal}
        plantingId={plantingId}
        editingPlan={editingPlan}
        onClose={() => { setShowEditModal(false); setEditingPlan(null); }}
        onSuccess={() => { setShowEditModal(false); setEditingPlan(null); onUpdate(); }}
      />
    </>
  );
}

function detailRow(icon: string, label: string, value: string) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f9fafb", gap: 10 }}>
      <Ionicons name={icon as any} size={16} color="#9ca3af" style={{ marginTop: 2 }} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 11, color: "#9ca3af", fontWeight: "600" }}>{label}</Text>
        <Text style={{ fontSize: 14, color: "#111827", fontWeight: "500", marginTop: 2 }}>{value}</Text>
      </View>
    </View>
  );
}

function SprayDetailModal({
  visible, plan, isAdmin, onClose, onMarkDone, onEdit, onDelete,
}: {
  visible: boolean;
  plan: any;
  isAdmin: boolean;
  onClose: () => void;
  onMarkDone: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  if (!plan) return null;

  const sc = SPRAY_STATUS_CONFIG[plan.status] || SPRAY_STATUS_CONFIG.PENDING;
  const isOverdue = plan.status === "PENDING" && new Date(plan.scheduledDate) < new Date();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <View style={{
          flexDirection: "row", alignItems: "center", justifyContent: "space-between",
          paddingHorizontal: 16, paddingVertical: 16,
          borderBottomWidth: 1, borderBottomColor: "#f3f4f6",
        }}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
          <Text style={{ fontSize: 17, fontWeight: "700" }}>Spray Plan</Text>
          {isAdmin ? (
            <TouchableOpacity onPress={onEdit}>
              <Text style={{ color: "#16a34a", fontSize: 16, fontWeight: "600" }}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 24 }} />
          )}
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          <Text style={{ fontSize: 20, fontWeight: "800", color: "#111827" }}>{plan.name}</Text>
          <View style={{ flexDirection: "row", marginTop: 8, marginBottom: 4 }}>
            <View style={{
              paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
              backgroundColor: isOverdue ? "#fef2f2" : sc.bg,
            }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: isOverdue ? "#ef4444" : sc.color }}>
                {isOverdue ? "OVERDUE" : sc.label}
              </Text>
            </View>
          </View>

          <View style={{ marginTop: 8 }}>
            {detailRow("calendar-outline", "Scheduled Date", fmt(plan.scheduledDate))}
            {detailRow("flask-outline", "Pesticide / Chemical", plan.pesticide)}
            {plan.targetPest && detailRow("bug-outline", "Target Pest / Disease", plan.targetPest)}
            {detailRow("beaker-outline", "Dosage", plan.dosage)}
            {plan.applicationMethod && detailRow("water-outline", "Application Method", plan.applicationMethod)}
            {plan.weatherConditions && detailRow("partly-sunny-outline", "Weather Conditions", plan.weatherConditions)}
          </View>

          {plan.safetyPrecautions && (
            <View style={{ backgroundColor: "#fffbeb", borderRadius: 12, padding: 14, marginTop: 12, borderWidth: 1, borderColor: "#fde68a" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <Ionicons name="warning-outline" size={16} color="#d97706" />
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#d97706" }}>Safety Precautions</Text>
              </View>
              <Text style={{ fontSize: 13, color: "#92400e", lineHeight: 19 }}>{plan.safetyPrecautions}</Text>
            </View>
          )}

          {plan.notes && (
            <View style={{ marginTop: 12 }}>
              <Text style={{ fontSize: 11, fontWeight: "700", color: "#9ca3af", marginBottom: 6, textTransform: "uppercase" }}>Notes</Text>
              <Text style={{ fontSize: 14, color: "#374151", lineHeight: 21 }}>{plan.notes}</Text>
            </View>
          )}

          {plan.completedDate && (
            <View style={{ marginTop: 12, backgroundColor: "#f0fdf4", borderRadius: 12, padding: 14 }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#16a34a" }}>Completed {fmt(plan.completedDate)}</Text>
              {plan.completedBy?.name && (
                <Text style={{ fontSize: 12, color: "#16a34a", marginTop: 2 }}>by {plan.completedBy.name}</Text>
              )}
            </View>
          )}

          <View style={{ marginTop: 24, gap: 10 }}>
            {plan.status === "PENDING" && (
              <TouchableOpacity
                onPress={onMarkDone}
                style={{ backgroundColor: "#16a34a", borderRadius: 12, padding: 14, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}
              >
                <Ionicons name="checkmark-circle-outline" size={18} color="white" />
                <Text style={{ color: "white", fontWeight: "700", fontSize: 14 }}>Mark Complete</Text>
              </TouchableOpacity>
            )}
            {isAdmin && (
              <TouchableOpacity
                onPress={onDelete}
                style={{ borderWidth: 1.5, borderColor: "#fee2e2", borderRadius: 12, padding: 14, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}
              >
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
                <Text style={{ color: "#ef4444", fontWeight: "700", fontSize: 14 }}>Delete Spray Plan</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Harvests Tab ─────────────────────────────────────────────────────────────

function HarvestsTab({ harvests }: { harvests: any[] }) {
  const QUALITY_COLORS: Record<string, string> = {
    EXCELLENT: "#16a34a", GOOD: "#22c55e", FAIR: "#f59e0b", POOR: "#ef4444",
  };

  if (harvests.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Ionicons name="basket-outline" size={48} color="#d1d5db" />
        <Text style={{ color: "#9ca3af", marginTop: 12, fontSize: 14 }}>No harvests recorded</Text>
      </View>
    );
  }

  const totalQty = harvests.reduce((sum: number, h: any) => sum + parseFloat(h.quantity), 0);
  const unit = harvests[0]?.unit || "kg";

  return (
    <FlatList
      data={harvests}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      ListHeaderComponent={
        <View style={{
          backgroundColor: "#f0fdf4", borderRadius: 12, padding: 14,
          marginBottom: 12, flexDirection: "row", justifyContent: "space-between",
        }}>
          <Text style={{ fontSize: 13, color: "#16a34a", fontWeight: "600" }}>Total Harvested</Text>
          <Text style={{ fontSize: 15, color: "#16a34a", fontWeight: "800" }}>
            {totalQty.toFixed(1)} {unit}
          </Text>
        </View>
      }
      renderItem={({ item }) => {
        const qColor = QUALITY_COLORS[item.quality] || "#22c55e";
        return (
          <View style={{
            backgroundColor: "white", borderRadius: 14, padding: 14,
            marginBottom: 10, borderWidth: 1, borderColor: "#f3f4f6",
          }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 20, fontWeight: "800", color: "#111827" }}>
                {parseFloat(item.quantity).toFixed(1)} {item.unit}
              </Text>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ fontSize: 11, fontWeight: "700", color: qColor }}>
                  {item.quality}
                </Text>
                <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                  {fmt(item.harvestDate)}
                </Text>
              </View>
            </View>
            {item.soldQuantity && (
              <View style={{ flexDirection: "row", gap: 16, marginTop: 8 }}>
                <Text style={{ fontSize: 13, color: "#6b7280" }}>
                  Sold: {parseFloat(item.soldQuantity).toFixed(1)} {item.unit}
                </Text>
                {item.soldPrice && (
                  <Text style={{ fontSize: 13, color: "#16a34a", fontWeight: "600" }}>
                    @ ZMW {parseFloat(item.soldPrice).toFixed(2)}
                  </Text>
                )}
              </View>
            )}
            {item.buyer && (
              <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>Buyer: {item.buyer}</Text>
            )}
            {item.notes && (
              <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>{item.notes}</Text>
            )}
          </View>
        );
      }}
    />
  );
}

// ─── Modals ───────────────────────────────────────────────────────────────────

function ActivityModal({ visible, plantingId, onClose, onSuccess }: any) {
  const [type, setType] = useState("WEEDING");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    try {
      await createCropActivity(plantingId, {
        type,
        description: description || undefined,
        activityDate: new Date().toISOString(),
        cost: cost ? parseFloat(cost) : undefined,
        notes: notes || undefined,
      });
      Alert.alert("Success", "Activity logged");
      setDescription(""); setCost(""); setNotes("");
      onSuccess();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <ModalHeader title="Log Activity" onClose={onClose} onSave={handleSubmit} loading={loading} />
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text style={mLabel}>Activity Type</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {ACTIVITY_TYPES.map((a) => {
              const active = type === a;
              return (
                <TouchableOpacity
                  key={a}
                  onPress={() => setType(a)}
                  style={{
                    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
                    backgroundColor: active ? "#16a34a" : "#f3f4f6",
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: "600", color: active ? "white" : "#6b7280" }}>
                    {a.replace(/_/g, " ")}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={mLabel}>Description</Text>
          <TextInput style={mInput} placeholder="What was done?" placeholderTextColor="#9ca3af"
            value={description} onChangeText={setDescription} />
          <Text style={mLabel}>Cost (ZMW)</Text>
          <TextInput style={mInput} placeholder="0.00" placeholderTextColor="#9ca3af"
            value={cost} onChangeText={setCost} keyboardType="decimal-pad" />
          <Text style={mLabel}>Notes</Text>
          <TextInput style={[mInput, { minHeight: 70, textAlignVertical: "top" }]}
            placeholder="Additional notes" placeholderTextColor="#9ca3af"
            value={notes} onChangeText={setNotes} multiline numberOfLines={3} />
        </ScrollView>
      </View>
    </Modal>
  );
}

function InputModal({ visible, plantingId, onClose, onSuccess }: any) {
  const [inputType, setInputType] = useState("FERTILIZER");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [cost, setCost] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!name || !quantity) {
      Alert.alert("Error", "Name and quantity are required");
      return;
    }
    setLoading(true);
    try {
      await createCropInput(plantingId, {
        inputType,
        name,
        quantity: parseFloat(quantity),
        unit,
        cost: cost ? parseFloat(cost) : undefined,
        appliedDate: new Date().toISOString(),
        notes: notes || undefined,
      });
      Alert.alert("Success", "Input recorded");
      setName(""); setQuantity(""); setCost(""); setNotes("");
      onSuccess();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <ModalHeader title="Record Input" onClose={onClose} onSave={handleSubmit} loading={loading} />
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text style={mLabel}>Input Type</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {INPUT_TYPES.map((t) => {
              const active = inputType === t;
              return (
                <TouchableOpacity key={t} onPress={() => setInputType(t)} style={{
                  paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
                  backgroundColor: active ? "#16a34a" : "#f3f4f6",
                }}>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: active ? "white" : "#6b7280" }}>{t}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={mLabel}>Product Name</Text>
          <TextInput style={mInput} placeholder="e.g. D-Compound, Karate" placeholderTextColor="#9ca3af"
            value={name} onChangeText={setName} />
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={mLabel}>Quantity</Text>
              <TextInput style={mInput} placeholder="0" placeholderTextColor="#9ca3af"
                value={quantity} onChangeText={setQuantity} keyboardType="decimal-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={mLabel}>Unit</Text>
              <TextInput style={mInput} placeholder="kg / L / bags" placeholderTextColor="#9ca3af"
                value={unit} onChangeText={setUnit} />
            </View>
          </View>
          <Text style={mLabel}>Cost (ZMW)</Text>
          <TextInput style={mInput} placeholder="0.00" placeholderTextColor="#9ca3af"
            value={cost} onChangeText={setCost} keyboardType="decimal-pad" />
          <Text style={mLabel}>Notes</Text>
          <TextInput style={[mInput, { minHeight: 70, textAlignVertical: "top" }]}
            placeholder="Additional notes" placeholderTextColor="#9ca3af"
            value={notes} onChangeText={setNotes} multiline numberOfLines={3} />
        </ScrollView>
      </View>
    </Modal>
  );
}

function HarvestModal({ visible, plantingId, onClose, onSuccess }: any) {
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [quality, setQuality] = useState("GOOD");
  const [soldQuantity, setSoldQuantity] = useState("");
  const [soldPrice, setSoldPrice] = useState("");
  const [buyer, setBuyer] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!quantity) {
      Alert.alert("Error", "Quantity is required");
      return;
    }
    setLoading(true);
    try {
      await createCropHarvest(plantingId, {
        quantity: parseFloat(quantity),
        unit,
        quality,
        harvestDate: new Date().toISOString(),
        soldQuantity: soldQuantity ? parseFloat(soldQuantity) : undefined,
        soldPrice: soldPrice ? parseFloat(soldPrice) : undefined,
        buyer: buyer || undefined,
        notes: notes || undefined,
      });
      Alert.alert("Success", "Harvest recorded");
      setQuantity(""); setSoldQuantity(""); setSoldPrice(""); setBuyer(""); setNotes("");
      onSuccess();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <ModalHeader title="Record Harvest" onClose={onClose} onSave={handleSubmit} loading={loading} />
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 2 }}>
              <Text style={mLabel}>Quantity</Text>
              <TextInput style={mInput} placeholder="0" placeholderTextColor="#9ca3af"
                value={quantity} onChangeText={setQuantity} keyboardType="decimal-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={mLabel}>Unit</Text>
              <TextInput style={mInput} placeholder="kg" placeholderTextColor="#9ca3af"
                value={unit} onChangeText={setUnit} />
            </View>
          </View>
          <Text style={mLabel}>Quality</Text>
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
            {HARVEST_QUALITY.map((q) => {
              const active = quality === q;
              const colors: Record<string, string> = {
                EXCELLENT: "#16a34a", GOOD: "#22c55e", FAIR: "#f59e0b", POOR: "#ef4444",
              };
              return (
                <TouchableOpacity key={q} onPress={() => setQuality(q)} style={{
                  paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
                  backgroundColor: active ? colors[q] : "#f3f4f6",
                }}>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: active ? "white" : "#6b7280" }}>{q}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#374151", marginBottom: 8 }}>SALE INFO (optional)</Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={mLabel}>Sold Qty</Text>
              <TextInput style={mInput} placeholder="0" placeholderTextColor="#9ca3af"
                value={soldQuantity} onChangeText={setSoldQuantity} keyboardType="decimal-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={mLabel}>Price / unit (ZMW)</Text>
              <TextInput style={mInput} placeholder="0.00" placeholderTextColor="#9ca3af"
                value={soldPrice} onChangeText={setSoldPrice} keyboardType="decimal-pad" />
            </View>
          </View>
          <Text style={mLabel}>Buyer</Text>
          <TextInput style={mInput} placeholder="Buyer name" placeholderTextColor="#9ca3af"
            value={buyer} onChangeText={setBuyer} />
          <Text style={mLabel}>Notes</Text>
          <TextInput style={[mInput, { minHeight: 70, textAlignVertical: "top" }]}
            placeholder="Additional notes" placeholderTextColor="#9ca3af"
            value={notes} onChangeText={setNotes} multiline numberOfLines={3} />
        </ScrollView>
      </View>
    </Modal>
  );
}

function SprayModal({ visible, plantingId, editingPlan, onClose, onSuccess }: any) {
  const [name, setName] = useState("");
  const [pesticide, setPesticide] = useState("");
  const [targetPest, setTargetPest] = useState("");
  const [dosage, setDosage] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    if (editingPlan) {
      setName(editingPlan.name || "");
      setPesticide(editingPlan.pesticide || "");
      setTargetPest(editingPlan.targetPest || "");
      setDosage(editingPlan.dosage || "");
      setScheduledDate(editingPlan.scheduledDate ? editingPlan.scheduledDate.slice(0, 10) : "");
      setNotes(editingPlan.notes || "");
    } else {
      setName(""); setPesticide(""); setTargetPest(""); setDosage(""); setScheduledDate(""); setNotes("");
    }
  }, [editingPlan, visible]);

  async function handleSubmit() {
    if (!name || !pesticide || !dosage) {
      Alert.alert("Error", "Name, pesticide, and dosage are required");
      return;
    }
    if (scheduledDate && isNaN(new Date(scheduledDate).getTime())) {
      Alert.alert("Error", "Scheduled date must be in YYYY-MM-DD format");
      return;
    }
    setLoading(true);
    try {
      if (editingPlan) {
        await updateSprayPlan(plantingId, editingPlan.id, {
          name,
          pesticide,
          targetPest: targetPest || undefined,
          dosage,
          scheduledDate: scheduledDate ? new Date(scheduledDate).toISOString() : undefined,
          notes: notes || undefined,
        });
        Alert.alert("Success", "Spray plan updated");
      } else {
        const scheduled = scheduledDate ? new Date(scheduledDate) : new Date(Date.now() + 7 * 86400000);
        await createCropSprayPlan(plantingId, {
          name,
          pesticide,
          targetPest: targetPest || undefined,
          dosage,
          scheduledDate: scheduled.toISOString(),
          notes: notes || undefined,
        });
        Alert.alert("Success", "Spray plan created");
        setName(""); setPesticide(""); setTargetPest(""); setDosage(""); setNotes(""); setScheduledDate("");
      }
      onSuccess();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <ModalHeader title={editingPlan ? "Edit Spray Plan" : "Add Spray Plan"} onClose={onClose} onSave={handleSubmit} loading={loading} />
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text style={mLabel}>Plan Name</Text>
          <TextInput style={mInput} placeholder="e.g. Week 3 Pest Control" placeholderTextColor="#9ca3af"
            value={name} onChangeText={setName} />
          <Text style={mLabel}>Pesticide / Chemical</Text>
          <TextInput style={mInput} placeholder="e.g. Karate 2.5EC" placeholderTextColor="#9ca3af"
            value={pesticide} onChangeText={setPesticide} />
          <Text style={mLabel}>Target Pest / Disease</Text>
          <TextInput style={mInput} placeholder="e.g. Fall Armyworm, Aphids" placeholderTextColor="#9ca3af"
            value={targetPest} onChangeText={setTargetPest} />
          <Text style={mLabel}>Dosage</Text>
          <TextInput style={mInput} placeholder="e.g. 50ml per 20L water" placeholderTextColor="#9ca3af"
            value={dosage} onChangeText={setDosage} />
          <Text style={mLabel}>Scheduled Date</Text>
          <TextInput style={mInput} placeholder="YYYY-MM-DD" placeholderTextColor="#9ca3af"
            value={scheduledDate} onChangeText={setScheduledDate} />
          <Text style={mLabel}>Notes / Instructions</Text>
          <TextInput style={[mInput, { minHeight: 70, textAlignVertical: "top" }]}
            placeholder="Safety notes, timing, etc." placeholderTextColor="#9ca3af"
            value={notes} onChangeText={setNotes} multiline numberOfLines={3} />
        </ScrollView>
      </View>
    </Modal>
  );
}

function StatusModal({ visible, current, currentHealth, plantingId, onClose, onSuccess }: any) {
  const [status, setStatus] = useState(current);
  const [health, setHealth] = useState(currentHealth);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      await updateCrop(plantingId, { status, health });
      onSuccess();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <ModalHeader title="Update Status" onClose={onClose} onSave={handleSave} loading={loading} />
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text style={mLabel}>Planting Status</Text>
          <View style={{ gap: 8, marginBottom: 20 }}>
            {PLANTING_STATUSES.map((s) => {
              const sc = STATUS_CONFIG[s];
              const active = status === s;
              return (
                <TouchableOpacity key={s} onPress={() => setStatus(s)} style={{
                  flexDirection: "row", alignItems: "center", padding: 14,
                  borderRadius: 12, borderWidth: 1,
                  borderColor: active ? sc.color : "#e5e7eb",
                  backgroundColor: active ? sc.bg : "white",
                }}>
                  <Ionicons
                    name={active ? "radio-button-on" : "radio-button-off"}
                    size={20} color={active ? sc.color : "#9ca3af"}
                  />
                  <Text style={{ marginLeft: 12, fontSize: 15, fontWeight: "600", color: active ? sc.color : "#374151" }}>
                    {sc.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={mLabel}>Crop Health</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {HEALTH_OPTIONS.map((h) => {
              const color = HEALTH_COLORS[h];
              const active = health === h;
              return (
                <TouchableOpacity key={h} onPress={() => setHealth(h)} style={{
                  paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10,
                  backgroundColor: active ? color : "#f3f4f6",
                }}>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: active ? "white" : "#6b7280" }}>{h}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

function ModalHeader({
  title, onClose, onSave, loading,
}: {
  title: string; onClose: () => void; onSave: () => void; loading: boolean;
}) {
  return (
    <View style={{
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      paddingHorizontal: 16, paddingVertical: 16,
      borderBottomWidth: 1, borderBottomColor: "#f3f4f6",
    }}>
      <TouchableOpacity onPress={onClose}>
        <Text style={{ color: "#16a34a", fontSize: 16 }}>Cancel</Text>
      </TouchableOpacity>
      <Text style={{ fontSize: 17, fontWeight: "700" }}>{title}</Text>
      <TouchableOpacity onPress={onSave} disabled={loading}>
        {loading
          ? <ActivityIndicator size="small" color="#16a34a" />
          : <Text style={{ color: "#16a34a", fontSize: 16, fontWeight: "600" }}>Save</Text>
        }
      </TouchableOpacity>
    </View>
  );
}

const mLabel = { fontSize: 13, fontWeight: "600" as const, color: "#374151", marginBottom: 6 };
const mInput = {
  backgroundColor: "#f9fafb", borderWidth: 1, borderColor: "#e5e7eb",
  borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
  fontSize: 15, color: "#111827", marginBottom: 14,
};
