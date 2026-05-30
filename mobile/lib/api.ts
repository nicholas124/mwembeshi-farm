import * as SecureStore from "expo-secure-store";

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

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `Request failed: ${res.status}`);
  }

  return res.json();
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string) {
  const data = await request<{ token: string; user: any }>("/api/auth/mobile-login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  await setToken(data.token);
  return data;
}

// ─── Goats ───────────────────────────────────────────────────────────────────

export async function getGoats(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return request<any>(`/api/goats${query}`);
}

export async function getGoat(id: string) {
  return request<any>(`/api/goats/${id}`);
}

export async function createGoat(data: any) {
  return request<any>("/api/goats", { method: "POST", body: JSON.stringify(data) });
}

export async function updateGoat(id: string, data: any) {
  return request<any>(`/api/goats/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteGoat(id: string) {
  return request<any>(`/api/goats/${id}`, { method: "DELETE" });
}

// ─── Health / Treatments ─────────────────────────────────────────────────────

export async function getHealth() {
  return request<any>("/api/goats/health");
}

export async function createTreatment(data: any) {
  return request<any>("/api/goats/health", { method: "POST", body: JSON.stringify(data) });
}

export async function deleteTreatments(ids: string[]) {
  return request<any>("/api/goats/health", { method: "DELETE", body: JSON.stringify({ treatmentIds: ids }) });
}

// ─── Breeding ────────────────────────────────────────────────────────────────

export async function getBreeding() {
  return request<any>("/api/goats/breeding");
}

export async function createBreeding(data: any) {
  return request<any>("/api/goats/breeding", { method: "POST", body: JSON.stringify(data) });
}

export async function updateBreeding(id: string, data: any) {
  return request<any>(`/api/goats/breeding/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

// ─── Daily Logs ──────────────────────────────────────────────────────────────

export async function getDailyLogs(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return request<any>(`/api/goats/daily-logs${query}`);
}

export async function createDailyLog(data: any) {
  return request<any>("/api/goats/daily-logs", { method: "POST", body: JSON.stringify(data) });
}

// ─── Pens ─────────────────────────────────────────────────────────────────────

export async function getPens() {
  return request<any>("/api/goats/pens");
}

export async function getPen(id: string) {
  return request<any>(`/api/goats/pens/${id}`);
}

export async function createPen(data: any) {
  return request<any>("/api/goats/pens", { method: "POST", body: JSON.stringify(data) });
}

export async function updatePen(id: string, data: any) {
  return request<any>(`/api/goats/pens/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function assignGoatsToPen(penId: string, animalIds: string[], reason?: string) {
  return request<any>(`/api/goats/pens/${penId}/assign`, {
    method: "POST",
    body: JSON.stringify({ animalIds, reason }),
  });
}

export async function removeGoatsFromPen(penId: string, animalIds: string[]) {
  return request<any>(`/api/goats/pens/${penId}/assign`, {
    method: "DELETE",
    body: JSON.stringify({ animalIds }),
  });
}

// ─── Kidding ──────────────────────────────────────────────────────────────────

export async function getKiddingRecords(animalId?: string) {
  const query = animalId ? `?animalId=${animalId}` : "";
  return request<any>(`/api/goats/kidding${query}`);
}

export async function createKiddingRecord(data: any) {
  return request<any>("/api/goats/kidding", { method: "POST", body: JSON.stringify(data) });
}

// ─── Feed ─────────────────────────────────────────────────────────────────────

export async function getFeedRecords(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return request<any>(`/api/goats/feed${query}`);
}

export async function createFeedRecord(data: any) {
  return request<any>("/api/goats/feed", { method: "POST", body: JSON.stringify(data) });
}

// ─── Sales ────────────────────────────────────────────────────────────────────

export async function getSales(animalId?: string) {
  const query = animalId ? `?animalId=${animalId}` : "";
  return request<any>(`/api/goats/sales${query}`);
}

export async function createSale(data: any) {
  return request<any>("/api/goats/sales", { method: "POST", body: JSON.stringify(data) });
}

// ─── Mortality ───────────────────────────────────────────────────────────────

export async function getMortality() {
  return request<any>("/api/goats/mortality");
}

export async function createMortality(data: any) {
  return request<any>("/api/goats/mortality", { method: "POST", body: JSON.stringify(data) });
}

// ─── Assessments (BCS + FAMACHA) ─────────────────────────────────────────────

export async function getAssessments(animalId: string) {
  return request<any>(`/api/goats/${animalId}/assessments`);
}

export async function createAssessment(animalId: string, data: any) {
  return request<any>(`/api/goats/${animalId}/assessments`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ─── Growth Photos ───────────────────────────────────────────────────────────

export async function getGoatPhotos(id: string) {
  return request<any>(`/api/goats/${id}/photos`);
}

export async function uploadGoatPhoto(id: string, base64: string, mimeType: string, caption?: string, takenAt?: string) {
  return request<any>(`/api/goats/${id}/photos`, {
    method: "POST",
    body: JSON.stringify({ base64, mimeType, caption, takenAt }),
  });
}

export async function deleteGoatPhoto(goatId: string, photoId: string) {
  return request<any>(`/api/goats/${goatId}/photos/${photoId}`, { method: "DELETE" });
}

// ─── Crops ────────────────────────────────────────────────────────────────────

export async function getCrops(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return request<any>(`/api/crops${query}`);
}

export async function getCrop(id: string) {
  return request<any>(`/api/crops/${id}`);
}

export async function createCrop(data: any) {
  return request<any>("/api/crops", { method: "POST", body: JSON.stringify(data) });
}

export async function updateCrop(id: string, data: any) {
  return request<any>(`/api/crops/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function createCropActivity(plantingId: string, data: any) {
  return request<any>(`/api/crops/${plantingId}/activities`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createCropInput(plantingId: string, data: any) {
  return request<any>(`/api/crops/${plantingId}/inputs`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createCropHarvest(plantingId: string, data: any) {
  return request<any>(`/api/crops/${plantingId}/harvests`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getCropSprayPlans(plantingId: string) {
  return request<any>(`/api/crops/${plantingId}/spray-plans`);
}

export async function createCropSprayPlan(plantingId: string, data: any) {
  return request<any>(`/api/crops/${plantingId}/spray-plans`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateSprayPlan(plantingId: string, planId: string, data: any) {
  return request<any>(`/api/crops/${plantingId}/spray-plans/${planId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function getCropTypes() {
  return request<any>("/api/crop-types");
}

export async function getFields() {
  return request<any>("/api/fields");
}
