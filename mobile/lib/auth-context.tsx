import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { getToken, clearToken, login as apiLogin } from "./api";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const token = await getToken();
      if (token) {
        const stored = await SecureStore.getItemAsync("user_data");
        if (stored) setUser(JSON.parse(stored));
      }
    } catch {
      // Token invalid or expired
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const { user: userData } = await apiLogin(email, password);
    setUser(userData);
    await SecureStore.setItemAsync("user_data", JSON.stringify(userData));
  }

  async function logout() {
    await clearToken();
    await SecureStore.deleteItemAsync("user_data");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
