
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

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

// Generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

serve(async (req) => {
  console.log('Received request method:', req.method);
  console.log('Request headers:', Object.fromEntries(req.headers.entries()));

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const contentType = req.headers.get('content-type');
    console.log('Content-Type:', contentType);

    const rawBody = await req.text();
    console.log('Raw request body:', rawBody);

    const parsedBody = JSON.parse(rawBody);
    console.log('Parsed request body:', parsedBody);

    const { phoneNumber } = parsedBody;
    
    if (!phoneNumber) {
      return new Response(
        JSON.stringify({ error: 'Phone number is required', success: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    console.log('Formatted phone:', formattedPhone);

    const otp = generateOTP();
    console.log('Generated OTP:', otp);

    // Hash the OTP for security
    const otpHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(otp + Deno.env.get('SUPABASE_JWT_SECRET'))
    )
    const otpHashString = Array.from(new Uint8Array(otpHash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    // Set expiration time (5 minutes from now)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // Check if user exists, if not create them
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, phone_number')
      .eq('phone_number', formattedPhone)
      .single()

    if (existingUser) {
      // Update existing user with new OTP
      console.log('Updating existing user with new OTP');
      const { error: updateError } = await supabase
        .from('users')
        .update({
          otp_hash: otpHashString,
          otp_expires: expiresAt,
          last_otp_request: new Date().toISOString(),
          failed_otp_attempts: 0,
          otp_verified: false
        })
        .eq('id', existingUser.id)

      if (updateError) {
        console.error('Database error:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update OTP', success: false }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } else {
      // Create new user
      console.log('Creating new user');
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          phone_number: formattedPhone,
          otp_hash: otpHashString,
          otp_expires: expiresAt,
          last_otp_request: new Date().toISOString(),
          failed_otp_attempts: 0,
          otp_verified: false,
          role: 'voter'
        })

      if (insertError) {
        console.error('Database error:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to create user', success: false }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // In a real application, you would send the OTP via SMS here
    // For demo purposes, we'll log it (remove in production)
    console.log(`SMS would be sent to ${formattedPhone} with OTP: ${otp}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OTP sent successfully',
        // For demo purposes only - remove in production
        debug_otp: otp
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', success: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
