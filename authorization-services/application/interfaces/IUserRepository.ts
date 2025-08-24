export interface IUserRepository {
  validateCredentials(email: string, password: string): Promise<boolean>;
}
