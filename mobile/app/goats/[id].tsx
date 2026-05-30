import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Image,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import {
  getGoat, updateGoat, createTreatment,
  createSale, createMortality, createAssessment,
  uploadGoatPhoto, deleteGoatPhoto,
} from "../../lib/api";

type TabType = "info" | "health" | "weights" | "assess" | "lineage";
type ModalType = "weight" | "treatment" | "sell" | "dead" | "assess" | null;

const DEATH_CAUSES = [
  { value: "DISEASE", label: "Disease" },
  { value: "PARASITES", label: "Parasites" },
  { value: "PREDATOR", label: "Predator" },
  { value: "ACCIDENT", label: "Accident" },
  { value: "POISONING", label: "Poisoning" },
  { value: "BIRTHING_COMPLICATIONS", label: "Birth Complications" },
  { value: "OLD_AGE", label: "Old Age" },
  { value: "UNKNOWN", label: "Unknown" },
];

const SALE_TYPES = [
  { value: "DIRECT", label: "Direct" },
  { value: "MARKET", label: "Market" },
  { value: "ABATTOIR", label: "Abattoir" },
  { value: "AUCTION", label: "Auction" },
];

function getAge(dob: string) {
  if (!dob) return "Unknown";
  const months = Math.floor(
    (Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  );
  if (months < 12) return `${months} month${months !== 1 ? "s" : ""}`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years}y ${rem}m` : `${years} year${years !== 1 ? "s" : ""}`;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function GoatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabType>("info");
  const [modal, setModal] = useState<ModalType>(null);
  const queryClient = useQueryClient();

  const [photoUploading, setPhotoUploading] = useState(false);

  async function handlePhotoChange() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow access to your photo library to add a goat photo.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });
    if (result.canceled || !result.assets[0].base64) return;
    const { base64, mimeType } = result.assets[0];
    setPhotoUploading(true);
    try {
      await uploadGoatPhoto(id!, base64!, mimeType || "image/jpeg");
      queryClient.invalidateQueries({ queryKey: ["goat", id] });
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setPhotoUploading(false);
    }
  }

  async function handlePhotoDelete() {
    Alert.alert("Remove Photo", "Remove this goat's photo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove", style: "destructive",
        onPress: async () => {
          try {
            await deleteGoatPhoto(id!);
            queryClient.invalidateQueries({ queryKey: ["goat", id] });
          } catch (e: any) {
            Alert.alert("Error", e.message);
          }
        },
      },
    ]);
  }

  const { data: goatResponse, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["goat", id],
    queryFn: () => getGoat(id!),
    enabled: !!id,
  });

  const goat = goatResponse?.data;

  const offspring = [
    ...(goat?.offspringAsMother || []),
    ...(goat?.offspringAsFather || []),
  ];
  const currentPen = goat?.penAssignments?.[0]?.pen;

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "white" }}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  if (!goat) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "white" }}>
        <Text style={{ color: "#9ca3af" }}>Goat not found</Text>
      </View>
    );
  }

  const isFemale = goat.gender === "FEMALE";
  const isActive = goat.status === "ACTIVE";

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#16a34a" />}
      >
        {/* Profile Header */}
        <View style={{ backgroundColor: "white", padding: 20, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            {/* Photo avatar */}
            <TouchableOpacity onPress={handlePhotoChange} activeOpacity={0.8} style={{ marginRight: 16 }}>
              {photoUploading ? (
                <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: "#f3f4f6", alignItems: "center", justifyContent: "center" }}>
                  <ActivityIndicator size="small" color="#16a34a" />
                </View>
              ) : goat.photo ? (
                <View>
                  <Image source={{ uri: goat.photo }} style={{ width: 72, height: 72, borderRadius: 36 }} />
                  <TouchableOpacity
                    onPress={(e) => { e.stopPropagation?.(); handlePhotoDelete(); }}
                    style={{ position: "absolute", top: -4, right: -4, backgroundColor: "#ef4444", borderRadius: 10, width: 20, height: 20, alignItems: "center", justifyContent: "center" }}
                  >
                    <Ionicons name="close" size={12} color="white" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: isFemale ? "#fdf2f8" : "#eff6ff", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: isFemale ? "#fbcfe8" : "#bfdbfe", borderStyle: "dashed" }}>
                  <Ionicons name="camera-outline" size={24} color={isFemale ? "#ec4899" : "#3b82f6"} />
                </View>
              )}
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons
                  name={isFemale ? "female" : "male"}
                  size={20}
                  color={isFemale ? "#ec4899" : "#3b82f6"}
                />
                <Text style={{ fontSize: 22, fontWeight: "800", color: "#111827" }}>
                  {goat.name || goat.tag}
                </Text>
              </View>
              {goat.name && (
                <Text style={{ fontSize: 13, color: "#9ca3af", marginTop: 2 }}>Tag: #{goat.tag}</Text>
              )}
              {currentPen && (
                <TouchableOpacity
                  onPress={() => router.push(`/pens/${currentPen.id}` as any)}
                  style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}
                >
                  <Ionicons name="grid-outline" size={13} color="#16a34a" />
                  <Text style={{ fontSize: 12, color: "#16a34a", fontWeight: "600" }}>{currentPen.name}</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                onPress={() => router.push(`/goats/edit/${id}`)}
                style={{ backgroundColor: "#f0fdf4", padding: 10, borderRadius: 12 }}
              >
                <Ionicons name="create-outline" size={20} color="#16a34a" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Status chips */}
          <View style={{ flexDirection: "row", marginTop: 14, gap: 8, flexWrap: "wrap" }}>
            <InfoChip label="Breed" value={goat.breed || "Unknown"} />
            <InfoChip label="Age" value={getAge(goat.dateOfBirth)} />
            {goat.weight && <InfoChip label="Weight" value={`${goat.weight}kg`} />}
            <InfoChip
              label="Status"
              value={goat.status}
              color={goat.status === "ACTIVE" ? "#16a34a" : goat.status === "SOLD" ? "#0ea5e9" : "#6b7280"}
            />
          </View>
        </View>

        {/* Quick Actions */}
        {isActive && (
          <View style={{ flexDirection: "row", paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}>
            <QuickAction icon="scale-outline" label="Weight" color="#3b82f6" onPress={() => setModal("weight")} />
            <QuickAction icon="medkit-outline" label="Treatment" color="#8b5cf6" onPress={() => setModal("treatment")} />
            <QuickAction icon="body-outline" label="Assess" color="#f59e0b" onPress={() => setModal("assess")} />
            <QuickAction icon="cash-outline" label="Sell" color="#16a34a" onPress={() => setModal("sell")} />
            <QuickAction icon="skull-outline" label="Deceased" color="#ef4444" onPress={() => setModal("dead")} />
          </View>
        )}

        {/* Tabs */}
        <View style={{ flexDirection: "row", backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: "#f3f4f6" }}>
          {(["info", "health", "weights", "assess", "lineage"] as TabType[]).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setActiveTab(t)}
              style={{
                flex: 1, paddingVertical: 12, alignItems: "center",
                borderBottomWidth: 2,
                borderBottomColor: activeTab === t ? "#16a34a" : "transparent",
              }}
            >
              <Text style={{
                fontSize: 11, fontWeight: "600", textTransform: "capitalize",
                color: activeTab === t ? "#16a34a" : "#9ca3af",
              }}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View style={{ padding: 16 }}>
          {activeTab === "info" && <InfoTab goat={goat} currentPen={currentPen} />}
          {activeTab === "health" && <HealthTab treatments={goat.treatments || []} />}
          {activeTab === "weights" && <WeightsTab weights={goat.weights || []} />}
          {activeTab === "assess" && (
            <AssessTab
              bcs={goat.bodyConditionScores || []}
              famacha={goat.famachaScores || []}
            />
          )}
          {activeTab === "lineage" && <LineageTab goat={goat} offspring={offspring} />}
        </View>
      </ScrollView>

      {/* Modals */}
      <RecordModal
        type={modal}
        goatId={id!}
        onClose={() => setModal(null)}
        onSuccess={() => {
          setModal(null);
          queryClient.invalidateQueries({ queryKey: ["goat", id] });
          queryClient.invalidateQueries({ queryKey: ["goats-dashboard"] });
        }}
      />
    </View>
  );
}

function InfoChip({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={{ backgroundColor: "#f9fafb", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 }}>
      <Text style={{ fontSize: 10, color: "#9ca3af" }}>{label}</Text>
      <Text style={{ fontSize: 13, fontWeight: "600", color: color || "#374151" }}>{value}</Text>
    </View>
  );
}

function QuickAction({ icon, label, color, onPress }: {
  icon: string; label: string; color: string; onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flex: 1, backgroundColor: "white", borderRadius: 12, padding: 10,
        alignItems: "center", borderWidth: 1, borderColor: "#f3f4f6",
      }}
    >
      <Ionicons name={icon as any} size={20} color={color} />
      <Text style={{ fontSize: 10, color: "#6b7280", marginTop: 4 }}>{label}</Text>
    </TouchableOpacity>
  );
}

function InfoTab({ goat, currentPen }: { goat: any; currentPen: any }) {
  return (
    <View style={{ backgroundColor: "white", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f3f4f6" }}>
      <DetailRow label="Breed" value={goat.breed || "Not recorded"} />
      <DetailRow label="Color/Markings" value={goat.color || "Not recorded"} />
      <DetailRow label="Acquisition" value={goat.acquisitionMethod || "Unknown"} />
      {goat.purchasePrice && <DetailRow label="Purchase Price" value={`ZMW ${goat.purchasePrice}`} />}
      <DetailRow label="Date of Birth" value={goat.dateOfBirth ? new Date(goat.dateOfBirth).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Unknown"} />
      {currentPen && <DetailRow label="Current Pen" value={currentPen.name} />}
      {goat.notes && <DetailRow label="Notes" value={goat.notes} />}
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f9fafb" }}>
      <Text style={{ fontSize: 13, color: "#6b7280" }}>{label}</Text>
      <Text style={{ fontSize: 13, fontWeight: "600", color: "#111827", textAlign: "right", flex: 1, marginLeft: 16 }}>{value}</Text>
    </View>
  );
}

function HealthTab({ treatments }: { treatments: any[] }) {
  if (treatments.length === 0) {
    return (
      <View style={{ alignItems: "center", paddingVertical: 40 }}>
        <Ionicons name="medkit-outline" size={36} color="#d1d5db" />
        <Text style={{ color: "#9ca3af", marginTop: 8 }}>No treatments recorded</Text>
      </View>
    );
  }
  return (
    <View>
      {treatments.map((t: any) => (
        <View key={t.id} style={{ backgroundColor: "white", borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: "#f3f4f6" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#16a34a" }}>{t.type}</Text>
            <Text style={{ fontSize: 11, color: "#9ca3af" }}>{formatDate(t.treatmentDate)}</Text>
          </View>
          {t.description && <Text style={{ fontSize: 13, color: "#6b7280", marginTop: 3 }}>{t.description}</Text>}
          {t.medication && (
            <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
              {t.medication}{t.dosage ? ` (${t.dosage})` : ""}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

function WeightsTab({ weights }: { weights: any[] }) {
  if (weights.length === 0) {
    return (
      <View style={{ alignItems: "center", paddingVertical: 40 }}>
        <Ionicons name="scale-outline" size={36} color="#d1d5db" />
        <Text style={{ color: "#9ca3af", marginTop: 8 }}>No weight records</Text>
      </View>
    );
  }
  return (
    <View>
      {weights.map((w: any, i: number) => {
        const prev = weights[i + 1];
        const diff = prev ? (w.weight - prev.weight).toFixed(1) : null;
        return (
          <View key={w.id} style={{ backgroundColor: "white", borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: "#f3f4f6", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View>
              <Text style={{ fontSize: 22, fontWeight: "800", color: "#111827" }}>{w.weight} kg</Text>
              <Text style={{ fontSize: 11, color: "#9ca3af" }}>{formatDate(w.recordedAt)}</Text>
            </View>
            {diff && (
              <View style={{ backgroundColor: parseFloat(diff) >= 0 ? "#f0fdf4" : "#fef2f2", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                <Text style={{ fontSize: 13, fontWeight: "700", color: parseFloat(diff) >= 0 ? "#16a34a" : "#dc2626" }}>
                  {parseFloat(diff) >= 0 ? "+" : ""}{diff}kg
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

function AssessTab({ bcs, famacha }: { bcs: any[]; famacha: any[] }) {
  const BCS_COLORS = ["", "#dc2626", "#f97316", "#eab308", "#84cc16", "#16a34a"];
  const FAM_COLORS = ["", "#16a34a", "#84cc16", "#eab308", "#f97316", "#dc2626"];

  if (bcs.length === 0 && famacha.length === 0) {
    return (
      <View style={{ alignItems: "center", paddingVertical: 40 }}>
        <Ionicons name="body-outline" size={36} color="#d1d5db" />
        <Text style={{ color: "#9ca3af", marginTop: 8 }}>No assessments recorded</Text>
        <Text style={{ color: "#d1d5db", fontSize: 12, marginTop: 4 }}>Tap "Assess" above to record BCS or FAMACHA</Text>
      </View>
    );
  }

  // Merge and sort by date
  const combined = [
    ...bcs.map((b: any) => ({ ...b, kind: "BCS" })),
    ...famacha.map((f: any) => ({ ...f, kind: "FAMACHA" })),
  ].sort((a, b) => new Date(b.assessedAt).getTime() - new Date(a.assessedAt).getTime());

  return (
    <View>
      {combined.map((item: any) => {
        const isBCS = item.kind === "BCS";
        const score = isBCS ? item.score : item.score;
        const colors = isBCS ? BCS_COLORS : FAM_COLORS;
        return (
          <View key={item.id} style={{ backgroundColor: "white", borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: "#f3f4f6", flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: (colors[score] || "#6b7280") + "20", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
              <Text style={{ fontSize: 20, fontWeight: "800", color: colors[score] || "#6b7280" }}>{score}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827" }}>{item.kind}</Text>
                <View style={{ backgroundColor: (colors[score] || "#6b7280") + "20", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                  <Text style={{ fontSize: 11, fontWeight: "600", color: colors[score] || "#6b7280" }}>
                    {isBCS
                      ? ["", "Emaciated", "Thin", "Moderate", "Good", "Fat"][score]
                      : ["", "No anaemia", "Mild", "Moderate", "Severe", "Critical"][score]
                    }
                  </Text>
                </View>
              </View>
              <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{formatDate(item.assessedAt)}</Text>
              {item.notes && <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{item.notes}</Text>}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function LineageTab({ goat, offspring }: { goat: any; offspring: any[] }) {
  return (
    <View>
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
        <View style={{ flex: 1, backgroundColor: "white", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#f3f4f6" }}>
          <Text style={{ fontSize: 11, color: "#9ca3af", marginBottom: 4 }}>Dam (Mother)</Text>
          {goat.mother ? (
            <TouchableOpacity onPress={() => router.push(`/goats/${goat.mother.id}`)}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#16a34a" }}>{goat.mother.name || goat.mother.tag}</Text>
              <Text style={{ fontSize: 11, color: "#9ca3af" }}>{goat.mother.breed}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={{ fontSize: 13, color: "#9ca3af" }}>Unknown</Text>
          )}
        </View>
        <View style={{ flex: 1, backgroundColor: "white", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#f3f4f6" }}>
          <Text style={{ fontSize: 11, color: "#9ca3af", marginBottom: 4 }}>Sire (Father)</Text>
          {goat.father ? (
            <TouchableOpacity onPress={() => router.push(`/goats/${goat.father.id}`)}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#16a34a" }}>{goat.father.name || goat.father.tag}</Text>
              <Text style={{ fontSize: 11, color: "#9ca3af" }}>{goat.father.breed}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={{ fontSize: 13, color: "#9ca3af" }}>Unknown</Text>
          )}
        </View>
      </View>
      {offspring.length > 0 ? (
        <View>
          <Text style={{ fontSize: 14, fontWeight: "700", color: "#374151", marginBottom: 10 }}>Offspring ({offspring.length})</Text>
          {offspring.map((o: any) => (
            <TouchableOpacity
              key={o.id}
              onPress={() => router.push(`/goats/${o.id}`)}
              style={{ backgroundColor: "white", borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: "#f3f4f6", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
            >
              <View>
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}>{o.name || o.tag}</Text>
                <Text style={{ fontSize: 11, color: "#9ca3af" }}>{o.breed} · {o.gender}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={{ alignItems: "center", paddingVertical: 24 }}>
          <Text style={{ color: "#9ca3af", fontSize: 13 }}>No offspring recorded</Text>
        </View>
      )}
    </View>
  );
}

function RecordModal({
  type, goatId, onClose, onSuccess,
}: {
  type: ModalType; goatId: string; onClose: () => void; onSuccess: () => void;
}) {
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");
  const [treatmentType, setTreatmentType] = useState("CHECKUP");
  const [description, setDescription] = useState("");
  const [medication, setMedication] = useState("");
  const [dosage, setDosage] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [saleType, setSaleType] = useState("DIRECT");
  const [buyerName, setBuyerName] = useState("");
  const [deathCause, setDeathCause] = useState("UNKNOWN");
  const [bcsScore, setBcsScore] = useState(3);
  const [famachaScore, setFamachaScore] = useState(1);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    try {
      if (type === "weight") {
        if (!value) { Alert.alert("Error", "Enter a weight"); return; }
        await updateGoat(goatId, { addWeight: { weight: parseFloat(value), notes } });
        Alert.alert("Saved", "Weight recorded");

      } else if (type === "treatment") {
        await createTreatment({
          animalIds: [goatId],
          type: treatmentType,
          description: description || undefined,
          medication: medication || undefined,
          dosage: dosage || undefined,
          treatmentDate: new Date().toISOString(),
        });
        Alert.alert("Saved", "Treatment recorded");

      } else if (type === "sell") {
        if (!salePrice) { Alert.alert("Error", "Enter sale price"); return; }
        await createSale({
          animalId: goatId,
          salePrice,
          saleType,
          buyerName: buyerName || undefined,
          saleDate: new Date().toISOString().split("T")[0],
          notes,
        });
        Alert.alert("Sold", "Goat marked as sold");

      } else if (type === "dead") {
        await createMortality({
          animalId: goatId,
          cause: deathCause,
          causeDetails: notes || undefined,
          deathDate: new Date().toISOString().split("T")[0],
        });
        Alert.alert("Recorded", "Mortality recorded");

      } else if (type === "assess") {
        const now = new Date().toISOString();
        await Promise.all([
          createAssessment(goatId, { type: "BCS", score: bcsScore, notes: notes || undefined, assessedAt: now }),
          createAssessment(goatId, { type: "FAMACHA", score: famachaScore, notes: notes || undefined, assessedAt: now }),
        ]);
        Alert.alert("Saved", "Assessment recorded");
      }

      setValue(""); setNotes(""); setDescription(""); setMedication(""); setDosage(""); setSalePrice(""); setBuyerName("");
      setBcsScore(3); setFamachaScore(1); setDeathCause("UNKNOWN");
      onSuccess();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  }

  const titles: Record<string, string> = {
    weight: "Record Weight",
    treatment: "Add Treatment",
    sell: "Record Sale",
    dead: "Mark as Deceased",
    assess: "BCS / FAMACHA Assessment",
  };

  return (
    <Modal visible={type !== null} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" }}>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ fontSize: 15, color: "#6b7280" }}>Cancel</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}>{type ? titles[type] : ""}</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={loading}>
            {loading
              ? <ActivityIndicator size="small" color="#16a34a" />
              : <Text style={{ fontSize: 15, fontWeight: "700", color: type === "dead" ? "#dc2626" : type === "sell" ? "#16a34a" : "#16a34a" }}>Save</Text>
            }
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
          {/* Weight */}
          {type === "weight" && (
            <>
              <Text style={labelStyle}>Weight (kg)</Text>
              <TextInput
                style={inputStyle}
                placeholder="e.g. 45.5"
                placeholderTextColor="#9ca3af"
                value={value}
                onChangeText={setValue}
                keyboardType="decimal-pad"
                autoFocus
              />
              <Text style={labelStyle}>Notes (optional)</Text>
              <TextInput style={[inputStyle, { minHeight: 70, textAlignVertical: "top" }]}
                placeholder="Any notes..." placeholderTextColor="#9ca3af"
                value={notes} onChangeText={setNotes} multiline />
            </>
          )}

          {/* Treatment */}
          {type === "treatment" && (
            <>
              <Text style={labelStyle}>Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                {["CHECKUP", "VACCINATION", "DEWORMING", "MEDICATION", "INJURY", "SURGERY"].map(t => (
                  <TouchableOpacity key={t} onPress={() => setTreatmentType(t)}
                    style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: treatmentType === t ? "#16a34a" : "#f3f4f6", borderWidth: 1, borderColor: treatmentType === t ? "#16a34a" : "#e5e7eb" }}>
                    <Text style={{ fontSize: 12, fontWeight: "600", color: treatmentType === t ? "white" : "#6b7280" }}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={labelStyle}>Description (optional)</Text>
              <TextInput style={inputStyle} placeholder="e.g. Annual deworming round" placeholderTextColor="#9ca3af" value={description} onChangeText={setDescription} />
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={labelStyle}>Medication (optional)</Text>
                  <TextInput style={inputStyle} placeholder="e.g. Ivermectin" placeholderTextColor="#9ca3af" value={medication} onChangeText={setMedication} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={labelStyle}>Dosage (optional)</Text>
                  <TextInput style={inputStyle} placeholder="e.g. 5ml" placeholderTextColor="#9ca3af" value={dosage} onChangeText={setDosage} />
                </View>
              </View>
              <Text style={labelStyle}>Notes (optional)</Text>
              <TextInput style={[inputStyle, { minHeight: 70, textAlignVertical: "top" }]}
                placeholder="Additional observations..." placeholderTextColor="#9ca3af"
                value={notes} onChangeText={setNotes} multiline />
            </>
          )}

          {/* Sell */}
          {type === "sell" && (
            <>
              <Text style={labelStyle}>Sale Type</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                {SALE_TYPES.map(t => (
                  <TouchableOpacity key={t.value} onPress={() => setSaleType(t.value)}
                    style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: saleType === t.value ? "#16a34a" : "#f3f4f6", borderWidth: 1, borderColor: saleType === t.value ? "#16a34a" : "#e5e7eb" }}>
                    <Text style={{ fontSize: 12, fontWeight: "600", color: saleType === t.value ? "white" : "#6b7280" }}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={labelStyle}>Sale Price (ZMW) *</Text>
              <TextInput style={inputStyle} placeholder="0.00" placeholderTextColor="#9ca3af" keyboardType="decimal-pad" value={salePrice} onChangeText={setSalePrice} autoFocus />
              <Text style={labelStyle}>Buyer Name (optional)</Text>
              <TextInput style={inputStyle} placeholder="e.g. John Banda" placeholderTextColor="#9ca3af" value={buyerName} onChangeText={setBuyerName} />
              <Text style={labelStyle}>Notes</Text>
              <TextInput style={inputStyle} placeholder="Any notes..." placeholderTextColor="#9ca3af" value={notes} onChangeText={setNotes} />
            </>
          )}

          {/* Deceased */}
          {type === "dead" && (
            <>
              <View style={{ backgroundColor: "#fef2f2", borderRadius: 12, padding: 14, marginBottom: 16, flexDirection: "row", gap: 10 }}>
                <Ionicons name="warning" size={18} color="#dc2626" />
                <Text style={{ fontSize: 13, color: "#dc2626", flex: 1 }}>This will mark the goat as deceased and cannot be undone easily.</Text>
              </View>
              <Text style={labelStyle}>Cause of Death</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                {DEATH_CAUSES.map(c => (
                  <TouchableOpacity key={c.value} onPress={() => setDeathCause(c.value)}
                    style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: deathCause === c.value ? "#dc2626" : "#f3f4f6", borderWidth: 1, borderColor: deathCause === c.value ? "#dc2626" : "#e5e7eb" }}>
                    <Text style={{ fontSize: 12, fontWeight: "600", color: deathCause === c.value ? "white" : "#6b7280" }}>{c.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={labelStyle}>Details (optional)</Text>
              <TextInput style={[inputStyle, { minHeight: 70, textAlignVertical: "top" }]}
                placeholder="Describe what happened..." placeholderTextColor="#9ca3af"
                value={notes} onChangeText={setNotes} multiline />
            </>
          )}

          {/* BCS/FAMACHA Assessment */}
          {type === "assess" && (
            <>
              <Text style={labelStyle}>Body Condition Score (BCS)</Text>
              <Text style={{ fontSize: 12, color: "#9ca3af", marginBottom: 10 }}>1=Emaciated · 2=Thin · 3=Moderate · 4=Good · 5=Fat</Text>
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
                {[1, 2, 3, 4, 5].map(s => (
                  <TouchableOpacity key={s} onPress={() => setBcsScore(s)}
                    style={{ flex: 1, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: bcsScore === s ? "#16a34a" : "#f3f4f6", borderWidth: 2, borderColor: bcsScore === s ? "#16a34a" : "#e5e7eb" }}>
                    <Text style={{ fontSize: 18, fontWeight: "800", color: bcsScore === s ? "white" : "#374151" }}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={labelStyle}>FAMACHA Score</Text>
              <Text style={{ fontSize: 12, color: "#9ca3af", marginBottom: 10 }}>1=No anaemia · 2=Mild · 3=Moderate · 4=Severe · 5=Critical</Text>
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
                {[1, 2, 3, 4, 5].map(s => {
                  const colors = ["", "#16a34a", "#84cc16", "#eab308", "#f97316", "#dc2626"];
                  return (
                    <TouchableOpacity key={s} onPress={() => setFamachaScore(s)}
                      style={{ flex: 1, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: famachaScore === s ? colors[s] : "#f3f4f6", borderWidth: 2, borderColor: famachaScore === s ? colors[s] : "#e5e7eb" }}>
                      <Text style={{ fontSize: 18, fontWeight: "800", color: famachaScore === s ? "white" : "#374151" }}>{s}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {famachaScore >= 3 && (
                <View style={{ backgroundColor: "#fff7ed", borderRadius: 10, padding: 10, marginBottom: 12, flexDirection: "row", gap: 8 }}>
                  <Ionicons name="information-circle" size={16} color="#f59e0b" />
                  <Text style={{ fontSize: 12, color: "#92400e", flex: 1 }}>FAMACHA ≥ 3 will auto-schedule a deworming treatment.</Text>
                </View>
              )}
              <Text style={labelStyle}>Notes (optional)</Text>
              <TextInput style={inputStyle} placeholder="Observations..." placeholderTextColor="#9ca3af" value={notes} onChangeText={setNotes} />
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const labelStyle = {
  fontSize: 13,
  fontWeight: "600" as const,
  color: "#374151",
  marginBottom: 6,
};

const inputStyle = {
  backgroundColor: "#f9fafb",
  borderWidth: 1.5,
  borderColor: "#e5e7eb",
  borderRadius: 12,
  padding: 14,
  fontSize: 15,
  color: "#111827",
  marginBottom: 16,
};
