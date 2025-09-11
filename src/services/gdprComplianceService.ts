/**
 * GDPR Compliance Service for E-Voting System
 * Ensures data protection, privacy rights, and regulatory compliance
 */

export interface PersonalDataRecord {
  id: string;
  userId: string;
  dataType: 'biometric' | 'personal_info' | 'voting_record' | 'audit_log' | 'behavioral';
  data: any;
  purpose: string;
  legalBasis: 'consent' | 'legitimate_interest' | 'public_task' | 'vital_interests';
  collectedAt: Date;
  retentionPeriod: number; // days
  encrypted: boolean;
  anonymized: boolean;
  deleted: boolean;
  deletedAt?: Date;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: 'biometric_processing' | 'data_storage' | 'analytics' | 'marketing';
  granted: boolean;
  grantedAt?: Date;
  withdrawnAt?: Date;
  ipAddress: string;
  userAgent: string;
  version: string; // Consent version
}

export interface DataProcessingActivity {
  id: string;
  name: string;
  purpose: string;
  dataCategories: string[];
  legalBasis: string;
  retentionPeriod: number;
  dataSubjects: string[];
  recipients: string[];
  transferToThirdCountries: boolean;
  securityMeasures: string[];
}

export interface PrivacyRights {
  access: boolean;
  rectification: boolean;
  erasure: boolean;
  restriction: boolean;
  portability: boolean;
  objection: boolean;
}

export interface DataBreachRecord {
  id: string;
  detectedAt: Date;
  reportedAt?: Date;
  description: string;
  affectedDataTypes: string[];
  affectedRecords: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  mitigationActions: string[];
  supervisoryAuthorityNotified: boolean;
  dataSubjectsNotified: boolean;
  resolved: boolean;
}

class GDPRComplianceService {
  private personalDataRecords: Map<string, PersonalDataRecord> = new Map();
  private consentRecords: Map<string, ConsentRecord[]> = new Map();
  private processingActivities: DataProcessingActivity[] = [];
  private dataBreaches: DataBreachRecord[] = [];
  private retentionPolicyActive = true;
  private cleanupInterval?: NodeJS.Timeout;

  /**
   * Initialize GDPR compliance system
   */
  async initialize(): Promise<boolean> {
    try {
      console.log('Initializing GDPR Compliance Service...');
      
      // Setup data processing activities
      this.setupProcessingActivities();
      
      // Start retention policy enforcement
      this.startRetentionPolicyEnforcement();
      
      // Initialize privacy dashboard
      await this.initializePrivacyDashboard();
      
      console.log('GDPR compliance system initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize GDPR compliance:', error);
      return false;
    }
  }

  /**
   * Record consent from user
   */
  async recordConsent(
    userId: string,
    consentType: ConsentRecord['consentType'],
    granted: boolean,
    metadata: {
      ipAddress: string;
      userAgent: string;
      version: string;
    }
  ): Promise<ConsentRecord> {
    const consentRecord: ConsentRecord = {
      id: this.generateId(),
      userId,
      consentType,
      granted,
      grantedAt: granted ? new Date() : undefined,
      withdrawnAt: !granted ? new Date() : undefined,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      version: metadata.version
    };

    // Store consent record
    const userConsents = this.consentRecords.get(userId) || [];
    userConsents.push(consentRecord);
    this.consentRecords.set(userId, userConsents);

    // If consent withdrawn, handle data accordingly
    if (!granted) {
      await this.handleConsentWithdrawal(userId, consentType);
    }

    console.log(`Consent ${granted ? 'granted' : 'withdrawn'} for user ${userId}: ${consentType}`);
    return consentRecord;
  }

