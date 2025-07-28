
import * as faceapi from 'face-api.js';

// Face recognition configuration
const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/model';
const FACE_MATCH_THRESHOLD = 0.6;
const AUTHORIZED_FACE_LABEL = 'Fezan';

// Face detection options
const getFaceDetectorOptions = () => {
  return new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 });
};

// Initialize face-api models
export const initializeFaceAPI = async (): Promise<boolean> => {
  try {
    console.log('Loading face-api.js models...');
    
    // Load required models from CDN
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);
    
    console.log('Face-api.js models loaded successfully');
    return true;
  } catch (error) {
    console.error('Error loading face-api.js models:', error);
    return false;
  }
};

// Load reference face descriptors for authorized user
export const loadAuthorizedFaceDescriptors = async (): Promise<faceapi.LabeledFaceDescriptors | null> => {
  try {
    console.log('Loading authorized face descriptors...');
    
    // Reference images of the authorized user (Fezan)
    const referenceImages = [
      '/lovable-uploads/ae2ff4df-7534-41d5-ab91-ba4d74a0f8bc.png',
      '/lovable-uploads/1a4d42b9-fb99-4ef2-a39b-402180b08d16.png',
      '/lovable-uploads/f6cf0c03-1e50-4a8b-8d82-aab30ec77939.png',
      '/lovable-uploads/2f4ad45b-c1ac-4b64-b51d-b978020e8c67.png',
      '/lovable-uploads/52c1752a-e030-43af-8ffc-a90b96cec55d.png'
    ];
    
    
    const faceDescriptors: Float32Array[] = [];
    
    for (const imagePath of referenceImages) {
      try {
        console.log(`Processing reference image: ${imagePath}`);
        const img = await faceapi.fetchImage(imagePath);
        
        // Try multiple detection options for better results
        let detection = await faceapi
          .detectSingleFace(img, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.3 }))
          .withFaceLandmarks()
          .withFaceDescriptor();
        
        // If SSD doesn't work, try TinyFaceDetector
        if (!detection) {
          console.log(`Trying TinyFaceDetector for ${imagePath}`);
          detection = await faceapi
            .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.3 }))
            .withFaceLandmarks()
            .withFaceDescriptor();
        }
        
        if (detection && detection.descriptor) {
          faceDescriptors.push(detection.descriptor);
          console.log(`Successfully processed reference image: ${imagePath}`);
        } else {
          console.warn(`No face detected in reference image: ${imagePath}`);
        }
      } catch (error) {
        console.error(`Error processing reference image ${imagePath}:`, error);
      }
    }
    
    if (faceDescriptors.length === 0) {
      console.error('No face descriptors could be extracted from reference images');
      return null;
    }
    
    console.log(`Created face descriptors for ${AUTHORIZED_FACE_LABEL} with ${faceDescriptors.length} references`);
    return new faceapi.LabeledFaceDescriptors(AUTHORIZED_FACE_LABEL, faceDescriptors);
  } catch (error) {
    console.error('Error loading authorized face descriptors:', error);
    return null;
  }
};

// Perform face recognition on video element with user-specific descriptors
export const recognizeFaceForUser = async (
  videoElement: HTMLVideoElement,
  userId: string
): Promise<{
  isAuthorized: boolean;
  confidence: number;
  label: string;
  detection?: any;
}> => {
  try {
    console.log('Attempting face detection for user:', userId);
    
    // Load user's face descriptors
    const userDescriptors = await loadUserFaceDescriptors(userId);
    if (!userDescriptors) {
      return {
        isAuthorized: false,
        confidence: 0,
        label: 'No enrolled face data found',
      };
    }
    
    // Create face matcher with user's descriptors
    const faceMatcher = new faceapi.FaceMatcher([userDescriptors], 0.5);
    
    // Try multiple detection methods for better results
    let detection = await faceapi
      .detectSingleFace(videoElement, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.4 }))
      .withFaceLandmarks()
      .withFaceDescriptor();
    
    // If SSD doesn't work, try TinyFaceDetector
    if (!detection) {
      console.log('Trying TinyFaceDetector for video stream...');
      detection = await faceapi
        .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.4 }))
        .withFaceLandmarks()
        .withFaceDescriptor();
    }
    
    if (!detection) {
      console.log('No face detected in current video frame');
      return {
        isAuthorized: false,
        confidence: 0,
        label: 'No face detected',
      };
    }
    
    // Match against user's enrolled face
    const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
    const distance = bestMatch.distance;
    const confidence = Math.max(0, 1 - distance);
    
    // Security threshold for user verification
    const isAuthorized = bestMatch.label !== 'unknown' && 
                        distance <= 0.4 && // Reasonable distance threshold 
                        confidence >= 0.6;  // Require good confidence
    
    console.log('Face recognition result:', {
      userId: userId,
      label: bestMatch.label,
      distance: bestMatch.distance,
      confidence: confidence,
      isAuthorized: isAuthorized
    });
    
    return {
      isAuthorized,
      confidence: confidence,
      label: isAuthorized ? userId : 'Unauthorized',
      detection
    };
  } catch (error) {
    console.error('Error in face recognition for user:', error);
    return {
      isAuthorized: false,
      confidence: 0,
      label: 'Recognition error',
    };
  }
};

