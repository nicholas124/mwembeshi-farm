import * as SecureStore from "expo-secure-store";

// Change this to your Vercel deployment URL
const BASE_URL = "https://mwembeshi-farm.vercel.app";

let authToken: string | null = null;

export async function getToken(): Promise<string | null> {
  if (authToken) return authToken;
  authToken = await SecureStore.getItemAsync("auth_token");
  return authToken;
}

export async function setToken(token: string) {
  authToken = token;
  await SecureStore.setItemAsync("auth_token", token);
}

export async function clearToken() {
  authToken = null;
  await SecureStore.deleteItemAsync("auth_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `Request failed: ${res.status}`);
  }

  return res.json();
}

// Auth
export async function login(email: string, password: string) {
  const data = await request<{ token: string; user: any }>("/api/auth/mobile-login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  await setToken(data.token);
  return data;
}

// Goats
export async function getGoats(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return request<any>(`/api/goats${query}`);
}

export async function getGoat(id: string) {
  return request<any>(`/api/goats/${id}`);
}

export async function createGoat(data: any) {
  return request<any>("/api/goats", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateGoat(id: string, data: any) {
  return request<any>(`/api/goats/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteGoat(id: string) {
  return request<any>(`/api/goats/${id}`, { method: "DELETE" });
}

// Health / Treatments
export async function getHealth() {
  return request<any>("/api/goats/health");
}

export async function createTreatment(data: any) {
  return request<any>("/api/goats/health", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteTreatments(ids: string[]) {
  return request<any>("/api/goats/health", {
    method: "DELETE",
    body: JSON.stringify({ ids }),
  });
}

// Breeding
export async function getBreeding() {
  return request<any>("/api/goats/breeding");
}

export async function createBreeding(data: any) {
  return request<any>("/api/goats/breeding", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateBreeding(id: string, data: any) {
  return request<any>(`/api/goats/breeding/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Daily Logs
export async function getDailyLogs(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return request<any>(`/api/goats/daily-logs${query}`);
}

export async function createDailyLog(data: any) {
  return request<any>("/api/goats/daily-logs", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
