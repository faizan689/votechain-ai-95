/**
 * Performance Monitoring Service for Production E-Voting System
 * Tracks system performance, latency, and optimization metrics
 */

export interface PerformanceMetric {
  id: string;
  category: 'response_time' | 'throughput' | 'error_rate' | 'resource_usage' | 'blockchain';
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  metadata?: any;
}

export interface SystemHealth {
  overall: 'excellent' | 'good' | 'warning' | 'critical';
  apiResponseTime: number;
  biometricProcessingTime: number;
  blockchainLatency: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
  activeUsers: number;
  throughput: number;
  uptime: number;
}

export interface PerformanceThreshold {
  metric: string;
  warningThreshold: number;
  criticalThreshold: number;
  unit: string;
}

export interface OptimizationRecommendation {
  id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  title: string;
  description: string;
  expectedImprovement: string;
  implementation: string;
  estimatedEffort: 'low' | 'medium' | 'high';
}

class PerformanceMonitoringService {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private thresholds: PerformanceThreshold[] = [];
  private isMonitoring = false;
  private monitoringInterval?: NodeJS.Timeout;
  private performanceObserver?: PerformanceObserver;
  private alertCallbacks: ((metric: PerformanceMetric) => void)[] = [];

  /**
   * Initialize performance monitoring
   */
  async initialize(): Promise<boolean> {
    try {
      console.log('Initializing Performance Monitoring Service...');
      
      // Set up default thresholds
      this.setupDefaultThresholds();
      
      // Initialize performance observer
      this.initializePerformanceObserver();
      
      // Start monitoring
      this.startMonitoring();
      
      console.log('Performance monitoring initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize performance monitoring:', error);
      return false;
    }
  }

  /**
   * Set up default performance thresholds
   */
  private setupDefaultThresholds(): void {
    this.thresholds = [
      { metric: 'api_response_time', warningThreshold: 200, criticalThreshold: 500, unit: 'ms' },
      { metric: 'biometric_processing_time', warningThreshold: 150, criticalThreshold: 300, unit: 'ms' },
      { metric: 'blockchain_latency', warningThreshold: 2000, criticalThreshold: 5000, unit: 'ms' },
      { metric: 'error_rate', warningThreshold: 1, criticalThreshold: 5, unit: '%' },
      { metric: 'memory_usage', warningThreshold: 75, criticalThreshold: 90, unit: '%' },
      { metric: 'cpu_usage', warningThreshold: 70, criticalThreshold: 85, unit: '%' },
      { metric: 'throughput', warningThreshold: 50, criticalThreshold: 20, unit: 'requests/sec' }
    ];
  }

