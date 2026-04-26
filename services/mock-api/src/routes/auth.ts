import type { FastifyInstance } from 'fastify';
import { db, makeFakeJwt } from '../store';

export async function registerAuthRoutes(app: FastifyInstance) {
  /** POST /v1/auth/session — accepts any email/password, returns fake JWT */
  app.post('/v1/auth/session', async (request, reply) => {
    const { email } = (request.body as { email?: string; password?: string }) ?? {};

    if (!email) {
      return reply.status(400).send({ error: 'email is required' });
    }

    // Find or create a mock user for this email
    let user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      user = {
        id: `usr_${Date.now()}`,
        email: email.toLowerCase(),
        displayName: email.split('@')[0],
        role: 'user',
        onboardingComplete: false,
        createdAt: new Date().toISOString(),
      };
      db.users.push(user);
    }

    const token = makeFakeJwt(user.id);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();

    return reply.status(200).send({ token, user, expiresAt });
  });
}
