
import { apiRequest } from './api';
import { web3Service } from './web3Service';
import { VoteCastResponse } from '@/types/api';

export const votingService = {
  /**
   * Cast a vote for a party with blockchain integration
   */
  castVote: async (partyId: string, partyName: string): Promise<VoteCastResponse> => {
    console.log('VotingService: Casting vote for:', { partyId, partyName });
    
    try {
      // Check if user is connected to blockchain
      const isWeb3Connected = web3Service.getConnectionStatus();
      
      if (isWeb3Connected) {
        console.log('VotingService: Casting vote on blockchain...');
        
        try {
          // Get biometric hash from localStorage or use default
          const biometricHash = localStorage.getItem('currentBiometricHash') || 'default-hash';
          
          const blockchainResult = await web3Service.castVote(partyId, partyName, biometricHash);
          
          if (blockchainResult.success) {
            console.log('VotingService: Blockchain vote successful:', blockchainResult);
            
            // Also record in traditional database for analytics
            try {
              const response = await apiRequest<VoteCastResponse>('vote', {
                partyId,
                partyName,
                blockchainTxHash: blockchainResult.txHash,
                voteHash: blockchainResult.voteHash
              });
              
              return {
                ...response,
                blockchainTxHash: blockchainResult.txHash,
                isBlockchainVote: true
              };
            } catch (dbError) {
              console.warn('VotingService: Database recording failed, but blockchain vote succeeded:', dbError);
              
              return {
                success: true,
                message: 'Vote recorded on blockchain successfully!',
                transactionId: blockchainResult.txHash,
                blockchainTxHash: blockchainResult.txHash,
                isBlockchainVote: true
              };
            }
          } else {
            throw new Error(blockchainResult.error || 'Blockchain vote failed');
          }
        } catch (blockchainError: any) {
          console.warn('VotingService: Blockchain voting failed, falling back to database vote:', blockchainError);
          
          // Check if it's a contract deployment issue
          if (blockchainError.message?.includes('Smart contract not deployed') || 
              blockchainError.message?.includes('could not decode result data')) {
            console.log('VotingService: Contract not deployed, using database-only voting...');
            
            // Fall back to traditional database vote
            const isAdminUser = localStorage.getItem('isAdmin') === 'true';
            const response = await apiRequest<VoteCastResponse>('vote', { partyId, partyName }, isAdminUser);
            console.log('VotingService: Database vote successful (blockchain fallback):', response);
            return {
              ...response,
              message: response.message + ' (Database only - blockchain contract not deployed)',
              isBlockchainVote: false
            };
          } else {
            // Re-throw other blockchain errors
            throw blockchainError;
          }
        }
      } else {
        console.log('VotingService: Falling back to traditional vote...');
        
        // For admin users, explicitly use admin token
        const isAdminUser = localStorage.getItem('isAdmin') === 'true';
        const response = await apiRequest<VoteCastResponse>('vote', { partyId, partyName }, isAdminUser);
        console.log('VotingService: Vote response received:', response);
        return response;
      }
    } catch (error: any) {
      console.error('VotingService: Vote casting failed:', error);
      
      // Enhanced error handling for Supabase Functions errors  
      if (error.name === 'FunctionsHttpError') {
        console.log('VotingService: FunctionsHttpError detected - likely user already voted');
        
        // For admin users who have already voted, allow them to vote again as a test
        if (localStorage.getItem('isAdmin') === 'true') {
          console.log('VotingService: Admin user - allowing test vote after conflict');
          // Return mock success response for admin test
          return {
            success: true,
            message: 'Admin test vote recorded (conflict handled)',
            transactionId: 'TEST_TX_' + Date.now(),
            isAdminTest: true
          };
        }
        
        // For regular users, assume 409/conflict means already voted since JWT is working
        console.log('VotingService: Regular user - assuming already voted conflict');
        throw new Error('already_voted');
      }
      
      // Check for specific error patterns in message
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
