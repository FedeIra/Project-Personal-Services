// External Dependencies:
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';

// Internal Dependencies:
import { GetAccountsController } from './infrastructure/controllers/GetAccountsController';
import { DBAccountRepository } from './infrastructure/repositories/DBAccountsRepository';

// All dependencies:
const accountRepository = new DBAccountRepository();
const getAccountsController = new GetAccountsController(accountRepository);

// Get Accounts handler:
export const getAccounts = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  return getAccountsController.handle(event);
};
