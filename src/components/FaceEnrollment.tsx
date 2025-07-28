import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useCamera } from '@/hooks/useCamera';
import { toast } from 'sonner';
import * as faceRecognitionService from '@/services/faceRecognitionService';

interface FaceEnrollmentProps {
  userId: string;
  onSuccess: (faceDescriptor: number[]) => void;
  onSkip?: () => void;
}

export const FaceEnrollment: React.FC<FaceEnrollmentProps> = ({
  userId,
  onSuccess,
  onSkip
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [enrollmentStep, setEnrollmentStep] = useState<'instruction' | 'capturing' | 'processing' | 'success' | 'error'>('instruction');
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentCapture, setCurrentCapture] = useState(0);
  const [faceDescriptor, setFaceDescriptor] = useState<number[] | null>(null);

  const { cameraActive, cameraError, enableCamera, stopCamera } = useCamera();

  const REQUIRED_CAPTURES = 3;

  useEffect(() => {
    const initializeSystem = async () => {
      try {
        const initialized = await faceRecognitionService.initializeFaceAPI();
        if (!initialized) {
          setEnrollmentStep('error');
          toast.error('Failed to initialize face recognition system');
        }
      } catch (error) {
        console.error('Face API initialization error:', error);
        setEnrollmentStep('error');
      }
    };

    initializeSystem();

    return () => {
      stopCamera();
    };
  }, []);

  const captureImage = async (): Promise<string | null> => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Set canvas dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data as base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    return imageData;
  };

  const startEnrollment = async () => {
    if (!cameraActive) {
      await enableCamera();
      return;
    }

    setEnrollmentStep('capturing');
    setCapturedImages([]);
    setCurrentCapture(0);
    setProgress(0);

    // Capture multiple images with delays
    const images: string[] = [];
    
    for (let i = 0; i < REQUIRED_CAPTURES; i++) {
      setCurrentCapture(i + 1);
      setProgress(((i + 1) / REQUIRED_CAPTURES) * 100);
      
      // Wait for user to position properly
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const imageData = await captureImage();
      if (imageData) {
        images.push(imageData);
        toast.success(`Image ${i + 1} captured successfully`);
      } else {
        toast.error(`Failed to capture image ${i + 1}`);
        setEnrollmentStep('error');
        return;
      }
    }

    setCapturedImages(images);
    await processEnrollment(images);
  };

  const processEnrollment = async (images: string[]) => {
    setEnrollmentStep('processing');
    
    try {
      // Create face descriptors from captured images
      const descriptors: number[][] = [];
      
      for (const imageData of images) {
        // Convert base64 to image element
        const img = new Image();
        img.src = imageData;
        
        await new Promise((resolve) => {
          img.onload = resolve;
        });

        // Get face descriptor
        const descriptor = await faceRecognitionService.createFaceDescriptor(img);
        if (descriptor) {
          descriptors.push(descriptor);
        }
      }

      if (descriptors.length === 0) {
        throw new Error('No valid face descriptors could be created');
      }

      // Average the descriptors for better accuracy
      const avgDescriptor = descriptors[0].map((_, i) => 
        descriptors.reduce((sum, desc) => sum + desc[i], 0) / descriptors.length
      );

      setFaceDescriptor(avgDescriptor);
      setEnrollmentStep('success');
      
      // Store face descriptor (you can save this to your backend/database)
      localStorage.setItem(`faceDescriptor_${userId}`, JSON.stringify(avgDescriptor));
      
      toast.success('Face enrollment completed successfully!');
      onSuccess(avgDescriptor);
      
    } catch (error) {
      console.error('Enrollment processing error:', error);
      setEnrollmentStep('error');
      toast.error('Failed to process face enrollment');
    }
  };

  const resetEnrollment = () => {
    setEnrollmentStep('instruction');
    setCapturedImages([]);
    setCurrentCapture(0);
    setProgress(0);
    setFaceDescriptor(null);
  };

  const renderContent = () => {
    switch (enrollmentStep) {
      case 'instruction':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="space-y-4">
              <Camera className="w-16 h-16 mx-auto text-primary" />
              <h3 className="text-xl font-semibold">Face Enrollment</h3>
              <p className="text-muted-foreground">
                We'll capture a few images of your face to set up secure verification.
                Make sure you're in good lighting and looking directly at the camera.
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Instructions:</p>
              <ul className="text-sm text-muted-foreground space-y-1 text-left max-w-md mx-auto">
                <li>• Position your face in the center of the camera</li>
                <li>• Ensure good lighting on your face</li>
                <li>• Keep your face straight and look at the camera</li>
                <li>• We'll capture {REQUIRED_CAPTURES} images with short delays</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button onClick={startEnrollment} className="w-full">
                Start Face Enrollment
              </Button>
              {onSkip && (
                <Button variant="outline" onClick={onSkip} className="w-full">
                  Skip for Now
                </Button>
              )}
            </div>
          </motion.div>
        );

      case 'capturing':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-6"
          >
            <div className="space-y-4">
              <Camera className="w-16 h-16 mx-auto text-primary animate-pulse" />
              <h3 className="text-xl font-semibold">Capturing Image {currentCapture} of {REQUIRED_CAPTURES}</h3>
              <p className="text-muted-foreground">
                Hold still and look directly at the camera
              </p>
            </div>
            
            <Progress value={progress} className="w-full" />
          </motion.div>
        );

      case 'processing':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-6"
          >
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <h3 className="text-xl font-semibold">Processing Face Data</h3>
              <p className="text-muted-foreground">
                Creating your unique face profile...
              </p>
            </div>
          </motion.div>
        );

      case 'success':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="space-y-4">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
              <h3 className="text-xl font-semibold">Enrollment Complete!</h3>
              <p className="text-muted-foreground">
                Your face has been successfully enrolled. You can now use facial verification for secure access.
              </p>
            </div>
          </motion.div>
        );

      case 'error':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-6"
          >
            <div className="space-y-4">
              <AlertCircle className="w-16 h-16 mx-auto text-destructive" />
              <h3 className="text-xl font-semibold">Enrollment Failed</h3>
              <p className="text-muted-foreground">
                We couldn't complete the face enrollment. Please try again with better lighting.
              </p>
            </div>
            
            <Button onClick={resetEnrollment} variant="outline" className="w-full">
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto p-6">
      {cameraError && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive">{cameraError}</p>
        </div>
      )}

      {(enrollmentStep === 'capturing' || enrollmentStep === 'processing') && (
        <div className="mb-6">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-48 object-cover rounded-lg bg-muted"
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {renderContent()}
    </Card>
  );
};