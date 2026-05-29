import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
  ScrollView,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../lib/auth-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function LoginScreen() {
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace("/(tabs)");
    } catch (e: any) {
      Alert.alert("Login Failed", e.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#14532d" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, backgroundColor: "#14532d" }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero section */}
          <View
            style={{
              alignItems: "center",
              paddingTop: insets.top + 40,
              paddingBottom: 40,
              paddingHorizontal: 28,
            }}
          >
            {/* Icon */}
            <View
              style={{
                width: 90,
                height: 90,
                borderRadius: 26,
                backgroundColor: "rgba(255,255,255,0.18)",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 18,
                borderWidth: 1.5,
                borderColor: "rgba(255,255,255,0.3)",
              }}
            >
              <Ionicons name="leaf" size={46} color="white" />
            </View>

            <Text
              style={{
                color: "white",
                fontSize: 26,
                fontWeight: "700",
                letterSpacing: 0.3,
              }}
            >
              Mwembeshi Farm
            </Text>
            <Text
              style={{
                color: "rgba(255,255,255,0.65)",
                fontSize: 14,
                marginTop: 5,
              }}
            >
              Farm Management System
            </Text>
          </View>

          {/* Form card */}
          <View
            style={{
              flex: 1,
              backgroundColor: "white",
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              paddingHorizontal: 28,
              paddingTop: 32,
              paddingBottom: insets.bottom + 32,
              minHeight: SCREEN_HEIGHT * 0.6,
            }}
          >
            <Text
              style={{
                fontSize: 22,
                fontWeight: "700",
                color: "#111827",
                marginBottom: 4,
              }}
            >
              Welcome back
            </Text>
            <Text
              style={{ fontSize: 14, color: "#6b7280", marginBottom: 28 }}
            >
              Sign in to manage your farm
            </Text>

            {/* Email field */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: 8,
                }}
              >
                Email address
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderWidth: 1.5,
                  borderColor:
                    focusedField === "email" ? "#16a34a" : "#e5e7eb",
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  paddingVertical: Platform.OS === "android" ? 12 : 14,
                  backgroundColor:
                    focusedField === "email" ? "#f0fdf4" : "#f9fafb",
                }}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={focusedField === "email" ? "#16a34a" : "#9ca3af"}
                />
                <TextInput
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    fontSize: 15,
                    color: "#111827",
                    paddingVertical: 0,
                  }}
                  placeholder="you@example.com"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {/* Password field */}
            <View style={{ marginBottom: 32 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: 8,
                }}
              >
                Password
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderWidth: 1.5,
                  borderColor:
                    focusedField === "password" ? "#16a34a" : "#e5e7eb",
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  paddingVertical: Platform.OS === "android" ? 12 : 14,
                  backgroundColor:
                    focusedField === "password" ? "#f0fdf4" : "#f9fafb",
                }}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={
                    focusedField === "password" ? "#16a34a" : "#9ca3af"
                  }
                />
                <TextInput
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    fontSize: 15,
                    color: "#111827",
                    paddingVertical: 0,
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#9ca3af"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign in button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
              style={{
                backgroundColor: loading ? "#86efac" : "#16a34a",
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: "center",
                shadowColor: "#16a34a",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.35,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text
                  style={{
                    color: "white",
                    fontSize: 16,
                    fontWeight: "700",
                    letterSpacing: 0.3,
                  }}
                >
                  Sign In
                </Text>
              )}
            </TouchableOpacity>

            {/* Footer */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginTop: 20,
              }}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={13}
                color="#9ca3af"
              />
              <Text
                style={{ fontSize: 12, color: "#9ca3af", marginLeft: 5 }}
              >
                Secure access to your farm data
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
