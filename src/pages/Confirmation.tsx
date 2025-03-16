
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle, Clipboard, Home, ExternalLink } from "lucide-react";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Confirmation = () => {
  const [isCopied, setIsCopied] = useState(false);
  
  // Generate a random transaction hash
  const transactionHash = "0x" + Array.from({ length: 64 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
  
  const formattedHash = `${transactionHash.slice(0, 8)}...${transactionHash.slice(-6)}`;
  
  const handleCopyHash = () => {
    navigator.clipboard.writeText(transactionHash);
    setIsCopied(true);
    
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <section className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                damping: 15,
                stiffness: 200,
              }}
              className="w-20 h-20 bg-green-500 rounded-full mx-auto flex items-center justify-center mb-8"
            >
              <CheckCircle size={36} className="text-white" />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center mb-12"
            >
              <h1 className="text-3xl font-display font-semibold mb-3">
                Vote Successfully Recorded!
              </h1>
              <p className="text-muted-foreground">
                Your vote has been securely recorded on the blockchain.
                Thank you for participating in the democratic process.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="glass border border-border rounded-2xl p-8 mb-8"
            >
              <h2 className="text-xl font-medium mb-6">Vote Receipt</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Date & Time</div>
                  <div>{new Date().toLocaleString()}</div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Constituency</div>
                  <div>Delhi Central</div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Blockchain Transaction Hash</div>
                  <div className="flex items-center gap-2">
                    <code className="bg-secondary/50 px-2 py-1 rounded text-sm">{formattedHash}</code>
                    <button
                      onClick={handleCopyHash}
                      className="p-1 rounded-md hover:bg-secondary transition-colors"
                      aria-label="Copy transaction hash"
                    >
                      <Clipboard size={16} />
                    </button>
                    
                    {isCopied && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-green-500"
                      >
                        Copied!
                      </motion.span>
                    )}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Verification Link</div>
                  <a 
                    href="#" 
                    className="text-primary flex items-center gap-1 hover:underline"
                  >
                    <span>Verify on Blockchain Explorer</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center justify-center gap-2 rounded-lg px-6 py-3 bg-primary text-primary-foreground shadow-button"
                >
                  <Home size={18} />
                  <span>Return to Home</span>
                </motion.button>
              </Link>
              
              <Link to="/about">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center justify-center gap-2 rounded-lg px-6 py-3 border border-border hover:bg-secondary transition-colors"
                >
                  <ArrowLeft size={18} />
                  <span>Learn More</span>
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Confirmation;
