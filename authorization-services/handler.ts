// External Dependencies:
import {
  APIGatewayTokenAuthorizerEvent,
  APIGatewayAuthorizerResult,
  APIGatewayEvent,
} from 'aws-lambda';

// Internal Dependencies:
import { JwtService } from './infrastructure/services/JwtService';
import { DynamoUserRepository } from './infrastructure/repositories/DynamoUserRepository';
import { LoginUseCase } from './application/usecases/LoginUseCase';
import { AuthorizerUseCase } from './application/usecases/AuthorizerUseCase';
import { LoginController } from './infrastructure/controllers/LoginController';

// Wiring dependencies:
const tokenService = new JwtService();

// Authorizer Use Case
const authorizerUseCase = new AuthorizerUseCase(tokenService);

// Login Controller
const userRepository = new DynamoUserRepository();
const loginUseCase = new LoginUseCase(userRepository, tokenService);
const loginController = new LoginController(loginUseCase);

// Authorizer Handler:
export const authorizer = async (
  event: APIGatewayTokenAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
  return authorizerUseCase.execute(event);
};

// Login Handler:
export const login = async (event: APIGatewayEvent) => {
  return loginController.handle(event);
};
