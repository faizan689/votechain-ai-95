
import { apiRequest, setAuthToken } from './api';
import { AuthResponse, VoterVerificationResponse } from '@/types/api';

export const authService = {
  /**
   * Verify voter ID and send OTP
   */
  verifyVoterId: async (voterId: string): Promise<AuthResponse> => {
    return await apiRequest<AuthResponse>(
      '/auth/verify-voter-id',
      "POST",
      { voterId }
    );
  },
  
  /**
   * Verify OTP
   */
  verifyOTP: async (voterId: string, otp: string): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>(
      '/auth/verify-otp',
      "POST",
      { voterId, otp }
    );
    
    // Store the token if it's available
    if (response.token) {
      setAuthToken(response.token);
    }
    
    return response;
  },
  
  /**
   * Perform facial verification (mock implementation)
   */
  facialVerification: async (imageData: string): Promise<VoterVerificationResponse> => {
    // For a frontend-only app, we'll simulate verification with a 90% success rate
    const isVerified = Math.random() < 0.9;
    
    if (isVerified) {
      return {
        success: true,
        message: 'Facial verification successful',
        voter: {
          id: 'VOTER-' + Math.random().toString(36).substring(2),
          name: 'John Doe',
          district: 'Central District',
          hasVoted: false
        }
      };
    } else {
      return {
        success: false,
        error: 'Facial verification failed. Please try again.'
      };
    }
  }
};
