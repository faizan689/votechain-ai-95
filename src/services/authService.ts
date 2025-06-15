
import { apiRequest, setAuthToken, setAdminToken } from './api';
import { AuthResponse, VoterVerificationResponse } from '@/types/api';

export const authService = {
  /**
   * Request OTP for voter authentication
   */
  requestOTP: async (email: string): Promise<AuthResponse> => {
    return await apiRequest<AuthResponse>('auth-request-otp', { email });
  },
  
  /**
   * Verify OTP and get authentication token
   */
  verifyOTP: async (email: string, otp: string): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>('auth-verify-otp', { 
      email, 
      otp 
    });
    
    if (response.token) {
      // Store user email for facial verification
      localStorage.setItem('userEmail', email);
      
      // Check if this is an admin user based on email domain or response
      const isAdminUser = email.includes('admin@') || response.message?.includes('admin');
      
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
  facialVerification: async (imageData: string, email: string): Promise<VoterVerificationResponse> => {
    return await apiRequest<VoterVerificationResponse>('auth-face-verify', {
      imageData,
      email
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
    localStorage.removeItem('userEmail');
    setAuthToken('');
    setAdminToken('');
  }
};
