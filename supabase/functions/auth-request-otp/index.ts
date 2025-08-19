import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

// Twilio configuration
const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER')

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

// Generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send SMS using Twilio
async function sendSMS(to: string, message: string): Promise<{ success: boolean, error?: string }> {
  try {
    console.log(`Attempting to send SMS:`);
    console.log(`From: ${TWILIO_PHONE_NUMBER}`);
    console.log(`To: ${to}`);
    
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      console.error('Twilio credentials not configured');
      return { success: false, error: 'Twilio credentials missing' };
    }

    // Check if To and From numbers are the same
    if (to === TWILIO_PHONE_NUMBER) {
      console.error(`Cannot send SMS: 'To' and 'From' numbers are identical: ${to}`);
      return { 
        success: false, 
        error: `Cannot send SMS to the same number as your Twilio phone number (${TWILIO_PHONE_NUMBER}). Please use a different phone number for testing.` 
      };
    }

    const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
    
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: TWILIO_PHONE_NUMBER,
          To: to,
          Body: message,
        }),
      }
    );

    const result = await response.json();
    
    if (response.ok) {
      console.log('SMS sent successfully:', result.sid);
      return { success: true };
    } else {
      console.error('Twilio error:', result);
      return { 
        success: false, 
        error: result.message || 'Failed to send SMS' 
      };
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
    return { 
      success: false, 
      error: 'Network error while sending SMS' 
    };
  }
}

serve(async (req) => {
  console.log('OTP Request - Received request method:', req.method);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const contentType = req.headers.get('content-type');
    console.log('OTP Request - Content-Type:', contentType);

    const rawBody = await req.text();
    console.log('OTP Request - Raw request body:', rawBody);

    const parsedBody = JSON.parse(rawBody);
    console.log('OTP Request - Parsed request body:', parsedBody);

    const { phoneNumber } = parsedBody;
    
    if (!phoneNumber) {
      console.log('OTP Request - Phone number missing');
      return new Response(
        JSON.stringify({ error: 'Phone number is required', success: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    console.log('OTP Request - Original phone:', phoneNumber);
    console.log('OTP Request - Formatted phone:', formattedPhone);

    console.log('OTP Request - Generating OTP');
    const otp = generateOTP();

    // Hash the OTP for security - ensure EXACT same format as verification
    const otpString = otp.padStart(6, '0'); // Ensure 6-digit string with leading zeros
    
    const jwtSecret = Deno.env.get('JWT_SECRET') || 'secret';
    
    const hashInput = otpString + jwtSecret;
    
    const otpHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(hashInput)
    )
    const otpHashString = Array.from(new Uint8Array(otpHash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    // Set expiration time (3 minutes from now)
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000).toISOString();
    console.log('OTP Request - Expires at:', expiresAt);

    // Check if user exists, if not create them
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, phone_number')
      .eq('phone_number', formattedPhone)
      .single()

    console.log('OTP Request - Existing user:', existingUser?.id || 'Not found');

    if (existingUser) {
      // Update existing user with new OTP
      console.log('OTP Request - Updating existing user with new OTP');
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
        console.error('OTP Request - Database error:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update OTP', success: false }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } else {
      // Create new user
      console.log('OTP Request - Creating new user');
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
        console.error('OTP Request - Database error:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to create user', success: false }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Send OTP via SMS using Twilio
    const smsMessage = `Your VoteGuard verification code is: ${otp}. This code will expire in 3 minutes. Do not share this code with anyone.`;
    const smsResult = await sendSMS(formattedPhone, smsMessage);

    if (smsResult.success) {
      console.log(`OTP Request - SMS sent successfully to ${formattedPhone}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'OTP sent successfully to your phone'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      console.error('OTP Request - Failed to send SMS:', smsResult.error);
      return new Response(
        JSON.stringify({ 
          error: smsResult.error || 'Failed to send SMS. Please try again.', 
          success: false 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('OTP Request - Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', success: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
