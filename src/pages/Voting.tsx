
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Info, ShieldCheck } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PartyCard from "@/components/PartyCard";
import ConfirmationModal from "@/components/ConfirmationModal";

type Party = {
  id: string;
  name: string;
  symbol: string;
  color: string;
};

const Voting = () => {
  const [selectedParty, setSelectedParty] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const parties: Party[] = [
    { id: "bjp", name: "Bharatiya Janata Party", symbol: "Lotus", color: "#FF9933" },
    { id: "inc", name: "Indian National Congress", symbol: "Hand", color: "#0078D7" },
    { id: "aap", name: "Aam Aadmi Party", symbol: "Broom", color: "#019934" },
    { id: "nota", name: "None of the Above", symbol: "NOTA", color: "#6B7280" }
  ];
  
  const handlePartySelect = (id: string) => {
    setSelectedParty(id);
  };
  
  const handleContinue = () => {
    if (!selectedParty) return;
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  const selectedPartyDetails = selectedParty 
    ? parties.find(party => party.id === selectedParty) || null
    : null;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <section className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl font-display font-semibold mb-3">
              Cast Your Vote
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
                disabled={!selectedParty}
                className={`
                  flex items-center justify-center gap-2 rounded-lg px-6 py-3 
                  transition-all duration-300 shadow-button
                  ${selectedParty 
                    ? "bg-primary text-primary-foreground" 
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
      
      <div className="py-6 border-t border-border bg-secondary/50">
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
      />
    </div>
  );
};

export default Voting;
