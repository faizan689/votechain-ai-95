
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { create } from 'https://deno.land/x/djwt@v2.8/mod.ts'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'secret'

// Format phone number to Indian E.164 format
function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  
  // Handle Indian phone numbers (10 digits)
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  
  // If already has country code
  if (digits.startsWith('91') && digits.length === 12) {
    return `+${digits}`;
  }
  
  // Default fallback
  return digits.startsWith('+') ? phone : `+91${digits}`;
}

serve(async (req) => {
  console.log('OTP Verification - Request method:', req.method);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { phoneNumber, otp } = await req.json()
    console.log('OTP Verification - Input:', { phoneNumber, otp: otp?.toString() });
    
    if (!phoneNumber || !otp) {
      console.log('OTP Verification - Missing phone number or OTP');
      return new Response(
        JSON.stringify({ error: 'Phone number and OTP are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    console.log('OTP Verification - Formatted phone:', formattedPhone);

    // Get user with OTP details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('phone_number', formattedPhone)
      .single()

    console.log('OTP Verification - User lookup result:', { user: user?.id, error: userError });

    if (userError || !user) {
      console.log('OTP Verification - User not found');
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if OTP has expired
    if (!user.otp_expires || new Date() > new Date(user.otp_expires)) {
      console.log('OTP Verification - OTP expired');
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

    // Verify OTP - ensure we're using the EXACT same format as when generating
    console.log('OTP Verification - Creating hash for provided OTP');
    
    // Convert to string and ensure it's a 6-digit string with leading zeros if needed
    const otpString = String(otp).padStart(6, '0');
    console.log('OTP Verification - OTP as padded string:', otpString);
    console.log('OTP Verification - JWT_SECRET length:', JWT_SECRET.length);
    
    const hashInput = otpString + JWT_SECRET;
    console.log('OTP Verification - Hash input length:', hashInput.length);
    
    const providedOtpHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(hashInput)
    )
    const providedOtpHashString = Array.from(new Uint8Array(providedOtpHash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    console.log('OTP Verification - Comparing hashes');
    console.log('Stored hash:', user.otp_hash);
    console.log('Provided hash:', providedOtpHashString);
    console.log('Hash match:', providedOtpHashString === user.otp_hash);

    if (providedOtpHashString !== user.otp_hash) {
      console.log('OTP Verification - Invalid OTP');
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
    console.log('OTP Verification - OTP is valid, updating user');
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
    console.log('OTP Verification - Generating JWT token');
    const jwtSecret = new TextEncoder().encode(JWT_SECRET);
    const payload = {
      sub: user.id,
      phone_number: user.phone_number,
      role: user.role,
      otp_verified: true,
      face_verified: user.face_verified,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    }

    const token = await create(
      { alg: "HS256", typ: "JWT" }, 
      payload, 
      jwtSecret
    )

    console.log('OTP Verification - Success, returning token');
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
    console.error('OTP Verification - Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
