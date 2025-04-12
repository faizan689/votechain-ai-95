
import React from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ConfirmationTicket from "@/components/ConfirmationTicket";

const Confirmation = () => {
  // In a real app, these would come from API or navigation state
  const mockData = {
    transactionId: "vg-tx-8f4h91j5k9l2m3n7p8q1r5s9t",
    timestamp: new Date().toISOString(),
    partyName: "Bharatiya Janata Party",
    partyLogo: "/lovable-uploads/bd528e11-c547-4096-be22-973ccf0a7e69.png"
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gradient-to-b from-background to-secondary/30">
        <div className="container mx-auto px-4 py-20 pt-32">
          <ConfirmationTicket 
            transactionId={mockData.transactionId}
            timestamp={mockData.timestamp}
            partyName={mockData.partyName}
            partyLogo={mockData.partyLogo}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Confirmation;
