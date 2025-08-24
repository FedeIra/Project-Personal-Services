// External Dependencies:
import AWS from 'aws-sdk';

// Token cache service:

const ssm = new AWS.SSM();
export class TokenCacheService {
  private static token: string | null = null;
  private static tokenExpiration: number | null = null;
  private static refreshToken: string | null = null;

  // Check token from memory or cache:
  static async isTokenValid(): Promise<boolean> {
    // Cached token:
    if (!this.token || !this.tokenExpiration) {
      await this.loadTokenFromSSM();
    }
    return (this.tokenExpiration ?? 0) > Date.now();
  }

  // Save token in memory and SSM:
  static async getToken(): Promise<string | null> {
    if (!this.token) {
      await this.loadTokenFromSSM();
    }
    return this.token;
  }

  // Set token in cache:
  static setToken(token: string, expiresInMs: number) {
    this.token = token;
    this.tokenExpiration = Date.now() + (expiresInMs ?? 0);
    this.saveTokenToSSM();
  }

  // Get refresh token from memory or cache:
  static async getRefreshToken(): Promise<string | null> {
    if (!this.refreshToken) {
      await this.loadTokenFromSSM();
    }
    return this.refreshToken;
  }

  // Set refresh token in cache and SSM:
  static async setRefreshToken(refreshToken: string) {
    this.refreshToken = refreshToken;
    await this.saveTokenToSSM();
  }

  // Load token and refresh token from SSM:
  private static async loadTokenFromSSM() {
    try {
      const result = await ssm
        .getParameter({ Name: '/ppi/token', WithDecryption: true })
        .promise();

      if (result.Parameter?.Value) {
        const parsed = JSON.parse(result.Parameter.Value);
        this.token = parsed.token;
        this.tokenExpiration = parsed.expiration;
        this.refreshToken = parsed.refreshToken;
      }
    } catch (error) {
      console.error(' Error loading token from SSM:', error);
    }
  }

  // Store token and refresh token in SSM:
  private static async saveTokenToSSM() {
    try {
      await ssm
        .putParameter({
          Name: '/ppi/token',
          Value: JSON.stringify({
            token: this.token,
            expiration: this.tokenExpiration,
            refreshToken: this.refreshToken,
          }),
          Type: 'SecureString',
          Overwrite: true,
        })
        .promise();
    } catch (error) {
      console.error('Error saving token to SSM:', error);
    }
  }
}
