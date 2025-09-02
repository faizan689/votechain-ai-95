import { ethers } from 'ethers';
import VotingContractABI from '../contracts/VotingContract.json';

// Sepolia Testnet Configuration
export const SEPOLIA_CONFIG = {
  chainId: '0xaa36a7', // 11155111 in hex
  chainName: 'Sepolia Test Network',
  nativeCurrency: {
    name: 'SepoliaETH',
    symbol: 'SEP',
    decimals: 18
  },
  rpcUrls: ['https://sepolia.infura.io/v3/YOUR_PROJECT_ID'],
  blockExplorerUrls: ['https://sepolia.etherscan.io']
};

// Contract address (will be updated after deployment)
export const CONTRACT_ADDRESS = process.env.VITE_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

export class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;
  private isConnected = false;

  constructor() {
    this.initializeProvider();
  }

  private async initializeProvider() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new ethers.BrowserProvider(window.ethereum);
      
      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          this.disconnect();
        } else {
          this.initializeSigner();
        }
      });

      // Listen for chain changes
      window.ethereum.on('chainChanged', (chainId: string) => {
        console.log('Chain changed to:', chainId);
        if (chainId !== SEPOLIA_CONFIG.chainId) {
          this.switchToSepolia();
        }
      });
    }
  }

  async connectWallet(): Promise<{ success: boolean; address?: string; error?: string }> {
    try {
      if (!window.ethereum) {
        return { success: false, error: 'MetaMask not installed' };
      }

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Switch to Sepolia if not already
      await this.switchToSepolia();
      
      await this.initializeSigner();
      
      const address = await this.signer?.getAddress();
      this.isConnected = true;
      
      return { success: true, address };
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to connect wallet' 
      };
    }
  }

  async switchToSepolia(): Promise<boolean> {
    try {
      if (!window.ethereum) return false;

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CONFIG.chainId }],
      });

      return true;
    } catch (switchError: any) {
      // Chain not added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [SEPOLIA_CONFIG],
          });
          return true;
        } catch (addError) {
          console.error('Failed to add Sepolia network:', addError);
          return false;
        }
      }
      console.error('Failed to switch to Sepolia:', switchError);
      return false;
    }
  }

  private async initializeSigner() {
    if (!this.provider) return;
    
    this.signer = await this.provider.getSigner();
    this.contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      VotingContractABI.abi,
      this.signer
    );
  }

  disconnect() {
    this.isConnected = false;
    this.signer = null;
    this.contract = null;
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  async getAccount(): Promise<string | null> {
    try {
      return await this.signer?.getAddress() || null;
    } catch {
      return null;
    }
  }

  async getBalance(): Promise<string> {
    try {
      if (!this.signer || !this.provider) return '0';
      const address = await this.signer.getAddress();
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch {
      return '0';
    }
  }

  // Contract interaction methods
  async registerVoter(
    voterAddress: string, 
    faceHash: string, 
    phoneNumber: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.contract) throw new Error('Contract not initialized');
      
      const tx = await this.contract.registerVoter(
        voterAddress,
        ethers.keccak256(ethers.toUtf8Bytes(faceHash)),
        phoneNumber
      );
      
      await tx.wait();
      
      return { success: true, txHash: tx.hash };
    } catch (error: any) {
      console.error('Failed to register voter:', error);
      return { success: false, error: error.message };
    }
  }

  async castVote(
    partyId: string,
    partyName: string,
    biometricHash: string
  ): Promise<{ success: boolean; txHash?: string; voteHash?: string; error?: string }> {
    try {
      if (!this.contract) throw new Error('Contract not initialized');
      
      const voterAddress = await this.signer?.getAddress();
      const voteData = `${voterAddress}-${partyId}-${Date.now()}`;
      const voteHash = ethers.keccak256(ethers.toUtf8Bytes(voteData));
      const bioHash = ethers.keccak256(ethers.toUtf8Bytes(biometricHash));
      
      const tx = await this.contract.castVote(
        partyId,
        partyName,
        voteHash,
        bioHash
      );
      
      await tx.wait();
      
      return { 
        success: true, 
        txHash: tx.hash, 
        voteHash: voteHash 
      };
    } catch (error: any) {
      console.error('Failed to cast vote:', error);
      return { success: false, error: error.message };
    }
  }

  async getElectionInfo(): Promise<{
    name: string;
    startTime: number;
    endTime: number;
    isActive: boolean;
    partyIds: string[];
  } | null> {
    try {
      if (!this.contract) return null;
      
      const info = await this.contract.getElectionInfo();
      return {
        name: info[0],
        startTime: Number(info[1]),
        endTime: Number(info[2]),
        isActive: info[3],
        partyIds: info[4]
      };
    } catch (error) {
      console.error('Failed to get election info:', error);
      return null;
    }
  }

  async getVoteCount(partyId: string): Promise<number> {
    try {
      if (!this.contract) return 0;
      const count = await this.contract.getVoteCount(partyId);
      return Number(count);
    } catch (error) {
      console.error('Failed to get vote count:', error);
      return 0;
    }
  }

  async getVoterInfo(address: string): Promise<{
    isRegistered: boolean;
    hasVoted: boolean;
    registrationTime: number;
  } | null> {
    try {
      if (!this.contract) return null;
      
      const info = await this.contract.getVoterInfo(address);
      return {
        isRegistered: info[0],
        hasVoted: info[1],
        registrationTime: Number(info[2])
      };
    } catch (error) {
      console.error('Failed to get voter info:', error);
      return null;
    }
  }

  async getTotalVotes(): Promise<number> {
    try {
      if (!this.contract) return 0;
      const total = await this.contract.getTotalVotes();
      return Number(total);
    } catch (error) {
      console.error('Failed to get total votes:', error);
      return 0;
    }
  }

  async getTotalRegisteredVoters(): Promise<number> {
    try {
      if (!this.contract) return 0;
      const total = await this.contract.getTotalRegisteredVoters();
      return Number(total);
    } catch (error) {
      console.error('Failed to get total registered voters:', error);
      return 0;
    }
  }

  async verifyVote(voteHash: string): Promise<{ exists: boolean; verified: boolean }> {
    try {
      if (!this.contract) return { exists: false, verified: false };
      
      const result = await this.contract.verifyVote(voteHash);
      return {
        exists: result[0],
        verified: result[1]
      };
    } catch (error) {
      console.error('Failed to verify vote:', error);
      return { exists: false, verified: false };
    }
  }

  // Multi-signature admin functions
  async proposeElection(
    name: string,
    startTime: number,
    endTime: number,
    partyIds: string[],
    partyNames: string[]
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.contract) throw new Error('Contract not initialized');
      
      const tx = await this.contract.proposeElection(
        name,
        startTime,
        endTime,
        partyIds,
        partyNames
      );
      
      await tx.wait();
      
      return { success: true, txHash: tx.hash };
    } catch (error: any) {
      console.error('Failed to propose election:', error);
      return { success: false, error: error.message };
    }
  }

  async signAdminAction(actionHash: string): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.contract) throw new Error('Contract not initialized');
      
      const tx = await this.contract.signAdminAction(actionHash);
      await tx.wait();
      
      return { success: true, txHash: tx.hash };
    } catch (error: any) {
      console.error('Failed to sign admin action:', error);
      return { success: false, error: error.message };
    }
  }

  // Event listeners
  onVoteCast(callback: (event: any) => void) {
    if (!this.contract) return;
    
    this.contract.on('VoteCast', callback);
  }

  onVoterRegistered(callback: (event: any) => void) {
    if (!this.contract) return;
    
    this.contract.on('VoterRegistered', callback);
  }

  onElectionCreated(callback: (event: any) => void) {
    if (!this.contract) return;
    
    this.contract.on('ElectionCreated', callback);
  }
}

export const web3Service = new Web3Service();