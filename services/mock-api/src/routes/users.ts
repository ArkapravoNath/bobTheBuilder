import type { FastifyInstance } from 'fastify';
import { db, getUserFromRequest } from '../store';

export async function registerUserRoutes(app: FastifyInstance) {
  /** GET /v1/me */
  app.get('/v1/me', async (request, reply) => {
    const user = getUserFromRequest(app, request.headers.authorization);
    if (!user) return reply.status(401).send({ error: 'Unauthorised' });
    return reply.send({ data: user });
  });

  /** PATCH /v1/me/onboarding */
  app.patch('/v1/me/onboarding', async (request, reply) => {
    const user = getUserFromRequest(app, request.headers.authorization);
    if (!user) return reply.status(401).send({ error: 'Unauthorised' });

    const patch = (request.body ?? {}) as Record<string, unknown>;
    const idx = db.users.findIndex((u) => u.id === user.id);
    if (idx === -1) return reply.status(404).send({ error: 'User not found' });

    db.users[idx] = { ...db.users[idx], ...patch };
    return reply.send({ data: db.users[idx] });
  });
}
