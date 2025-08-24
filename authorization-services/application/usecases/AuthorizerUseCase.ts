// External Dependencies:
import {
  APIGatewayTokenAuthorizerEvent,
  APIGatewayAuthorizerResult,
} from 'aws-lambda';

// Internal Dependencies:
import { ITokenService } from '../../application/interfaces/ITokenService';
import { AuthPolicy } from '../../infrastructure/auth/AuthPolicy';

// Authorizer use case:
export class AuthorizerUseCase {
  constructor(private readonly tokenService: ITokenService) {}

  async execute(
    event: APIGatewayTokenAuthorizerEvent
  ): Promise<APIGatewayAuthorizerResult> {
    if (!event.authorizationToken) {
      throw new Error('Unauthorized');
    }

    const token = event.authorizationToken.replace('Bearer ', '');

    try {
      // Verify token:
      this.tokenService.verifyToken(token);

      // Generate policy:
      return AuthPolicy.generatePolicy('user', 'Allow', event.methodArn);
    } catch (error) {
      return AuthPolicy.generatePolicy('user', 'Deny', event.methodArn);
    }
  }
}
