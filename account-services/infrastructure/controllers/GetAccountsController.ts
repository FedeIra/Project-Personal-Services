import { APIGatewayEvent } from 'aws-lambda';
import {
  buildResponse,
  ErrorHandler,
} from '../../../common/utils/ResponseBuilder';
import { GetAccountsUseCase } from '../../application/usecases/GetAccountUseCase';
import { IDBAccountRepository } from '../../application/interfaces/IGetAccountRepository';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { PaginatedAccounts } from '../../domain/entities/account/AccountResponseDB';

export class GetAccountsController {
  private useCase: GetAccountsUseCase;

  constructor(repository: IDBAccountRepository) {
    this.useCase = new GetAccountsUseCase(repository);
  }

  async handle(event: APIGatewayEvent) {
    try {
      const queryParams = event.queryStringParameters || {};
      const pageSize = Number(queryParams.pageSize);
      const nextTokenRaw = queryParams.nextToken;
      const accountFilter = queryParams['filter[account][eq]'];

      if (!pageSize || pageSize < 1) {
        return buildResponse({
          codeStatus: 400,
          status: 'error',
          data: null,
          errorMessage: 'Missing or invalid parameter: pageSize is required',
        });
      }

      let parsedNextToken: DocumentClient.Key | undefined = undefined;
      if (nextTokenRaw) {
        try {
          parsedNextToken = JSON.parse(
            Buffer.from(nextTokenRaw, 'base64').toString('utf-8')
          );
        } catch {
          return buildResponse({
            codeStatus: 400,
            status: 'error',
            data: null,
            errorMessage: 'Invalid nextToken format',
          });
        }
      }

      const result: PaginatedAccounts = await this.useCase.execute(
        pageSize,
        accountFilter,
        parsedNextToken
      );

      const nextPageToken = result.nextToken
        ? Buffer.from(JSON.stringify(result.nextToken)).toString('base64')
        : undefined;

      return buildResponse({
        codeStatus: 200,
        status: 'success',
        data: {
          items: result.items,
          nextPageToken: nextPageToken || null,
        },
      });
    } catch (error) {
      return ErrorHandler.handle(error);
    }
  }
}
