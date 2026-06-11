import { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
  ActivityIndicator, Modal, TextInput, Alert,
} from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../lib/auth-context";
import { getUsers, createUser, updateUser, deleteUser } from "../../lib/api";

const ROLES = [
  { value: "STAFF", label: "Staff" },
  { value: "SUPERVISOR", label: "Supervisor" },
  { value: "ADMIN", label: "Administrator" },
];

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  ADMIN: { bg: "#f5f3ff", text: "#7c3aed" },
  SUPERVISOR: { bg: "#eff6ff", text: "#2563eb" },
  STAFF: { bg: "#f3f4f6", text: "#6b7280" },
};

const emptyForm = { name: "", email: "", phone: "", role: "STAFF", password: "" };

export default function UsersScreen() {
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const { user: me } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["users"],
    queryFn: () => getUsers({ limit: "100" }),
  });

  const users: any[] = data?.users || [];

  function openCreate() {
    setEditingUser(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(u: any) {
    setEditingUser(u);
    setForm({ name: u.name, email: u.email, phone: u.phone || "", role: u.role, password: "" });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.email.trim()) {
      Alert.alert("Error", "Name and email are required");
      return;
    }
    if (!editingUser && form.password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters");
      return;
    }
    setSaving(true);
    try {
      if (editingUser) {
        const payload: any = { name: form.name, email: form.email, phone: form.phone || null, role: form.role };
        if (form.password) payload.password = form.password;
        await updateUser(editingUser.id, payload);
      } else {
        await createUser({ name: form.name, email: form.email, phone: form.phone || undefined, role: form.role, password: form.password });
      }
      qc.invalidateQueries({ queryKey: ["users"] });
      setShowModal(false);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(u: any) {
    try {
      await updateUser(u.id, { isActive: !u.isActive });
      qc.invalidateQueries({ queryKey: ["users"] });
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  }

  function handleDeactivate() {
    if (!editingUser) return;
    Alert.alert("Deactivate User", `Deactivate ${editingUser.name}? They will no longer be able to log in.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Deactivate",
        style: "destructive",
        onPress: async () => {
          setSaving(true);
          try {
            await deleteUser(editingUser.id);
            qc.invalidateQueries({ queryKey: ["users"] });
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
          <Text style={{ color: "white", fontSize: 20, fontWeight: "700" }}>User Accounts</Text>
          <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 1 }}>{users.length} user{users.length === 1 ? "" : "s"}</Text>
        </View>
        <TouchableOpacity onPress={openCreate} style={{ backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Ionicons name="add" size={18} color="white" />
          <Text style={{ color: "white", fontSize: 13, fontWeight: "600" }}>New User</Text>
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
          {users.length === 0 ? (
            <View style={{ alignItems: "center", paddingTop: 60 }}>
              <Ionicons name="people-outline" size={48} color="#d1d5db" />
              <Text style={{ color: "#9ca3af", marginTop: 12, fontSize: 15 }}>No users found</Text>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {users.map((u) => {
                const roleStyle = ROLE_COLORS[u.role] || ROLE_COLORS.STAFF;
                const isMe = u.id === me?.id;
                return (
                  <TouchableOpacity
                    key={u.id}
                    onPress={() => openEdit(u)}
                    activeOpacity={0.75}
                    style={{ backgroundColor: "white", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#f3f4f6", flexDirection: "row", alignItems: "center" }}
                  >
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#16a34a", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                      <Text style={{ color: "white", fontWeight: "700", fontSize: 14 }}>
                        {u.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827" }} numberOfLines={1}>{u.name}{isMe ? " (You)" : ""}</Text>
                      <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }} numberOfLines={1}>{u.email}</Text>
                      <View style={{ flexDirection: "row", gap: 6, marginTop: 6 }}>
                        <View style={{ backgroundColor: roleStyle.bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                          <Text style={{ fontSize: 11, fontWeight: "700", color: roleStyle.text }}>{u.role}</Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => toggleActive(u)}
                          disabled={isMe}
                          style={{
                            backgroundColor: u.isActive ? "#f0fdf4" : "#fef2f2",
                            paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8,
                            opacity: isMe ? 0.5 : 1,
                          }}
                        >
                          <Text style={{ fontSize: 11, fontWeight: "700", color: u.isActive ? "#16a34a" : "#dc2626" }}>
                            {u.isActive ? "Active" : "Inactive"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
                  </TouchableOpacity>
                );
              })}
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
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#111827", flex: 1 }}>{editingUser ? "Edit User" : "New User"}</Text>
            <TouchableOpacity onPress={handleSave} disabled={saving} style={{ backgroundColor: "#16a34a", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 }}>
              {saving ? <ActivityIndicator color="white" size="small" /> : <Text style={{ color: "white", fontWeight: "600" }}>{editingUser ? "Save" : "Create"}</Text>}
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Full Name *</Text>
            <TextInput
              style={inputStyle}
              placeholder="e.g. John Banda"
              placeholderTextColor="#9ca3af"
              value={form.name}
              onChangeText={v => setForm(f => ({ ...f, name: v }))}
            />
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Email Address *</Text>
            <TextInput
              style={inputStyle}
              placeholder="john@example.com"
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
              keyboardType="email-address"
              value={form.email}
              onChangeText={v => setForm(f => ({ ...f, email: v }))}
            />
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>Phone Number</Text>
            <TextInput
              style={inputStyle}
              placeholder="+260 97 123 4567"
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={v => setForm(f => ({ ...f, phone: v }))}
            />
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 8 }}>Role *</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {ROLES.map(r => {
                const disabled = !!editingUser && editingUser.id === me?.id;
                return (
                  <TouchableOpacity
                    key={r.value}
                    disabled={disabled}
                    onPress={() => setForm(f => ({ ...f, role: r.value }))}
                    style={{
                      paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                      backgroundColor: form.role === r.value ? "#16a34a" : "#f3f4f6",
                      borderWidth: 1, borderColor: form.role === r.value ? "#16a34a" : "#e5e7eb",
                      opacity: disabled ? 0.5 : 1,
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: "600", color: form.role === r.value ? "white" : "#6b7280" }}>{r.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {editingUser && editingUser.id === me?.id && (
              <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: -10, marginBottom: 16 }}>You cannot change your own role</Text>
            )}
            <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 }}>
              {editingUser ? "New Password (leave blank to keep current)" : "Password *"}
            </Text>
            <TextInput
              style={[inputStyle, { marginBottom: editingUser ? 24 : 16 }]}
              placeholder="Min 8 characters"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={form.password}
              onChangeText={v => setForm(f => ({ ...f, password: v }))}
            />
            {editingUser && editingUser.id !== me?.id && (
              <TouchableOpacity
                onPress={handleDeactivate}
                disabled={saving}
                style={{ borderWidth: 1.5, borderColor: "#fee2e2", borderRadius: 12, padding: 14, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}
              >
                <Ionicons name="ban-outline" size={18} color="#ef4444" />
                <Text style={{ color: "#ef4444", fontWeight: "700", fontSize: 14 }}>
                  {editingUser.isActive ? "Deactivate User" : "User is Inactive"}
                </Text>
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
