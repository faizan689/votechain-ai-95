
import { apiRequest, setAuthToken, setAdminToken } from './api';
import { AuthResponse, VoterVerificationResponse } from '@/types/api';

export const authService = {
  /**
   * Request OTP for voter authentication via phone
   */
  requestOTP: async (phoneNumber: string): Promise<AuthResponse> => {
    return await apiRequest<AuthResponse>('auth-request-otp', { phoneNumber });
  },
  
  /**
   * Verify OTP and get authentication token
   */
  verifyOTP: async (phoneNumber: string, otp: string): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>('auth-verify-otp', { 
      phoneNumber, 
      otp 
    });
    
    if (response.token) {
      // Store user phone for facial verification
      localStorage.setItem('userPhone', phoneNumber);
      
      // Check if this is an admin user based on response
      const isAdminUser = response.message?.includes('admin') || response.user?.role === 'admin';
      
      if (isAdminUser) {
        setAdminToken(response.token);
        localStorage.setItem('isAdmin', 'true');
      } else {
        setAuthToken(response.token);
        localStorage.setItem('isAdmin', 'false');
      }
      localStorage.setItem('isVerified', 'true');
    }
    
    return response;
  },
  
  /**
   * Perform facial verification
   */
  facialVerification: async (imageData: string, phoneNumber: string): Promise<VoterVerificationResponse> => {
    return await apiRequest<VoterVerificationResponse>('auth-face-verify', {
      imageData,
      phoneNumber
    });
  },
  
  /**
   * Check if user is admin
   */
  isAdmin: (): boolean => {
    return localStorage.getItem('isAdmin') === 'true';
  },
  
  /**
   * Check if user is verified
   */
  isVerified: (): boolean => {
    return localStorage.getItem('isVerified') === 'true';
  },
  
  /**
   * Log out the user
   */
  logout: (): void => {
    localStorage.removeItem('isVerified');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userPhone');
    setAuthToken('');
    setAdminToken('');
  }
};
