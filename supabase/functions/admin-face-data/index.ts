import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { verify } from 'https://deno.land/x/djwt@v2.8/mod.ts';
import { corsHeaders } from '../_shared/cors.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const JWT_SECRET = new TextEncoder().encode(Deno.env.get('SUPABASE_JWT_SECRET') || 'secret');

async function verifyJWT(token: string) {
  try {
    const payload = await verify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authorization token required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.substring(7);
    const payload: any = await verifyJWT(token);

    if (!payload || payload.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch users and active enrollments
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, phone_number, face_verified, created_at, role')
      .order('created_at', { ascending: false });

    if (usersError) throw usersError;

    const { data: enrollments, error: enrollErr } = await supabase
      .from('face_enrollment')
      .select('id, user_id, enrollment_date, enrolled_by, is_active, confidence_threshold')
      .eq('is_active', true)
      .order('enrollment_date', { ascending: false });

    if (enrollErr) throw enrollErr;

    const totalUsers = users?.length || 0;
    const faceEnrolled = users?.filter(u => u.face_verified).length || 0;
    const notEnrolled = totalUsers - faceEnrolled;

    return new Response(
      JSON.stringify({
        success: true,
        users,
        enrollments,
        counters: {
          totalUsers,
          faceEnrolled,
          notEnrolled,
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('admin-face-data error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
