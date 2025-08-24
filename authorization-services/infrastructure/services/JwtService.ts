// External Dependencies:
import jwt from 'jsonwebtoken';

// Internal Dependencies:
import { CONFIG } from '../../config/constants';
import { ITokenService } from '../../application/interfaces/ITokenService';

export class JwtService implements ITokenService {
  // JWT token verification:
  verifyToken(token: string): void {
    const jwtSecret = CONFIG.JWT_SECRET;
    jwt.verify(token, jwtSecret);
  }

  // JWT token generation:
  generateToken(email: string): string {
    const payload = { email };
    const jwtSecret = CONFIG.JWT_SECRET;
    // Generate a new token:
    return jwt.sign(payload, jwtSecret, {
      expiresIn: '1h',
    });
  }
}
