
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, Check, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  initFacialRecognition, 
  processFacialVerification 
} from "@/services/facialRecognitionService";

type CameraVerificationProps = {
  onSuccess: () => void;
  onCancel: () => void;
};

const CameraVerification = ({ onSuccess, onCancel }: CameraVerificationProps) => {
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

  // Initialize facial recognition models
  useEffect(() => {
    async function loadModels() {
      try {
        setIsInitializing(true);
        const success = await initFacialRecognition();
        setModelsLoaded(success);
        if (!success) {
          setErrorMessage("Failed to initialize facial recognition. Please refresh the page and try again.");
        }
      } catch (error) {
        console.error("Error loading facial recognition models:", error);
        setErrorMessage("Failed to initialize facial recognition. Please refresh the page and try again.");
      } finally {
        setIsInitializing(false);
      }
    }

    loadModels();
  }, []);

  // Initialize camera on component mount
  useEffect(() => {
    if (modelsLoaded) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [modelsLoaded]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 } 
        } 
      });
      
      setCameraStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setErrorMessage("Camera access denied. Please allow camera access to continue.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsCapturing(true);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    
    if (!context) return;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to image data URL
    const imageDataUrl = canvas.toDataURL("image/png");
    setCapturedImage(imageDataUrl);
    setIsCapturing(false);
  };

  const verifyImage = async () => {
    if (!videoRef.current) return;
    
    setVerificationStatus("processing");
    
    try {
      const result = await processFacialVerification(videoRef.current);
      
      if (result.success) {
        setVerificationStatus("success");
        // Wait a moment to show success before proceeding
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setVerificationStatus("error");
        setErrorMessage(result.message);
      }
    } catch (error) {
      console.error("Error during verification:", error);
      setVerificationStatus("error");
      setErrorMessage("Verification failed. Please try again.");
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setVerificationStatus("idle");
    setErrorMessage("");
  };

  if (isInitializing) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="glass border border-border rounded-2xl p-6 overflow-hidden flex flex-col items-center justify-center py-12">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <h2 className="text-xl font-display font-semibold mb-2 text-center">
            Initializing Facial Recognition
          </h2>
          <p className="text-sm text-muted-foreground text-center">
            Please wait while we load the facial recognition models...
          </p>
        </div>
      </div>
    );
  }

  if (!modelsLoaded) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="glass border border-border rounded-2xl p-6 overflow-hidden">
          <h2 className="text-xl font-display font-semibold mb-4 text-center text-destructive">
            Facial Recognition Failed to Initialize
          </h2>
          <p className="text-sm text-muted-foreground mb-6 text-center">
            We couldn't load the required facial recognition models. Please check your internet connection and try again.
          </p>
          <div className="flex justify-center">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg border border-border"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass border border-border rounded-2xl p-6 overflow-hidden"
      >
        <h2 className="text-xl font-display font-semibold mb-4 text-center">
          Face Verification
        </h2>
        
        <p className="text-sm text-muted-foreground mb-6 text-center">
          Please look directly at the camera for identity verification
        </p>
        
        <div className="relative mb-6 rounded-xl overflow-hidden aspect-[4/3] bg-black">
          {!capturedImage ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <img 
              src={capturedImage} 
              alt="Captured" 
              className="w-full h-full object-cover" 
            />
          )}
          
          {/* Face outline guide */}
          {!capturedImage && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-40 h-40 border-2 border-dashed border-white/50 rounded-full"></div>
            </div>
          )}
          
          {/* Processing overlay */}
          {verificationStatus === "processing" && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 text-white animate-spin mb-2" />
              <p className="text-white text-sm">Verifying identity...</p>
            </div>
          )}
          
          {/* Success overlay */}
          {verificationStatus === "success" && (
            <div className="absolute inset-0 bg-green-500/30 flex flex-col items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center"
              >
                <Check className="w-8 h-8 text-white" />
              </motion.div>
              <p className="text-white text-sm mt-2">Verification successful!</p>
            </div>
          )}
          
          <canvas ref={canvasRef} className="hidden" />
        </div>
        
        {errorMessage && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">{errorMessage}</p>
          </div>
        )}
        
        <div className="flex items-center justify-center gap-4">
          {!capturedImage ? (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCancel}
                className="px-4 py-2 rounded-lg border border-border"
              >
                Cancel
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={captureImage}
                disabled={isCapturing || !cameraStream}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>Capture</span>
              </motion.button>
            </>
          ) : (
            <>
              {verificationStatus === "idle" && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={retakePhoto}
                    className="px-4 py-2 rounded-lg border border-border flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Retake</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={verifyImage}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Verify</span>
                  </motion.button>
                </>
              )}
              
              {verificationStatus === "error" && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={retakePhoto}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </motion.button>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CameraVerification;
