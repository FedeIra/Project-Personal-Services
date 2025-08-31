// External Dependencies:
import {
  APIGatewayEvent,
  APIGatewayProxyEventQueryStringParameters,
} from 'aws-lambda';
import {
  buildResponse,
  ErrorHandler,
} from '../../../common/utils/ResponseBuilder';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

// Internal Dependencies:
import { GetAccountsUseCase } from '../../application/usecases/GetAccountUseCase';
import { IDBAccountRepository } from '../../application/interfaces/IGetAccountRepository';
import { PaginatedAccounts } from '../../domain/entities/account/AccountResponseDB';

// Controller to get accounts
export class GetAccountsController {
  private useCase: GetAccountsUseCase;

  constructor(repository: IDBAccountRepository) {
    this.useCase = new GetAccountsUseCase(repository);
  }

  async handle(event: APIGatewayEvent): Promise<{
    statusCode: number;
    body: string;
  }> {
    try {
      const queryParams: APIGatewayProxyEventQueryStringParameters =
        event.queryStringParameters || {};
      const pageSize = Number(queryParams.pageSize);
      const nextTokenRaw: string | undefined | null = queryParams.nextToken;
      const accountFilter: string | undefined =
        queryParams['filter[account][eq]'];

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

      const nextPageToken: string | undefined = result.nextToken
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
