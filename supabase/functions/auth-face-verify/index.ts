
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { verify } from 'https://deno.land/x/djwt@v2.8/mod.ts'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const JWT_SECRET = new TextEncoder().encode(Deno.env.get('SUPABASE_JWT_SECRET') || 'secret')

async function verifyJWT(token: string) {
  try {
    const payload = await verify(token, JWT_SECRET)
    return payload
  } catch {
    return null
  }
}

// Simulate face verification - in production, integrate with actual face recognition service
function simulateFaceVerification(imageData: string): { success: boolean; confidence: number; liveness: boolean } {
  // Basic validation of image data
  if (!imageData || !imageData.startsWith('data:image/')) {
    return { success: false, confidence: 0, liveness: false }
  }
  
  // Simulate processing with high success rate for demo
  const confidence = 0.85 + Math.random() * 0.14 // 85-99% confidence
  const liveness = Math.random() > 0.1 // 90% liveness detection success
  const success = confidence > 0.8 && liveness
  
  return { success, confidence, liveness }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authorization token required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.substring(7)
    const payload = await verifyJWT(token)
    
    if (!payload || !payload.otp_verified) {
      return new Response(
        JSON.stringify({ error: 'Invalid token or OTP not verified' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { imageData } = await req.json()
    
    if (!imageData) {
      return new Response(
        JSON.stringify({ error: 'Image data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const clientIP = req.headers.get('x-forwarded-for') || 'unknown'
    
    // Perform face verification
    const verification = simulateFaceVerification(imageData)
    
    // Log verification attempt
    await supabase
      .from('face_verification_attempts')
      .insert({
        user_id: payload.sub,
        success: verification.success,
        confidence_score: verification.confidence,
        liveness_check_passed: verification.liveness,
        ip_address: clientIP
      })

    if (!verification.success) {
      await supabase
        .from('security_alerts')
        .insert({
          type: 'face_verify_failure',
          user_id: payload.sub,
          user_email: payload.email,
          ip_address: clientIP,
          details: {
            confidence: verification.confidence,
            liveness_passed: verification.liveness,
            reason: !verification.liveness ? 'liveness_failed' : 'low_confidence'
          }
        })

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Face verification failed',
          details: {
            confidence: verification.confidence,
            liveness_passed: verification.liveness
          }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Store face embedding (in production, this would be actual face embedding data)
    const faceEmbedding = {
      timestamp: new Date().toISOString(),
      confidence: verification.confidence,
      verified: true
    }

    // Update user as face verified
    await supabase
      .from('users')
      .update({
        face_verified: true,
        face_embedding: faceEmbedding
      })
      .eq('id', payload.sub)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Face verification successful',
        confidence: verification.confidence
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
