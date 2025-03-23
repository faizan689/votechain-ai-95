
import express from 'express';
import { generateOTP, verifyVoterExists, hashPassword, comparePassword } from '../utils/auth';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

/**
 * Verify voter ID and send OTP
 * POST /api/auth/verify-voter-id
 */
router.post('/verify-voter-id', async (req: any, res) => {
  try {
    const { voterId } = req.body;
    
    if (!voterId) {
      return res.status(400).json({ success: false, error: 'Voter ID is required' });
    }
    
    // Check if voter exists in database
    const voter = await verifyVoterExists(req.db, voterId);
    
    if (!voter) {
      return res.status(404).json({ success: false, error: 'Voter ID not found' });
    }
    
    // Check if voter has already voted
    if (voter.has_voted) {
      return res.status(403).json({ success: false, error: 'You have already cast your vote' });
    }
    
    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP in database with expiration
    await req.db.query(
      'UPDATE voters SET otp = $1, otp_expires_at = NOW() + INTERVAL \'5 minutes\' WHERE voter_id = $2',
      [hashPassword(otp), voterId]
    );
    
    // In a real application, send OTP via SMS
    console.log(`OTP for ${voterId}: ${otp}`);
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: 'OTP sent to registered mobile number'
    });
  } catch (error) {
    console.error('Error verifying voter ID:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * Verify OTP
 * POST /api/auth/verify-otp
 */
router.post('/verify-otp', async (req: any, res) => {
  try {
    const { voterId, otp } = req.body;
    
    if (!voterId || !otp) {
      return res.status(400).json({ success: false, error: 'Voter ID and OTP are required' });
    }
    
    // Get stored OTP from database
    const result = await req.db.query(
      'SELECT otp, otp_expires_at FROM voters WHERE voter_id = $1',
      [voterId]
    );
    
    const voter = result.rows[0];
    
    if (!voter) {
      return res.status(404).json({ success: false, error: 'Voter ID not found' });
    }
    
    // Check if OTP has expired
    if (new Date() > new Date(voter.otp_expires_at)) {
      return res.status(401).json({ success: false, error: 'OTP has expired' });
    }
    
    // Verify OTP
    if (!comparePassword(otp, voter.otp)) {
      return res.status(401).json({ success: false, error: 'Invalid OTP' });
    }
    
    // Clear OTP from database
    await req.db.query(
      'UPDATE voters SET otp = NULL, otp_expires_at = NULL WHERE voter_id = $1',
      [voterId]
    );
    
    // Generate JWT token
    const token = generateToken(voterId);
    
    // Return success response with token
    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      token
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * Facial verification
 * POST /api/auth/facial-verification
 */
router.post('/facial-verification', authenticateToken, async (req: any, res) => {
  try {
    const { imageData } = req.body;
    const voterId = req.user.voterId;
    
    if (!imageData) {
      return res.status(400).json({ success: false, error: 'Image data is required' });
    }
    
    // Get voter information from database
    const result = await req.db.query(
      'SELECT name, district, has_voted FROM voters WHERE voter_id = $1',
      [voterId]
    );
    
    const voter = result.rows[0];
    
    if (!voter) {
      return res.status(404).json({ success: false, error: 'Voter not found' });
    }
    
    if (voter.has_voted) {
      return res.status(403).json({ success: false, error: 'You have already cast your vote' });
    }
    
    // In a real app, perform facial recognition here
    // For demo purposes, always succeed
    
    // Return success response with voter information
    return res.status(200).json({
      success: true,
      message: 'Facial verification successful',
      voter: {
        id: voterId,
        name: voter.name,
        district: voter.district,
        hasVoted: voter.has_voted
      }
    });
  } catch (error) {
    console.error('Error during facial verification:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
