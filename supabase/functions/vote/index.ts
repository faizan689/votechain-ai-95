
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
    
    if (!payload || !payload.otp_verified || !payload.face_verified) {
      return new Response(
        JSON.stringify({ error: 'User must complete OTP and face verification' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { partyId, partyName } = await req.json()
    
    if (!partyId || !partyName) {
      return new Response(
        JSON.stringify({ error: 'Party ID and name are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check voting schedule
    const { data: schedule } = await supabase
      .from('voting_schedule')
      .select('*')
      .eq('id', 1)
      .single()

    if (!schedule?.is_active) {
      return new Response(
        JSON.stringify({ error: 'Voting is not currently active' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const now = new Date()
    const votingStart = new Date(schedule.voting_start)
    const votingEnd = new Date(schedule.voting_end)

    if (now < votingStart || now > votingEnd) {
      return new Response(
        JSON.stringify({ error: 'Voting is not within the allowed time window' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user details and check if already voted
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', payload.sub)
      .single()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (user.has_voted) {
      await supabase
        .from('security_alerts')
        .insert({
          type: 'duplicate_vote',
          user_id: user.id,
          user_email: user.email,
          details: { attempted_party: partyId }
        })

      return new Response(
        JSON.stringify({ error: 'User has already voted' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create vote hash for privacy
    const voteData = `${user.id}-${partyId}-${Date.now()}`
    const voteHashBuffer = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(voteData)
    )
    const voteHash = Array.from(new Uint8Array(voteHashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    // Create blockchain transaction
    const blockchainResult = await createBlockchainTransaction(user.id, partyId, voteHash)

    // Store vote in database
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
        JSON.stringify({ error: 'Failed to record vote' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Mark user as voted
    await supabase
      .from('users')
      .update({ has_voted: true })
      .eq('id', user.id)

    console.log(`Vote recorded: User ${user.id} voted for ${partyName} (${partyId})`)

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
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
