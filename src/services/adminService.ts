
import { apiRequest } from './api';
import { AdminStatsResponse } from '@/types/api';

export const adminService = {
  /**
   * Get election statistics
   */
  getElectionStats: async (): Promise<AdminStatsResponse> => {
    return await apiRequest<AdminStatsResponse>(
      '/admin/stats',
      "GET",
      undefined,
      true // Use admin token
    );
  }
};
