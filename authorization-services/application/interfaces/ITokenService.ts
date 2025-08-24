// Interface for token service:
export interface ITokenService {
  generateToken(email: string): string;
  verifyToken(token: string): void;
}
