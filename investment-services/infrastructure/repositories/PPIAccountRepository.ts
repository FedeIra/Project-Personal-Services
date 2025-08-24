// Internal Dependencies:
import { IPPIAccountRepository } from '../../application/interfaces/IGetAvailableBalanceRepository';
import { PPITokenService } from '../services/PPITokenServices';
import { AccountBalanceResponsePPI } from '../../domain/entities/account/AccountBalanceResponsePPI';
import { axiosConfiguration } from '../../config/axiosConfiguration';
import { CONFIG } from '../../config/constants';

// PPI Account repository:
export class PPIAccountRepository implements IPPIAccountRepository {
  // Get investing profile service:
  async getAvailableBalance(): Promise<AccountBalanceResponsePPI[]> {
    try {
      // Get PPI token:
      const token: string = await PPITokenService.getToken();

      // Get available balance:
      const response = await axiosConfiguration.get(
        `${CONFIG.PPI.BASE_URL}/Account/AvailableBalance?accountNumber=${CONFIG.PPI.ACCOUNT_NUMBER}`,
        {
          headers: {
            AuthorizedClient: CONFIG.PPI.AUTHORIZED_CLIENT,
            ClientKey: CONFIG.PPI.CLIENT_KEY,
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const ppiAccountBalanceResponse: AccountBalanceResponsePPI[] =
        response.data;

      return ppiAccountBalanceResponse;
    } catch (error: any) {
      throw new Error(`Error getting balance: ${error.message}`);
    }
  }
}
