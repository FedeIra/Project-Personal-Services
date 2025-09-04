import Fastify, { FastifyInstance } from 'fastify';

// (Tus deps)
// import { DBReportRepository } from './infrastructure/repositories/DBReportRepository';
// import { CreateReportController } from './infrastructure/controllers/CreateReportController';
// import { GetReportByIdController } from './infrastructure/controllers/GetReportByIdController';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify();

  // const repo = new DBReportRepository();
  // const createCtrl = new CreateReportController(repo);
  // const getByIdCtrl = new GetReportByIdController(repo);

  // POST /reports
  app.post('/reports', async (request, reply) => {
    const res = await createCtrl.handle(request.raw as any);
    reply
      .code(res.statusCode)
      .headers(res.headers ?? {})
      .send(res.body);
  });
  return app;
}
