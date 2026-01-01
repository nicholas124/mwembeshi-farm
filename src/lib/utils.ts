import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency for Zambian Kwacha (ZMW)
 */
export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return "K0.00";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-ZM", {
    style: "currency",
    currency: "ZMW",
    minimumFractionDigits: 2,
  }).format(num);
}

/**
 * Format date for Zambian locale - consistent across server and client
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  
  const day = d.getDate();
  const month = d.toLocaleString('en-US', { month: 'short' });
  const year = d.getFullYear();
  
  return `${day} ${month} ${year}`;
}

/**
 * Format date as short (e.g., "15 Jan")
 */
export function formatDateShort(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  
  const day = d.getDate();
  const month = d.toLocaleString('en-US', { month: 'short' });
  
  return `${day} ${month}`;
}

/**
 * Format date as month and year (e.g., "Jan 2024")
 */
export function formatMonthYear(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  
  const month = d.toLocaleString('en-US', { month: 'short' });
  const year = d.getFullYear();
  
  return `${month} ${year}`;
}

/**
 * Format date as just month (e.g., "Jan")
 */
export function formatMonth(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  
  return d.toLocaleString('en-US', { month: 'short' });
}

/**
 * Format date with time
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  
  const day = d.getDate();
  const month = d.toLocaleString('en-US', { month: 'short' });
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${day} ${month} ${year} ${hours}:${minutes}`;
}

/**
 * Generate a unique ID for animals/equipment
 */
export function generateTag(prefix: string, number: number): string {
  return `${prefix}-${String(number).padStart(4, "0")}`;
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dob: Date | string | null | undefined): string {
  if (!dob) return "Unknown";
  const birth = typeof dob === "string" ? new Date(dob) : dob;
  const now = new Date();
  
  const years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();
  
  if (years > 0) {
    return `${years} year${years > 1 ? "s" : ""}`;
  } else if (months > 0) {
    return `${months} month${months > 1 ? "s" : ""}`;
  } else {
    const days = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
    return `${days} day${days > 1 ? "s" : ""}`;
  }
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Check if the app is running offline
 */
export function isOffline(): boolean {
  return typeof navigator !== "undefined" && !navigator.onLine;
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Pluralize a word based on count
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : plural || `${singular}s`;
}