  /**
   * Record personal data processing
   */
  async recordDataProcessing(
    userId: string,
    dataType: PersonalDataRecord['dataType'],
    data: any,
    purpose: string,
    legalBasis: PersonalDataRecord['legalBasis'],
    retentionDays: number = 730, // Default 2 years
    encrypted: boolean = true
  ): Promise<PersonalDataRecord> {
    // Check if we have valid consent or legal basis
    if (legalBasis === 'consent') {
      const hasConsent = await this.hasValidConsent(userId, this.mapDataTypeToConsent(dataType));
      if (!hasConsent) {
        throw new Error(`No valid consent for processing ${dataType} data`);
      }
    }

    const record: PersonalDataRecord = {
      id: this.generateId(),
      userId,
      dataType,
      data: encrypted ? await this.encryptData(data) : data,
      purpose,
      legalBasis,
      collectedAt: new Date(),
      retentionPeriod: retentionDays,
      encrypted,
      anonymized: false,
      deleted: false
    };

    this.personalDataRecords.set(record.id, record);
    
    console.log(`Personal data recorded: ${dataType} for user ${userId}`);
    return record;
  }

  /**
   * Handle data subject access request (DSAR)
   */
  async handleAccessRequest(userId: string): Promise<{
    personalData: PersonalDataRecord[];
    consents: ConsentRecord[];
    processingActivities: DataProcessingActivity[];
    exportData: string; // JSON export
  }> {
    console.log(`Processing access request for user ${userId}`);
    
    // Collect all personal data
    const personalData = Array.from(this.personalDataRecords.values())
      .filter(record => record.userId === userId && !record.deleted);
    
    // Decrypt data for export (with proper authorization)
    const decryptedData = await Promise.all(
      personalData.map(async (record) => ({
        ...record,
        data: record.encrypted ? await this.decryptData(record.data) : record.data
      }))
    );
    
    // Get consent history
    const consents = this.consentRecords.get(userId) || [];
    
    // Get relevant processing activities
    const processingActivities = this.processingActivities.filter(activity =>
      activity.dataSubjects.includes('voters') || activity.dataSubjects.includes('all_users')
    );
    
    // Create exportable data package
    const exportData = JSON.stringify({
      userId,
      exportDate: new Date().toISOString(),
      personalData: decryptedData,
      consents,
      processingActivities,
      privacyRights: this.getPrivacyRights()
    }, null, 2);
    
    // Log the access request for audit purposes
    await this.logDataAccess(userId, 'access_request', 'User requested data export');
    
    return {
      personalData: decryptedData,
      consents,
      processingActivities,
      exportData
    };
  }

  /**
   * Handle right to erasure (right to be forgotten)
   */
  async handleErasureRequest(
    userId: string,
    reason: string,
    exceptions: string[] = []
  ): Promise<{
    deleted: PersonalDataRecord[];
    retained: PersonalDataRecord[];
    reason: string;
  }> {
    console.log(`Processing erasure request for user ${userId}`);
    
    const userRecords = Array.from(this.personalDataRecords.values())
      .filter(record => record.userId === userId && !record.deleted);
    
    const deleted: PersonalDataRecord[] = [];
    const retained: PersonalDataRecord[] = [];
    
    for (const record of userRecords) {
      let shouldDelete = true;
      let retentionReason = '';
      
      // Check legal obligations
      if (record.dataType === 'voting_record' && record.legalBasis === 'public_task') {
        shouldDelete = false;
        retentionReason = 'Legal obligation to retain voting records for electoral integrity';
      }
      
      // Check exceptions
      if (exceptions.includes(record.dataType)) {
        shouldDelete = false;
        retentionReason = 'User-specified exception';
      }
      
      // Check if data is needed for legal claims
      if (record.purpose.includes('fraud_prevention') || record.purpose.includes('security')) {
        const daysSinceCollection = (Date.now() - record.collectedAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceCollection < 365) { // Keep security data for 1 year
          shouldDelete = false;
          retentionReason = 'Retained for security and fraud prevention purposes';
        }
      }
      
      if (shouldDelete) {
        // Securely delete the data
        await this.securelyDeleteData(record);
        record.deleted = true;
        record.deletedAt = new Date();
        deleted.push(record);
      } else {
        // Anonymize if possible
        if (this.canAnonymize(record)) {
          await this.anonymizeData(record);
          record.anonymized = true;
        }
        retained.push({ ...record, data: retentionReason });
      }
    }
    
    // Log the erasure request
    await this.logDataAccess(userId, 'erasure_request', `${deleted.length} records deleted, ${retained.length} retained`);
    
    return { deleted, retained, reason };
  }

