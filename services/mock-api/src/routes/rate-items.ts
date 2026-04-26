import type { FastifyInstance } from 'fastify';
import { db } from '../store';

export async function registerRateItemRoutes(app: FastifyInstance) {
  /** GET /v1/rate-items */
  app.get('/v1/rate-items', async (_request, reply) => {
    return reply.send({ data: db.rateItems, total: db.rateItems.length });
  });
}
