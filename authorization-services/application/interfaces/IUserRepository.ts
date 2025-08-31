// Interface for user repository:
export interface IUserRepository {
  validateCredentials(email: string, password: string): Promise<boolean>;
}
