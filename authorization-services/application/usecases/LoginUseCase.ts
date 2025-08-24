// Internal Dependencies:
import { IUserRepository } from '../interfaces/IUserRepository';
import { ITokenService } from '../interfaces/ITokenService';

// Login use case:
export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService
  ) {}

  async execute(email: string, password: string): Promise<string> {
    const isValid = await this.userRepository.validateCredentials(
      email,
      password
    );

    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    return this.tokenService.generateToken(email);
  }
}
