
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
   * Perform facial verification
   */
  facialVerification: async (imageData: string): Promise<VoterVerificationResponse> => {
    return await apiRequest<VoterVerificationResponse>(
      '/auth/facial-verification',
      "POST",
      { imageData },
      false // Use voter token
    );
  }
};
