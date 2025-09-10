/**
 * IPFS Storage Service for Decentralized Biometric Data
 * Provides secure, encrypted storage of face embeddings on IPFS network
 */

import { create as createIPFS, IPFSHTTPClient } from 'ipfs-http-client';

export interface IPFSConfig {
  host: string;
  port: number;
  protocol: 'https' | 'http';
  apiPath: string;
}

export interface EncryptedBiometricData {
  encryptedDescriptors: string;
  encryptedMeshData: string;
  metadata: {
    userId: string;
    enrollmentDate: string;
    encryptionVersion: string;
    checksumHash: string;
  };
  ipfsHash?: string;
}

export interface IPFSStorageResult {
  success: boolean;
  ipfsHash?: string;
  error?: string;
  redundantHashes?: string[];
}

class IPFSStorageService {
  private ipfsClient: IPFSHTTPClient | null = null;
  private config: IPFSConfig;
  private isInitialized = false;

  constructor() {
    // Default to public IPFS gateway (in production, use private node)
    this.config = {
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https',
      apiPath: '/api/v0'
    };
  }

  /**
   * Initialize IPFS client connection
   */
  async initialize(): Promise<boolean> {
    try {
      this.ipfsClient = createIPFS({
        host: this.config.host,
        port: this.config.port,
        protocol: this.config.protocol,
        apiPath: this.config.apiPath,
        headers: {
          // In production, add proper authentication
          'Authorization': 'Basic ' + btoa('project_id:project_secret')
        }
      });

      // Test connection
      const version = await this.ipfsClient.version();
      console.log('IPFS connected, version:', version);
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize IPFS:', error);
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * Store encrypted biometric data on IPFS with redundancy
   */
  async storeBiometricData(
    userId: string,
    faceDescriptors: Float32Array[],
    meshData: any[],
    enrollmentMetadata: any
  ): Promise<IPFSStorageResult> {
    if (!this.isInitialized || !this.ipfsClient) {
      return { success: false, error: 'IPFS not initialized' };
    }

    try {
      // Encrypt the biometric data
      const encryptedData = await this.encryptBiometricData(
        userId,
        faceDescriptors,
        meshData,
        enrollmentMetadata
      );

      // Convert to buffer for IPFS
      const dataBuffer = Buffer.from(JSON.stringify(encryptedData));

      // Store on IPFS
      const result = await this.ipfsClient.add(dataBuffer, {
        pin: true, // Pin to prevent garbage collection
        wrapWithDirectory: false,
        cidVersion: 1 // Use CIDv1 for better future compatibility
      });

      // Store redundant copies (in production, use multiple IPFS nodes)
      const redundantHashes = await this.createRedundantCopies(dataBuffer);

      console.log('Biometric data stored on IPFS:', result.cid.toString());

      return {
        success: true,
        ipfsHash: result.cid.toString(),
        redundantHashes
      };
    } catch (error) {
      console.error('Failed to store biometric data on IPFS:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Storage failed'
      };
    }
  }

  /**
   * Retrieve and decrypt biometric data from IPFS
   */
  async retrieveBiometricData(ipfsHash: string): Promise<{
    success: boolean;
    faceDescriptors?: Float32Array[];
    meshData?: any[];
    metadata?: any;
    error?: string;
  }> {
    if (!this.isInitialized || !this.ipfsClient) {
      return { success: false, error: 'IPFS not initialized' };
    }

    try {
      // Retrieve data from IPFS
      const chunks: Uint8Array[] = [];
      for await (const chunk of this.ipfsClient.cat(ipfsHash)) {
        chunks.push(chunk);
      }

      // Combine chunks
      const dataBuffer = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
      let offset = 0;
      for (const chunk of chunks) {
        dataBuffer.set(chunk, offset);
        offset += chunk.length;
      }

      // Parse encrypted data
      const encryptedData: EncryptedBiometricData = JSON.parse(
        new TextDecoder().decode(dataBuffer)
      );

      // Decrypt the biometric data
      const decryptedData = await this.decryptBiometricData(encryptedData);

      return {
        success: true,
        ...decryptedData
      };
    } catch (error) {
      console.error('Failed to retrieve biometric data from IPFS:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Retrieval failed'
      };
    }
  }

  /**
   * Encrypt biometric data using AES-GCM
   */
  private async encryptBiometricData(
    userId: string,
    faceDescriptors: Float32Array[],
    meshData: any[],
    enrollmentMetadata: any
  ): Promise<EncryptedBiometricData> {
    // Generate encryption key from user data + system secret
    const keyMaterial = await this.deriveEncryptionKey(userId);
    
    // Serialize the data
    const descriptorData = JSON.stringify(
      faceDescriptors.map(desc => Array.from(desc))
    );
    const meshDataStr = JSON.stringify(meshData);

    // Encrypt descriptors
    const descriptorResult = await this.encryptData(descriptorData, keyMaterial);
    const meshResult = await this.encryptData(meshDataStr, keyMaterial);

    // Create checksum for integrity
    const checksumHash = await this.createChecksum(descriptorData + meshDataStr);

    return {
      encryptedDescriptors: descriptorResult,
      encryptedMeshData: meshResult,
      metadata: {
        userId,
        enrollmentDate: new Date().toISOString(),
        encryptionVersion: '1.0',
        checksumHash
      }
    };
  }

  /**
   * Decrypt biometric data
   */
  private async decryptBiometricData(
    encryptedData: EncryptedBiometricData
  ): Promise<{
    faceDescriptors: Float32Array[];
    meshData: any[];
    metadata: any;
  }> {
    const keyMaterial = await this.deriveEncryptionKey(encryptedData.metadata.userId);

    // Decrypt data
    const descriptorData = await this.decryptData(encryptedData.encryptedDescriptors, keyMaterial);
    const meshDataStr = await this.decryptData(encryptedData.encryptedMeshData, keyMaterial);

    // Verify checksum
    const calculatedChecksum = await this.createChecksum(descriptorData + meshDataStr);
    if (calculatedChecksum !== encryptedData.metadata.checksumHash) {
      throw new Error('Data integrity check failed');
    }

    // Parse decrypted data
    const descriptorArrays = JSON.parse(descriptorData);
    const faceDescriptors = descriptorArrays.map((arr: number[]) => new Float32Array(arr));
    const meshData = JSON.parse(meshDataStr);

    return {
      faceDescriptors,
      meshData,
      metadata: encryptedData.metadata
    };
  }

  /**
   * Derive encryption key from user ID and system secret
   */
  private async deriveEncryptionKey(userId: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(userId + process.env.BIOMETRIC_ENCRYPTION_SECRET || 'default-secret'),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('biometric-salt-2024'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt data using AES-GCM
   */
  private async encryptData(data: string, key: CryptoKey): Promise<string> {
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(data)
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return btoa(String.fromCharCode(...combined));
  }

  /**
   * Decrypt data using AES-GCM
   */
  private async decryptData(encryptedData: string, key: CryptoKey): Promise<string> {
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    return new TextDecoder().decode(decrypted);
  }

  /**
   * Create SHA-256 checksum for data integrity
   */
  private async createChecksum(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const hash = await crypto.subtle.digest('SHA-256', encoder.encode(data));
    return btoa(String.fromCharCode(...new Uint8Array(hash)));
  }

  /**
   * Create redundant copies on multiple IPFS nodes (production feature)
   */
  private async createRedundantCopies(dataBuffer: Buffer): Promise<string[]> {
    // In production, this would store copies on multiple IPFS nodes
    // For now, return empty array as we only have one connection
    return [];
  }

  /**
   * Pin data to ensure persistence
   */
  async pinData(ipfsHash: string): Promise<boolean> {
    if (!this.isInitialized || !this.ipfsClient) {
      return false;
    }

    try {
      await this.ipfsClient.pin.add(ipfsHash);
      return true;
    } catch (error) {
      console.error('Failed to pin IPFS data:', error);
      return false;
    }
  }

  /**
   * Remove pinned data (for GDPR compliance)
   */
  async unpinData(ipfsHash: string): Promise<boolean> {
    if (!this.isInitialized || !this.ipfsClient) {
      return false;
    }

    try {
      await this.ipfsClient.pin.rm(ipfsHash);
      return true;
    } catch (error) {
      console.error('Failed to unpin IPFS data:', error);
      return false;
    }
  }

  /**
   * Get IPFS gateway URL for data access
   */
  getGatewayUrl(ipfsHash: string): string {
    return `https://ipfs.io/ipfs/${ipfsHash}`;
  }
}

// Export singleton instance
export const ipfsStorageService = new IPFSStorageService();