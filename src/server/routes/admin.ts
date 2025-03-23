
import express from 'express';
import { authenticateAdminToken } from '../middleware/auth';

const router = express.Router();

/**
 * Get election stats
 * GET /api/admin/stats
 */
router.get('/stats', authenticateAdminToken, async (req: any, res) => {
  try {
    // Get total registered voters
    const totalVotersResult = await req.db.query('SELECT COUNT(*) as count FROM voters');
    const totalRegisteredVoters = parseInt(totalVotersResult.rows[0].count);
    
    // Get total votes cast
    const totalVotesResult = await req.db.query('SELECT COUNT(*) as count FROM votes');
    const totalVotesCast = parseInt(totalVotesResult.rows[0].count);
    
    // Calculate voter turnout percentage
    const voterTurnoutPercentage = totalRegisteredVoters > 0
      ? (totalVotesCast / totalRegisteredVoters) * 100
      : 0;
    
    // Get party-wise votes
    const partywiseVotesResult = await req.db.query(`
      SELECT p.id as party_id, COUNT(v.id) as vote_count
      FROM parties p
      LEFT JOIN votes v ON p.id = v.party_id
      GROUP BY p.id
      ORDER BY vote_count DESC
    `);
    
    const partywiseVotes = partywiseVotesResult.rows.map(row => ({
      partyId: row.party_id,
      votes: parseInt(row.vote_count),
      percentage: totalVotesCast > 0 ? (parseInt(row.vote_count) / totalVotesCast) * 100 : 0
    }));
    
    // Get district-wise turnout
    const districtTurnoutResult = await req.db.query(`
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
      turnout: parseInt(row.total_voters) > 0
        ? (parseInt(row.votes_cast) / parseInt(row.total_voters)) * 100
        : 0
    }));
    
    return res.status(200).json({
      success: true,
      stats: {
        totalRegisteredVoters,
        totalVotesCast,
        voterTurnoutPercentage,
        partywiseVotes,
        districtWiseTurnout
      }
    });
  } catch (error) {
    console.error('Error fetching election stats:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
