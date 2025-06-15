
import { apiRequest } from './api';
import { VoteCastResponse } from '@/types/api';

export const votingService = {
  /**
   * Cast a vote for a party
   */
  castVote: async (partyId: string): Promise<VoteCastResponse> => {
    return await apiRequest<VoteCastResponse>('vote', { partyId });
  }
};
