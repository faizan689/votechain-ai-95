import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Camera, CheckCircle, XCircle, RefreshCw, Shield } from 'lucide-react';
import { modernFaceRecognition } from '@/services/modernFaceRecognition';
import { toast } from 'sonner';

interface SimpleFaceVerificationProps {
  onSuccess: (confidence: number) => void;
  onFailure: (error: string) => void;
}

const SimpleFaceVerification: React.FC<SimpleFaceVerificationProps> = ({
  onSuccess,
  onFailure
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    initializeSystem();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const initializeSystem = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Initialize face recognition
      const initialized = await modernFaceRecognition.initialize();
      if (!initialized) {
        throw new Error('Failed to initialize face recognition');
      }

      // Start camera
      await startCamera();
      setCameraReady(true);
      toast.success('Camera ready for verification');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to initialize';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      throw new Error('Camera access denied. Please allow camera permissions.');
    }
  };

  const handleVerifyFace = async () => {
    if (!videoRef.current || !cameraReady) {
      toast.error('Camera not ready');
      return;
    }

    setIsVerifying(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      // Verify face
      const result = await modernFaceRecognition.recognizeFace(videoRef.current);

      clearInterval(progressInterval);
      setProgress(100);

      if (result.success) {
        toast.success(`Face verified! Confidence: ${(result.confidence * 100).toFixed(1)}%`);
        onSuccess(result.confidence);
      } else {
        const errorMsg = result.error || 'Face verification failed';
        toast.error(errorMsg);
        onFailure(errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Verification failed';
      setError(errorMsg);
      toast.error(errorMsg);
      onFailure(errorMsg);
    } finally {
      setIsVerifying(false);
      setProgress(0);
    }
  };

  const handleRetry = () => {
    setError(null);
    initializeSystem();
  };

  if (isLoading) {
    return (
      <Card className="p-6 text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Initializing camera...</span>
        </div>
        <Progress value={50} className="w-full" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center border-red-200 bg-red-50">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-700 mb-2">Error</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={handleRetry} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="text-center mb-4">
          <Shield className="w-12 h-12 mx-auto mb-2 text-primary" />
          <h3 className="text-lg font-semibold">Face Verification</h3>
          <p className="text-muted-foreground">
            Look at the camera to verify your identity
          </p>
        </div>

        <div className="relative mb-4">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full max-w-md mx-auto rounded-lg border-2 border-dashed border-primary/30"
            style={{ maxHeight: '360px' }}
          />
          
          {/* Face detection overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 border-2 border-primary rounded-full opacity-30" />
          </div>
        </div>

        {isVerifying && (
          <div className="mb-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm">Verifying face...</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        <div className="flex gap-2 justify-center">
          <Button
            onClick={handleVerifyFace}
            disabled={!cameraReady || isVerifying}
            className="flex items-center gap-2"
          >
            {isVerifying ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Shield className="w-4 h-4" />
            )}
            {isVerifying ? 'Verifying...' : 'Verify Face'}
          </Button>
        </div>
      </Card>

      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">🔒 Face Verification Tips:</p>
          <ul className="text-xs space-y-1">
            <li>• Look directly at the camera</li>
            <li>• Ensure good lighting on your face</li>
            <li>• Keep your face centered in the circle</li>
            <li>• Hold still during verification</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default SimpleFaceVerification;