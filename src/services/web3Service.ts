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
  rpcUrls: [
    'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    'https://rpc.sepolia.org',
    'https://rpc2.sepolia.org'
  ],
  blockExplorerUrls: ['https://sepolia.etherscan.io']
};

// Contract address (will be updated after deployment)
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

// Function to load contract address from deployment file
async function loadDeployedAddress(): Promise<string> {
  try {
    const response = await fetch('/contract-deployment.json');
    if (response.ok) {
      const deploymentInfo = await response.json();
      if (deploymentInfo.contractAddress && deploymentInfo.contractAddress !== "0x0000000000000000000000000000000000000000") {
        return deploymentInfo.contractAddress;
      }
    }
  } catch (error) {
    console.log('No deployment info found, using default address');
  }
  return CONTRACT_ADDRESS;
}

export let DEPLOYED_CONTRACT_ADDRESS = CONTRACT_ADDRESS;

export class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;
  private isConnected = false;
  private contractAddress: string = CONTRACT_ADDRESS;

  constructor() {
    this.initializeProvider();
    this.loadContractAddress();
  }

  private async loadContractAddress() {
    this.contractAddress = await loadDeployedAddress();
    DEPLOYED_CONTRACT_ADDRESS = this.contractAddress;
  }

  private async initializeProvider() {
    if (typeof window !== 'undefined' && window.ethereum) {
      console.log('Initializing Web3 provider...');
      this.provider = new ethers.BrowserProvider(window.ethereum);
      
      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        console.log('Accounts changed:', accounts);
        if (accounts.length === 0) {
          console.log('No accounts found, disconnecting...');
          this.disconnect();
        } else {
          console.log('Account changed, reinitializing...');
          this.initializeSigner();
        }
      });

      // Listen for chain changes
      window.ethereum.on('chainChanged', (chainId: string) => {
        console.log('Chain changed to:', chainId);
        if (chainId !== SEPOLIA_CONFIG.chainId) {
          console.log('Not on Sepolia, attempting to switch...');
          this.switchToSepolia();
        } else {
          console.log('Successfully connected to Sepolia network');
        }
        // Reload the page to refresh all data
        window.location.reload();
      });

      // Listen for connection events
      window.ethereum.on('connect', (connectInfo: any) => {
        console.log('MetaMask connected:', connectInfo);
      });

      window.ethereum.on('disconnect', (error: any) => {
        console.log('MetaMask disconnected:', error);
        this.disconnect();
      });
    } else {
      console.warn('MetaMask not detected');
    }
  }

  async connectWallet(): Promise<{ success: boolean; address?: string; error?: string }> {
    try {
      if (!window.ethereum) {
        return { success: false, error: 'MetaMask not installed. Please install MetaMask to continue.' };
      }

      // First, request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts.length === 0) {
        return { success: false, error: 'No accounts found. Please unlock MetaMask.' };
      }

      // Check current network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      console.log('Current network:', chainId, 'Expected:', SEPOLIA_CONFIG.chainId);
      
      // Switch to Sepolia if not already connected
      if (chainId !== SEPOLIA_CONFIG.chainId) {
        const switched = await this.switchToSepolia();
        if (!switched) {
          return { success: false, error: 'Failed to switch to Sepolia network' };
        }
      }
      
      // Initialize provider and signer
      await this.initializeSigner();
      
      const address = await this.signer?.getAddress();
      if (!address) {
        return { success: false, error: 'Failed to get wallet address' };
      }

      this.isConnected = true;
      console.log('Successfully connected to Sepolia with address:', address);
      
      return { success: true, address };
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      
      // Handle specific MetaMask errors
      if (error.code === 4001) {
        return { success: false, error: 'User rejected the connection request' };
      } else if (error.code === -32002) {
        return { success: false, error: 'Connection request already pending. Please check MetaMask.' };
      }
      
      return { 
        success: false, 
        error: error.message || 'Failed to connect wallet. Please try again.' 
      };
    }
  }

  async switchToSepolia(): Promise<boolean> {
    try {
      if (!window.ethereum) {
        console.error('MetaMask not available');
        return false;
      }

      console.log('Attempting to switch to Sepolia network...');
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CONFIG.chainId }],
      });

      console.log('Successfully switched to Sepolia network');
      return true;
    } catch (switchError: any) {
      console.log('Switch error:', switchError);
      
      // Chain not added to MetaMask
      if (switchError.code === 4902) {
        console.log('Sepolia network not found, attempting to add...');
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: SEPOLIA_CONFIG.chainId,
              chainName: SEPOLIA_CONFIG.chainName,
              nativeCurrency: SEPOLIA_CONFIG.nativeCurrency,
              rpcUrls: SEPOLIA_CONFIG.rpcUrls,
              blockExplorerUrls: SEPOLIA_CONFIG.blockExplorerUrls
            }],
          });
          console.log('Successfully added Sepolia network');
          return true;
        } catch (addError: any) {
          console.error('Failed to add Sepolia network:', addError);
          return false;
        }
      } else if (switchError.code === 4001) {
        console.log('User rejected network switch');
        return false;
      }
      
      console.error('Failed to switch to Sepolia:', switchError);
      return false;
    }
  }

  private async initializeSigner() {
    if (!this.provider) {
      console.error('Provider not initialized');
      return;
    }
    
    try {
      console.log('Initializing signer...');
      this.signer = await this.provider.getSigner();
      
      // Verify we're on the correct network
      const network = await this.provider.getNetwork();
      console.log('Connected to network:', network.name, 'chainId:', network.chainId);
      
      if (network.chainId.toString() !== parseInt(SEPOLIA_CONFIG.chainId, 16).toString()) {
        console.warn('Not connected to Sepolia network');
        await this.switchToSepolia();
        return;
      }
      
      this.contract = new ethers.Contract(
        this.contractAddress,
        VotingContractABI.abi,
        this.signer
      );
      
      console.log('Signer and contract initialized successfully');
      console.log('Contract address:', this.contractAddress);
    } catch (error) {
      console.error('Failed to initialize signer:', error);
      throw error;
    }
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
      if (this.contractAddress === "0x0000000000000000000000000000000000000000") {
        throw new Error('Smart contract not deployed. Please deploy the contract first.');
      }
      
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
      if (this.contractAddress === "0x0000000000000000000000000000000000000000") {
        console.warn('Contract not deployed. Using mock data.');
        return {
          name: "Mock Election",
          startTime: Date.now(),
          endTime: Date.now() + 86400000,
          isActive: true,
          partyIds: ["1", "2", "3"]
        };
      }
      
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
      if (this.contractAddress === "0x0000000000000000000000000000000000000000") {
        console.warn('Contract not deployed. Using mock data.');
        return 0;
      }
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
      if (this.contractAddress === "0x0000000000000000000000000000000000000000") {
        console.warn('Contract not deployed. Using mock data.');
        return 0;
      }
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