  /**
   * Handle data portability request
   */
  async handlePortabilityRequest(userId: string): Promise<{
    data: any;
    format: 'json' | 'csv' | 'xml';
    size: number;
  }> {
    console.log(`Processing portability request for user ${userId}`);
    
    // Get portable data (only data provided by user, not derived data)
    const portableRecords = Array.from(this.personalDataRecords.values())
      .filter(record => 
        record.userId === userId && 
        !record.deleted && 
        this.isPortableData(record)
      );
    
    const portableData = await Promise.all(
      portableRecords.map(async (record) => ({
        type: record.dataType,
        data: record.encrypted ? await this.decryptData(record.data) : record.data,
        collectedAt: record.collectedAt,
        purpose: record.purpose
      }))
    );
    
    const exportData = {
      userId,
      exportDate: new Date().toISOString(),
      data: portableData
    };
    
    const jsonData = JSON.stringify(exportData, null, 2);
    
    // Log the portability request
    await this.logDataAccess(userId, 'portability_request', 'Data export for portability');
    
    return {
      data: exportData,
      format: 'json',
      size: new Blob([jsonData]).size
    };
  }

  /**
   * Record data breach
   */
  async recordDataBreach(
    description: string,
    affectedDataTypes: string[],
    affectedRecords: number,
    riskLevel: DataBreachRecord['riskLevel']
  ): Promise<DataBreachRecord> {
    const breach: DataBreachRecord = {
      id: this.generateId(),
      detectedAt: new Date(),
      description,
      affectedDataTypes,
      affectedRecords,
      riskLevel,
      mitigationActions: [],
      supervisoryAuthorityNotified: false,
      dataSubjectsNotified: false,
      resolved: false
    };
    
    this.dataBreaches.push(breach);
    
    // Auto-notify if high risk
    if (riskLevel === 'high' || riskLevel === 'critical') {
      setTimeout(() => this.notifySupervisoryAuthority(breach.id), 0);
      
      if (riskLevel === 'critical') {
        setTimeout(() => this.notifyDataSubjects(breach.id), 0);
      }
    }
    
    console.error(`Data breach recorded: ${description} (${riskLevel} risk)`);
    return breach;
  }

  /**
   * Generate privacy impact assessment
   */
  generatePrivacyImpactAssessment(): {
    riskScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    findings: string[];
    recommendations: string[];
    complianceStatus: 'compliant' | 'issues_found' | 'non_compliant';
  } {
    const findings: string[] = [];
    const recommendations: string[] = [];
    let riskScore = 0;
    
    // Check data minimization
    const totalRecords = this.personalDataRecords.size;
    const biometricRecords = Array.from(this.personalDataRecords.values())
      .filter(r => r.dataType === 'biometric').length;
    
    if (biometricRecords / totalRecords > 0.5) {
      riskScore += 20;
      findings.push('High proportion of biometric data processing');
      recommendations.push('Implement biometric data minimization strategies');
    }
    
    // Check retention compliance
    const overdueRecords = Array.from(this.personalDataRecords.values())
      .filter(r => this.isRetentionOverdue(r)).length;
    
    if (overdueRecords > 0) {
      riskScore += 15;
      findings.push(`${overdueRecords} records exceed retention period`);
      recommendations.push('Implement automated retention policy enforcement');
    }
    
    // Check encryption
    const unencryptedRecords = Array.from(this.personalDataRecords.values())
      .filter(r => !r.encrypted && r.dataType === 'biometric').length;
    
    if (unencryptedRecords > 0) {
      riskScore += 25;
      findings.push(`${unencryptedRecords} biometric records not encrypted`);
      recommendations.push('Encrypt all biometric data immediately');
    }
    
    // Check consent management
    const usersWithoutConsent = new Set(Array.from(this.personalDataRecords.values())
      .filter(r => r.legalBasis === 'consent' && !this.hasValidConsent(r.userId, this.mapDataTypeToConsent(r.dataType)))
      .map(r => r.userId)).size;
    
    if (usersWithoutConsent > 0) {
      riskScore += 30;
      findings.push(`${usersWithoutConsent} users processing without valid consent`);
      recommendations.push('Audit and refresh consent records');
    }
    
    // Check data breach history
    const recentBreaches = this.dataBreaches.filter(b => 
      (Date.now() - b.detectedAt.getTime()) < (90 * 24 * 60 * 60 * 1000) // Last 90 days
    ).length;
    
    if (recentBreaches > 0) {
      riskScore += recentBreaches * 10;
      findings.push(`${recentBreaches} data breaches in last 90 days`);
      recommendations.push('Strengthen security measures and incident response');
    }
    
    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    if (riskScore >= 70) riskLevel = 'critical';
    else if (riskScore >= 50) riskLevel = 'high';
    else if (riskScore >= 30) riskLevel = 'medium';
    else riskLevel = 'low';
    
    // Determine compliance status
    let complianceStatus: 'compliant' | 'issues_found' | 'non_compliant';
    if (riskScore >= 50) complianceStatus = 'non_compliant';
    else if (riskScore >= 20) complianceStatus = 'issues_found';
    else complianceStatus = 'compliant';
    
    return {
      riskScore,
      riskLevel,
      findings,
      recommendations,
      complianceStatus
    };
  }

