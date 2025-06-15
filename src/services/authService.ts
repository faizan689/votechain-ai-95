
import { apiRequest, setAuthToken, setAdminToken, removeAuthToken, removeAdminToken } from './api';
import { AuthResponse, VoterVerificationResponse } from '@/types/api';

export const authService = {
  /**
   * Request OTP for voter authentication via phone
   */
  requestOTP: async (phoneNumber: string): Promise<AuthResponse> => {
    try {
      const response = await apiRequest<AuthResponse>('auth-request-otp', { phoneNumber });
      console.log('AuthService: OTP request response:', response);
      return response;
    } catch (error: any) {
      console.error('AuthService: OTP request failed:', error);
      
      // Parse error message if it's a string response
      if (typeof error.message === 'string') {
        try {
          const errorData = JSON.parse(error.message);
          return {
            success: false,
            error: errorData.error || 'Failed to send OTP'
          };
        } catch (parseError) {
          // If JSON parsing fails, return the original error message
          return {
            success: false,
            error: error.message
          };
        }
      }
      
      return {
        success: false,
        error: 'Failed to send OTP. Please try again.'
      };
    }
  },
  
  /**
   * Verify OTP and get authentication token
   */
  verifyOTP: async (phoneNumber: string, otp: string): Promise<AuthResponse> => {
    try {
      const response = await apiRequest<AuthResponse>('auth-verify-otp', { 
        phoneNumber, 
        otp 
      });
      
      console.log('AuthService: OTP verification response:', response);
      
      if (response && response.success && response.token) {
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
    } catch (error: any) {
      console.error('AuthService: OTP verification failed:', error);
      
      // Parse error message if it's a string response
      if (typeof error.message === 'string') {
        try {
          const errorData = JSON.parse(error.message);
          return {
            success: false,
            error: errorData.error || 'OTP verification failed'
          };
        } catch (parseError) {
          return {
            success: false,
            error: error.message
          };
        }
      }
      
      return {
        success: false,
        error: 'OTP verification failed. Please try again.'
      };
    }
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
    removeAuthToken();
    removeAdminToken();
  }
};
