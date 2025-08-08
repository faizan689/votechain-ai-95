import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Camera, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { modernFaceRecognition } from '@/services/modernFaceRecognition';
import { toast } from 'sonner';

interface SimpleFaceEnrollmentProps {
  userId: string;
  onSuccess: (faceDescriptor: number[]) => void;
  onSkip: () => void;
}

const SimpleFaceEnrollment: React.FC<SimpleFaceEnrollmentProps> = ({
  userId,
  onSuccess,
  onSkip
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [needsUserInteraction, setNeedsUserInteraction] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

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
      toast.success('Camera ready for face enrollment');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to initialize';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const forceVideoPlay = async () => {
    if (!videoRef.current) return false;
    
    try {
      await videoRef.current.play();
      setVideoPlaying(true);
      setNeedsUserInteraction(false);
      return true;
    } catch (err) {
      console.warn('📹 Video play failed:', err);
      setNeedsUserInteraction(true);
      return false;
    }
  };

  const startCamera = async () => {
    try {
      setDebugInfo('Requesting camera access...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      console.log('📹 Camera stream obtained:', mediaStream.getVideoTracks().length, 'video tracks');
      setDebugInfo('Camera stream obtained');
      
      // Validate video tracks
      const videoTracks = mediaStream.getVideoTracks();
      if (videoTracks.length === 0) {
        throw new Error('No video tracks found in stream');
      }
      
      const videoTrack = videoTracks[0];
      console.log('📹 Video track state:', videoTrack.readyState, 'enabled:', videoTrack.enabled);
      setDebugInfo(`Video track: ${videoTrack.readyState}, enabled: ${videoTrack.enabled}`);
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setDebugInfo('Video source assigned');
        
        // Wait for video to be ready with enhanced validation
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error('Video element not available'));
            return;
          }

          let resolved = false;
          let playAttempted = false;
          const timeout = setTimeout(() => {
            if (!resolved) {
              resolved = true;
              cleanup();
              reject(new Error('Video failed to load within timeout'));
            }
          }, 10000); // 10 second timeout

          const cleanup = () => {
            clearTimeout(timeout);
            videoRef.current?.removeEventListener('loadedmetadata', onLoadedMetadata);
            videoRef.current?.removeEventListener('canplay', onCanPlay);
            videoRef.current?.removeEventListener('playing', onPlaying);
            videoRef.current?.removeEventListener('error', onError);
          };

          const attemptPlay = async () => {
            if (playAttempted || !videoRef.current) return;
            playAttempted = true;
            
            try {
              await videoRef.current.play();
              console.log('📹 Video playing successfully');
              setVideoPlaying(true);
              setDebugInfo('Video playing');
            } catch (playError) {
              console.warn('📹 Autoplay failed:', playError);
              setNeedsUserInteraction(true);
              setDebugInfo('Autoplay failed - user interaction needed');
            }
          };

          const onLoadedMetadata = () => {
            console.log('📹 Video metadata loaded, dimensions:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);
            setDebugInfo(`Video loaded: ${videoRef.current?.videoWidth}x${videoRef.current?.videoHeight}`);
            
            if (videoRef.current && videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
              attemptPlay();
            }
          };

          const onCanPlay = () => {
            console.log('📹 Video can play');
            setDebugInfo('Video can play');
            attemptPlay();
          };

          const onPlaying = () => {
            if (!resolved) {
              resolved = true;
              console.log('📹 Video is playing and ready');
              setVideoPlaying(true);
              setDebugInfo('Video playing and ready');
              cleanup();
              resolve();
            }
          };

          const onError = (e: Event) => {
            if (!resolved) {
              resolved = true;
              console.error('📹 Video error:', e);
              setDebugInfo('Video error occurred');
              cleanup();
              reject(new Error('Video failed to load'));
            }
          };

          videoRef.current.addEventListener('loadedmetadata', onLoadedMetadata);
          videoRef.current.addEventListener('canplay', onCanPlay);
          videoRef.current.addEventListener('playing', onPlaying);
          videoRef.current.addEventListener('error', onError);

          // Fallback: resolve even if not playing after some time (for browsers blocking autoplay)
          setTimeout(() => {
            if (!resolved && videoRef.current?.videoWidth && videoRef.current.videoWidth > 0) {
              resolved = true;
              console.log('📹 Video loaded but may need user interaction to play');
              setDebugInfo('Video loaded - may need user interaction');
              cleanup();
              resolve();
            }
          }, 5000);
        });
      }
    } catch (err) {
      console.error('📹 Camera access error:', err);
      setDebugInfo('Camera access failed');
      throw new Error('Camera access denied. Please allow camera permissions.');
    }
  };

  const handleEnrollFace = async () => {
    if (!videoRef.current || !cameraReady) {
      toast.error('Camera not ready');
      return;
    }

    setIsEnrolling(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      // Enroll face
      const result = await modernFaceRecognition.enrollFace(userId, videoRef.current);

      clearInterval(progressInterval);
      setProgress(100);

      if (result.success && result.descriptor) {
        toast.success('Face enrolled successfully!');
        onSuccess(result.descriptor);
      } else {
        throw new Error(result.error || 'Failed to enroll face');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Enrollment failed';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsEnrolling(false);
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
        <div className="flex gap-2 justify-center">
          <Button onClick={handleRetry} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button onClick={onSkip} variant="ghost">
            Skip for Now
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="text-center mb-4">
          <Camera className="w-12 h-12 mx-auto mb-2 text-primary" />
          <h3 className="text-lg font-semibold">Face Enrollment</h3>
          <p className="text-muted-foreground">
            Position your face in the camera view and click "Enroll Face"
          </p>
        </div>

        <div className="relative mb-4 flex justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full max-w-md rounded-lg border-2 border-dashed border-primary/30"
            style={{ 
              maxHeight: '360px',
              minHeight: '240px',
              objectFit: 'cover',
              background: 'hsl(var(--muted))',
              display: 'block'
            }}
            onLoadedMetadata={() => {
              console.log('📹 Video element loaded metadata');
            }}
            onCanPlay={() => {
              console.log('📹 Video can play');
            }}
            onError={(e) => {
              console.error('📹 Video element error:', e);
            }}
          />
          
          {/* Face detection overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 border-2 border-primary rounded-full opacity-30" />
          </div>
          
          {/* Camera status indicator */}
          {!cameraReady && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
              <div className="text-white text-center">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p className="text-sm">Starting camera...</p>
                {debugInfo && <p className="text-xs mt-1 opacity-75">{debugInfo}</p>}
              </div>
            </div>
          )}

          {/* User interaction needed overlay */}
          {cameraReady && needsUserInteraction && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/75 rounded-lg">
              <div className="text-white text-center p-4">
                <Camera className="w-8 h-8 mx-auto mb-3" />
                <p className="text-sm mb-3">Video needs to start</p>
                <p className="text-xs mb-4 opacity-75">Click to start camera feed</p>
                <Button 
                  onClick={forceVideoPlay}
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  Start Camera
                </Button>
              </div>
            </div>
          )}

          {/* Video status indicator */}
          {cameraReady && !needsUserInteraction && (
            <div className="absolute top-2 left-2 z-10">
              <div className="bg-black/60 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${videoPlaying ? 'bg-green-400' : 'bg-yellow-400'}`} />
                {videoPlaying ? 'Live' : 'Ready'}
              </div>
            </div>
          )}
        </div>

        {isEnrolling && (
          <div className="mb-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm">Enrolling face...</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        <div className="flex gap-2 justify-center">
          <Button
            onClick={handleEnrollFace}
            disabled={!cameraReady || isEnrolling || !videoPlaying}
            className="flex items-center gap-2"
          >
            {isEnrolling ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            {isEnrolling ? 'Enrolling...' : 'Enroll Face'}
          </Button>
          
          <Button onClick={onSkip} variant="outline">
            Skip for Now
          </Button>
        </div>
      </Card>

      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">👤 Face Enrollment Tips:</p>
          <ul className="text-xs space-y-1">
            <li>• Look directly at the camera</li>
            <li>• Ensure good lighting on your face</li>
            <li>• Keep your face centered in the circle</li>
            <li>• Remove glasses or face coverings if possible</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default SimpleFaceEnrollment;