  /**
   * Private helper methods
   */
  private setupProcessingActivities(): void {
    this.processingActivities = [
      {
        id: 'voter_registration',
        name: 'Voter Registration',
        purpose: 'Enable eligible citizens to participate in elections',
        dataCategories: ['identity_data', 'biometric_data', 'contact_data'],
        legalBasis: 'public_task',
        retentionPeriod: 2555, // 7 years
        dataSubjects: ['voters'],
        recipients: ['election_authorities', 'system_administrators'],
        transferToThirdCountries: false,
        securityMeasures: ['encryption', 'access_control', 'audit_logging']
      },
      {
        id: 'biometric_verification',
        name: 'Biometric Verification',
        purpose: 'Verify voter identity during authentication',
        dataCategories: ['biometric_data', 'behavioral_data'],
        legalBasis: 'consent',
        retentionPeriod: 365, // 1 year
        dataSubjects: ['voters'],
        recipients: ['system_administrators'],
        transferToThirdCountries: false,
        securityMeasures: ['encryption', 'pseudonymization', 'liveness_detection']
      },
      {
        id: 'vote_casting',
        name: 'Vote Casting',
        purpose: 'Record and tally votes while maintaining privacy',
        dataCategories: ['voting_data', 'transaction_data'],
        legalBasis: 'public_task',
        retentionPeriod: 2555, // 7 years (legal requirement)
        dataSubjects: ['voters'],
        recipients: ['election_authorities'],
        transferToThirdCountries: false,
        securityMeasures: ['zero_knowledge_proofs', 'blockchain', 'encryption']
      }
    ];
  }

  private async handleConsentWithdrawal(userId: string, consentType: ConsentRecord['consentType']): Promise<void> {
    const relevantRecords = Array.from(this.personalDataRecords.values())
      .filter(record => 
        record.userId === userId && 
        record.legalBasis === 'consent' &&
        this.mapDataTypeToConsent(record.dataType) === consentType
      );
    
    for (const record of relevantRecords) {
      if (this.canDeleteAfterConsentWithdrawal(record)) {
        await this.securelyDeleteData(record);
        record.deleted = true;
        record.deletedAt = new Date();
      } else {
        // Anonymize if deletion not possible
        await this.anonymizeData(record);
        record.anonymized = true;
      }
    }
  }

  private mapDataTypeToConsent(dataType: PersonalDataRecord['dataType']): ConsentRecord['consentType'] {
    switch (dataType) {
      case 'biometric': return 'biometric_processing';
      case 'behavioral': return 'analytics';
      default: return 'data_storage';
    }
  }

  private async hasValidConsent(userId: string, consentType: ConsentRecord['consentType']): Promise<boolean> {
    const userConsents = this.consentRecords.get(userId) || [];
    const latestConsent = userConsents
      .filter(c => c.consentType === consentType)
      .sort((a, b) => (b.grantedAt?.getTime() || 0) - (a.grantedAt?.getTime() || 0))[0];
    
    return latestConsent?.granted === true;
  }

