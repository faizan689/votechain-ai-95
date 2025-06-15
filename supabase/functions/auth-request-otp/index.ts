
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email } = await req.json()
    
    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Valid email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const clientIP = req.headers.get('x-forwarded-for') || 'unknown'
    
    // Check rate limiting
    const { data: rateLimit } = await supabase
      .from('otp_rate_limits')
      .select('*')
      .eq('email', email)
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
        .insert({ email, ip_address: clientIP, attempts: 1 })
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
        email,
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

    // Send OTP via SendGrid
    const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: 'faizanshaikhfs7860@gmail.com' }],
          subject: 'VoteGuard - Your Verification Code'
        }],
        from: { email: '2203031050611@paruluniversity.ac.in', name: 'VoteGuard' },
        content: [{
          type: 'text/html',
          value: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1f2937;">VoteGuard Verification Code</h2>
              <p>Your verification code is:</p>
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <h1 style="color: #1f2937; font-size: 32px; margin: 0; letter-spacing: 8px;">${otp}</h1>
              </div>
              <p style="color: #6b7280;">This code will expire in 5 minutes.</p>
              <p style="color: #6b7280;">If you didn't request this code, please ignore this email.</p>
            </div>
          `
        }]
      })
    })

    if (!emailResponse.ok) {
      console.error('SendGrid error:', await emailResponse.text())
      return new Response(
        JSON.stringify({ error: 'Failed to send OTP email' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`OTP sent to ${email}`)

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
