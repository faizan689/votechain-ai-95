
import { supabase } from "@/integrations/supabase/client";

/**
 * API utilities for the VoteGuard application (Supabase Edge Functions)
 */

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

// API request helper using Supabase Edge Functions
export async function apiRequest<T>(
  functionName: string,
  data?: any,
  useAdminToken: boolean = false
): Promise<T> {
  try {
    console.log(`Making API request to ${functionName} with data:`, data);
    
    const token = useAdminToken ? getAdminToken() : getAuthToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Ensure data is properly serialized
    const requestBody = data ? JSON.stringify(data) : undefined;
    console.log(`Request body for ${functionName}:`, requestBody);

    const { data: result, error } = await supabase.functions.invoke(functionName, {
      body: requestBody,
      headers
    });

    console.log(`Response from ${functionName}:`, { result, error });

    if (error) {
      console.error(`Edge function error for ${functionName}:`, error);
      throw new Error(error.message);
    }

    return result as T;
  } catch (error) {
    console.error(`API request failed for ${functionName}:`, error);
    throw error;
  }
}
