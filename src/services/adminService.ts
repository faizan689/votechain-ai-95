
import { apiRequest } from './api';
import { AdminStatsResponse } from '@/types/api';

// Mock data for the development environment
const getMockStats = (): AdminStatsResponse => {
  // Get a consistent percentage with some variance
  const basePercent = 42.8;
  const variance = Math.sin(Date.now() / 10000000) * 2; // Slight variance over time
  const currentPercent = basePercent + variance;
  
  // Calculate votes based on percentage
  const totalRegistered = 854291;
  const votesCast = Math.round(totalRegistered * (currentPercent / 100));
  
  return {
    stats: {
      totalRegisteredVoters: totalRegistered,
      totalVotesCast: votesCast,
      voterTurnoutPercentage: currentPercent,
      activePollingStations: 1254,
      activePollingStationsPercentage: 98.2,
      recentChange: 1.2 + (Math.random() * 0.4 - 0.2), // Small random variance
      
      partywiseVotes: [
        { partyId: "bjp", partyName: "Bharatiya Janata Party", votes: 154932, percentage: 42.4 },
        { partyId: "inc", partyName: "Indian National Congress", votes: 124785, percentage: 34.1 },
        { partyId: "aap", partyName: "Aam Aadmi Party", votes: 78563, percentage: 21.5 },
        { partyId: "nota", partyName: "None of the Above", votes: 7357, percentage: 2.0 }
      ],
      
      demographicBreakdown: {
        ageGroups: [
          { group: "18-24", votes: 32584, percentage: 8.9 },
          { group: "25-34", votes: 98745, percentage: 27.0 },
          { group: "35-44", votes: 87452, percentage: 23.9 },
          { group: "45-54", votes: 65324, percentage: 17.9 },
          { group: "55-64", votes: 52178, percentage: 14.3 },
          { group: "65+", votes: 29354, percentage: 8.0 }
        ],
        gender: [
          { type: "Male", votes: 189432, percentage: 51.8 },
          { type: "Female", votes: 172349, percentage: 47.1 },
          { type: "Non-binary", votes: 3856, percentage: 1.1 }
        ]
      },
      
      securityIncidents: {
        total: 54,
        byType: {
          facialVerificationFailure: 37,
          duplicateVoteAttempt: 12,
          unauthorizedAccess: 5
        },
        resolved: 42,
        pending: 12
      }
    }
  };
};

export const adminService = {
  /**
   * Get election statistics
   */
  getElectionStats: async (): Promise<AdminStatsResponse> => {
    try {
      // In development, return mock data
      if (process.env.NODE_ENV === 'development') {
        return getMockStats();
      }
      
      // In production, make the actual API call
      return await apiRequest<AdminStatsResponse>(
        '/admin/stats',
        "GET",
        undefined,
        true // Use admin token
      );
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      // Return mock data as fallback
      return getMockStats();
    }
  },
  
  /**
   * Update voting schedule
   */
  updateVotingSchedule: async (scheduleData: any): Promise<{ success: boolean }> => {
    try {
      if (process.env.NODE_ENV === 'development') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        return { success: true };
      }
      
      return await apiRequest<{ success: boolean }>(
        '/admin/schedule',
        "PUT",
        scheduleData,
        true
      );
    } catch (error) {
      console.error("Error updating voting schedule:", error);
      throw error;
    }
  },
  
  /**
   * Get security logs
   */
  getSecurityLogs: async (): Promise<any> => {
    try {
      if (process.env.NODE_ENV === 'development') {
        // Return mock security logs in development
        await new Promise(resolve => setTimeout(resolve, 600));
        return { logs: [] };
      }
      
      return await apiRequest<any>(
        '/admin/security-logs',
        "GET",
        undefined,
        true
      );
    } catch (error) {
      console.error("Error fetching security logs:", error);
      throw error;
    }
  }
};
