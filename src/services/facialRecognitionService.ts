
let tf: any;
let faceDetection: any;
let faceLandmarksDetection: any;
import { authService } from './authService';

// Models
let faceDetector: any = null;
let faceLandmarksDetector: any = null;
let initPromise: Promise<boolean> | null = null;

// Face detection configurations
const FACE_DETECTION_CONFIG = {
  runtime: 'tfjs' as const,
  modelType: 'short' as const,
  minDetectionConfidence: 0.5
};

const FACE_LANDMARKS_CONFIG = {
  runtime: 'tfjs' as const,
  refineLandmarks: true,
  maxFaces: 1
};

/**
 * Initialize TensorFlow.js and face detection models
 */
export async function initFacialRecognition(): Promise<boolean> {
  if (faceDetector && faceLandmarksDetector) return true;
  if (initPromise) return initPromise;
  initPromise = (async () => {
    try {
      if (!tf) {
        tf = await import('@tensorflow/tfjs');
      }
      if (!faceDetection) {
        faceDetection = await import('@tensorflow-models/face-detection');
      }
      if (!faceLandmarksDetection) {
        faceLandmarksDetection = await import('@tensorflow-models/face-landmarks-detection');
      }
      await tf.ready();
      console.log('TensorFlow.js initialized');
      
      // Load face detection model
      faceDetector = await faceDetection.createDetector(
        faceDetection.SupportedModels.MediaPipeFaceDetector,
        FACE_DETECTION_CONFIG
      );
      console.log('Face detection model loaded');
      
      // Load face landmarks model
      faceLandmarksDetector = await faceLandmarksDetection.createDetector(
        faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
        FACE_LANDMARKS_CONFIG
      );
      console.log('Face landmarks model loaded');
      
      return true;
    } catch (error) {
      console.error('Error initializing facial recognition:', error);
      return false;
    } finally {
      initPromise = null;
    }
  })();
  return initPromise;
}

/**
 * Detect face in an image
 */
export async function detectFace(imageElement: HTMLImageElement | HTMLVideoElement): Promise<boolean> {
  if (!faceDetector) {
    const ok = await initFacialRecognition();
    if (!ok || !faceDetector) {
      console.error('Face detector not initialized');
      return false;
    }
  }
  
  try {
    const faces = await faceDetector.estimateFaces(imageElement);
    return faces.length > 0;
  } catch (error) {
    console.error('Error detecting face:', error);
    return false;
  }
}

/**
 * Check for liveness detection (blinking, movement)
 */
export async function detectLiveness(videoElement: HTMLVideoElement): Promise<boolean> {
  if (!faceLandmarksDetector) {
    const ok = await initFacialRecognition();
    if (!ok || !faceLandmarksDetector) {
      console.error('Face landmarks detector not initialized');
      return false;
    }
  }
  
  try {
    const faces = await faceLandmarksDetector.estimateFaces(videoElement);
    if (!faces || faces.length === 0) return false;
    const face: any = faces[0];

    // Prefer 3D keypoints if available
    const points: any[] = (face.keypoints3D?.length ? face.keypoints3D : face.keypoints) || [];
    if (!points.length) return false;

    const zs = points.map((p: any) => (typeof p.z === 'number' ? p.z : 0)).filter((z: number) => !Number.isNaN(z));
    if (!zs.length) return false;

    const zMin = Math.min(...zs);
    const zMax = Math.max(...zs);
    const zRange = Math.abs(zMax - zMin);

    // Simple depth-based anti-spoofing: flat surfaces have near-zero depth variance
    const depthPass = zRange > 0.01; // tune as needed per device/camera

    return depthPass;
  } catch (error) {
    console.error('Error detecting liveness:', error);
    return false;
  }
}

/**
 * Process and verify facial recognition
 * Captures image data, detects face, confirms liveness, and sends to server
 */
export async function processFacialVerification(videoElement: HTMLVideoElement, email: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // 1. Check if face is detected
    const hasFace = await detectFace(videoElement);
    if (!hasFace) {
      return {
        success: false,
        message: 'No face detected. Please ensure your face is clearly visible.'
      };
    }
    
    // 2. Check for liveness detection
    const isLive = await detectLiveness(videoElement);
    if (!isLive) {
      return {
        success: false,
        message: 'Liveness check failed. Please ensure you are in a well-lit area and facing the camera.'
      };
    }
    
    // 3. Capture image data
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    // Draw video frame to canvas
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    // Get image data as base64 string
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    // 4. Send to backend for verification
    const response = await authService.facialVerification(imageData, email);
    
    if (response.success) {
      return {
        success: true,
        message: 'Facial verification successful'
      };
    } else {
      return {
        success: false,
        message: response.error || 'Facial verification failed'
      };
    }
  } catch (error) {
    console.error('Error during facial verification process:', error);
    return {
      success: false,
      message: 'An error occurred during facial verification'
    };
  }
}
