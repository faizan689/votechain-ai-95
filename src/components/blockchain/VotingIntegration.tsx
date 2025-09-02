import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWeb3 } from '@/hooks/useWeb3';
import { WalletConnection } from './WalletConnection';
import { 
  Vote, 
  Shield, 
  Users, 
  CheckCircle,
  AlertTriangle,
  Info 
} from 'lucide-react';
import { motion } from 'framer-motion';

interface VotingIntegrationProps {
  selectedParty?: {
    id: string;
    name: string;
  };
  onVoteSuccess?: (result: any) => void;
  onVoteError?: (error: string) => void;
}

export function VotingIntegration({ 
  selectedParty, 
  onVoteSuccess, 
  onVoteError 
}: VotingIntegrationProps) {
  const { 
    isConnected, 
    address, 
    castVote, 
    getVoterInfo,
    isLoading 
  } = useWeb3();
  
  const [voterInfo, setVoterInfo] = useState<{
    isRegistered: boolean;
    hasVoted: boolean;
  } | null>(null);
  const [isVoting, setIsVoting] = useState(false);

  // Check voter status when connected
  useEffect(() => {
    if (isConnected && address) {
      checkVoterStatus();
    }
  }, [isConnected, address]);

  const checkVoterStatus = async () => {
    if (!address) return;
    
    try {
      const info = await getVoterInfo(address);
      setVoterInfo(info);
    } catch (error) {
      console.error('Failed to check voter status:', error);
    }
  };

  const handleBlockchainVote = async () => {
    if (!selectedParty || !isConnected) return;
    
    setIsVoting(true);
    
    try {
      // Get biometric hash from localStorage (from face verification)
      const biometricHash = localStorage.getItem('currentBiometricHash') || 'default-hash';
      
      const result = await castVote(
        selectedParty.id,
        selectedParty.name,
        biometricHash
      );
      
      if (result.success) {
        onVoteSuccess?.(result);
        await checkVoterStatus(); // Refresh voter status
      } else {
        onVoteError?.(result.error || 'Blockchain vote failed');
      }
    } catch (error: any) {
      onVoteError?.(error.message || 'Failed to cast blockchain vote');
    } finally {
      setIsVoting(false);
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Blockchain Voting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <Info className="w-4 h-4" />
            <AlertDescription>
              Connect your MetaMask wallet to cast votes on the blockchain for maximum security and transparency.
            </AlertDescription>
          </Alert>
          <WalletConnection />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Blockchain Voting Ready
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="text-sm">
            Connected to Ethereum Sepolia
          </span>
          <Badge className="bg-green-100 text-green-800">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </Badge>
        </div>

        {voterInfo && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Voter Registration:</span>
              <Badge variant={voterInfo.isRegistered ? "default" : "destructive"}>
                {voterInfo.isRegistered ? 'Registered' : 'Not Registered'}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Voting Status:</span>
              <Badge variant={voterInfo.hasVoted ? "destructive" : "default"}>
                {voterInfo.hasVoted ? 'Already Voted' : 'Can Vote'}
              </Badge>
            </div>
          </div>
        )}

        {selectedParty && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-muted rounded-lg p-4"
          >
            <h4 className="font-medium mb-2">Selected Party:</h4>
            <div className="flex items-center gap-2">
              <Vote className="w-4 h-4" />
              <span>{selectedParty.name}</span>
            </div>
          </motion.div>
        )}

        {voterInfo?.hasVoted && (
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              You have already cast your vote on the blockchain. Each voter can only vote once.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <Button
            onClick={handleBlockchainVote}
            disabled={!selectedParty || isVoting || voterInfo?.hasVoted || isLoading}
            className="w-full"
          >
            {isVoting ? 'Casting Blockchain Vote...' : 'Cast Blockchain Vote'}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            Your vote will be permanently recorded on the Ethereum blockchain
          </p>
        </div>
      </CardContent>
    </Card>
  );
}