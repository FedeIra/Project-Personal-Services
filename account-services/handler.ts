// External Dependencies:
import { APIGatewayEvent } from 'aws-lambda';

// Internal Dependencies:
import { GetAccountsController } from './infrastructure/controllers/GetAccountsController';
import { DBAccountRepository } from './infrastructure/repositories/DBAccountsRepository';

// All dependencies:
const accountRepository = new DBAccountRepository();
const getAccountsController = new GetAccountsController(accountRepository);

// Get Accounts handler:
export const getAccounts = async (event: APIGatewayEvent) => {
  return getAccountsController.handle(event);
};
