/**
 * AI/ML Anomaly Detection Service for Fraud Prevention
 * Implements TensorFlow.js models for real-time fraud detection
 */

import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js for browser usage
env.allowLocalModels = false;
env.useBrowserCache = true;

export interface AnomalyDetectionResult {
  isAnomalous: boolean;
  confidence: number;
  riskScore: number;
  detectedAnomalies: string[];
  behavioralProfile: BehavioralProfile;
  recommendations: string[];
}

export interface BehavioralProfile {
  typingPattern: TypingMetrics;
  deviceFingerprint: DeviceMetrics;
  accessPattern: AccessMetrics;
  biometricConsistency: BiometricMetrics;
}

export interface TypingMetrics {
  avgKeyInterval: number;
  keyPressVariance: number;
  dwellTimes: number[];
  flightTimes: number[];
  rhythmScore: number;
}

export interface DeviceMetrics {
  screenResolution: string;
  userAgent: string;
  timezone: string;
  language: string;
  deviceMemory?: number;
  hardwareConcurrency?: number;
  fingerprintHash: string;
}

export interface AccessMetrics {
  sessionDuration: number;
  clickPatterns: any[];
  scrollBehavior: any[];
  navigationPath: string[];
  timeSpentPerPage: Record<string, number>;
}

export interface BiometricMetrics {
  faceConsistency: number;
  livenessVariation: number;
  qualityTrend: number[];
  spoofingIndicators: number;
}

export interface DeepfakeDetectionResult {
  isDeepfake: boolean;
  confidence: number;
  artifactScore: number;
  temporalInconsistencies: number;
  detectionMethod: 'cnn' | 'temporal' | 'frequency' | 'hybrid';
}

class AnomalyDetectionService {
  private isInitialized = false;
  private deepfakeDetector: any = null;
  private behavioralModel: any = null;
  private keystrokeModel: any = null;
  private userProfiles: Map<string, BehavioralProfile> = new Map();
  private sessionData: Map<string, any> = new Map();

  /**
   * Initialize AI/ML models for anomaly detection
   */
  async initialize(): Promise<boolean> {
    try {
      console.log('Initializing anomaly detection models...');

      // Initialize deepfake detection model
      this.deepfakeDetector = await pipeline(
        'image-classification',
        'dima806/deepfake_vs_real_image_detection',
        { device: 'webgpu' }
      );

      console.log('Anomaly detection models loaded successfully');
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize anomaly detection:', error);
      return false;
    }
  }

  /**
   * Comprehensive fraud detection analysis
   */
  async detectAnomalies(
    userId: string,
    sessionData: any,
    biometricData?: any
  ): Promise<AnomalyDetectionResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const result: AnomalyDetectionResult = {
      isAnomalous: false,
      confidence: 0,
      riskScore: 0,
      detectedAnomalies: [],
      behavioralProfile: await this.buildBehavioralProfile(userId, sessionData),
      recommendations: []
    };

