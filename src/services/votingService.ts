
import { apiRequest } from './api';
import { VoteCastResponse } from '@/types/api';

export const votingService = {
  /**
   * Cast a vote for a party
   */
  castVote: async (partyId: string, partyName: string): Promise<VoteCastResponse> => {
    console.log('VotingService: Casting vote for:', { partyId, partyName });
    
    try {
      const response = await apiRequest<VoteCastResponse>('vote', { partyId, partyName });
      console.log('VotingService: Vote response received:', response);
      return response;
    } catch (error: any) {
      console.error('VotingService: Vote casting failed:', error);
      
      // Enhanced error handling with specific status code checking
      if (error.message && error.message.includes('409')) {
        console.log('VotingService: User already voted (409 Conflict)');
        throw new Error('already_voted');
      }
      
      if (error.message && error.message.includes('401')) {
        console.error('VotingService: Authentication error - token may be invalid');
        throw new Error('Authentication failed. Please log in again.');
      }
      
      if (error.message && error.message.includes('400')) {
        console.error('VotingService: Bad request error');
        throw new Error('Invalid vote request. Please try again.');
      }
      
      throw new Error(error.message || 'Failed to cast vote. Please try again.');
    }
  }
};
