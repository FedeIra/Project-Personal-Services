// External Dependencies:
import { APIGatewayEvent } from 'aws-lambda';

// Internal Dependencies:
import { GetAvailableBalanceController } from './infrastructure/controllers/GetAvailableBalanceController';
import { PPIAccountRepository } from './infrastructure/repositories/PPIAccountRepository';

// All dependencies:
const accountRepository = new PPIAccountRepository();
const getAvailableBalanceController = new GetAvailableBalanceController(
  accountRepository
);

// Get Balance handler:
export const getAvailableBalance = async (event: APIGatewayEvent) => {
  return getAvailableBalanceController.handle(event);
};
