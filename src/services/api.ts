
/**
 * API utilities for the VoteGuard application
 */

// Base API configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Storage keys
export const TOKEN_STORAGE_KEY = "voteguard_auth_token";
export const ADMIN_TOKEN_STORAGE_KEY = "voteguard_admin_token";

// Get auth token from storage
export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

// Set auth token in storage
export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

// Remove auth token from storage
export function removeAuthToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

// Get admin token from storage
export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
}

// Set admin token in storage
export function setAdminToken(token: string): void {
  localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
}

// Remove admin token from storage
export function removeAdminToken(): void {
  localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
}

// API request helper
export async function apiRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  data?: any,
  isAdmin: boolean = false
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  
  // Add auth token if available
  const token = isAdmin ? getAdminToken() : getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.error || "Something went wrong");
    }
    
    return responseData as T;
  } catch (error) {
    console.error(`API ${method} request failed:`, error);
    throw error;
  }
}
