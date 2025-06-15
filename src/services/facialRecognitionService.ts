
import * as tf from '@tensorflow/tfjs';
import * as faceDetection from '@tensorflow-models/face-detection';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import { authService } from './authService';

// Models
let faceDetector: faceDetection.FaceDetector | null = null;
let faceLandmarksDetector: faceLandmarksDetection.FaceLandmarksDetector | null = null;

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
  try {
    // Initialize TensorFlow.js
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
  }
}

/**
 * Detect face in an image
 */
export async function detectFace(imageElement: HTMLImageElement | HTMLVideoElement): Promise<boolean> {
  if (!faceDetector) {
    throw new Error('Face detector not initialized');
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
    throw new Error('Face landmarks detector not initialized');
  }
  
  try {
    // Capture multiple frames to detect eye blinking or movement
    const faceLandmarks = await faceLandmarksDetector.estimateFaces(videoElement);
    
    // For demo purposes, we'll consider the detection of facial landmarks as proof of liveness
    // In a production app, you'd implement more sophisticated liveness detection
    return faceLandmarks.length > 0;
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
