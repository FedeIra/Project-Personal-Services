// External Dependencies:
import awsLambdaFastify from '@fastify/aws-lambda';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';

// Internal Dependencies:
import { buildApp } from './app';

const appPromise = buildApp().then(async (app) => {
  const proxy = awsLambdaFastify(app);
  await app.ready();
  return proxy;
});

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<unknown> => {
  const proxy = await appPromise;
  return proxy(event, context);
};
