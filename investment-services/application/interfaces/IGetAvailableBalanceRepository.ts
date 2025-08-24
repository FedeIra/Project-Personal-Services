// Internal Dependencies:
import { AccountBalanceResponsePPI } from '../../domain/entities/account/AccountBalanceResponsePPI';

// Interface for getting available balance repository:
export interface IPPIAccountRepository {
  getAvailableBalance(): Promise<AccountBalanceResponsePPI[]>;
}
