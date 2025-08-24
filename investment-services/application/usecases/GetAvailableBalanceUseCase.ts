// Internal Dependencies:
import { IPPIAccountRepository } from '../interfaces/IGetAvailableBalanceRepository';
import { AccountBalanceResponsePPI } from '../../domain/entities/account/AccountBalanceResponsePPI';

// Get available balance use case:
export class GetAvailableBalanceUseCase {
  constructor(private repository: IPPIAccountRepository) {}

  async execute(): Promise<AccountBalanceResponsePPI[]> {
    const balances = await this.repository.getAvailableBalance();

    // Filter positive balances:
    const positiveBalance = balances.filter(
      (accountBalance) => accountBalance.amount > 0
    );

    return positiveBalance;
  }
}
