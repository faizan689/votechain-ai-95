
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
      '/lovable-uploads/1a4d42b9-fb99-4ef2-a39b-402180b08d16.png'
    ];
    
    const faceDescriptors: Float32Array[] = [];
    
    for (const imagePath of referenceImages) {
      try {
        const img = await faceapi.fetchImage(imagePath);
        const detection = await faceapi
          .detectSingleFace(img, getFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();
        
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

// Perform face recognition on video element
export const recognizeFace = async (
  videoElement: HTMLVideoElement,
  faceMatcher: faceapi.FaceMatcher
): Promise<{
  isAuthorized: boolean;
  confidence: number;
  label: string;
  detection?: faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<faceapi.FaceDetection>>;
}> => {
  try {
    // Detect face in current video frame
    const detection = await faceapi
      .detectSingleFace(videoElement, getFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();
    
    if (!detection) {
      return {
        isAuthorized: false,
        confidence: 0,
        label: 'No face detected',
      };
    }
    
    // Match against authorized face
    const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
    const isAuthorized = bestMatch.label !== 'unknown' && bestMatch.distance <= (1 - FACE_MATCH_THRESHOLD);
    
    return {
      isAuthorized,
      confidence: Math.max(0, 1 - bestMatch.distance),
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
