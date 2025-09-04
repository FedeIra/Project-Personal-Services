import awsLambdaFastify from '@fastify/aws-lambda';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { buildApp } from './app';

// Construimos la app una sola vez por container (mejor para cold starts)
const appPromise = buildApp().then(async (app) => {
  const proxy = awsLambdaFastify(app);
  // Optimización recomendada por el repo (top-level ready):
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
