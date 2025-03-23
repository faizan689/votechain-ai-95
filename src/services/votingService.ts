
import { apiRequest } from './api';
import { VoteCastResponse, PartiesResponse } from '@/types/api';

export const votingService = {
  /**
   * Get list of parties
   */
  getParties: async (): Promise<PartiesResponse> => {
    return await apiRequest<PartiesResponse>(
      '/voting/parties',
      "GET"
    );
  },
  
  /**
   * Cast a vote for a party
   */
  castVote: async (partyId: string): Promise<VoteCastResponse> => {
    return await apiRequest<VoteCastResponse>(
      '/voting/cast-vote',
      "POST",
      { partyId },
      false // Use voter token
    );
  }
};
