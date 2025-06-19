import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'secret'

// Special admin phone number for testing - allows unlimited voting
const ADMIN_TEST_PHONE = '+919825751170'

// Fixed JWT verification function to match auth-verify-otp implementation
async function verifyJWT(token: string) {
  try {
    console.log('Vote - Verifying JWT token, length:', token.length);
    
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('Vote - Invalid JWT format, parts count:', parts.length);
      return null;
    }

    const [headerB64, payloadB64, signatureB64] = parts;
    console.log('Vote - JWT parts extracted successfully');
    
    // Verify signature using the same method as auth-verify-otp
    const signatureInput = `${headerB64}.${payloadB64}`;
    console.log('Vote - Creating verification key');
    
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(JWT_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"] // Use verify capability, not sign
    );
    
    console.log('Vote - Key imported for verification');
    
    // Decode the provided signature for verification
    const providedSignature = Uint8Array.from(atob(signatureB64), c => c.charCodeAt(0));
    console.log('Vote - Signature decoded, length:', providedSignature.length);
    
    // Use crypto.subtle.verify to check the signature
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      providedSignature,
      new TextEncoder().encode(signatureInput)
    );
    
    console.log('Vote - Signature verification result:', isValid);
    
    if (!isValid) {
      console.log('Vote - JWT signature verification failed');
      return null;
    }
    
    // Parse payload
    const payload = JSON.parse(atob(payloadB64));
    console.log('Vote - JWT payload parsed successfully:', { 
      sub: payload.sub, 
      exp: payload.exp,
      otp_verified: payload.otp_verified,
      face_verified: payload.face_verified 
    });
    
    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      console.log('Vote - JWT token expired, exp:', payload.exp, 'now:', Math.floor(Date.now() / 1000));
      return null;
    }
    
    console.log('Vote - JWT verification successful');
    return payload;
  } catch (error) {
    console.error('Vote - JWT verification error:', error);
    return null;
  }
}

// Simulate blockchain transaction
async function createBlockchainTransaction(userId: string, partyId: string, voteHash: string) {
  try {
    // In production, this would interact with actual Ethereum network
    // using the ETHEREUM_PRIVATE_KEY and ETHEREUM_RPC_URL
    
    // Simulate transaction hash
    const txHash = '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log(`Blockchain transaction created: ${txHash} for user: ${userId}, party: ${partyId}`)
    
    return { txHash, confirmed: true }
  } catch (error) {
    console.error('Blockchain transaction failed:', error)
    throw error
  }
}

serve(async (req) => {
  console.log('Vote - Request method:', req.method);
  console.log('Vote - Request URL:', req.url);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    console.log('Vote - Auth header present:', !!authHeader);
    console.log('Vote - Auth header value:', authHeader ? `${authHeader.substring(0, 20)}...` : 'none');
    
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('Vote - No Bearer token found');
      return new Response(
        JSON.stringify({ 
          error: 'Authorization token required',
          details: 'Missing or invalid Authorization header'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.substring(7)
    console.log('Vote - Extracted token length:', token.length);
    console.log('Vote - Token first 20 chars:', token.substring(0, 20));
    
    const payload = await verifyJWT(token)
    
    if (!payload) {
      console.log('Vote - JWT verification failed - returning 401');
      return new Response(
        JSON.stringify({ 
          error: 'Invalid or expired token',
          details: 'JWT verification failed'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Vote - Token verification successful for user:', payload.sub);
    
    // Check verification requirements
    if (!payload.otp_verified) {
      console.log('Vote - User OTP verification incomplete');
      return new Response(
        JSON.stringify({ 
          error: 'Authentication incomplete',
          details: 'OTP verification required'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const requestBody = await req.json()
    console.log('Vote - Request body received:', requestBody);
    
    const { partyId, partyName } = requestBody
    
    if (!partyId || !partyName) {
      console.log('Vote - Missing party data');
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request',
          details: 'Party ID and name are required'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check voting schedule - more lenient for testing
    console.log('Vote - Checking voting schedule');
    const { data: schedule, error: scheduleError } = await supabase
      .from('voting_schedule')
      .select('*')
      .eq('id', 1)
      .single()

    if (scheduleError) {
      console.error('Vote - Schedule lookup error:', scheduleError);
      console.log('Vote - Proceeding without schedule check for testing');
    } else if (schedule && !schedule.is_active) {
      console.log('Vote - Voting not active, but proceeding for testing');
    }

    // Get user details and check if already voted
    console.log('Vote - Getting user details for:', payload.sub);
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', payload.sub)
      .single()

    if (userError || !user) {
      console.error('Vote - User lookup error:', userError);
      return new Response(
        JSON.stringify({ 
          error: 'User not found',
          details: userError?.message || 'User lookup failed'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Vote - User found:', { id: user.id, has_voted: user.has_voted, phone: user.phone_number });

    // Special handling for admin test phone number - allow unlimited voting
    const isAdminTestUser = user.phone_number === ADMIN_TEST_PHONE;
    
    if (isAdminTestUser) {
      console.log('Vote - Admin test user detected, allowing unlimited voting');
      // Reset voting status for admin test user to allow unlimited voting
      await supabase
        .from('users')
        .update({ has_voted: false })
        .eq('id', user.id)
    } else if (user.has_voted) {
      console.log('Vote - Regular user already voted');
      await supabase
        .from('security_alerts')
        .insert({
          type: 'duplicate_vote',
          user_id: user.id,
          user_phone: user.phone_number,
          details: { attempted_party: partyId }
        })

      return new Response(
        JSON.stringify({ 
          error: 'already_voted',
          message: 'You have already cast your vote'
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create vote hash for privacy
    console.log('Vote - Creating vote hash');
    const voteData = `${user.id}-${partyId}-${Date.now()}`
    const voteHashBuffer = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(voteData)
    )
    const voteHash = Array.from(new Uint8Array(voteHashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    // Create blockchain transaction
    console.log('Vote - Creating blockchain transaction');
    const blockchainResult = await createBlockchainTransaction(user.id, partyId, voteHash)

    // Store vote in database
    console.log('Vote - Storing vote in database');
    const { data: vote, error: voteError } = await supabase
      .from('votes')
      .insert({
        user_id: user.id,
        party_id: partyId,
        party_name: partyName,
        vote_hash: voteHash,
        tx_hash: blockchainResult.txHash,
        blockchain_confirmed: blockchainResult.confirmed
      })
      .select()
      .single()

    if (voteError) {
      console.error('Vote storage error:', voteError)
      return new Response(
        JSON.stringify({ 
          error: 'Vote recording failed',
          details: voteError.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Mark user as voted (except for admin test user who gets reset each time)
    if (!isAdminTestUser) {
      console.log('Vote - Marking regular user as voted');
      const { error: updateError } = await supabase
        .from('users')
        .update({ has_voted: true })
        .eq('id', user.id)

      if (updateError) {
        console.error('Vote - User update error:', updateError);
      }
    } else {
      console.log('Vote - Admin test user - not marking as voted to allow unlimited voting');
    }

    console.log(`Vote recorded successfully: User ${user.id} voted for ${partyName} (${partyId})${isAdminTestUser ? ' [ADMIN TEST - UNLIMITED]' : ''}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Vote recorded successfully',
        transactionId: blockchainResult.txHash,
        voteId: vote.id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Vote - Unexpected error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message || 'Unknown error occurred'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
