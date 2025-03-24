
/**
 * API utilities for the VoteGuard application (mock implementation)
 */

// Storage keys
export const TOKEN_STORAGE_KEY = "voteguard_auth_token";
export const ADMIN_TOKEN_STORAGE_KEY = "voteguard_admin_token";

// Get auth token from storage
export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

// Set auth token in storage
export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

// Remove auth token from storage
export function removeAuthToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

// Get admin token from storage
export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
}

// Set admin token in storage
export function setAdminToken(token: string): void {
  localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
}

// Remove admin token from storage
export function removeAdminToken(): void {
  localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
}

// Mock API request helper
export async function apiRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  data?: any,
  isAdmin: boolean = false
): Promise<T> {
  // For a frontend-only app, we'll simulate API responses
  console.log(`Mock API request: ${method} ${endpoint}`, data);
  
  // Add a small delay to simulate network latency
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return mock data based on the endpoint
  return mockApiResponses(endpoint, method, data) as T;
}

// Mock API responses
function mockApiResponses(endpoint: string, method: string, data?: any): any {
  // Simulate different API endpoints
  if (endpoint === '/auth/verify-voter-id' && method === 'POST') {
    return {
      success: true,
      message: 'OTP sent to registered mobile number'
    };
  }
  
  if (endpoint === '/auth/verify-otp' && method === 'POST') {
    return {
      success: true,
      message: 'OTP verified successfully',
      token: 'mock-jwt-token-' + Math.random().toString(36).substring(2)
    };
  }
  
  if (endpoint === '/voting/parties' && method === 'GET') {
    return {
      success: true,
      parties: [
        {
          id: 'PTY-001',
          name: 'Progressive Alliance',
          symbol: 'Star',
          color: '#1E88E5',
          logoPath: '/logos/progressive-alliance.png'
        },
        {
          id: 'PTY-002',
          name: 'Conservative Union',
          symbol: 'Tree',
          color: '#43A047',
          logoPath: '/logos/conservative-union.png'
        },
        {
          id: 'PTY-003',
          name: 'Liberty Party',
          symbol: 'Eagle',
          color: '#FDD835',
          logoPath: '/logos/liberty-party.png'
        },
        {
          id: 'PTY-004',
          name: 'National Front',
          symbol: 'Lion',
          color: '#F4511E',
          logoPath: '/logos/national-front.png'
        },
        {
          id: 'PTY-005',
          name: 'Unity Coalition',
          symbol: 'Handshake',
          color: '#8E24AA',
          logoPath: '/logos/unity-coalition.png'
        }
      ]
    };
  }
  
  if (endpoint === '/voting/cast-vote' && method === 'POST') {
    return {
      success: true,
      message: 'Vote cast successfully',
      transactionId: 'tx-' + Math.random().toString(36).substring(2)
    };
  }
  
  if (endpoint === '/admin/stats' && method === 'GET') {
    return {
      success: true,
      stats: {
        totalRegisteredVoters: 5000,
        totalVotesCast: 3245,
        voterTurnoutPercentage: 64.9,
        partywiseVotes: [
          {
            partyId: 'PTY-001',
            partyName: 'Progressive Alliance',
            votes: 1245,
            percentage: 38.4
          },
          {
            partyId: 'PTY-002',
            partyName: 'Conservative Union',
            votes: 987,
            percentage: 30.4
          },
          {
            partyId: 'PTY-003',
            partyName: 'Liberty Party',
            votes: 568,
            percentage: 17.5
          },
          {
            partyId: 'PTY-004',
            partyName: 'National Front',
            votes: 312,
            percentage: 9.6
          },
          {
            partyId: 'PTY-005',
            partyName: 'Unity Coalition',
            votes: 133,
            percentage: 4.1
          }
        ],
        districtWiseTurnout: [
          {
            district: 'North District',
            totalVoters: 1200,
            votesCast: 876,
            turnout: 73.0
          },
          {
            district: 'South District',
            totalVoters: 980,
            votesCast: 654,
            turnout: 66.7
          },
          {
            district: 'East District',
            totalVoters: 1100,
            votesCast: 712,
            turnout: 64.7
          },
          {
            district: 'West District',
            totalVoters: 920,
            votesCast: 543,
            turnout: 59.0
          },
          {
            district: 'Central District',
            totalVoters: 800,
            votesCast: 460,
            turnout: 57.5
          }
        ]
      }
    };
  }
  
  // Default response for unhandled endpoints
  return {
    success: false,
    error: 'Endpoint not implemented in mock API'
  };
}
