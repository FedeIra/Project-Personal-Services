// External Dependencies:
import crypto from 'crypto';

// Internal Dependencies:
import { CONFIG } from '../../config/constants';

// Encryption service:
export class EncryptionService {
  private static readonly algorithm = CONFIG.ENCRYPTION.ALGORITHM;
  private static readonly key = Buffer.from(CONFIG.ENCRYPTION.KEY, 'hex');

  // Encrypt plaintext (UTF-8) to base64 string:
  static encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(CONFIG.ENCRYPTION.RANDOM_BYTES);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  }

  // Decrypt hex string to plaintext (UTF-8):
  static decrypt(data: string): string {
    const [ivHex, encrypted] = data.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