    try {
      // 1. Analyze typing patterns
      const typingAnomaly = await this.analyzeTypingPattern(userId, sessionData.keystrokes);
      if (typingAnomaly.isAnomalous) {
        result.detectedAnomalies.push('Unusual typing pattern detected');
        result.riskScore += typingAnomaly.severity * 0.3;
      }

      // 2. Device fingerprint analysis
      const deviceAnomaly = await this.analyzeDeviceFingerprint(userId, sessionData.deviceInfo);
      if (deviceAnomaly.isAnomalous) {
        result.detectedAnomalies.push('Device fingerprint mismatch');
        result.riskScore += deviceAnomaly.severity * 0.25;
      }

      // 3. Access pattern analysis
      const accessAnomaly = await this.analyzeAccessPattern(userId, sessionData.accessLog);
      if (accessAnomaly.isAnomalous) {
        result.detectedAnomalies.push('Suspicious access pattern');
        result.riskScore += accessAnomaly.severity * 0.2;
      }

      // 4. Biometric consistency check
      if (biometricData) {
        const biometricAnomaly = await this.analyzeBiometricConsistency(userId, biometricData);
        if (biometricAnomaly.isAnomalous) {
          result.detectedAnomalies.push('Biometric inconsistency detected');
          result.riskScore += biometricAnomaly.severity * 0.25;
        }
      }

      // 5. Temporal analysis
      const temporalAnomaly = await this.analyzeTemporalPatterns(userId, sessionData);
      if (temporalAnomaly.isAnomalous) {
        result.detectedAnomalies.push('Unusual temporal behavior');
        result.riskScore += temporalAnomaly.severity * 0.15;
      }

      // Calculate final anomaly assessment
      result.riskScore = Math.min(1, result.riskScore);
      result.isAnomalous = result.riskScore > 0.6;
      result.confidence = this.calculateConfidence(result.detectedAnomalies.length, result.riskScore);

      // Generate recommendations
      result.recommendations = this.generateRecommendations(result);

      return result;
    } catch (error) {
      console.error('Anomaly detection failed:', error);
      return result;
    }
  }

  /**
   * Advanced deepfake detection for biometric verification
   */
  async detectDeepfake(imageData: string): Promise<DeepfakeDetectionResult> {
    if (!this.deepfakeDetector) {
      await this.initialize();
    }

    try {
      // Use Hugging Face model for deepfake detection
      const result = await this.deepfakeDetector(imageData);
      
      const fakeLabel = result.find((r: any) => r.label.toLowerCase().includes('fake'));
      const realLabel = result.find((r: any) => r.label.toLowerCase().includes('real'));
      
      const fakeScore = fakeLabel?.score || 0;
      const realScore = realLabel?.score || 1;
      
      const isDeepfake = fakeScore > realScore;
      const confidence = Math.abs(fakeScore - realScore);

      return {
        isDeepfake,
        confidence,
        artifactScore: fakeScore,
        temporalInconsistencies: 0, // Would be calculated from video analysis
        detectionMethod: 'cnn'
      };
    } catch (error) {
      console.error('Deepfake detection failed:', error);
      return {
        isDeepfake: false,
        confidence: 0,
        artifactScore: 0,
        temporalInconsistencies: 0,
        detectionMethod: 'cnn'
      };
    }
  }

  /**
   * Real-time risk scoring for ongoing sessions
   */
  async calculateRealTimeRiskScore(
    userId: string,
    currentAction: string,
    contextData: any
  ): Promise<number> {
    let riskScore = 0;

    // Check for rapid successive actions
    const lastAction = this.sessionData.get(userId)?.lastAction;
    if (lastAction && Date.now() - lastAction.timestamp < 100) {
      riskScore += 0.3; // Potential bot behavior
    }

    // Analyze action context
    if (currentAction === 'vote' && !contextData.biometricVerified) {
      riskScore += 0.5; // Voting without biometric verification
    }

    // Check for unusual time patterns
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) {
      riskScore += 0.1; // Unusual time access
    }

    // Geographic analysis (if available)
    if (contextData.location && this.isUnusualLocation(userId, contextData.location)) {
      riskScore += 0.2;
    }

    return Math.min(1, riskScore);
  }

  /**
   * Behavioral biometrics analysis
   */
  private async analyzeTypingPattern(userId: string, keystrokeData: any[]): Promise<{
    isAnomalous: boolean;
    severity: number;
  }> {
    if (!keystrokeData || keystrokeData.length < 10) {
      return { isAnomalous: false, severity: 0 };
    }

    const userProfile = this.userProfiles.get(userId);
    if (!userProfile) {
      // First session - establish baseline
      return { isAnomalous: false, severity: 0 };
    }

    // Calculate current session metrics
    const currentMetrics = this.calculateTypingMetrics(keystrokeData);
    const baselineMetrics = userProfile.typingPattern;

    // Compare with baseline
    const avgIntervalDiff = Math.abs(currentMetrics.avgKeyInterval - baselineMetrics.avgKeyInterval);
    const varianceDiff = Math.abs(currentMetrics.keyPressVariance - baselineMetrics.keyPressVariance);

    const threshold = 0.3; // 30% deviation threshold
    const isAnomalous = avgIntervalDiff > threshold || varianceDiff > threshold;
    const severity = Math.min(1, (avgIntervalDiff + varianceDiff) / 2);

    return { isAnomalous, severity };
  }

  /**
   * Device fingerprint analysis
   */
  private async analyzeDeviceFingerprint(userId: string, deviceInfo: any): Promise<{
    isAnomalous: boolean;
    severity: number;
  }> {
    const storedProfile = this.userProfiles.get(userId);
    if (!storedProfile) {
      return { isAnomalous: false, severity: 0 };
    }

    const currentFingerprint = this.generateDeviceFingerprint(deviceInfo);
    const storedFingerprint = storedProfile.deviceFingerprint.fingerprintHash;

    // Check for exact match first
    if (currentFingerprint === storedFingerprint) {
      return { isAnomalous: false, severity: 0 };
    }

    // Check for partial matches (different browser, same device)
    const partialMatch = this.calculateFingerprintSimilarity(deviceInfo, storedProfile.deviceFingerprint);
    
    if (partialMatch > 0.8) {
      return { isAnomalous: false, severity: 0.1 };
    } else if (partialMatch > 0.6) {
      return { isAnomalous: true, severity: 0.3 };
    } else {
      return { isAnomalous: true, severity: 0.8 };
    }
  }

  /**
   * Access pattern analysis
   */
  private async analyzeAccessPattern(userId: string, accessLog: any[]): Promise<{
    isAnomalous: boolean;
    severity: number;
  }> {
    if (!accessLog || accessLog.length === 0) {
      return { isAnomalous: false, severity: 0 };
    }

    // Analyze for unusual patterns
    let anomalyScore = 0;

    // Check for rapid page navigation
    const rapidNavigation = accessLog.filter((log, index) => {
      if (index === 0) return false;
      return log.timestamp - accessLog[index - 1].timestamp < 1000; // Less than 1 second
    });

    if (rapidNavigation.length > accessLog.length * 0.5) {
      anomalyScore += 0.4; // More than 50% rapid navigation
    }

    // Check for unusual navigation patterns
    const directVoteAccess = accessLog.some(log => 
      log.path === '/vote' && !accessLog.some(prev => prev.path === '/auth')
    );

    if (directVoteAccess) {
      anomalyScore += 0.6; // Direct access to voting without authentication
    }

    return {
      isAnomalous: anomalyScore > 0.3,
      severity: Math.min(1, anomalyScore)
    };
  }

  /**
   * Biometric consistency analysis
   */
  private async analyzeBiometricConsistency(userId: string, biometricData: any): Promise<{
    isAnomalous: boolean;
    severity: number;
  }> {
    const storedProfile = this.userProfiles.get(userId);
    if (!storedProfile) {
      return { isAnomalous: false, severity: 0 };
    }

    let anomalyScore = 0;

    // Check for sudden quality drops
    const currentQuality = biometricData.qualityScore || 0;
    const avgStoredQuality = storedProfile.biometricConsistency.qualityTrend.reduce((a, b) => a + b, 0) / 
                            storedProfile.biometricConsistency.qualityTrend.length;

    if (currentQuality < avgStoredQuality * 0.6) {
      anomalyScore += 0.3; // Significant quality drop
    }

    // Check for liveness inconsistencies
    if (biometricData.livenessScore < 0.5) {
      anomalyScore += 0.4; // Low liveness score
    }

    // Check for face consistency
    if (biometricData.faceConsistency < 0.7) {
      anomalyScore += 0.5; // Low face consistency
    }

    return {
      isAnomalous: anomalyScore > 0.4,
      severity: Math.min(1, anomalyScore)
    };
  }

  /**
   * Temporal pattern analysis
   */
  private async analyzeTemporalPatterns(userId: string, sessionData: any): Promise<{
    isAnomalous: boolean;
    severity: number;
  }> {
    let anomalyScore = 0;

    // Check session duration
    const sessionDuration = sessionData.duration || 0;
    if (sessionDuration < 30) { // Less than 30 seconds
      anomalyScore += 0.3; // Very short session
    } else if (sessionDuration > 3600) { // More than 1 hour
      anomalyScore += 0.2; // Very long session
    }

    // Check for unusual timing
    const now = new Date();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;
    const isNightTime = now.getHours() < 6 || now.getHours() > 22;

    if (isWeekend && isNightTime) {
      anomalyScore += 0.1; // Weekend night access
    }

    return {
      isAnomalous: anomalyScore > 0.2,
      severity: Math.min(1, anomalyScore)
    };
  }

  // Helper methods
  private async buildBehavioralProfile(userId: string, sessionData: any): Promise<BehavioralProfile> {
    return {
      typingPattern: this.calculateTypingMetrics(sessionData.keystrokes || []),
      deviceFingerprint: this.buildDeviceMetrics(sessionData.deviceInfo || {}),
      accessPattern: this.buildAccessMetrics(sessionData.accessLog || []),
      biometricConsistency: this.buildBiometricMetrics(sessionData.biometricData || {})
    };
  }

  private calculateTypingMetrics(keystrokeData: any[]): TypingMetrics {
    if (keystrokeData.length < 2) {
      return {
        avgKeyInterval: 0,
        keyPressVariance: 0,
        dwellTimes: [],
        flightTimes: [],
        rhythmScore: 0
      };
    }

    const intervals = keystrokeData.slice(1).map((stroke, i) => 
      stroke.timestamp - keystrokeData[i].timestamp
    );

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((acc, interval) => 
      acc + Math.pow(interval - avgInterval, 2), 0
    ) / intervals.length;

    return {
      avgKeyInterval: avgInterval,
      keyPressVariance: variance,
      dwellTimes: keystrokeData.map(k => k.dwellTime || 0),
      flightTimes: intervals,
      rhythmScore: this.calculateRhythmScore(intervals)
    };
  }

  private calculateRhythmScore(intervals: number[]): number {
    if (intervals.length < 3) return 0;
    
    // Calculate rhythm consistency
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const deviations = intervals.map(interval => Math.abs(interval - avgInterval));
    const avgDeviation = deviations.reduce((a, b) => a + b, 0) / deviations.length;
    
    return Math.max(0, 1 - (avgDeviation / avgInterval));
  }

  private buildDeviceMetrics(deviceInfo: any): DeviceMetrics {
    return {
      screenResolution: deviceInfo.screenResolution || '',
      userAgent: deviceInfo.userAgent || '',
      timezone: deviceInfo.timezone || '',
      language: deviceInfo.language || '',
      deviceMemory: deviceInfo.deviceMemory,
      hardwareConcurrency: deviceInfo.hardwareConcurrency,
      fingerprintHash: this.generateDeviceFingerprint(deviceInfo)
    };
  }

  private buildAccessMetrics(accessLog: any[]): AccessMetrics {
    return {
      sessionDuration: accessLog.length > 0 ? 
        accessLog[accessLog.length - 1].timestamp - accessLog[0].timestamp : 0,
      clickPatterns: accessLog.filter(log => log.type === 'click'),
      scrollBehavior: accessLog.filter(log => log.type === 'scroll'),
      navigationPath: accessLog.map(log => log.path).filter(Boolean),
      timeSpentPerPage: this.calculateTimePerPage(accessLog)
    };
  }

  private buildBiometricMetrics(biometricData: any): BiometricMetrics {
    return {
      faceConsistency: biometricData.faceConsistency || 0,
      livenessVariation: biometricData.livenessVariation || 0,
      qualityTrend: biometricData.qualityTrend || [],
      spoofingIndicators: biometricData.spoofingIndicators || 0
    };
  }

  private generateDeviceFingerprint(deviceInfo: any): string {
    const fingerprint = [
      deviceInfo.userAgent,
      deviceInfo.screenResolution,
      deviceInfo.timezone,
      deviceInfo.language,
      deviceInfo.deviceMemory,
      deviceInfo.hardwareConcurrency
    ].join('|');

    return btoa(fingerprint);
  }

  private calculateFingerprintSimilarity(current: any, stored: DeviceMetrics): number {
    let matches = 0;
    let total = 0;

    const fields = ['userAgent', 'screenResolution', 'timezone', 'language'];
    
    fields.forEach(field => {
      total++;
      if (current[field] === stored[field as keyof DeviceMetrics]) {
        matches++;
      }
    });

    return matches / total;
  }

  private calculateTimePerPage(accessLog: any[]): Record<string, number> {
    const timePerPage: Record<string, number> = {};
    
    for (let i = 0; i < accessLog.length - 1; i++) {
      const current = accessLog[i];
      const next = accessLog[i + 1];
      
      if (current.path) {
        timePerPage[current.path] = (timePerPage[current.path] || 0) + 
          (next.timestamp - current.timestamp);
      }
    }

    return timePerPage;
  }

  private isUnusualLocation(userId: string, location: any): boolean {
    // Simple location analysis - in production, use more sophisticated geo-analysis
    const storedProfile = this.userProfiles.get(userId);
    if (!storedProfile) return false;

    // Check if location is significantly different from previous sessions
    return false; // Simplified implementation
  }

  private calculateConfidence(anomalyCount: number, riskScore: number): number {
    const anomalyWeight = Math.min(1, anomalyCount / 5); // Up to 5 anomalies
    const riskWeight = riskScore;
    
    return (anomalyWeight * 0.4 + riskWeight * 0.6);
  }

  private generateRecommendations(result: AnomalyDetectionResult): string[] {
    const recommendations: string[] = [];

    if (result.riskScore > 0.8) {
      recommendations.push('Block access immediately');
      recommendations.push('Require additional verification');
    } else if (result.riskScore > 0.6) {
      recommendations.push('Increase monitoring');
      recommendations.push('Request additional authentication');
    } else if (result.riskScore > 0.3) {
      recommendations.push('Enable enhanced logging');
      recommendations.push('Monitor subsequent actions');
    }

    if (result.detectedAnomalies.includes('Biometric inconsistency detected')) {
      recommendations.push('Require fresh biometric enrollment');
    }

    if (result.detectedAnomalies.includes('Device fingerprint mismatch')) {
      recommendations.push('Send device verification notification');
    }

    return recommendations;
  }
}

// Export singleton instance
export const anomalyDetectionService = new AnomalyDetectionService();