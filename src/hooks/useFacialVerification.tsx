
import { useState, useEffect } from "react";
import * as faceRecognitionService from "@/services/faceRecognitionService";

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

  const [initialized, setInitialized] = useState(false);
  const [realtimeVerification, setRealtimeVerification] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [lastVerificationAttempt, setLastVerificationAttempt] = useState(0);

  // Initialize face recognition system
  useEffect(() => {
    const initializeSystem = async () => {
      try {
        const initialized = await faceRecognitionService.initializeFaceAPI();
        if (initialized) {
          setInitialized(true);
          // Start realtime verification after initialization
          setRealtimeVerification(true);
        }
      } catch (error) {
        console.error("Failed to initialize face recognition:", error);
      }
    };

    if (videoRef.current && !initialized) {
      initializeSystem();
    }
  }, [videoRef.current, initialized]);

  // Realtime face detection and verification
  useEffect(() => {
    let animationFrame: number;
    let lastVerificationTime = 0;
    
    const performRealtimeVerification = async () => {
      if (!videoRef.current || !initialized || isVerifying || verificationSuccess || verificationFailed) {
        animationFrame = requestAnimationFrame(performRealtimeVerification);
        return;
      }

      try {
        const now = Date.now();
        // Only attempt verification every 2 seconds to avoid overwhelming the system
        if (now - lastVerificationTime < 2000) {
          animationFrame = requestAnimationFrame(performRealtimeVerification);
          return;
        }

        // Detect face first
        const detection = await faceRecognitionService.detectFaceInVideo(videoRef.current);
        
        if (detection && detection.confidence > 0.7) {
          lastVerificationTime = now;
          
          // Get user identifier
          const storedUserId = localStorage.getItem('userId') || '';
          const userPhone = localStorage.getItem('userPhone') || '';
          const userEmail = localStorage.getItem('userEmail') || '';
          const userId = storedUserId || userPhone || userEmail;
          
          if (userId) {
            // Start verification process
            setIsVerifying(true);
            setScanningProgress(0);
            
            // Animate progress
            const progressInterval = setInterval(() => {
              setScanningProgress((prev) => {
                const newProgress = prev + 10;
                return newProgress > 90 ? 90 : newProgress;
              });
            }, 100);

            // Perform face recognition
            const result = await faceRecognitionService.recognizeFaceForUser(videoRef.current, userId);
            
            clearInterval(progressInterval);
            setScanningProgress(100);
            
            if (result.isAuthorized && result.confidence > 0.65) {
              setVerificationSuccess(true);
              setRealtimeVerification(false); // Stop realtime verification
              setTimeout(() => {
                if (onSuccess) onSuccess();
              }, 1500);
              return; // Stop the loop
            } else {
              // Reset for next attempt
              setIsVerifying(false);
              setScanningProgress(0);
            }
          }
        }
      } catch (error) {
        console.error("Realtime verification error:", error);
        setIsVerifying(false);
        setScanningProgress(0);
      }
      
      animationFrame = requestAnimationFrame(performRealtimeVerification);
    };

    if (realtimeVerification && initialized) {
      performRealtimeVerification();
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [realtimeVerification, initialized, isVerifying, verificationSuccess, verificationFailed, onSuccess]);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    
    if (isVerifying) {
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
    
    // If realtime verification is already running, don't start manual verification
    if (realtimeVerification) {
      return;
    }
    
    setIsVerifying(true);
    setVerificationSuccess(false);
    setVerificationFailed(false);
    
    try {
      // Get user identifier from localStorage (prefer UUID)
      const storedUserId = localStorage.getItem('userId') || '';
      const userPhone = localStorage.getItem('userPhone') || '';
      const userEmail = localStorage.getItem('userEmail') || '';
      const userId = storedUserId || userPhone || userEmail;
      
      if (!userId) {
        throw new Error('No user identifier found');
      }

      // Initialize face API first
      const initialized = await faceRecognitionService.initializeFaceAPI();
      if (!initialized) {
        throw new Error('Failed to initialize face recognition');
      }

      // Always attempt user-specific recognition using enrolled data from Supabase
      const result = await faceRecognitionService.recognizeFaceForUser(videoRef.current, userId);
      
      if (result.isAuthorized && result.confidence > 0.65) {
        setVerificationSuccess(true);
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 1500);
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
    setRealtimeVerification(true); // Restart realtime verification
  };
  
  const startVerification = () => {
    // With realtime verification, manual start isn't needed
    // But we can ensure realtime verification is running
    if (!realtimeVerification && initialized) {
      setRealtimeVerification(true);
    }
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
