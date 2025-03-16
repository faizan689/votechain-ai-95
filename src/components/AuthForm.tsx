
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { User, Lock, ChevronRight, AlertCircle } from "lucide-react";

const AuthForm = () => {
  const [voterId, setVoterId] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  
  const handleSubmitVoterId = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voterId) {
      setError("Please enter your Voter ID");
      return;
    }
    
    // In a real app, we'd verify the voter ID and send OTP
    setError("");
    setStep(2);
  };
  
  const handleSubmitOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setError("Please enter the OTP");
      return;
    }
    
    if (otp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }
    
    // In a real app, we'd verify the OTP
    setError("");
    navigate("/voting");
  };
  
  // Format voter ID as user types (XXX-XXX-XXX)
  const handleVoterIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^A-Za-z0-9]/g, "");
    let formattedValue = "";
    
    for (let i = 0; i < value.length && i < 10; i++) {
      if (i === 3 || i === 6) {
        formattedValue += "-";
      }
      formattedValue += value[i];
    }
    
    setVoterId(formattedValue);
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="glass border border-border rounded-2xl p-8 md:p-10">
        <h2 className="text-2xl font-display font-semibold mb-6 text-center">
          {step === 1 ? "Voter Authentication" : "Enter OTP"}
        </h2>
        
        {step === 1 ? (
          <motion.form 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmitVoterId}
            className="space-y-6"
          >
            <div className="space-y-2">
              <label htmlFor="voterId" className="text-sm font-medium">
                Voter ID
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <User size={18} />
                </div>
                <input
                  id="voterId"
                  type="text"
                  value={voterId}
                  onChange={handleVoterIdChange}
                  placeholder="XXX-XXX-XXX"
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all bg-background"
                  maxLength={11}
                />
              </div>
            </div>
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-destructive text-sm"
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </motion.div>
            )}
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg px-4 py-2 hover:opacity-90 transition-all"
            >
              <span>Continue</span>
              <ChevronRight size={18} />
            </motion.button>
          </motion.form>
        ) : (
          <motion.form 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmitOTP}
            className="space-y-6"
          >
            <div className="space-y-2">
              <label htmlFor="otp" className="text-sm font-medium">
                Enter the OTP sent to your registered mobile
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Lock size={18} />
                </div>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="6-digit OTP"
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all bg-background"
                  maxLength={6}
                />
              </div>
            </div>
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-destructive text-sm"
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </motion.div>
            )}
            
            <div className="flex items-center justify-between">
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="text-sm text-primary hover:underline"
              >
                Back
              </button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg px-4 py-2 hover:opacity-90 transition-all"
              >
                <span>Verify & Continue</span>
                <ChevronRight size={18} />
              </motion.button>
            </div>
          </motion.form>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
