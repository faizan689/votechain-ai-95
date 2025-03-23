
import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { getBlockchainHash } from '../utils/blockchain';

const router = express.Router();

/**
 * Get list of parties
 * GET /api/voting/parties
 */
router.get('/parties', async (req: any, res) => {
  try {
    // Fetch parties from database
    const result = await req.db.query('SELECT * FROM parties');
    
    return res.status(200).json({
      success: true,
      parties: result.rows.map(party => ({
        id: party.id,
        name: party.name,
        symbol: party.symbol,
        color: party.color,
        logoPath: party.logo_path
      }))
    });
  } catch (error) {
    console.error('Error fetching parties:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * Cast a vote
 * POST /api/voting/cast-vote
 */
router.post('/cast-vote', authenticateToken, async (req: any, res) => {
  try {
    const { partyId } = req.body;
    const voterId = req.user.voterId;
    
    if (!partyId) {
      return res.status(400).json({ success: false, error: 'Party ID is required' });
    }
    
    // Check if voter has already voted
    const voterResult = await req.db.query(
      'SELECT has_voted FROM voters WHERE voter_id = $1',
      [voterId]
    );
    
    const voter = voterResult.rows[0];
    
    if (!voter) {
      return res.status(404).json({ success: false, error: 'Voter not found' });
    }
    
    if (voter.has_voted) {
      return res.status(403).json({ success: false, error: 'You have already cast your vote' });
    }
    
    // Check if party exists
    const partyResult = await req.db.query(
      'SELECT id FROM parties WHERE id = $1',
      [partyId]
    );
    
    if (partyResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Party not found' });
    }
    
    // Begin transaction
    const client = await req.db.connect();
    
    try {
      await client.query('BEGIN');
      
      // Record vote in database
      const now = new Date();
      await client.query(
        'INSERT INTO votes (voter_id, party_id, voted_at) VALUES ($1, $2, $3)',
        [voterId, partyId, now]
      );
      
      // Mark voter as having voted
      await client.query(
        'UPDATE voters SET has_voted = TRUE WHERE voter_id = $1',
        [voterId]
      );
      
      // Generate blockchain hash (in a real app, this would interact with actual blockchain)
      const transactionId = getBlockchainHash(voterId, partyId, now);
      
      await client.query('COMMIT');
      
      // Broadcast vote count update to all connected clients
      const stats = await getElectionStats(req.db);
      req.io.emit('vote_update', stats);
      
      // Return success response
      return res.status(200).json({
        success: true,
        message: 'Vote cast successfully',
        transactionId
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error casting vote:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * Get election stats
 */
async function getElectionStats(db: any) {
  // Get total registered voters
  const totalVotersResult = await db.query('SELECT COUNT(*) as count FROM voters');
  const totalRegisteredVoters = parseInt(totalVotersResult.rows[0].count);
  
  // Get total votes cast
  const totalVotesResult = await db.query('SELECT COUNT(*) as count FROM votes');
  const totalVotesCast = parseInt(totalVotesResult.rows[0].count);
  
  // Calculate voter turnout percentage
  const voterTurnoutPercentage = totalRegisteredVoters > 0
    ? (totalVotesCast / totalRegisteredVoters) * 100
    : 0;
  
  // Get party-wise votes
  const partywiseVotesResult = await db.query(`
    SELECT p.id as party_id, p.name as party_name, COUNT(v.id) as vote_count
    FROM parties p
    LEFT JOIN votes v ON p.id = v.party_id
    GROUP BY p.id, p.name
    ORDER BY vote_count DESC
  `);
  
  const partywiseVotes = partywiseVotesResult.rows.map(row => ({
    partyId: row.party_id,
    partyName: row.party_name,
    votes: parseInt(row.vote_count),
    percentage: totalVotesCast > 0 ? (parseInt(row.vote_count) / totalVotesCast) * 100 : 0
  }));
  
  // Get district-wise turnout
  const districtTurnoutResult = await db.query(`
    SELECT vr.district, 
           COUNT(DISTINCT vr.voter_id) as total_voters,
           COUNT(DISTINCT v.voter_id) as votes_cast
    FROM voters vr
    LEFT JOIN votes v ON vr.voter_id = v.voter_id
    GROUP BY vr.district
    ORDER BY vr.district
  `);
  
  const districtWiseTurnout = districtTurnoutResult.rows.map(row => ({
    district: row.district,
    totalVoters: parseInt(row.total_voters),
    votesCast: parseInt(row.votes_cast),
    turnout: parseInt(row.total_voters) > 0
      ? (parseInt(row.votes_cast) / parseInt(row.total_voters)) * 100
      : 0
  }));
  
  return {
    totalRegisteredVoters,
    totalVotesCast,
    voterTurnoutPercentage,
    partywiseVotes,
    districtWiseTurnout
  };
}

export default router;
