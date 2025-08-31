// External Dependencies:
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';

// Internal Dependencies:
import { LoginUseCase } from '../../application/usecases/LoginUseCase';

// Login controller:
export class LoginController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  async handle(event: APIGatewayEvent): Promise<APIGatewayProxyResult> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let body: any = {};

      if (event.isBase64Encoded) {
        const decoded: string = Buffer.from(
          event.body || '',
          'base64'
        ).toString('utf-8');
        body = JSON.parse(decoded);
      } else {
        body =
          typeof event.body === 'string'
            ? JSON.parse(event.body)
            : event.body || {};
      }

      const { email, password } = body;

      if (!email || !password) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'Email and password are required.' }),
        };
      }

      // Execute the login use case:
      const token: string = await this.loginUseCase.execute(email, password);

      return {
        statusCode: 200,
        body: JSON.stringify({ token }),
      };
    } catch (error) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Invalid credentials.' }),
      };
    }
  }
}
