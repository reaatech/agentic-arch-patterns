/**
 * Multi-Key Rotation Pattern Example
 * 
 * Demonstrates cryptographic key lifecycle management.
 */

import { randomBytes } from 'node:crypto';

interface EncryptionKey {
  id: string;
  version: number;
  key: Buffer;
  createdAt: Date;
  expiresAt: Date;
  status: 'active' | 'rotating' | 'expired' | 'revoked';
}

interface KeyRotationConfig {
  rotationPeriodDays: number;
  gracePeriodDays: number;
}

class MultiKeyRotation {
  readonly keys: Map<string, EncryptionKey> = new Map();
  private currentVersion: number = 0;

  constructor(private config: KeyRotationConfig) {}

  generateKey(): EncryptionKey {
    this.currentVersion++;
    const key: EncryptionKey = {
      id: `key-${Date.now()}`,
      version: this.currentVersion,
      key: randomBytes(32),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.config.rotationPeriodDays * 24 * 60 * 60 * 1000),
      status: 'active'
    };
    this.keys.set(key.id, key);
    return key;
  }

  getActiveKey(): EncryptionKey | null {
    const now = new Date();
    for (const key of this.keys.values()) {
      if (key.status === 'active' && now < key.expiresAt) {
        return key;
      }
    }
    return null;
  }

  rotate(): EncryptionKey {
    // Mark current key as rotating
    const currentKey = this.getActiveKey();
    if (currentKey) {
      currentKey.status = 'rotating';
    }

    // Generate new key
    const newKey = this.generateKey();
    console.log(`Key rotated: v${currentKey?.version || 0} → v${newKey.version}`);
    return newKey;
  }

  cleanupExpired(): void {
    const now = new Date();
    const gracePeriod = this.config.gracePeriodDays * 24 * 60 * 60 * 1000;
    
    for (const [id, key] of this.keys.entries()) {
      if (key.status === 'rotating' && now.getTime() - key.expiresAt.getTime() > gracePeriod) {
        key.status = 'expired';
        this.keys.delete(id);
        console.log(`Cleaned up expired key: v${key.version}`);
      }
    }
  }
}
async function main() {
  const rotation = new MultiKeyRotation({
    rotationPeriodDays: 30,
    gracePeriodDays: 7
  });

  // Generate initial key
  const key1 = rotation.generateKey();
  console.log('Initial key:', key1.version, key1.status);

  // Rotate keys
  const key2 = rotation.rotate();
  console.log('After rotation:', key2.version, key2.status);

  // Cleanup
  rotation.cleanupExpired();
  console.log('Active keys:', [...rotation.keys.values()].filter(k => k.status === 'active').length);
}

export { MultiKeyRotation };
export type { EncryptionKey, KeyRotationConfig };
