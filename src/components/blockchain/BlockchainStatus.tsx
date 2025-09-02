import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCcw, ExternalLink, Activity, Users, Vote } from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';
import { motion } from 'framer-motion';

interface BlockchainStats {
  totalVotes: number;
  totalVoters: number;
  electionInfo: {
    name: string;
    isActive: boolean;
    startTime: number;
    endTime: number;
  } | null;
  isLoading: boolean;
}

export function BlockchainStatus() {
  const { 
    isConnected, 
    getTotalVotes, 
    getTotalRegisteredVoters, 
    getElectionInfo 
  } = useWeb3();
  
  const [stats, setStats] = useState<BlockchainStats>({
    totalVotes: 0,
    totalVoters: 0,
    electionInfo: null,
    isLoading: false
  });

  const refreshStats = async () => {
    if (!isConnected) return;
    
    setStats(prev => ({ ...prev, isLoading: true }));
    
    try {
      const [totalVotes, totalVoters, electionInfo] = await Promise.all([
        getTotalVotes(),
        getTotalRegisteredVoters(),
        getElectionInfo()
      ]);
      
      setStats({
        totalVotes,
        totalVoters,
        electionInfo,
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to refresh blockchain stats:', error);
      setStats(prev => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    if (isConnected) {
      refreshStats();
      // Refresh every 30 seconds
      const interval = setInterval(refreshStats, 30000);
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            Connect your wallet to view blockchain status
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Blockchain Status
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Sepolia Testnet
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshStats}
            disabled={stats.isLoading}
            className="h-8 w-8 p-0"
          >
            <RefreshCcw className={`w-4 h-4 ${stats.isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Vote className="w-4 h-4" />
              Total Votes
            </div>
            <div className="text-2xl font-bold">{stats.totalVotes}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              Registered Voters
            </div>
            <div className="text-2xl font-bold">{stats.totalVoters}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <div className="text-sm text-muted-foreground">Election Status</div>
            <div className="flex items-center gap-2">
              {stats.electionInfo?.isActive ? (
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              ) : (
                <Badge variant="secondary">Inactive</Badge>
              )}
            </div>
          </motion.div>
        </div>

        {stats.electionInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 p-3 bg-muted rounded-lg"
          >
            <h4 className="font-medium mb-2">{stats.electionInfo.name}</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>
                Start: {new Date(stats.electionInfo.startTime * 1000).toLocaleString()}
              </div>
              <div>
                End: {new Date(stats.electionInfo.endTime * 1000).toLocaleString()}
              </div>
            </div>
          </motion.div>
        )}

        <div className="mt-4 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('https://sepolia.etherscan.io/', '_blank')}
            className="w-full"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View on Etherscan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}