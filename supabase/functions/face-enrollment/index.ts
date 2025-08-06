import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
      const { userId, faceDescriptor, enrolledBy, confidenceThreshold = 0.6 }: FaceEnrollmentRequest = await req.json();

      if (!userId || !faceDescriptor || !Array.isArray(faceDescriptor)) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: userId, faceDescriptor" }),
          { status: 400, headers: { ...headers, "Content-Type": "application/json" } }
        );
      }

      // Deactivate any existing face enrollments for this user
      await supabase
        .from("face_enrollment")
        .update({ is_active: false })
        .eq("user_id", userId);

      // Insert new face enrollment
      const { data: enrollment, error: insertError } = await supabase
        .from("face_enrollment")
        .insert({
          user_id: userId,
          face_descriptor: faceDescriptor,
          enrolled_by: enrolledBy,
          confidence_threshold: confidenceThreshold,
          is_active: true
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
        JSON.stringify({ 
          success: true, 
          enrollment: enrollment,
          message: "Face enrollment completed successfully" 
        }),
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

      // Get active face enrollment for user
      const { data: enrollment, error } = await supabase
        .from("face_enrollment")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .single();

      if (error && error.code !== "PGRST116") { // PGRST116 = no rows returned
        console.error("Error fetching face enrollment:", error);
        return new Response(
          JSON.stringify({ error: "Failed to fetch face enrollment" }),
          { status: 500, headers: { ...headers, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ enrollment: enrollment || null }),
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