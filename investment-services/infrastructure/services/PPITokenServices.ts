// Internal Dependencies:
import { TokenCacheService } from './PPITokenCacheService';
import { LoginResponsePPI } from '../../domain/entities/account/LoginResponsePPI';
import { axiosConfiguration } from '../../config/axiosConfiguration';
import { CONFIG } from '../../config/constants';

// External Dependencies:
import axios from 'axios';

// Service for PPI Token:
export class PPITokenService {
  // Get PPI token:
  public static async getToken(): Promise<string> {
    if (await TokenCacheService.isTokenValid()) {
      return (await TokenCacheService.getToken()) as string;
    }

    // Refresh token:
    if (await TokenCacheService.getRefreshToken()) {
      return await this.refreshToken();
    }

    // Request new token:
    return await this.requestNewToken();
  }

  // Request new token from PPI:
  private static async requestNewToken(): Promise<string> {
    const tokenInfo: LoginResponsePPI = await this.fetchToken();

    // Store token:
    this.storeToken(tokenInfo);
    return tokenInfo.accessToken;
  }

  // Refresh PPI token:
  private static async refreshToken(): Promise<string> {
    try {
      // get tokens from cache
      const refreshToken: string | null =
        await TokenCacheService.getRefreshToken();
      const previousToken: string | null = await TokenCacheService.getToken();

      if (!refreshToken || !previousToken) {
        return await this.requestNewToken();
      }

      // Refresh PPI token:
      const response = await axiosConfiguration.post(
        `${CONFIG.PPI.BASE_URL}/Account/RefreshToken`,
        { refreshToken },
        {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
            AuthorizedClient: CONFIG.PPI.AUTHORIZED_CLIENT,
            ClientKey: CONFIG.PPI.CLIENT_KEY,
            'Content-Type': 'application/json',
          },
        }
      );
      const tokenInfo: LoginResponsePPI = response.data;

      // Store token in cache:
      this.storeToken(tokenInfo);
      return tokenInfo.accessToken;
    } catch (error) {
      return this.requestNewToken();
    }
  }

  // Fetch token from PPI:
  private static async fetchToken(): Promise<LoginResponsePPI> {
    try {
      const response = await axios.post(
        `${CONFIG.PPI.BASE_URL}/Account/LoginApi`,
        {},
        {
          headers: {
            AuthorizedClient: CONFIG.PPI.AUTHORIZED_CLIENT,
            ClientKey: CONFIG.PPI.CLIENT_KEY,
            ApiKey: CONFIG.PPI.API_KEY,
            ApiSecret: CONFIG.PPI.API_SECRET,
          },
        }
      );

      const tokenInfo: LoginResponsePPI = response.data;

      return tokenInfo;
    } catch (error: any) {
      throw new Error(
        `Error getting token: ${error.response?.data || error.message}`
      );
    }
  }

  // Store token in cache:
  private static async storeToken(tokenInfo: LoginResponsePPI) {
    const expirationTimeMs: number = tokenInfo.expires * 1000;

    await TokenCacheService.setToken(tokenInfo.accessToken, expirationTimeMs);
    await TokenCacheService.setRefreshToken(tokenInfo.refreshToken);
  }
}
