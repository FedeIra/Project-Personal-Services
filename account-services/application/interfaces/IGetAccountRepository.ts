// External Dependencies:
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

// Internal Dependencies:
import { PaginatedAccounts } from '../../domain/entities/account/AccountResponseDB';

// Interface for getting account repository:
export interface IDBAccountRepository {
  getAccounts(
    pageSize: number,
    accountFilter?: string,
    nextToken?: DocumentClient.Key
  ): Promise<PaginatedAccounts>;
}
