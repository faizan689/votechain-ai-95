import React, { createContext, useContext, ReactNode } from 'react';
import { useRealtimeElectionData, RealtimeElectionData } from '@/hooks/useRealtimeElectionData';
import { useRealtimeVotingSchedule } from '@/hooks/admin/useRealtimeVotingSchedule';
import { useRealtimeUsers } from '@/hooks/admin/useRealtimeUsers';
import { useRealtimeAnalytics } from '@/hooks/admin/useRealtimeAnalytics';
import { useAdminMetrics } from '@/hooks/admin/useAdminMetrics';
import { useRealtimeSecurityLogs } from '@/hooks/admin/useRealtimeSecurityLogs';

interface RealtimeDataContextType {
  electionData: RealtimeElectionData;
  votingSchedule: ReturnType<typeof useRealtimeVotingSchedule>;
  users: ReturnType<typeof useRealtimeUsers>;
  analytics: ReturnType<typeof useRealtimeAnalytics>;
  metrics: ReturnType<typeof useAdminMetrics>;
  securityLogs: ReturnType<typeof useRealtimeSecurityLogs>;
}

const RealtimeDataContext = createContext<RealtimeDataContextType | null>(null);

export const useRealtimeData = () => {
  const context = useContext(RealtimeDataContext);
  if (!context) {
    throw new Error('useRealtimeData must be used within RealtimeDataProvider');
  }
  return context;
};

interface RealtimeDataProviderProps {
  children: ReactNode;
}

export function RealtimeDataProvider({ children }: RealtimeDataProviderProps) {
  const electionData = useRealtimeElectionData();
  const votingSchedule = useRealtimeVotingSchedule();
  const users = useRealtimeUsers();
  const analytics = useRealtimeAnalytics();
  const metrics = useAdminMetrics();
  const securityLogs = useRealtimeSecurityLogs();

  const value: RealtimeDataContextType = {
    electionData,
    votingSchedule,
    users,
    analytics,
    metrics,
    securityLogs
  };

  return (
    <RealtimeDataContext.Provider value={value}>
      {children}
    </RealtimeDataContext.Provider>
  );
}