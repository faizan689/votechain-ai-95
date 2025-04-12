
import { useState, useEffect } from "react";
import * as facialRecognitionService from "@/services/facialRecognitionService";

interface UseFacialVerificationOptions {
  videoRef: React.RefObject<HTMLVideoElement>;
  onSuccess?: () => void;
  onFailure?: () => void;
}

interface UseFacialVerificationReturn {
  isVerifying: boolean;
  verificationSuccess: boolean;
  verificationFailed: boolean;
  scanningProgress: number;
  startVerification: () => void;
  resetVerification: () => void;
}

export function useFacialVerification({
  videoRef,
  onSuccess,
  onFailure
}: UseFacialVerificationOptions): UseFacialVerificationReturn {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [verificationFailed, setVerificationFailed] = useState(false);
  const [scanningProgress, setScanningProgress] = useState(0);

  useEffect(() => {
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
      const result = await facialRecognitionService.processFacialVerification(videoRef.current);
      
      if (result?.success) {
        setVerificationSuccess(true);
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 1500); // Delay to show success state
      } else {
        setVerificationFailed(true);
        if (onFailure) onFailure();
      }
    } catch (error) {
      console.error("Facial verification error:", error);
      setVerificationFailed(true);
      if (onFailure) onFailure();
    } finally {
      setIsVerifying(false);
    }
  };

  const resetVerification = () => {
    setIsVerifying(false);
    setVerificationSuccess(false);
    setVerificationFailed(false);
    setScanningProgress(0);
  };
  
  const startVerification = () => {
    handleVerifyFace();
  };

  return {
    isVerifying,
    verificationSuccess,
    verificationFailed,
    scanningProgress,
    startVerification,
    resetVerification
  };
}
