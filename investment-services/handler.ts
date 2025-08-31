// External Dependencies:
import { APIGatewayProxyResult } from 'aws-lambda';

// Internal Dependencies:
import { GetAvailableBalanceController } from './infrastructure/controllers/GetAvailableBalanceController';
import { PPIAccountRepository } from './infrastructure/repositories/PPIAccountRepository';

// All dependencies:
const accountRepository = new PPIAccountRepository();
const getAvailableBalanceController = new GetAvailableBalanceController(
  accountRepository
);

// Get Balance handler:
export const getAvailableBalance = async (): Promise<APIGatewayProxyResult> => {
  return getAvailableBalanceController.handle();
};
