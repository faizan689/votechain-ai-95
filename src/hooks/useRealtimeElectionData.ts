import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { web3Service } from "@/services/web3Service";

export interface RealtimeElectionData {
  // Database stats
  totalUsers: number;
  totalVotes: number;
  voterTurnout: number;
  partyWiseVotes: Array<{
    partyId: string;
    partyName: string;
    votes: number;
    percentage: number;
  }>;
  
  // Blockchain stats
  blockchainTotalVotes: number;
  blockchainTotalVoters: number;
  electionInfo: {
    name: string;
    startTime: number;
    endTime: number;
    isActive: boolean;
    partyIds: string[];
  } | null;
  
  // Status
  loading: boolean;
  lastUpdated: Date;
}

export function useRealtimeElectionData() {
  const [data, setData] = useState<RealtimeElectionData>({
    totalUsers: 0,
    totalVotes: 0,
    voterTurnout: 0,
    partyWiseVotes: [],
    blockchainTotalVotes: 0,
    blockchainTotalVoters: 0,
    electionInfo: null,
    loading: true,
    lastUpdated: new Date()
  });

  const fetchDatabaseStats = async () => {
    try {
      // Get total users
      const { count: userCount } = await supabase
        .from("users")
        .select("*", { count: 'exact', head: true });

      // Get total votes and party-wise breakdown
      const { data: votes } = await supabase
        .from("votes")
        .select("party_id, party_name");

      const totalVotes = votes?.length || 0;
      const totalUsers = userCount || 0;
      const voterTurnout = totalUsers > 0 ? (totalVotes / totalUsers) * 100 : 0;

      // Calculate party-wise votes
      const partyVotes = votes?.reduce((acc, vote) => {
        const existing = acc.find(p => p.partyId === vote.party_id);
        if (existing) {
          existing.votes++;
        } else {
          acc.push({
            partyId: vote.party_id,
            partyName: vote.party_name,
            votes: 1
          });
        }
        return acc;
      }, [] as Array<{ partyId: string; partyName: string; votes: number }>) || [];

      const partyWiseVotes = partyVotes.map(party => ({
        ...party,
        percentage: totalVotes > 0 ? (party.votes / totalVotes) * 100 : 0
      }));

      return {
        totalUsers,
        totalVotes,
        voterTurnout,
        partyWiseVotes
      };
    } catch (error) {
      console.error("Error fetching database stats:", error);
      return {
        totalUsers: 0,
        totalVotes: 0,
        voterTurnout: 0,
        partyWiseVotes: []
      };
    }
  };

  const fetchBlockchainStats = async () => {
    try {
      const [totalVotes, totalVoters, electionInfo] = await Promise.all([
        web3Service.getTotalVotes(),
        web3Service.getTotalRegisteredVoters(),
        web3Service.getElectionInfo()
      ]);

      return {
        blockchainTotalVotes: totalVotes,
        blockchainTotalVoters: totalVoters,
        electionInfo
      };
    } catch (error) {
      console.error("Error fetching blockchain stats:", error);
      return {
        blockchainTotalVotes: 0,
        blockchainTotalVoters: 0,
        electionInfo: null
      };
    }
  };

  const fetchAllData = async () => {
    console.log("Fetching realtime election data...");
    
    const [dbStats, blockchainStats] = await Promise.all([
      fetchDatabaseStats(),
      fetchBlockchainStats()
    ]);

    setData(prev => ({
      ...prev,
      ...dbStats,
      ...blockchainStats,
      loading: false,
      lastUpdated: new Date()
    }));
  };

  useEffect(() => {
    fetchAllData();

    // Set up realtime subscriptions for database changes
    const votesChannel = supabase
      .channel("election-data-votes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "votes" },
        (payload) => {
          console.log("Vote change detected:", payload);
          fetchAllData();
        }
      )
      .subscribe();

    const usersChannel = supabase
      .channel("election-data-users")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        (payload) => {
          console.log("User change detected:", payload);
          fetchAllData();
        }
      )
      .subscribe();

    // Set up blockchain event listeners
    web3Service.onVoteCast(() => {
      console.log("Blockchain vote detected");
      fetchAllData();
    });

    web3Service.onVoterRegistered(() => {
      console.log("Blockchain voter registration detected");
      fetchAllData();
    });

    web3Service.onElectionCreated(() => {
      console.log("Blockchain election created");
      fetchAllData();
    });

    // Periodic refresh every 15 seconds for blockchain data
    const interval = setInterval(fetchAllData, 15000);

    return () => {
      supabase.removeChannel(votesChannel);
      supabase.removeChannel(usersChannel);
      clearInterval(interval);
    };
  }, []);

  return useMemo(() => data, [data]);
}