// Legacy function - perform face recognition on video element
export const recognizeFace = async (
  videoElement: HTMLVideoElement,
  faceMatcher: faceapi.FaceMatcher
): Promise<{
  isAuthorized: boolean;
  confidence: number;
  label: string;
  detection?: any;
}> => {
  try {
    console.log('Attempting face detection in video stream...');
    
    // Try multiple detection methods for better results
    let detection = await faceapi
      .detectSingleFace(videoElement, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.4 }))
      .withFaceLandmarks()
      .withFaceDescriptor();
    
    // If SSD doesn't work, try TinyFaceDetector
    if (!detection) {
      console.log('Trying TinyFaceDetector for video stream...');
      detection = await faceapi
        .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.4 }))
        .withFaceLandmarks()
        .withFaceDescriptor();
    }
    
    if (!detection) {
      console.log('No face detected in current video frame');
      return {
        isAuthorized: false,
        confidence: 0,
        label: 'No face detected',
      };
    }
    
    // Match against authorized face with strict threshold
    const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
    const distance = bestMatch.distance;
    const confidence = Math.max(0, 1 - distance);
    
    // Strict security: only authorize if it's a known face with high confidence
    const isAuthorized = bestMatch.label !== 'unknown' && 
                        distance <= 0.35 && // Stricter distance threshold 
                        confidence >= 0.65;  // Require high confidence
    
    console.log('Face recognition result:', {
      label: bestMatch.label,
      distance: bestMatch.distance,
      confidence: confidence,
      isAuthorized: isAuthorized
    });
    
    return {
      isAuthorized,
      confidence: confidence,
      label: isAuthorized ? bestMatch.label : 'Unauthorized',
      detection
    };
  } catch (error) {
    console.error('Error in face recognition:', error);
    return {
      isAuthorized: false,
      confidence: 0,
      label: 'Recognition error',
    };
  }
};

/**
 * Create face descriptor from image element
 */
export const createFaceDescriptor = async (imageElement: HTMLImageElement): Promise<number[] | null> => {
  try {
    const detection = await faceapi
      .detectSingleFace(imageElement, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
      .withFaceLandmarks()
      .withFaceDescriptor();
    
    return detection ? Array.from(detection.descriptor) : null;
  } catch (error) {
    console.error('Error creating face descriptor:', error);
    return null;
  }
};

/**
 * Load user-specific face descriptors from storage
 */
export const loadUserFaceDescriptors = async (userId: string): Promise<faceapi.LabeledFaceDescriptors | null> => {
  try {
    const storedDescriptor = localStorage.getItem(`faceDescriptor_${userId}`);
    if (!storedDescriptor) return null;
    
    const descriptor = JSON.parse(storedDescriptor);
    return new faceapi.LabeledFaceDescriptors(userId, [new Float32Array(descriptor)]);
  } catch (error) {
    console.error('Error loading user face descriptors:', error);
    return null;
  }
};

// Simple liveness detection (basic movement detection)
export const detectLiveness = (
  previousFrame: ImageData | null,
  currentFrame: ImageData
): boolean => {
  if (!previousFrame) return true;
  
  // Simple pixel difference detection
  let diffCount = 0;
  const threshold = 30;
  const sampleRate = 10; // Check every 10th pixel for performance
  
  for (let i = 0; i < currentFrame.data.length; i += 4 * sampleRate) {
    const rDiff = Math.abs(currentFrame.data[i] - previousFrame.data[i]);
    const gDiff = Math.abs(currentFrame.data[i + 1] - previousFrame.data[i + 1]);
    const bDiff = Math.abs(currentFrame.data[i + 2] - previousFrame.data[i + 2]);
    
    if (rDiff + gDiff + bDiff > threshold) {
      diffCount++;
    }
  }
  
  // If more than 1% of sampled pixels changed significantly, consider it live
  const changePercentage = (diffCount * sampleRate) / (currentFrame.data.length / 4) * 100;
  return changePercentage > 1;
};
