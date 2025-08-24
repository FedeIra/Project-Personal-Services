// PPI Login and Refresh token response:
export interface LoginResponsePPI {
  creationDate: string;
  expirationDate: string;
  accessToken: string;
  expires: number;
  refreshToken: string;
  tokenType: string;
}
