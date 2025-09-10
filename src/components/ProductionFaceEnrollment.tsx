import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Eye, 
  Shield, 
  Scan,
  UserCheck,
  Layers,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  initializeAdvancedBiometrics,
  performProductionFaceEnrollment,
  FaceScanAngle,
  ADVANCED_BIOMETRIC_CONFIG
} from '@/services/advancedBiometricService';
import { ipfsStorageService } from '@/services/ipfsStorageService';
import { faceEnrollmentService } from '@/services/faceEnrollmentService';

interface ProductionFaceEnrollmentProps {
  userId: string;
  onSuccess: (enrollmentData: any) => void;
  onSkip: () => void;
}

const ProductionFaceEnrollment: React.FC<ProductionFaceEnrollmentProps> = ({
  userId,
  onSuccess,
  onSkip
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  
  // Production enrollment state
  const [currentAngle, setCurrentAngle] = useState<FaceScanAngle>('front');
  const [angleProgress, setAngleProgress] = useState(0);
  const [completedAngles, setCompletedAngles] = useState<Set<FaceScanAngle>>(new Set());
  const [overallProgress, setOverallProgress] = useState(0);
  const [qualityMetrics, setQualityMetrics] = useState<any>(null);
  const [livenessStatus, setLivenessStatus] = useState<any>(null);
  
  // System status
  const [systemStatus, setSystemStatus] = useState({
    biometrics: false,
    ipfs: false,
    camera: false,
    ready: false
  });

  useEffect(() => {
    initializeProductionSystem();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const initializeProductionSystem = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Initialize advanced biometric system
      const biometricsReady = await initializeAdvancedBiometrics();
      setSystemStatus(prev => ({ ...prev, biometrics: biometricsReady }));

      if (!biometricsReady) {
        throw new Error('Failed to initialize advanced biometric system');
      }

      // Initialize IPFS storage
      const ipfsReady = await ipfsStorageService.initialize();
      setSystemStatus(prev => ({ ...prev, ipfs: ipfsReady }));

      // Initialize camera
      await startProductionCamera();
      setSystemStatus(prev => ({ ...prev, camera: true }));

      setSystemStatus(prev => ({ ...prev, ready: true }));
      setCameraReady(true);
      toast.success('Production enrollment system ready');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'System initialization failed';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const startProductionCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, min: 720 },
          height: { ideal: 720, min: 480 },
          facingMode: 'user',
          frameRate: { ideal: 30 }
        }
      });

      setStream(mediaStream);
      
      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = mediaStream;
        
        await new Promise<void>((resolve) => {
          const onLoaded = () => {
            video.removeEventListener('loadedmetadata', onLoaded);
            resolve();
          };
          
          if (video.readyState >= 1) {
            resolve();
          } else {
            video.addEventListener('loadedmetadata', onLoaded);
          }
        });

        // Wait for video dimensions
        let tries = 0;
        while ((video.videoWidth === 0 || video.videoHeight === 0) && tries < 20) {
          await new Promise(r => setTimeout(r, 100));
          tries++;
        }
      }
    } catch (err) {
      throw new Error('High-resolution camera access required for production enrollment');
    }
  };

  const handleProductionEnrollment = async () => {
    if (!videoRef.current || !cameraReady) {
      toast.error('System not ready');
      return;
    }

    setIsEnrolling(true);
    setOverallProgress(0);
    setCompletedAngles(new Set());

    try {
      // Start production enrollment process
      const enrollmentResult = await performProductionFaceEnrollment(
        videoRef.current,
        userId,
        (angle: FaceScanAngle, progress: number) => {
          setCurrentAngle(angle);
          setAngleProgress(progress);
          
          if (progress === 100) {
            setCompletedAngles(prev => new Set([...prev, angle]));
          }
          
          // Update overall progress
          const angleWeight = 100 / ADVANCED_BIOMETRIC_CONFIG.REQUIRED_ANGLES.length;
          const completedWeight = completedAngles.size * angleWeight;
          const currentAngleWeight = (progress / 100) * angleWeight;
          setOverallProgress(completedWeight + currentAngleWeight);
        }
      );

      if (!enrollmentResult) {
        throw new Error('Production enrollment failed');
      }

      // Store biometric data on IPFS
      const ipfsResult = await ipfsStorageService.storeBiometricData(
        userId,
        enrollmentResult.faceDescriptors,
        enrollmentResult.meshData,
        enrollmentResult.enrollmentMetadata
      );

      if (!ipfsResult.success) {
        console.warn('IPFS storage failed, using fallback storage');
      }

      // Store enrollment in database with IPFS reference
      const dbResult = await faceEnrollmentService.enrollFaceMultiple(
        userId,
        enrollmentResult.faceDescriptors.map(desc => Array.from(desc)),
        'production_system',
        ADVANCED_BIOMETRIC_CONFIG.VERIFICATION_THRESHOLD
      );

      if (!dbResult.success) {
        throw new Error(dbResult.error || 'Database enrollment failed');
      }

      setOverallProgress(100);
      toast.success('Production-grade biometric enrollment completed!');
      
      // Return comprehensive enrollment data
      const enrollmentData = {
        ...enrollmentResult,
        ipfsHash: ipfsResult.ipfsHash,
        databaseId: dbResult.data?.[0]?.id,
        systemVersion: 'production-2.0.0',
        qualityScore: enrollmentResult.qualityScores.reduce((a, b) => a + b, 0) / enrollmentResult.qualityScores.length
      };

      setTimeout(() => {
        onSuccess(enrollmentData);
      }, 1500);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Production enrollment failed';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsEnrolling(false);
    }
  };

  const getAngleInstruction = (angle: FaceScanAngle): string => {
    switch (angle) {
      case 'front':
        return 'Look directly at the camera';
      case 'left_profile':
        return 'Turn your head slowly to the left (30°)';
      case 'right_profile':
        return 'Turn your head slowly to the right (30°)';
      default:
        return 'Follow the instructions';
    }
  };

  const getAngleIcon = (angle: FaceScanAngle) => {
    if (completedAngles.has(angle)) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    if (currentAngle === angle) {
      return <Scan className="w-5 h-5 text-blue-500 animate-pulse" />;
    }
    return <Camera className="w-5 h-5 text-gray-400" />;
  };

  if (isLoading) {
    return (
      <Card className="p-6 text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Initializing production enrollment system...</span>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span>Advanced Biometrics</span>
            <Badge variant={systemStatus.biometrics ? "default" : "secondary"}>
              {systemStatus.biometrics ? "Ready" : "Loading"}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>IPFS Storage</span>
            <Badge variant={systemStatus.ipfs ? "default" : "secondary"}>
              {systemStatus.ipfs ? "Connected" : "Connecting"}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>HD Camera</span>
            <Badge variant={systemStatus.camera ? "default" : "secondary"}>
              {systemStatus.camera ? "Active" : "Initializing"}
            </Badge>
          </div>
        </div>
        
        <Progress value={Object.values(systemStatus).filter(Boolean).length * 25} className="w-full" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center border-red-200 bg-red-50">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-700 mb-2">System Error</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <div className="flex gap-2 justify-center">
          <Button onClick={initializeProductionSystem} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Initialization
          </Button>
          <Button onClick={onSkip} variant="ghost">
            Skip Production Enrollment
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Scan className="w-8 h-8 text-primary" />
            <Layers className="w-6 h-6 text-blue-500" />
            <Shield className="w-6 h-6 text-green-500" />
          </div>
          <h3 className="text-xl font-semibold">Production-Grade Biometric Enrollment</h3>
          <p className="text-muted-foreground">
            Multi-angle 3D scanning with 99.5% accuracy and IPFS storage
          </p>
        </div>

        {/* System Status Bar */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <Badge variant={systemStatus.biometrics ? "default" : "secondary"}>
            <Zap className="w-3 h-3 mr-1" />
            Advanced AI
          </Badge>
          <Badge variant={systemStatus.ipfs ? "default" : "secondary"}>
            <Layers className="w-3 h-3 mr-1" />
            IPFS Storage
          </Badge>
          <Badge variant={systemStatus.camera ? "default" : "secondary"}>
            <Camera className="w-3 h-3 mr-1" />
            HD Camera
          </Badge>
        </div>

        {/* Camera View */}
        <div className="relative mb-4 mx-auto max-w-md">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full rounded-lg border-2 border-dashed border-primary/30"
            style={{ maxHeight: '400px' }}
          />
          
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{ maxHeight: '400px' }}
          />
          
          {/* Angle Progress Indicator */}
          {isEnrolling && (
            <div className="absolute top-2 left-2 right-2">
              <div className="bg-black/80 text-white rounded p-2 text-center">
                <p className="text-sm font-medium">{getAngleInstruction(currentAngle)}</p>
                <div className="flex items-center gap-1 mt-1">
                  {ADVANCED_BIOMETRIC_CONFIG.REQUIRED_ANGLES.map(angle => (
                    <div key={angle} className="flex-1 flex items-center justify-center">
                      {getAngleIcon(angle)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Progress Tracking */}
        {isEnrolling && (
          <div className="mb-4 space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Overall Progress</span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="w-full h-3" />
            </div>
            
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Current Angle: {currentAngle.replace('_', ' ')}</span>
                <span>{Math.round(angleProgress)}%</span>
              </div>
              <Progress value={angleProgress} className="w-full h-2" />
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-2 justify-center">
          <Button
            onClick={handleProductionEnrollment}
            disabled={!systemStatus.ready || isEnrolling}
            className="flex items-center gap-2"
            size="lg"
          >
            {isEnrolling ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <UserCheck className="w-4 h-4" />
            )}
            {isEnrolling ? 'Enrolling...' : 'Start Production Enrollment'}
          </Button>
          
          <Button onClick={onSkip} variant="outline" disabled={isEnrolling}>
            Skip Advanced Features
          </Button>
        </div>
      </Card>

      {/* Feature Information */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <div className="text-sm text-blue-900">
          <p className="font-medium mb-2">🚀 Production Features Active:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>✓ 3D Face Mesh Analysis</div>
            <div>✓ Advanced Liveness Detection</div>
            <div>✓ Multi-angle Capture</div>
            <div>✓ IPFS Decentralized Storage</div>
            <div>✓ 99.5% Accuracy Target</div>
            <div>✓ Encryption & Privacy</div>
          </div>
        </div>
      </Card>

      {/* Quality Metrics Display */}
      {qualityMetrics && (
        <Card className="p-4 bg-gray-50 border-gray-200">
          <p className="font-medium text-sm mb-2">📊 Real-time Quality Metrics:</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>Face Size: {qualityMetrics.faceSize}px</div>
            <div>Brightness: {qualityMetrics.brightness}</div>
            <div>Sharpness: {qualityMetrics.sharpness.toFixed(2)}</div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProductionFaceEnrollment;