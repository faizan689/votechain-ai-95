import { useState, useEffect, useCallback } from 'react';
import { web3Service } from '@/services/web3Service';
import { toast } from 'sonner';

export interface Web3State {
  isConnected: boolean;
  address: string | null;
  balance: string;
  isLoading: boolean;
  error: string | null;
}

export function useWeb3() {
  const [state, setState] = useState<Web3State>({
    isConnected: false,
    address: null,
    balance: '0',
    isLoading: false,
    error: null
  });

  const updateState = useCallback(async () => {
    const isConnected = web3Service.getConnectionStatus();
    const address = await web3Service.getAccount();
    const balance = await web3Service.getBalance();
    
    setState(prev => ({
      ...prev,
      isConnected,
      address,
      balance,
      isLoading: false
    }));
  }, []);

  const connectWallet = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await web3Service.connectWallet();
      
      if (result.success) {
        toast.success('Wallet connected successfully!');
        await updateState();
      } else {
        setState(prev => ({ ...prev, error: result.error || 'Connection failed', isLoading: false }));
        toast.error(result.error || 'Failed to connect wallet');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to connect wallet';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      toast.error(errorMessage);
    }
  }, [updateState]);

  const disconnect = useCallback(() => {
    web3Service.disconnect();
    setState({
      isConnected: false,
      address: null,
      balance: '0',
      isLoading: false,
      error: null
    });
    toast.info('Wallet disconnected');
  }, []);

  // Contract interaction methods
  const registerVoter = useCallback(async (
    voterAddress: string, 
    faceHash: string, 
    phoneNumber: string
  ) => {
    if (!state.isConnected) {
      throw new Error('Wallet not connected');
    }

    const result = await web3Service.registerVoter(voterAddress, faceHash, phoneNumber);
    
    if (result.success) {
      toast.success('Voter registered on blockchain!');
      return result;
    } else {
      toast.error(result.error || 'Failed to register voter');
      throw new Error(result.error);
    }
  }, [state.isConnected]);

  const castVote = useCallback(async (
    partyId: string,
    partyName: string,
    biometricHash: string
  ) => {
    if (!state.isConnected) {
      throw new Error('Wallet not connected');
    }

    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const result = await web3Service.castVote(partyId, partyName, biometricHash);
      
      if (result.success) {
        toast.success('Vote cast successfully on blockchain!');
        await updateState();
        return result;
      } else {
        toast.error(result.error || 'Failed to cast vote');
        throw new Error(result.error);
      }
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.isConnected, updateState]);

  const getElectionInfo = useCallback(async () => {
    return await web3Service.getElectionInfo();
  }, []);

  const getVoteCount = useCallback(async (partyId: string) => {
    return await web3Service.getVoteCount(partyId);
  }, []);

  const getVoterInfo = useCallback(async (address: string) => {
    return await web3Service.getVoterInfo(address);
  }, []);

  const getTotalVotes = useCallback(async () => {
    return await web3Service.getTotalVotes();
  }, []);

  const getTotalRegisteredVoters = useCallback(async () => {
    return await web3Service.getTotalRegisteredVoters();
  }, []);

  const verifyVote = useCallback(async (voteHash: string) => {
    return await web3Service.verifyVote(voteHash);
  }, []);

  // Multi-signature admin functions
  const proposeElection = useCallback(async (
    name: string,
    startTime: number,
    endTime: number,
    partyIds: string[],
    partyNames: string[]
  ) => {
    if (!state.isConnected) {
      throw new Error('Wallet not connected');
    }

    const result = await web3Service.proposeElection(name, startTime, endTime, partyIds, partyNames);
    
    if (result.success) {
      toast.success('Election proposal submitted!');
      return result;
    } else {
      toast.error(result.error || 'Failed to propose election');
      throw new Error(result.error);
    }
  }, [state.isConnected]);

  const signAdminAction = useCallback(async (actionHash: string) => {
    if (!state.isConnected) {
      throw new Error('Wallet not connected');
    }

    const result = await web3Service.signAdminAction(actionHash);
    
    if (result.success) {
      toast.success('Admin action signed!');
      return result;
    } else {
      toast.error(result.error || 'Failed to sign action');
      throw new Error(result.error);
    }
  }, [state.isConnected]);

  // Initialize on component mount
  useEffect(() => {
    updateState();
  }, [updateState]);

  // Setup event listeners
  useEffect(() => {
    if (state.isConnected) {
      web3Service.onVoteCast((event) => {
        console.log('Vote cast event:', event);
        toast.success(`New vote cast for ${event.args.partyId}`);
      });

      web3Service.onVoterRegistered((event) => {
        console.log('Voter registered event:', event);
        toast.info(`New voter registered: ${event.args.voter}`);
      });

      web3Service.onElectionCreated((event) => {
        console.log('Election created event:', event);
        toast.success(`New election created: ${event.args.name}`);
      });
    }
  }, [state.isConnected]);

  return {
    ...state,
    connectWallet,
    disconnect,
    registerVoter,
    castVote,
    getElectionInfo,
    getVoteCount,
    getVoterInfo,
    getTotalVotes,
    getTotalRegisteredVoters,
    verifyVote,
    proposeElection,
    signAdminAction
  };
}