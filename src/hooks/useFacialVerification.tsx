
import { useState, useEffect, useRef } from "react";
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

  const animationFrameRef = useRef<number>();

  // Get video element reference
  const videoElement = videoRef.current;

  // Initialize face recognition system
  useEffect(() => {
    const initializeSystem = async () => {
      if (videoElement && !initialized) {
        console.log('🔄 Initializing face recognition system...');
        try {
          const success = await faceRecognitionService.initializeFaceAPI();
          if (success) {
            console.log('✅ Face API models loaded');
            // Add delay to ensure camera and models are ready
            setTimeout(() => {
              setInitialized(true);
              setModelReady(true);
              setRealtimeVerification(true);
              console.log('✅ Face recognition system fully initialized');
            }, 2000); // 2 second delay for stabilization
          } else {
            console.error('❌ Failed to initialize face recognition system');
          }
        } catch (error) {
          console.error('❌ Error initializing face recognition:', error);
        }
      }
    };

    initializeSystem();
  }, [videoElement, initialized]);

  // Realtime verification effect
  useEffect(() => {
    if (!realtimeVerification || !initialized || !modelReady || !videoElement || isVerifying || verificationSuccess) {
      return;
    }

    const performRealtimeVerification = async () => {
      try {
        // Get face detection first with lower threshold for initial attempts
        const faceDetection = await faceRecognitionService.detectFaceInVideo(videoElement);
        
        if (!faceDetection || faceDetection.confidence < 0.5) { // Lowered from 0.7 to 0.5
          console.log('👤 No sufficient face detected, confidence:', faceDetection?.confidence);
          return;
        }

        // Get user identifiers with better error handling
        const userPhone = localStorage.getItem('userPhone');
        const userId = localStorage.getItem('userId');
        
        console.log('🔍 User identifiers:', { userPhone, userId });
        
        if (!userPhone && !userId) {
          console.log('⚠️ No user identifiers found for verification');
          return;
        }

        // Use phone number as userId if userId is not available
        const verificationId = userId || userPhone;
        
        if (!verificationId) {
          console.log('⚠️ No verification ID available');
          return;
        }

        console.log('🔍 Performing realtime face verification for user:', verificationId);
        
        // Perform face recognition with retry logic
        const result = await faceRecognitionService.recognizeFaceForUser(videoElement, verificationId);
        console.log('🎯 Realtime verification result:', result);
        
        // Progressive confidence threshold - start lower and increase over time
        const progressiveThreshold = Math.max(0.4, 0.6 - (scanningProgress / 100) * 0.2);
        
        if (result.isAuthorized && result.confidence >= progressiveThreshold) {
          console.log('✅ Face verification successful!', { 
            confidence: result.confidence, 
            threshold: progressiveThreshold 
          });
          setVerificationSuccess(true);
          setRealtimeVerification(false);
          setScanningProgress(100);
          onSuccess?.();
        } else if (result.confidence > 0.2) {
          console.log('⚠️ Face detected but not authorized', { 
            confidence: result.confidence, 
            threshold: progressiveThreshold 
          });
          // Don't immediately fail, keep trying
        }
        
      } catch (error) {
        console.error('❌ Realtime verification error:', error);
        // Don't stop verification on single errors
      }
    };

    // Progressive scanning animation and verification attempts
    const interval = setInterval(() => {
      if (scanningProgress < 100) {
        setScanningProgress(prev => Math.min(prev + 1.5, 100)); // Slower progress
      }
      
      // Attempt verification every 3 seconds initially, then every 2 seconds
      const verificationInterval = scanningProgress < 50 ? 3000 : 2000;
      const now = Date.now();
      if (now - lastVerificationAttempt > verificationInterval) {
        setLastVerificationAttempt(now);
        performRealtimeVerification();
      }
    }, 150); // Update progress every 150ms

    return () => clearInterval(interval);
  }, [realtimeVerification, initialized, modelReady, videoElement, isVerifying, verificationSuccess, scanningProgress, onSuccess, lastVerificationAttempt]);

  const handleVerifyFace = async () => {
    if (!videoElement) {
      console.log('❌ No video element available');
      return;
    }
    
    console.log('🔄 Manual face verification started');
    setIsVerifying(true);
    setVerificationSuccess(false);
    setVerificationFailed(false);
    setScanningProgress(0);
    
    try {
      // Get user identifiers with better error handling
      const userPhone = localStorage.getItem('userPhone');
      const userId = localStorage.getItem('userId');
      
      console.log('🔍 Retrieved user identifiers:', { userPhone, userId });
      
      if (!userPhone && !userId) {
        throw new Error('No user identifier found for verification');
      }

      // Use phone number as userId if userId is not available
      const verificationId = userId || userPhone;
      
      if (!verificationId) {
        throw new Error('No verification ID available');
      }

      // Initialize face API if not already done
      if (!initialized) {
        console.log('🔄 Initializing face API for manual verification');
        const success = await faceRecognitionService.initializeFaceAPI();
        if (!success) {
          throw new Error('Failed to initialize face recognition');
        }
        setInitialized(true);
      }

      // Animate scanning progress
      const progressInterval = setInterval(() => {
        setScanningProgress(prev => {
          const newProgress = prev + 10;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 100);

      console.log('🔍 Performing face recognition for user:', verificationId);
      const result = await faceRecognitionService.recognizeFaceForUser(videoElement, verificationId);
      
      clearInterval(progressInterval);
      setScanningProgress(100);
      
      console.log('🎯 Manual verification result:', {
        isAuthorized: result.isAuthorized,
        confidence: result.confidence
      });
      
      if (result.isAuthorized && result.confidence >= 0.5) { // Lower threshold for manual verification
        console.log('✅ Manual face verification successful!');
        setVerificationSuccess(true);
        setTimeout(() => {
          onSuccess?.();
        }, 1500);
      } else {
        console.log('❌ Manual face verification failed');
        setVerificationFailed(true);
        onFailure?.();
      }
    } catch (error) {
      console.error('❌ Manual facial verification error:', error);
      setVerificationFailed(true);
      onFailure?.();
    } finally {
      setIsVerifying(false);
    }
  };

  const resetVerification = () => {
    console.log('🔄 Resetting verification state');
    setIsVerifying(false);
    setVerificationSuccess(false);
    setVerificationFailed(false);
    setScanningProgress(0);
    setLastVerificationAttempt(0);
    
    // Restart realtime verification with delay
    setTimeout(() => {
      setRealtimeVerification(true);
    }, 1000);
  };
  
  const startVerification = () => {
    console.log('🚀 Starting face verification');
    
    // If realtime verification is not running, start manual verification
    if (!realtimeVerification || !initialized) {
      handleVerifyFace();
    } else {
      // Ensure realtime verification is active
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
