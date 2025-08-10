import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// AES-GCM encryption utilities for securing face descriptors at rest
const textEncoder = new TextEncoder();

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

function tryDecodeHex(hex: string): Uint8Array | null {
  const cleaned = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (cleaned.length % 2 !== 0) return null;
  try {
    const arr = new Uint8Array(cleaned.length / 2);
    for (let i = 0; i < arr.length; i++) arr[i] = parseInt(cleaned.substr(i * 2, 2), 16);
    return arr;
  } catch {
    return null;
  }
}

async function getAesKey(): Promise<CryptoKey> {
  const secret = Deno.env.get('FACE_EMBEDDING_KEY') || '';
  let keyBytes: Uint8Array | null = null;
  // Try base64
  try {
    keyBytes = base64ToBytes(secret);
  } catch {
    // Try hex
    keyBytes = tryDecodeHex(secret);
  }
  // Fallback to utf-8 bytes
  if (!keyBytes) keyBytes = textEncoder.encode(secret);
  // Ensure 32 bytes for AES-256
  if (keyBytes.length < 32) {
    const padded = new Uint8Array(32);
    padded.set(keyBytes);
    keyBytes = padded;
  } else if (keyBytes.length > 32) {
    keyBytes = keyBytes.slice(0, 32);
  }
  return await crypto.subtle.importKey('raw', keyBytes, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

async function encryptDescriptor(descriptor: number[]): Promise<{ iv: string; data: string }> {
  const key = await getAesKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const payload = textEncoder.encode(JSON.stringify(descriptor));
  const cipherBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, payload);
  return { iv: bytesToBase64(iv), data: bytesToBase64(new Uint8Array(cipherBuf)) };
}

async function decryptDescriptor(record: any): Promise<number[] | null> {
  try {
    const key = await getAesKey();
    const iv = base64ToBytes(record.iv);
    const data = base64ToBytes(record.data);
    const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
    const json = new TextDecoder().decode(new Uint8Array(plainBuf));
    const arr = JSON.parse(json);
    if (Array.isArray(arr)) return arr as number[];
    return null;
  } catch (e) {
    console.error('Decryption failed:', e);
    return null;
  }
}

interface FaceEnrollmentRequest {
  userId: string;
  faceDescriptor: number[];
  enrolledBy?: string;
  confidenceThreshold?: number;
}

export default async function handler(req: Request) {
  // Set CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  try {
    if (req.method === "POST") {
      const body = await req.json();
      const {
        userId,
        faceDescriptor,
        faceDescriptors,
        enrolledBy,
        confidenceThreshold = 0.6,
      } = body;

      const hasSingle = Array.isArray(faceDescriptor);
      const hasMultiple = Array.isArray(faceDescriptors) && faceDescriptors.length > 0;

      if (!userId || (!hasSingle && !hasMultiple)) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: userId and faceDescriptor(s)" }),
          { status: 400, headers: { ...headers, "Content-Type": "application/json" } }
        );
      }

      // Deactivate any existing face enrollments for this user
      await supabase
        .from("face_enrollment")
        .update({ is_active: false })
        .eq("user_id", userId);

      if (hasMultiple) {
        // Insert multiple active enrollments (encrypted at rest)
        const prepared = await Promise.all(
          faceDescriptors
            .filter((d: any) => Array.isArray(d))
            .map(async (d: number[]) => ({
              user_id: userId,
              face_descriptor: await encryptDescriptor(d),
              enrolled_by: enrolledBy,
              confidence_threshold: confidenceThreshold,
              is_active: true,
            }))
        );

        const { data: enrollments, error: insertManyError } = await supabase
          .from("face_enrollment")
          .insert(prepared)
          .select();

        if (insertManyError) {
          console.error("Error inserting multiple face enrollments:", insertManyError);
          return new Response(
            JSON.stringify({ error: "Failed to save face enrollments" }),
            { status: 500, headers: { ...headers, "Content-Type": "application/json" } }
          );
        }

        // Update user's face_verified status
        const { error: userUpdateError } = await supabase
          .from("users")
          .update({ face_verified: true })
          .eq("id", userId);
        if (userUpdateError) {
          console.error("Error updating user face_verified status:", userUpdateError);
        }

        return new Response(
          JSON.stringify({ success: true, enrollments, message: "Face enrollments completed successfully" }),
          { status: 200, headers: { ...headers, "Content-Type": "application/json" } }
        );
      }

      // Fallback: insert single enrollment (encrypted at rest)
      const encrypted = await encryptDescriptor(faceDescriptor);
      const { data: enrollment, error: insertError } = await supabase
        .from("face_enrollment")
        .insert({
          user_id: userId,
          face_descriptor: encrypted,
          enrolled_by: enrolledBy,
          confidence_threshold: confidenceThreshold,
          is_active: true,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error inserting face enrollment:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to save face enrollment" }),
          { status: 500, headers: { ...headers, "Content-Type": "application/json" } }
        );
      }

      // Update user's face_verified status
      const { error: userUpdateError } = await supabase
        .from("users")
        .update({ face_verified: true })
        .eq("id", userId);
      if (userUpdateError) {
        console.error("Error updating user face_verified status:", userUpdateError);
      }

      return new Response(
        JSON.stringify({ success: true, enrollment, message: "Face enrollment completed successfully" }),
        { status: 200, headers: { ...headers, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "GET") {
      const url = new URL(req.url);
      const userId = url.searchParams.get("userId");

      if (!userId) {
        return new Response(
          JSON.stringify({ error: "Missing userId parameter" }),
          { status: 400, headers: { ...headers, "Content-Type": "application/json" } }
        );
      }

      // Get all active face enrollments for user (may be multiple samples)
      const { data: enrollments, error } = await supabase
        .from("face_enrollment")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("enrollment_date", { ascending: false });

      if (error) {
        console.error("Error fetching face enrollments:", error);
        return new Response(
          JSON.stringify({ error: "Failed to fetch face enrollments" }),
          { status: 500, headers: { ...headers, "Content-Type": "application/json" } }
        );
      }

      // Decrypt descriptors before returning to client for recognition
      const decrypted = await Promise.all(
        (enrollments || []).map(async (e: any) => ({
          ...e,
          face_descriptor: await decryptDescriptor(e.face_descriptor),
        }))
      );

      return new Response(
        JSON.stringify({ enrollments: decrypted }),
        { status: 200, headers: { ...headers, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "DELETE") {
      const { userId } = await req.json();

      if (!userId) {
        return new Response(
          JSON.stringify({ error: "Missing userId" }),
          { status: 400, headers: { ...headers, "Content-Type": "application/json" } }
        );
      }

      // Deactivate face enrollment
      const { error } = await supabase
        .from("face_enrollment")
        .update({ is_active: false })
        .eq("user_id", userId);

      if (error) {
        console.error("Error deactivating face enrollment:", error);
        return new Response(
          JSON.stringify({ error: "Failed to remove face enrollment" }),
          { status: 500, headers: { ...headers, "Content-Type": "application/json" } }
        );
      }

      // Update user's face_verified status
      await supabase
        .from("users")
        .update({ face_verified: false })
        .eq("id", userId);

      return new Response(
        JSON.stringify({ success: true, message: "Face enrollment removed" }),
        { status: 200, headers: { ...headers, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...headers, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Face enrollment function error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...headers, "Content-Type": "application/json" } }
    );
  }
}