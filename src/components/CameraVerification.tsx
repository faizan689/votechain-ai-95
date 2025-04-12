
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  UserSearch,
  ScanFace,
  Loader2,
  Check,
  X,
  RefreshCcw,
  Key,
  CheckCircle
} from "lucide-react";
import * as facialRecognitionService from "@/services/facialRecognitionService";
import LivenessGuide from "./LivenessGuide";
import FaceScanningOverlay from "./FaceScanningOverlay";

interface CameraVerificationProps {
  onSuccess: () => void;
  onFailure: () => void;
}

const CameraVerification = ({ onSuccess, onFailure }: CameraVerificationProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [verificationFailed, setVerificationFailed] = useState(false);
  const [scanningProgress, setScanningProgress] = useState(0);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const enableCamera = async () => {
      setCameraLoading(true);
      setCameraError(null);
      
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      } catch (error: any) {
        console.error("Error accessing camera:", error);
        setCameraError("Failed to access camera. Please check your permissions and try again.");
        setCameraActive(false);
      } finally {
        setCameraLoading(false);
      }
    };
    
    enableCamera();
    
    // Add scanning progress simulation
    let progressInterval: NodeJS.Timeout;
    if (isVerifying) {
      setScanningProgress(0);
      progressInterval = setInterval(() => {
        setScanningProgress((prev) => {
          const newProgress = prev + Math.random() * 5;
          return newProgress > 95 ? 95 : newProgress;
        });
      }, 200);
    }
    
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [isVerifying]);
  
  // On verification complete, jump to 100%
  useEffect(() => {
    if (verificationSuccess || verificationFailed) {
      setScanningProgress(100);
    }
  }, [verificationSuccess, verificationFailed]);

  const handleVerifyFace = async () => {
    if (!videoRef.current) return;
    
    setIsVerifying(true);
    setVerificationSuccess(false);
    setVerificationFailed(false);
    
    try {
      // Using processFacialVerification directly from the imported module
      const result = await facialRecognitionService.processFacialVerification(videoRef.current);
      
      if (result?.success) {
        setVerificationSuccess(true);
        setTimeout(onSuccess, 1500); // Delay to show success state
      } else {
        setVerificationFailed(true);
      }
    } catch (error) {
      console.error("Facial verification error:", error);
      setVerificationFailed(true);
    } finally {
      setIsVerifying(false);
    }
  };
  
  const startVerification = () => {
    if (cameraActive) {
      handleVerifyFace();
    } else {
      // Re-enable camera if it's not active
      setCameraLoading(true);
      setCameraError(null);
      
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setCameraActive(true);
          }
        })
        .catch((error: any) => {
          console.error("Error re-enabling camera:", error);
          setCameraError("Failed to access camera. Please check your permissions and try again.");
          setCameraActive(false);
        })
        .finally(() => {
          setCameraLoading(false);
        });
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-xl overflow-hidden shadow-lg border border-border bg-card"
        >
          {/* Camera view */}
          <div className="relative aspect-[4/3] bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* Face scanning overlay */}
            <FaceScanningOverlay 
              isScanning={isVerifying && !verificationSuccess && !verificationFailed} 
              progress={scanningProgress} 
            />
            
            {/* Verification status indicators */}
            {verificationSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex items-center justify-center bg-green-500/80 backdrop-blur-sm"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: 2, duration: 0.5 }}
                >
                  <Check className="w-16 h-16 text-white" />
                </motion.div>
              </motion.div>
            )}
            
            {verificationFailed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center bg-red-500/80 backdrop-blur-sm"
              >
                <motion.div 
                  animate={{ rotate: [-10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <X className="w-16 h-16 text-white" />
                </motion.div>
              </motion.div>
            )}
            
            {!cameraActive && !cameraLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
                <Camera className="w-12 h-12 text-white/50 mb-4" />
                <p className="text-white/70 text-center px-6">
                  Camera access is required for facial verification.
                  <br />
                  Please grant permission to continue.
                </p>
              </div>
            )}
            
            {cameraLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-10 h-10 text-primary" />
                </motion.div>
              </div>
            )}
          </div>
          
          {/* Controls and instructions */}
          <div className="p-4">
            <h3 className="font-medium text-lg mb-2 flex items-center gap-2">
              <UserSearch size={18} className="text-primary" />
              Facial Verification
            </h3>
            
            {cameraError ? (
              <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-3 rounded-md text-sm mb-3">
                <p>{cameraError}</p>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm mb-3">
                {isVerifying
                  ? "Hold still while we verify your face..."
                  : "Position your face in the frame and click Verify"}
              </p>
            )}
            
            {!isVerifying && !verificationSuccess && !verificationFailed && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={startVerification}
                disabled={!cameraActive || isVerifying}
                className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium disabled:bg-muted disabled:text-muted-foreground flex items-center justify-center gap-2"
              >
                {cameraActive ? (
                  <>
                    <ScanFace className="w-4 h-4" />
                    <span>Verify Face</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    <span>Enable Camera</span>
                  </>
                )}
              </motion.button>
            )}
            
            {verificationSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 p-3 rounded-md text-sm mb-3">
                  <p>Face verification successful!</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onSuccess}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-medium flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Continue</span>
                </motion.button>
              </motion.div>
            )}
            
            {verificationFailed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-3 rounded-md text-sm mb-3">
                  <p>Face verification failed. Please try again or use an alternative method.</p>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setVerificationFailed(false);
                      setIsVerifying(false);
                    }}
                    className="flex-1 bg-secondary text-secondary-foreground py-2 rounded-md font-medium flex items-center justify-center gap-2"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    <span>Try Again</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onFailure}
                    className="flex-1 bg-primary text-primary-foreground py-2 rounded-md font-medium flex items-center justify-center gap-2"
                  >
                    <Key className="w-4 h-4" />
                    <span>Use OTP</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
        
        {/* Liveness Guide button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-6"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowGuide(true)}
            className="w-full py-2 px-4 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center gap-2"
          >
            <Eye size={16} />
            <span>View Liveness Detection Guide</span>
          </motion.button>
        </motion.div>
      </div>
      
      {/* Conditional rendering of LivenessGuide */}
      {showGuide && (
        <LivenessGuide onClose={() => setShowGuide(false)} />
      )}
    </div>
  );
};

export default CameraVerification;
