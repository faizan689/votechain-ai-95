import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Info, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PartyCard from "@/components/PartyCard";
import ConfirmationModal from "@/components/ConfirmationModal";
import MetaMaskConflictWarning from "@/components/MetaMaskConflictWarning";
import { votingService } from "@/services/votingService";
import { authService } from "@/services/authService";
import { getAuthToken } from "@/services/api";
import { toast } from "sonner";

type Party = {
  id: string;
  name: string;
  symbol: string;
  color: string;
  logoPath: string;
};

const Voting = () => {
  const [selectedParty, setSelectedParty] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showMetaMaskWarning, setShowMetaMaskWarning] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  
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
    // Enhanced authentication check with debug logging
    console.log('Voting: Checking authentication status');
    const isVerified = authService.isVerified();
    const hasToken = !!getAuthToken();
    const adminStatus = authService.isAdmin();
    
    console.log('Voting: Auth status:', { isVerified, hasToken, isAdmin: adminStatus });
    setIsAdmin(adminStatus);
    
    if (!isVerified || !hasToken) {
      console.log('Voting: User not authenticated, redirecting to auth');
      toast.error('Please complete authentication to access voting');
      navigate('/auth');
      return;
    }
    
    console.log('Voting: Authentication verified, user can vote');
    
    // Check for MetaMask conflicts with proper type checking
    const checkMetaMaskConflicts = () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        const providers = window.ethereum.providers;
        if (providers && Array.isArray(providers) && providers.length > 1) {
          console.log('Multiple wallet providers detected:', providers.length);
          setShowMetaMaskWarning(true);
        }
      }
    };
    
    checkMetaMaskConflicts();
  }, [navigate]);
  
  const handlePartySelect = (id: string) => {
    console.log('Voting: Party selected:', id);
    setSelectedParty(id);
  };
  
  const handleContinue = () => {
    if (!selectedParty) {
      toast.error('Please select a party first');
      return;
    }
    
    console.log('Voting: Opening confirmation modal for party:', selectedParty);
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
    
    setIsLoading(true);
    
    // Debug token before voting
    const currentToken = getAuthToken();
    console.log('Voting: Current auth token present:', !!currentToken);
    console.log('Voting: Token first 20 chars:', currentToken?.substring(0, 20) || 'none');
    
    try {
      console.log('Voting: Attempting to cast vote for:', selectedPartyDetails);
      const response = await votingService.castVote(selectedPartyDetails.id, selectedPartyDetails.name);
      console.log('Voting: Vote response received:', response);
      
      if (response.success) {
        const successMessage = response.isAdminTest 
          ? 'Admin test vote cast successfully! You can vote again.' 
          : 'Vote cast successfully!';
        toast.success(successMessage);
        
        // Store vote data for confirmation page
        localStorage.setItem('voteData', JSON.stringify({
          transactionId: response.transactionId,
          partyId: selectedParty,
          partyName: selectedPartyDetails.name,
          timestamp: new Date().toISOString(),
          isAdminTest: response.isAdminTest
        }));
        console.log('Voting: Navigating to confirmation page');
        navigate('/confirmation');
      } else {
        console.error('Voting: Vote failed with response error:', response.error);
        toast.error(response.error || 'Failed to cast vote');
      }
    } catch (error: any) {
      console.error('Voting: Vote casting error details:', error);
      
      // Handle specific error types
      if (error.message === 'already_voted') {
        toast.error('You have already cast your vote.');
        navigate('/confirmation');
      } else if (error.message?.includes('Authentication failed')) {
        toast.error('Your session has expired. Please log in again.');
        authService.logout();
        navigate('/auth');
      } else if (error.message?.includes('Invalid vote request')) {
        toast.error('There was a problem with your vote. Please try again.');
      } else {
        toast.error(error.message || 'Failed to cast vote. Please try again.');
      }
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
    }
  };
  
  const closeModal = () => {
    console.log('Voting: Closing confirmation modal');
    setIsModalOpen(false);
  };
  
  const selectedPartyDetails = selectedParty 
    ? parties.find(party => party.id === selectedParty) || null
    : null;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <section className="flex-1 pt-32 pb-20 bg-gradient-to-b from-background to-secondary/30">
        <div className="container mx-auto px-6">
          {showMetaMaskWarning && (
            <div className="max-w-4xl mx-auto mb-6">
              <MetaMaskConflictWarning />
            </div>
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
              Your vote will be secured using blockchain technology.
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
                <span>Continue to Confirm</span>
                <ArrowRight size={18} />
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
    </div>
  );
};

export default Voting;
