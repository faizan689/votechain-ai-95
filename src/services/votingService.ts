
import { apiRequest } from './api';
import { VoteCastResponse } from '@/types/api';

export const votingService = {
  /**
   * Cast a vote for a party
   */
  castVote: async (partyId: string, partyName: string): Promise<VoteCastResponse> => {
    console.log('Casting vote for:', { partyId, partyName });
    return await apiRequest<VoteCastResponse>('vote', { partyId, partyName });
  }
};
