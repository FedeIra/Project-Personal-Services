// External Dependencies:
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

// Internal Dependencies:
import { IDBAccountRepository } from '../interfaces/IGetAccountRepository';
import { PaginatedAccounts } from '../../domain/entities/account/AccountResponseDB';
import { EncryptionService } from '../../infrastructure/services/EncryptionService';

// Get available balance use case:
export class GetAccountsUseCase {
  constructor(private repository: IDBAccountRepository) {}

  async execute(
    pageSize: number,
    accountFilter?: string,
    nextToken?: DocumentClient.Key
  ): Promise<PaginatedAccounts> {
    const accounts = await this.repository.getAccounts(
      pageSize,
      accountFilter,
      nextToken
    );

    // Decrypt passwords:
    accounts.items = accounts.items.map((account) => ({
      ...account,
      password: EncryptionService.decrypt(account.password),
    }));
    return accounts;
  }
}