  /**
   * Initialize performance observer for web APIs
   */
  private initializePerformanceObserver(): void {
    if (typeof PerformanceObserver !== 'undefined') {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordMetric({
            id: this.generateId(),
            category: 'response_time',
            name: entry.name,
            value: entry.duration,
            unit: 'ms',
            timestamp: new Date(),
            metadata: {
              entryType: entry.entryType,
              startTime: entry.startTime
            }
          });
        });
      });

      try {
        this.performanceObserver.observe({ entryTypes: ['navigation', 'resource', 'measure'] });
      } catch (error) {
        console.warn('Performance Observer not fully supported:', error);
      }
    }
  }

  /**
   * Start continuous monitoring
   */
  private startMonitoring(): void {
    this.isMonitoring = true;
    
    // Monitor system metrics every 10 seconds
    this.monitoringInterval = setInterval(() => {
      this.collectSystemMetrics();
    }, 10000);
  }

  /**
   * Record a performance metric
   */
  recordMetric(metric: PerformanceMetric): void {
    const categoryMetrics = this.metrics.get(metric.category) || [];
    categoryMetrics.push(metric);
    
    // Keep only last 1000 metrics per category to prevent memory issues
    if (categoryMetrics.length > 1000) {
      categoryMetrics.splice(0, categoryMetrics.length - 1000);
    }
    
    this.metrics.set(metric.category, categoryMetrics);
    
    // Check thresholds
    this.checkThresholds(metric);
  }

  /**
   * Record API call performance
   */
  recordApiCall(endpoint: string, duration: number, success: boolean): void {
    this.recordMetric({
      id: this.generateId(),
      category: 'response_time',
      name: `api_${endpoint}`,
      value: duration,
      unit: 'ms',
      timestamp: new Date(),
      metadata: { endpoint, success }
    });

    // Record error rate
    this.recordMetric({
      id: this.generateId(),
      category: 'error_rate',
      name: 'api_errors',
      value: success ? 0 : 1,
      unit: 'boolean',
      timestamp: new Date(),
      metadata: { endpoint }
    });
  }

  /**
   * Record biometric processing performance
   */
  recordBiometricProcessing(operation: string, duration: number, success: boolean, metadata?: any): void {
    this.recordMetric({
      id: this.generateId(),
      category: 'response_time',
      name: `biometric_${operation}`,
      value: duration,
      unit: 'ms',
      timestamp: new Date(),
      metadata: { operation, success, ...metadata }
    });
  }

  /**
   * Record blockchain transaction performance
   */
  recordBlockchainTransaction(
    operation: string, 
    duration: number, 
    gasUsed?: number, 
    success?: boolean
  ): void {
    this.recordMetric({
      id: this.generateId(),
      category: 'blockchain',
      name: `blockchain_${operation}`,
      value: duration,
      unit: 'ms',
      timestamp: new Date(),
      metadata: { operation, gasUsed, success }
    });

    if (gasUsed !== undefined) {
      this.recordMetric({
        id: this.generateId(),
        category: 'resource_usage',
        name: 'gas_usage',
        value: gasUsed,
        unit: 'gas',
        timestamp: new Date(),
        metadata: { operation }
      });
    }
  }

  /**
   * Collect system-level metrics
   */
  private async collectSystemMetrics(): Promise<void> {
    try {
      // Memory usage (approximation for web environment)
      const memoryInfo = (performance as any).memory;
      if (memoryInfo) {
        const memoryUsage = (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100;
        this.recordMetric({
          id: this.generateId(),
          category: 'resource_usage',
          name: 'memory_usage',
          value: memoryUsage,
          unit: '%',
          timestamp: new Date(),
          metadata: {
            used: memoryInfo.usedJSHeapSize,
            total: memoryInfo.jsHeapSizeLimit
          }
        });
      }

      // Network performance
      const connection = (navigator as any).connection;
      if (connection) {
        this.recordMetric({
          id: this.generateId(),
          category: 'resource_usage',
          name: 'network_speed',
          value: connection.downlink || 0,
          unit: 'Mbps',
          timestamp: new Date(),
          metadata: {
            effectiveType: connection.effectiveType,
            rtt: connection.rtt
          }
        });
      }

      // Page load performance
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.fetchStart;
        this.recordMetric({
          id: this.generateId(),
          category: 'response_time',
          name: 'page_load_time',
          value: loadTime,
          unit: 'ms',
          timestamp: new Date(),
          metadata: {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
            firstPaint: navigation.loadEventStart - navigation.fetchStart
          }
        });
      }
    } catch (error) {
      console.error('Failed to collect system metrics:', error);
    }
  }

  /**
   * Check performance thresholds and trigger alerts
   */
  private checkThresholds(metric: PerformanceMetric): void {
    const threshold = this.thresholds.find(t => t.metric === metric.name);
    if (!threshold) return;

    let alertLevel: 'warning' | 'critical' | null = null;
    
    if (metric.value >= threshold.criticalThreshold) {
      alertLevel = 'critical';
    } else if (metric.value >= threshold.warningThreshold) {
      alertLevel = 'warning';
    }

    if (alertLevel) {
      this.alertCallbacks.forEach(callback => {
        try {
          callback({
            ...metric,
            metadata: { ...metric.metadata, alertLevel, threshold }
          });
        } catch (error) {
          console.error('Performance alert callback failed:', error);
        }
      });
    }
  }

  /**
   * Get current system health
   */
  getSystemHealth(): SystemHealth {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    // Calculate recent metrics
    const recentMetrics = this.getMetricsSince(fiveMinutesAgo);
    
    const apiResponseTime = this.getAverageMetric(recentMetrics, 'response_time', 'api_');
    const biometricProcessingTime = this.getAverageMetric(recentMetrics, 'response_time', 'biometric_');
    const blockchainLatency = this.getAverageMetric(recentMetrics, 'blockchain');
    const errorRate = this.getErrorRate(recentMetrics);
    const memoryUsage = this.getLatestMetric(recentMetrics, 'resource_usage', 'memory_usage') || 0;
    const cpuUsage = this.estimateCpuUsage();
    const activeUsers = this.estimateActiveUsers();
    const throughput = this.calculateThroughput(recentMetrics);
    const uptime = this.calculateUptime();

    // Determine overall health
    let overall: SystemHealth['overall'] = 'excellent';
    
    const criticalIssues = [
      apiResponseTime > 500,
      biometricProcessingTime > 300,
      blockchainLatency > 5000,
      errorRate > 5,
      memoryUsage > 90,
      cpuUsage > 85
    ].filter(Boolean).length;

    const warningIssues = [
      apiResponseTime > 200,
      biometricProcessingTime > 150,
      blockchainLatency > 2000,
      errorRate > 1,
      memoryUsage > 75,
      cpuUsage > 70
    ].filter(Boolean).length;

    if (criticalIssues > 0) {
      overall = 'critical';
    } else if (warningIssues > 2) {
      overall = 'warning';
    } else if (warningIssues > 0) {
      overall = 'good';
    }

    return {
      overall,
      apiResponseTime,
      biometricProcessingTime,
      blockchainLatency,
      errorRate,
      memoryUsage,
      cpuUsage,
      activeUsers,
      throughput,
      uptime
    };
  }

  /**
   * Get optimization recommendations
   */
  getOptimizationRecommendations(): OptimizationRecommendation[] {
    const health = this.getSystemHealth();
    const recommendations: OptimizationRecommendation[] = [];

    // API Response Time optimization
    if (health.apiResponseTime > 200) {
      recommendations.push({
        id: 'api-optimization',
        priority: health.apiResponseTime > 500 ? 'critical' : 'high',
        category: 'API Performance',
        title: 'Optimize API Response Time',
        description: `Current API response time is ${health.apiResponseTime.toFixed(0)}ms, which exceeds the target of 200ms.`,
        expectedImprovement: 'Reduce response time by 30-50%',
        implementation: 'Implement caching, optimize database queries, add CDN for static assets',
        estimatedEffort: 'medium'
      });
    }

    // Biometric Processing optimization
    if (health.biometricProcessingTime > 150) {
      recommendations.push({
        id: 'biometric-optimization',
        priority: health.biometricProcessingTime > 300 ? 'critical' : 'high',
        category: 'Biometric Performance',
        title: 'Optimize Biometric Processing',
        description: `Biometric processing time is ${health.biometricProcessingTime.toFixed(0)}ms, target is <150ms.`,
        expectedImprovement: 'Reduce processing time by 40-60%',
        implementation: 'Use WebAssembly for face detection, implement GPU acceleration, optimize TensorFlow.js models',
        estimatedEffort: 'high'
      });
    }

    // Blockchain optimization
    if (health.blockchainLatency > 2000) {
      recommendations.push({
        id: 'blockchain-optimization',
        priority: health.blockchainLatency > 5000 ? 'critical' : 'medium',
        category: 'Blockchain Performance',
        title: 'Optimize Blockchain Integration',
        description: `Blockchain latency is ${health.blockchainLatency.toFixed(0)}ms, which affects user experience.`,
        expectedImprovement: 'Reduce latency by 20-40%',
        implementation: 'Implement transaction batching, use layer 2 solutions, optimize gas usage',
        estimatedEffort: 'high'
      });
    }

    // Memory usage optimization
    if (health.memoryUsage > 75) {
      recommendations.push({
        id: 'memory-optimization',
        priority: health.memoryUsage > 90 ? 'critical' : 'medium',
        category: 'Resource Usage',
        title: 'Optimize Memory Usage',
        description: `Memory usage is at ${health.memoryUsage.toFixed(1)}%, approaching limits.`,
        expectedImprovement: 'Reduce memory usage by 25-35%',
        implementation: 'Implement lazy loading, optimize image processing, clear unused objects',
        estimatedEffort: 'medium'
      });
    }

    // Error rate optimization
    if (health.errorRate > 1) {
      recommendations.push({
        id: 'error-reduction',
        priority: health.errorRate > 5 ? 'critical' : 'high',
        category: 'Reliability',
        title: 'Reduce Error Rate',
        description: `Current error rate is ${health.errorRate.toFixed(2)}%, target is <1%.`,
        expectedImprovement: 'Reduce errors by 60-80%',
        implementation: 'Improve error handling, add retry mechanisms, enhance validation',
        estimatedEffort: 'medium'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Helper methods for calculating metrics
   */
  private getMetricsSince(since: Date): PerformanceMetric[] {
    const allMetrics: PerformanceMetric[] = [];
    this.metrics.forEach(categoryMetrics => {
      allMetrics.push(...categoryMetrics.filter(m => m.timestamp >= since));
    });
    return allMetrics;
  }

  private getAverageMetric(metrics: PerformanceMetric[], category: string, namePrefix?: string): number {
    const filtered = metrics.filter(m => 
      m.category === category && (!namePrefix || m.name.startsWith(namePrefix))
    );
    
    if (filtered.length === 0) return 0;
    return filtered.reduce((sum, m) => sum + m.value, 0) / filtered.length;
  }

  private getLatestMetric(metrics: PerformanceMetric[], category: string, name: string): number | null {
    const filtered = metrics
      .filter(m => m.category === category && m.name === name)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return filtered.length > 0 ? filtered[0].value : null;
  }

  private getErrorRate(metrics: PerformanceMetric[]): number {
    const errorMetrics = metrics.filter(m => m.category === 'error_rate');
    if (errorMetrics.length === 0) return 0;
    
    const errors = errorMetrics.filter(m => m.value === 1).length;
    return (errors / errorMetrics.length) * 100;
  }

  private estimateCpuUsage(): number {
    // Simplified CPU usage estimation based on processing times
    const health = this.getSystemHealth();
    const baseUsage = 20; // Base system usage
    const apiLoad = Math.min((health.apiResponseTime / 200) * 30, 40);
    const biometricLoad = Math.min((health.biometricProcessingTime / 150) * 25, 35);
    
    return Math.min(baseUsage + apiLoad + biometricLoad, 100);
  }

  private estimateActiveUsers(): number {
    // Estimate based on recent API calls
    const now = new Date();
    const lastMinute = new Date(now.getTime() - 60 * 1000);
    const recentApiCalls = this.getMetricsSince(lastMinute)
      .filter(m => m.category === 'response_time' && m.name.startsWith('api_'))
      .length;
    
    return Math.max(recentApiCalls / 10, 1); // Rough estimate
  }

  private calculateThroughput(metrics: PerformanceMetric[]): number {
    const apiMetrics = metrics.filter(m => 
      m.category === 'response_time' && m.name.startsWith('api_')
    );
    
    if (apiMetrics.length === 0) return 0;
    
    // Calculate requests per second over the last 5 minutes
    return apiMetrics.length / (5 * 60); // requests per second
  }

  private calculateUptime(): number {
    // Simplified uptime calculation
    // In production, this would track actual service uptime
    return 99.9; // Assume 99.9% uptime
  }

  /**
   * Subscribe to performance alerts
   */
  subscribeToAlerts(callback: (metric: PerformanceMetric) => void): () => void {
    this.alertCallbacks.push(callback);
    
    return () => {
      const index = this.alertCallbacks.indexOf(callback);
      if (index > -1) {
        this.alertCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get historical metrics
   */
  getHistoricalMetrics(
    category?: string,
    timeRange?: { start: Date; end: Date }
  ): PerformanceMetric[] {
    let allMetrics: PerformanceMetric[] = [];
    
    if (category) {
      allMetrics = this.metrics.get(category) || [];
    } else {
      this.metrics.forEach(categoryMetrics => {
        allMetrics.push(...categoryMetrics);
      });
    }
    
    if (timeRange) {
      allMetrics = allMetrics.filter(m => 
        m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
      );
    }
    
    return allMetrics.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Generate performance report
   */
  generatePerformanceReport(): {
    summary: SystemHealth;
    recommendations: OptimizationRecommendation[];
    metrics: { [category: string]: PerformanceMetric[] };
    trends: { [metric: string]: number };
  } {
    const summary = this.getSystemHealth();
    const recommendations = this.getOptimizationRecommendations();
    
    const metrics: { [category: string]: PerformanceMetric[] } = {};
    this.metrics.forEach((categoryMetrics, category) => {
      metrics[category] = categoryMetrics.slice(-100); // Last 100 metrics per category
    });
    
    // Calculate trends (simplified - compare last hour vs previous hour)
    const trends: { [metric: string]: number } = {};
    const now = new Date();
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
    const previousHour = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    
    const lastHourMetrics = this.getMetricsSince(lastHour);
    const previousHourMetrics = this.getMetricsSince(previousHour).filter(m => m.timestamp < lastHour);
    
    ['api_response_time', 'biometric_processing_time', 'error_rate'].forEach(metricName => {
      const lastHourAvg = this.getAverageMetric(lastHourMetrics, 'response_time', metricName);
      const previousHourAvg = this.getAverageMetric(previousHourMetrics, 'response_time', metricName);
      
      if (previousHourAvg > 0) {
        trends[metricName] = ((lastHourAvg - previousHourAvg) / previousHourAvg) * 100;
      }
    });
    
    return { summary, recommendations, metrics, trends };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
  }
}

// Export singleton instance
export const performanceMonitoringService = new PerformanceMonitoringService();
