
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { create, verify } from 'https://deno.land/x/djwt@v2.8/mod.ts'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const JWT_SECRET = new TextEncoder().encode(Deno.env.get('SUPABASE_JWT_SECRET') || 'secret')

// Format phone number to E.164 format
function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  
  if (digits.startsWith('1') && digits.length === 11) {
    return `+${digits}`;
  }
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  return digits.startsWith('+') ? phone : `+1${digits}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { phoneNumber, otp } = await req.json()
    
    if (!phoneNumber || !otp) {
      return new Response(
        JSON.stringify({ error: 'Phone number and OTP are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);

    // Get user with OTP details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('phone_number', formattedPhone)
      .single()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if OTP has expired
    if (!user.otp_expires || new Date() > new Date(user.otp_expires)) {
      await supabase
        .from('security_alerts')
        .insert({
          type: 'otp_failure',
          user_phone: formattedPhone,
          details: { reason: 'expired_otp' }
        })

      return new Response(
        JSON.stringify({ error: 'OTP has expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify OTP
    const providedOtpHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(otp + Deno.env.get('SUPABASE_JWT_SECRET'))
    )
    const providedOtpHashString = Array.from(new Uint8Array(providedOtpHash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    if (providedOtpHashString !== user.otp_hash) {
      // Increment failed attempts
      await supabase
        .from('users')
        .update({ failed_otp_attempts: (user.failed_otp_attempts || 0) + 1 })
        .eq('id', user.id)

      await supabase
        .from('security_alerts')
        .insert({
          type: 'otp_failure',
          user_id: user.id,
          user_phone: formattedPhone,
          details: { reason: 'invalid_otp', attempts: (user.failed_otp_attempts || 0) + 1 }
        })

      return new Response(
        JSON.stringify({ error: 'Invalid OTP' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // OTP verified successfully
    await supabase
      .from('users')
      .update({
        otp_verified: true,
        otp_hash: null,
        otp_expires: null,
        failed_otp_attempts: 0
      })
      .eq('id', user.id)

    // Generate JWT token
    const payload = {
      sub: user.id,
      phone_number: user.phone_number,
      role: user.role,
      otp_verified: true,
      face_verified: user.face_verified,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    }

    const token = await create({ alg: "HS256", typ: "JWT" }, payload, JWT_SECRET)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OTP verified successfully',
        token,
        user: {
          id: user.id,
          phone_number: user.phone_number,
          role: user.role,
          face_verified: user.face_verified,
          has_voted: user.has_voted
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
