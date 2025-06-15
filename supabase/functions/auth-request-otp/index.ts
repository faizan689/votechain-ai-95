
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

// Format phone number to E.164 format
function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // If it starts with country code, use as is
  if (digits.startsWith('1') && digits.length === 11) {
    return `+${digits}`;
  }
  // If it's a 10-digit US number, add +1
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  // For other formats, assume it's already formatted or add +1
  return digits.startsWith('+') ? phone : `+1${digits}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { phoneNumber } = await req.json()
    
    if (!phoneNumber) {
      return new Response(
        JSON.stringify({ error: 'Phone number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown'
    
    // Check rate limiting
    const { data: rateLimit } = await supabase
      .from('otp_rate_limits')
      .select('*')
      .eq('phone_number', formattedPhone)
      .eq('ip_address', clientIP)
      .single()

    if (rateLimit) {
      const now = new Date()
      const windowStart = new Date(rateLimit.window_start)
      const timeDiff = now.getTime() - windowStart.getTime()
      
      // Reset window if more than 1 hour has passed
      if (timeDiff > 3600000) {
        await supabase
          .from('otp_rate_limits')
          .update({ attempts: 1, window_start: now.toISOString(), blocked_until: null })
          .eq('id', rateLimit.id)
      } else if (rateLimit.attempts >= 5) {
        // Block for 1 hour if too many attempts
        const blockedUntil = new Date(now.getTime() + 3600000)
        await supabase
          .from('otp_rate_limits')
          .update({ blocked_until: blockedUntil.toISOString() })
          .eq('id', rateLimit.id)
        
        return new Response(
          JSON.stringify({ error: 'Too many OTP requests. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else {
        // Increment attempts
        await supabase
          .from('otp_rate_limits')
          .update({ attempts: rateLimit.attempts + 1 })
          .eq('id', rateLimit.id)
      }
    } else {
      // Create new rate limit record
      await supabase
        .from('otp_rate_limits')
        .insert({ phone_number: formattedPhone, ip_address: clientIP, attempts: 1 })
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(otp + Deno.env.get('SUPABASE_JWT_SECRET'))
    )
    const otpHashString = Array.from(new Uint8Array(otpHash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    // Store or update user with OTP
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        phone_number: formattedPhone,
        otp_hash: otpHashString,
        otp_expires: expiresAt.toISOString(),
        last_otp_request: new Date().toISOString()
      })

    if (userError) {
      console.error('Database error:', userError)
      return new Response(
        JSON.stringify({ error: 'Failed to store OTP' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send SMS via Twilio
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      console.error('Missing Twilio credentials')
      return new Response(
        JSON.stringify({ error: 'SMS service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`
    const twilioAuth = btoa(`${twilioAccountSid}:${twilioAuthToken}`)

    const smsResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${twilioAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: twilioPhoneNumber,
        To: formattedPhone,
        Body: `Your VoteGuard verification code is: ${otp}. This code will expire in 5 minutes.`
      })
    })

    if (!smsResponse.ok) {
      console.error('Twilio error:', await smsResponse.text())
      return new Response(
        JSON.stringify({ error: 'Failed to send SMS' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`SMS sent to ${formattedPhone}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OTP sent successfully'
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
