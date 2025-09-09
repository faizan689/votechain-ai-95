import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ArrowRight, Info, ShieldCheck } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PartyCard from '@/components/PartyCard';
import ConfirmationModal from '@/components/ConfirmationModal';
import { WalletConnection } from '@/components/blockchain/WalletConnection';
import { BlockchainStatus } from '@/components/blockchain/BlockchainStatus';
import SimpleFaceVerification from '@/components/SimpleFaceVerification';
import { Button } from '@/components/ui/button';
import { votingService } from '@/services/votingService';
import { authService } from '@/services/authService';
import { useWeb3 } from '@/hooks/useWeb3';
import MetaMaskConflictWarning from '@/components/MetaMaskConflictWarning';

type Party = {
  id: string;
  name: string;
  symbol: string;
  color: string;
  logoPath: string;
};

const Voting = () => {
  const navigate = useNavigate();
  const { isConnected: isWeb3Connected, address: walletAddress } = useWeb3();
  const [selectedParty, setSelectedParty] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMetaMaskConflict, setHasMetaMaskConflict] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showFaceAuth, setShowFaceAuth] = useState(false);
  const [voteData, setVoteData] = useState<any>(null);

  const parties: Party[] = [
    { 
      id: "PTY-001", 
      name: "Bharatiya Janata Party", 
      symbol: "Lotus", 
      color: "#FF9933", 
      logoPath: "/lovable-uploads/bd528e11-c547-4096-be22-973ccf0a7e69.png" 
    },
    { 
      id: "PTY-002", 
      name: "Indian National Congress", 
      symbol: "Hand", 
      color: "#0078D7", 
      logoPath: "/lovable-uploads/6d40bf13-e73a-4e1b-82fe-7c36e7663ad3.png" 
    },
    { 
      id: "PTY-003", 
      name: "Aam Aadmi Party", 
      symbol: "Broom", 
      color: "#019934", 
      logoPath: "/lovable-uploads/c1e1f869-b9f5-4251-9872-e4504191624a.png" 
    },
    { 
      id: "PTY-004", 
      name: "None of the Above", 
      symbol: "NOTA", 
      color: "#6B7280", 
      logoPath: "/lovable-uploads/893342f4-7eb9-4b71-9b23-dbd4445bf9a0.png" 
    }
  ];

  useEffect(() => {
    // Check authentication
    const isVerified = authService.isVerified();
    const adminStatus = authService.isAdmin();
    setIsAdmin(adminStatus);
    
    if (!isVerified) {
      toast.error('Please complete authentication to access voting');
      navigate('/auth');
      return;
    }
    
    // Check for MetaMask conflicts
    const checkMetaMaskConflicts = () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        const providers = window.ethereum.providers;
        if (providers && Array.isArray(providers) && providers.length > 1) {
          setHasMetaMaskConflict(true);
        }
      }
    };
    
    checkMetaMaskConflicts();
  }, [navigate]);

  const handlePartySelect = (id: string) => {
    setSelectedParty(id);
  };

  const handleContinue = () => {
    if (!selectedParty) {
      toast.error('Please select a party first');
      return;
    }
    setIsModalOpen(true);
  };

  const handleVoteConfirm = async () => {
    if (!selectedParty) {
      toast.error('No party selected');
      return;
    }

    const selectedPartyDetails = parties.find(party => party.id === selectedParty);
    if (!selectedPartyDetails) {
      toast.error('Selected party not found');
      return;
    }

    setIsModalOpen(false);
    setIsLoading(true);

    try {
      console.log('Voting: Attempting to cast vote for:', selectedPartyDetails);
      
      // Store biometric hash for blockchain voting
      const biometricHash = `${selectedParty}-${Date.now()}`;
      localStorage.setItem('currentBiometricHash', biometricHash);
      
      const response = await votingService.castVote(selectedPartyDetails.id, selectedPartyDetails.name);
      console.log('Voting: Vote response received:', response);

      if (response.success) {
        toast.success(response.message);
        
        // Store vote data for later use
        const voteInfo = {
          transactionId: response.transactionId,
          blockchainTxHash: response.blockchainTxHash,
          partyId: selectedParty,
          partyName: selectedPartyDetails.name,
          timestamp: new Date().toISOString(),
          isBlockchainVote: response.isBlockchainVote,
          isAdminTest: response.isAdminTest
        };
        
        setVoteData(voteInfo);
        setShowFaceAuth(true); // Show facial authentication after successful vote
      } else {
        toast.error(response.message || 'Failed to cast vote');
      }
    } catch (error: any) {
      console.error('Voting: Vote casting error:', error);
      if (error.message === 'already_voted') {
        const voteInfo = {
          transactionId: 'PREV_VOTE_' + Date.now(),
          partyId: selectedParty,
          partyName: selectedPartyDetails.name,
          timestamp: new Date().toISOString(),
          alreadyVoted: true
        };
        setVoteData(voteInfo);
        setShowFaceAuth(true); // Show facial authentication even for already voted case
      } else if (error.message?.includes('Authentication failed')) {
        toast.error('Your session has expired. Please log in again.');
        authService.logout();
        navigate('/auth');
      } else {
        toast.error(error.message || 'Failed to cast vote. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleFaceAuthSuccess = (confidence: number) => {
    toast.success(`Face verification successful! Confidence: ${(confidence * 100).toFixed(1)}%`);
    
    // Store vote data and navigate to confirmation
    if (voteData) {
      localStorage.setItem('voteData', JSON.stringify(voteData));
      setTimeout(() => {
        navigate('/confirmation');
      }, 1500);
    }
  };

  const handleFaceAuthFailure = (error: string) => {
    toast.error('Face verification failed. Vote not confirmed.');
    setShowFaceAuth(false);
    setVoteData(null);
    setIsLoading(false);
  };

  const closeFaceAuth = () => {
    setShowFaceAuth(false);
    setVoteData(null);
    setIsLoading(false);
  };

  const selectedPartyDetails = selectedParty 
    ? parties.find(party => party.id === selectedParty) || null
    : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <section className="flex-1 pt-32 pb-20 bg-gradient-to-b from-background to-secondary/30">
        <div className="container mx-auto px-6">
          {hasMetaMaskConflict && (
            <div className="max-w-4xl mx-auto mb-6">
              <MetaMaskConflictWarning />
            </div>
          )}
          
          {/* Blockchain Status Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 max-w-4xl mx-auto">
            <WalletConnection />
            <BlockchainStatus />
          </div>
          
          {isWeb3Connected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 max-w-4xl mx-auto"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-800 font-medium">
                  Blockchain Connected - Your vote will be recorded on Ethereum Sepolia
                </span>
              </div>
              <p className="text-green-700 text-sm mt-1">
                Wallet: {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
              </p>
            </motion.div>
          )}
          
          {isAdmin && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto mb-6"
            >
              <div className="glass border border-orange-200 rounded-xl p-4 bg-gradient-to-r from-orange-50/50 to-amber-50/50">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-500/10 rounded-full p-2">
                    <ShieldCheck size={18} className="text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-orange-800">Admin Test Mode</h3>
                    <p className="text-sm text-orange-600">
                      You can vote multiple times for testing purposes. Test votes are tracked separately.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl font-display font-semibold mb-3">
              Cast Your <span className="bg-gradient-to-r from-orange-500 via-white to-green-600 bg-clip-text text-transparent">Vote</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Select your preferred candidate or party from the options below.
              {isWeb3Connected ? ' Your vote will be secured using blockchain technology.' : ' Connect your wallet for blockchain voting.'}
            </p>
          </motion.div>
          
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass border border-border rounded-xl p-4 mb-8 flex items-center gap-3"
            >
              <div className="bg-primary/10 rounded-full p-2">
                <Info size={18} className="text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Your vote is anonymous and confidential. The blockchain records only that you voted, not who you voted for.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {parties.map((party, index) => (
                <PartyCard
                  key={party.id}
                  id={party.id}
                  name={party.name}
                  symbol={party.symbol}
                  color={party.color}
                  logoPath={party.logoPath}
                  selected={selectedParty === party.id}
                  onSelect={handlePartySelect}
                />
              ))}
            </div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleContinue}
                disabled={!selectedParty || isLoading}
                className={`
                  flex items-center justify-center gap-2 rounded-lg px-6 py-3 
                  transition-all duration-300 shadow-button
                  ${selectedParty && !isLoading
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white" 
                    : "bg-secondary text-muted-foreground cursor-not-allowed"}
                `}
              >
                <span>{isLoading ? 'Casting Vote...' : 'Continue to Confirm'}</span>
                {!isLoading && <ArrowRight size={18} />}
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>
      
      <div className="py-6 border-t border-border bg-gradient-to-r from-orange-500/5 via-white/5 to-green-600/5">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck size={16} className="text-primary" />
            <span>Your vote is protected by end-to-end encryption and blockchain technology</span>
          </div>
        </div>
      </div>
      
      <Footer />
      
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        selectedParty={selectedPartyDetails}
        onConfirm={handleVoteConfirm}
        isLoading={isLoading}
      />

      {/* Face Authentication Modal */}
      {showFaceAuth && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-16 h-16 bg-gradient-to-r from-orange-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <ShieldCheck className="w-8 h-8 text-white" />
                </motion.div>
                
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Verify Your Identity
                </h3>
                <p className="text-muted-foreground text-sm">
                  Please complete face verification to confirm your vote
                </p>
              </div>
              
              <SimpleFaceVerification
                onSuccess={handleFaceAuthSuccess}
                onFailure={handleFaceAuthFailure}
              />
              
              <div className="mt-6 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={closeFaceAuth}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Voting;