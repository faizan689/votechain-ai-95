/**
 * Modern Face Recognition Service
 * A lightweight facial recognition implementation using native browser APIs
 */

export interface FaceDescriptor {
  id: string;
  descriptor: number[];
  timestamp: number;
  confidence: number;
}

export interface FaceRecognitionResult {
  success: boolean;
  confidence: number;
  match?: FaceDescriptor;
  error?: string;
}

export interface EnrollmentResult {
  success: boolean;
  descriptor?: number[];
  error?: string;
}

class ModernFaceRecognitionService {
  private enrolled: Map<string, FaceDescriptor> = new Map();
  private threshold = 0.6; // Similarity threshold

  /**
   * Initialize the face recognition system
   */
  async initialize(): Promise<boolean> {
    try {
      // Check if required APIs are available
      if (!navigator.mediaDevices || !window.HTMLCanvasElement) {
        throw new Error('Required browser APIs not available');
      }
      
      console.log('✅ Modern face recognition initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize face recognition:', error);
      return false;
    }
  }

  /**
   * Extract face features from video element
   */
  async extractFaceFeatures(videoElement: HTMLVideoElement): Promise<number[] | null> {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      // Set canvas size to match video
      canvas.width = videoElement.videoWidth || 640;
      canvas.height = videoElement.videoHeight || 480;

      // Draw current video frame to canvas
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Simple feature extraction using image histogram and patterns
      const features = this.computeSimpleFeatures(imageData);
      
      console.log('🔍 Extracted face features:', features.length, 'dimensions');
      return features;
    } catch (error) {
      console.error('❌ Error extracting face features:', error);
      return null;
    }
  }

  /**
   * Compute simple facial features using image analysis
   */
  private computeSimpleFeatures(imageData: ImageData): number[] {
    const { data, width, height } = imageData;
    const features: number[] = [];

    // Divide image into grid for regional analysis
    const gridSize = 8;
    const cellWidth = Math.floor(width / gridSize);
    const cellHeight = Math.floor(height / gridSize);

    for (let gridY = 0; gridY < gridSize; gridY++) {
      for (let gridX = 0; gridX < gridSize; gridX++) {
        const startX = gridX * cellWidth;
        const startY = gridY * cellHeight;
        
        let totalR = 0, totalG = 0, totalB = 0;
        let pixelCount = 0;

        // Calculate average color for this grid cell
        for (let y = startY; y < startY + cellHeight && y < height; y++) {
          for (let x = startX; x < startX + cellWidth && x < width; x++) {
            const idx = (y * width + x) * 4;
            totalR += data[idx];
            totalG += data[idx + 1];
            totalB += data[idx + 2];
            pixelCount++;
          }
        }

        if (pixelCount > 0) {
          // Normalize to 0-1 range
          features.push(totalR / pixelCount / 255);
          features.push(totalG / pixelCount / 255);
          features.push(totalB / pixelCount / 255);
        }
      }
    }

    // Add additional simple features
    const brightness = this.calculateBrightness(imageData);
    const contrast = this.calculateContrast(imageData);
    
    features.push(brightness);
    features.push(contrast);

    return features;
  }

  /**
   * Calculate average brightness
   */
  private calculateBrightness(imageData: ImageData): number {
    const { data } = imageData;
    let total = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
      total += gray;
    }
    
    return total / (data.length / 4) / 255;
  }

  /**
   * Calculate image contrast
   */
  private calculateContrast(imageData: ImageData): number {
    const { data } = imageData;
    const pixels: number[] = [];
    
    for (let i = 0; i < data.length; i += 4) {
      const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
      pixels.push(gray);
    }
    
    const mean = pixels.reduce((a, b) => a + b) / pixels.length;
    const variance = pixels.reduce((acc, pixel) => acc + Math.pow(pixel - mean, 2), 0) / pixels.length;
    
    return Math.sqrt(variance) / 255;
  }

  /**
   * Calculate similarity between two face descriptors
   */
  private calculateSimilarity(desc1: number[], desc2: number[]): number {
    if (desc1.length !== desc2.length) return 0;

    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    for (let i = 0; i < desc1.length; i++) {
      dotProduct += desc1[i] * desc2[i];
      magnitude1 += desc1[i] * desc1[i];
      magnitude2 += desc2[i] * desc2[i];
    }

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) return 0;

    return dotProduct / (magnitude1 * magnitude2);
  }

  /**
   * Enroll a face for recognition
   */
  async enrollFace(userId: string, videoElement: HTMLVideoElement): Promise<EnrollmentResult> {
    try {
      const descriptor = await this.extractFaceFeatures(videoElement);
      if (!descriptor) {
        return { success: false, error: 'Could not extract face features' };
      }

      const faceDescriptor: FaceDescriptor = {
        id: userId,
        descriptor,
        timestamp: Date.now(),
        confidence: 0.8 // Default confidence for enrollment
      };

      this.enrolled.set(userId, faceDescriptor);
      
      console.log('✅ Face enrolled for user:', userId);
      return { success: true, descriptor };
    } catch (error) {
      console.error('❌ Error enrolling face:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Enrollment failed' };
    }
  }

  /**
   * Recognize a face against enrolled faces
   */
  async recognizeFace(videoElement: HTMLVideoElement): Promise<FaceRecognitionResult> {
    try {
      const descriptor = await this.extractFaceFeatures(videoElement);
      if (!descriptor) {
        return { success: false, confidence: 0, error: 'Could not extract face features' };
      }

      let bestMatch: FaceDescriptor | null = null;
      let bestSimilarity = 0;

      // Compare against all enrolled faces
      for (const [userId, enrolled] of this.enrolled) {
        const similarity = this.calculateSimilarity(descriptor, enrolled.descriptor);
        
        if (similarity > bestSimilarity) {
          bestSimilarity = similarity;
          bestMatch = enrolled;
        }
      }

      const success = bestSimilarity > this.threshold;
      
      console.log('🔍 Face recognition result:', {
        success,
        confidence: bestSimilarity,
        threshold: this.threshold,
        match: bestMatch?.id
      });

      return {
        success,
        confidence: bestSimilarity,
        match: bestMatch || undefined,
        error: success ? undefined : 'No matching face found'
      };
    } catch (error) {
      console.error('❌ Error recognizing face:', error);
      return { 
        success: false, 
        confidence: 0, 
        error: error instanceof Error ? error.message : 'Recognition failed' 
      };
    }
  }

  /**
   * Remove enrolled face
   */
  removeFace(userId: string): boolean {
    return this.enrolled.delete(userId);
  }

  /**
   * Get enrolled face count
   */
  getEnrolledCount(): number {
    return this.enrolled.size;
  }

  /**
   * Check if user is enrolled
   */
  isEnrolled(userId: string): boolean {
    return this.enrolled.has(userId);
  }

  /**
   * Set recognition threshold
   */
  setThreshold(threshold: number): void {
    this.threshold = Math.max(0, Math.min(1, threshold));
  }

  /**
   * Load face data from external source
   */
  loadEnrolledFace(userId: string, descriptor: number[]): void {
    const faceDescriptor: FaceDescriptor = {
      id: userId,
      descriptor,
      timestamp: Date.now(),
      confidence: 0.8
    };
    this.enrolled.set(userId, faceDescriptor);
    console.log('📥 Loaded face data for user:', userId);
  }
}

// Export singleton instance
export const modernFaceRecognition = new ModernFaceRecognitionService();