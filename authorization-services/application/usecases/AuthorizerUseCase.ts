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

  // Execute the authorizer use case:
  async execute(
    event: APIGatewayTokenAuthorizerEvent
  ): Promise<APIGatewayAuthorizerResult> {
    if (!event.authorizationToken) {
      throw new Error('Unauthorized');
    }

    const token = event.authorizationToken.replace('Bearer ', '');

    // Build wildcard ARN to allow all methods/paths on this API stage,
    // so the cached policy works regardless of which method is called next.
    const arnParts = event.methodArn.split(':');
    const gatewayParts = arnParts[5].split('/');
    const wildcardArn = `${arnParts.slice(0, 5).join(':')}:${gatewayParts[0]}/${gatewayParts[1]}/*/*`;

    try {
      // Verify token:
      this.tokenService.verifyToken(token);

      // Generate policy:
      return AuthPolicy.generatePolicy('user', 'Allow', wildcardArn);
    } catch (error) {
      return AuthPolicy.generatePolicy('user', 'Deny', wildcardArn);
    }
  }
}