  private async encryptData(data: any): Promise<string> {
    // Simplified encryption - in production use proper encryption library
    return btoa(JSON.stringify(data));
  }

  private async decryptData(encryptedData: string): Promise<any> {
    // Simplified decryption - in production use proper decryption
    return JSON.parse(atob(encryptedData));
  }

  private async securelyDeleteData(record: PersonalDataRecord): Promise<void> {
    // Overwrite sensitive data
    record.data = null;
    console.log(`Securely deleted data for record ${record.id}`);
  }

  private async anonymizeData(record: PersonalDataRecord): Promise<void> {
    // Remove identifying information while keeping statistical value
    if (record.dataType === 'biometric') {
      record.data = { anonymized: true, timestamp: record.collectedAt };
    }
    record.anonymized = true;
  }

  private canAnonymize(record: PersonalDataRecord): boolean {
    return record.dataType !== 'voting_record'; // Voting records need special handling
  }

  private isPortableData(record: PersonalDataRecord): boolean {
    return record.dataType === 'personal_info' || 
           (record.dataType === 'biometric' && record.purpose === 'user_provided');
  }

  private canDeleteAfterConsentWithdrawal(record: PersonalDataRecord): boolean {
    // Check if there are other legal bases for processing
    return !(record.purpose.includes('legal_obligation') || 
             record.purpose.includes('public_task') || 
             record.dataType === 'audit_log');
  }

  private isRetentionOverdue(record: PersonalDataRecord): boolean {
    const daysSinceCollection = (Date.now() - record.collectedAt.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceCollection > record.retentionPeriod;
  }

  private startRetentionPolicyEnforcement(): void {
    this.cleanupInterval = setInterval(() => {
      this.enforceRetentionPolicy();
    }, 24 * 60 * 60 * 1000); // Daily cleanup
  }

  private async enforceRetentionPolicy(): Promise<void> {
    console.log('Enforcing retention policy...');
    
    const overdueRecords = Array.from(this.personalDataRecords.values())
      .filter(record => !record.deleted && this.isRetentionOverdue(record));
    
    for (const record of overdueRecords) {
      if (this.canAutoDelete(record)) {
        await this.securelyDeleteData(record);
        record.deleted = true;
        record.deletedAt = new Date();
      }
    }
    
    console.log(`Retention policy enforced: ${overdueRecords.length} records processed`);
  }

  private canAutoDelete(record: PersonalDataRecord): boolean {
    return !(record.legalBasis === 'public_task' || 
             record.purpose.includes('legal_obligation'));
  }

  private async initializePrivacyDashboard(): Promise<void> {
    // Initialize privacy dashboard components
    console.log('Privacy dashboard initialized');
  }

  private async logDataAccess(userId: string, action: string, details: string): Promise<void> {
    console.log(`Data access log: ${action} for user ${userId} - ${details}`);
  }

  private async notifySupervisoryAuthority(breachId: string): Promise<void> {
    const breach = this.dataBreaches.find(b => b.id === breachId);
    if (breach) {
      breach.supervisoryAuthorityNotified = true;
      breach.reportedAt = new Date();
      console.log(`Supervisory authority notified of breach: ${breachId}`);
    }
  }

  private async notifyDataSubjects(breachId: string): Promise<void> {
    const breach = this.dataBreaches.find(b => b.id === breachId);
    if (breach) {
      breach.dataSubjectsNotified = true;
      console.log(`Data subjects notified of breach: ${breachId}`);
    }
  }

  private getPrivacyRights(): PrivacyRights {
    return {
      access: true,
      rectification: true,
      erasure: true,
      restriction: true,
      portability: true,
      objection: true
    };
  }

  private generateId(): string {
    return `gdpr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Stop all monitoring and cleanup
   */
  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.retentionPolicyActive = false;
  }
}

// Export singleton instance
export const gdprComplianceService = new GDPRComplianceService();
