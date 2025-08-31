// External Dependencies:
import jwt, { JwtPayload } from 'jsonwebtoken';

// Internal Dependencies:
import { CONFIG } from '../../config/constants';
import { ITokenService } from '../../application/interfaces/ITokenService';

export class JwtService implements ITokenService {
  // JWT token verification:
  verifyToken(token: string): JwtPayload {
    const secret = CONFIG.JWT_SECRET;
    const decoded = jwt.verify(token, secret, {
      algorithms: ['HS256'],
      clockTolerance: 5,
    });
    if (typeof decoded === 'string') return { sub: decoded } as JwtPayload;
    return decoded;
  }

  // JWT token generation:
  generateToken(email: string): string {
    const secret = CONFIG.JWT_SECRET;
    // Generate a new token:
    return jwt.sign({ email }, secret, { algorithm: 'HS256', expiresIn: '1h' });
  }
}
