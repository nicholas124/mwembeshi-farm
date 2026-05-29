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
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { getGoat, deleteGoat, updateGoat } from "../../lib/api";

type ModalType = "weight" | "treatment" | "production" | null;

export default function GoatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<"info" | "health" | "lineage" | "weights">("info");
  const [modal, setModal] = useState<ModalType>(null);
  const queryClient = useQueryClient();

  const { data: goat, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["goat", id],
    queryFn: () => getGoat(id!),
    enabled: !!id,
  });

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

  async function handleDelete() {
    Alert.alert(
      "Remove Goat",
      `Mark ${goat?.name || goat?.tag} as deceased?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteGoat(id!);
              queryClient.invalidateQueries({ queryKey: ["goats"] });
              router.back();
            } catch (e: any) {
              Alert.alert("Error", e.message);
            }
          },
        },
      ]
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  if (!goat) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-400">Goat not found</Text>
      </View>
    );
  }

  const isFemale = goat.gender === "FEMALE";

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#16a34a" />
        }
      >
        {/* Profile Header */}
        <View className="bg-white p-5 border-b border-gray-100">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Ionicons
                  name={isFemale ? "female" : "male"}
                  size={20}
                  color={isFemale ? "#ec4899" : "#3b82f6"}
                />
                <Text className="text-2xl font-bold text-gray-900">
                  {goat.name || goat.tag}
                </Text>
              </View>
              {goat.name && (
                <Text className="text-sm text-gray-400 mt-0.5">Tag: #{goat.tag}</Text>
              )}
            </View>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => router.push(`/goats/edit/${id}`)}
                className="bg-primary-50 p-2.5 rounded-xl"
              >
                <Ionicons name="create-outline" size={20} color="#16a34a" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDelete}
                className="bg-red-50 p-2.5 rounded-xl"
              >
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Stats */}
          <View className="flex-row mt-4 gap-3">
            <InfoChip label="Breed" value={goat.breed} />
            <InfoChip label="Age" value={getAge(goat.dateOfBirth)} />
            {goat.weight && <InfoChip label="Weight" value={`${goat.weight}kg`} />}
            <InfoChip label="Status" value={goat.status} />
          </View>
        </View>

        {/* Quick Actions */}
        <View className="flex-row px-4 py-3 gap-2">
          <QuickAction icon="scale-outline" label="Weight" color="#3b82f6" onPress={() => setModal("weight")} />
          <QuickAction icon="medkit-outline" label="Treatment" color="#8b5cf6" onPress={() => setModal("treatment")} />
          {isFemale && (
            <QuickAction icon="beaker-outline" label="Milk" color="#ec4899" onPress={() => setModal("production")} />
          )}
        </View>

        {/* Tabs */}
        <View className="flex-row bg-white border-b border-gray-100 px-4">
          {(["info", "health", "lineage", "weights"] as const).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setActiveTab(t)}
              className={`flex-1 py-3 items-center border-b-2 ${
                activeTab === t ? "border-primary-600" : "border-transparent"
              }`}
            >
              <Text className={`text-sm font-medium capitalize ${
                activeTab === t ? "text-primary-600" : "text-gray-400"
              }`}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View className="p-4">
          {activeTab === "info" && <InfoTab goat={goat} />}
          {activeTab === "health" && <HealthTab treatments={goat.treatments || []} formatDate={formatDate} />}
          {activeTab === "lineage" && <LineageTab goat={goat} />}
          {activeTab === "weights" && <WeightsTab weights={goat.weightRecords || []} formatDate={formatDate} />}
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
        }}
      />
    </View>
  );
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <View className="bg-gray-50 px-3 py-1.5 rounded-lg">
      <Text className="text-xs text-gray-400">{label}</Text>
      <Text className="text-sm font-semibold text-gray-700">{value}</Text>
    </View>
  );
}

function QuickAction({
  icon,
  label,
  color,
  onPress,
}: {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 bg-white rounded-xl p-3 items-center border border-gray-100"
      activeOpacity={0.7}
    >
      <Ionicons name={icon as any} size={22} color={color} />
      <Text className="text-xs text-gray-600 mt-1">{label}</Text>
    </TouchableOpacity>
  );
}

function InfoTab({ goat }: { goat: any }) {
  return (
    <View className="bg-white rounded-2xl p-4 border border-gray-100">
      <DetailRow label="Color/Markings" value={goat.color || "Not recorded"} />
      <DetailRow label="Acquisition" value={goat.acquisitionMethod} />
      {goat.purchasePrice && <DetailRow label="Purchase Price" value={`K${goat.purchasePrice}`} />}
      <DetailRow label="Date of Birth" value={goat.dateOfBirth ? new Date(goat.dateOfBirth).toLocaleDateString() : "Unknown"} />
      {goat.notes && <DetailRow label="Notes" value={goat.notes} />}
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-2.5 border-b border-gray-50">
      <Text className="text-sm text-gray-500">{label}</Text>
      <Text className="text-sm font-medium text-gray-900 text-right flex-1 ml-4">{value}</Text>
    </View>
  );
}

function HealthTab({ treatments, formatDate }: { treatments: any[]; formatDate: (d: string) => string }) {
  if (treatments.length === 0) {
    return (
      <View className="items-center py-10">
        <Ionicons name="medkit-outline" size={36} color="#d1d5db" />
        <Text className="text-gray-400 mt-2">No treatments recorded</Text>
      </View>
    );
  }
  return (
    <View>
      {treatments.map((t: any) => (
        <View key={t.id} className="bg-white rounded-xl p-3 mb-2 border border-gray-100">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-primary-600">{t.type}</Text>
            <Text className="text-xs text-gray-400">{formatDate(t.treatmentDate)}</Text>
          </View>
          {t.description && <Text className="text-sm text-gray-600 mt-0.5">{t.description}</Text>}
          {t.medication && (
            <Text className="text-xs text-gray-400 mt-0.5">
              {t.medication} {t.dosage ? `(${t.dosage})` : ""}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

function LineageTab({ goat }: { goat: any }) {
  return (
    <View>
      <View className="flex-row gap-3 mb-4">
        <View className="flex-1 bg-white rounded-xl p-3 border border-gray-100">
          <Text className="text-xs text-gray-400 mb-1">Dam (Mother)</Text>
          {goat.mother ? (
            <TouchableOpacity onPress={() => router.push(`/goats/${goat.mother.id}`)}>
              <Text className="text-sm font-semibold text-primary-600">
                {goat.mother.name || goat.mother.tag}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text className="text-sm text-gray-400">Unknown</Text>
          )}
        </View>
        <View className="flex-1 bg-white rounded-xl p-3 border border-gray-100">
          <Text className="text-xs text-gray-400 mb-1">Sire (Father)</Text>
          {goat.father ? (
            <TouchableOpacity onPress={() => router.push(`/goats/${goat.father.id}`)}>
              <Text className="text-sm font-semibold text-primary-600">
                {goat.father.name || goat.father.tag}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text className="text-sm text-gray-400">Unknown</Text>
          )}
        </View>
      </View>
      {goat.offspring?.length > 0 ? (
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Offspring ({goat.offspring.length})
          </Text>
          {goat.offspring.map((o: any) => (
            <TouchableOpacity
              key={o.id}
              onPress={() => router.push(`/goats/${o.id}`)}
              className="bg-white rounded-xl p-3 mb-2 border border-gray-100 flex-row items-center justify-between"
            >
              <View>
                <Text className="text-sm font-medium text-gray-900">{o.name || o.tag}</Text>
                <Text className="text-xs text-gray-400">{o.breed} - {o.gender}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View className="items-center py-6">
          <Text className="text-gray-400 text-sm">No offspring recorded</Text>
        </View>
      )}
    </View>
  );
}

function WeightsTab({ weights, formatDate }: { weights: any[]; formatDate: (d: string) => string }) {
  if (weights.length === 0) {
    return (
      <View className="items-center py-10">
        <Ionicons name="scale-outline" size={36} color="#d1d5db" />
        <Text className="text-gray-400 mt-2">No weight records</Text>
      </View>
    );
  }
  return (
    <View>
      {weights.map((w: any) => (
        <View key={w.id} className="bg-white rounded-xl p-3 mb-2 border border-gray-100 flex-row items-center justify-between">
          <View>
            <Text className="text-lg font-bold text-gray-900">{w.weight} kg</Text>
            <Text className="text-xs text-gray-400">{formatDate(w.recordedAt)}</Text>
          </View>
          {w.notes && <Text className="text-xs text-gray-500 flex-1 ml-4 text-right">{w.notes}</Text>}
        </View>
      ))}
    </View>
  );
}

function RecordModal({
  type,
  goatId,
  onClose,
  onSuccess,
}: {
  type: ModalType;
  goatId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");
  const [treatmentType, setTreatmentType] = useState("CHECKUP");
  const [medication, setMedication] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    try {
      if (type === "weight") {
        await updateGoat(goatId, {
          addWeight: { weight: parseFloat(value), notes },
        });
      } else if (type === "treatment") {
        const { createTreatment } = await import("../../lib/api");
        await createTreatment({
          animalIds: [goatId],
          type: treatmentType,
          description: notes,
          medication,
          treatmentDate: new Date().toISOString(),
        });
      } else if (type === "production") {
        await updateGoat(goatId, {
          addProduction: { type: "MILK", quantity: parseFloat(value), unit: "liters", notes },
        });
      }
      Alert.alert("Success", "Record saved");
      setValue("");
      setNotes("");
      setMedication("");
      onSuccess();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={type !== null} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100">
          <TouchableOpacity onPress={onClose}>
            <Text className="text-primary-600 text-base">Cancel</Text>
          </TouchableOpacity>
          <Text className="text-lg font-bold capitalize">Record {type}</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#16a34a" />
            ) : (
              <Text className="text-primary-600 text-base font-semibold">Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
          {type === "weight" && (
            <>
              <Text className="text-sm font-medium text-gray-700 mb-1.5">Weight (kg)</Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-3 mb-3 text-base bg-gray-50"
                placeholder="e.g. 45.5"
                value={value}
                onChangeText={setValue}
                keyboardType="decimal-pad"
                autoFocus
              />
            </>
          )}

          {type === "treatment" && (
            <>
              <Text className="text-sm font-medium text-gray-700 mb-2">Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                <View className="flex-row gap-2">
                  {["CHECKUP", "VACCINATION", "DEWORMING", "MEDICATION", "INJURY"].map((t) => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setTreatmentType(t)}
                      className={`px-3 py-2 rounded-lg ${
                        treatmentType === t ? "bg-primary-600" : "bg-gray-100"
                      }`}
                    >
                      <Text className={`text-xs font-medium ${
                        treatmentType === t ? "text-white" : "text-gray-600"
                      }`}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              <Text className="text-sm font-medium text-gray-700 mb-1.5">Medication</Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-3 mb-3 text-base bg-gray-50"
                placeholder="Medication name"
                value={medication}
                onChangeText={setMedication}
              />
            </>
          )}

          {type === "production" && (
            <>
              <Text className="text-sm font-medium text-gray-700 mb-1.5">Quantity (liters)</Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-3 mb-3 text-base bg-gray-50"
                placeholder="e.g. 2.5"
                value={value}
                onChangeText={setValue}
                keyboardType="decimal-pad"
                autoFocus
              />
            </>
          )}

          <Text className="text-sm font-medium text-gray-700 mb-1.5">Notes</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-base bg-gray-50"
            placeholder="Optional notes"
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </ScrollView>
      </View>
    </Modal>
  );
}
