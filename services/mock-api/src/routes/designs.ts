import { randomUUID } from 'crypto';
import type { FastifyInstance } from 'fastify';
import { db, getUserFromRequest } from '../store';
import type { Design } from '@bob/shared-schemas';

export async function registerDesignRoutes(app: FastifyInstance) {
  /** GET /v1/designs */
  app.get('/v1/designs', async (request, reply) => {
    const user = getUserFromRequest(app, request.headers.authorization);
    if (!user) return reply.status(401).send({ error: 'Unauthorised' });

    const designs = db.designs.filter((d) => d.userId === user.id && d.status !== 'archived');
    return reply.send({ data: designs, total: designs.length });
  });

  /** POST /v1/designs */
  app.post('/v1/designs', async (request, reply) => {
    const user = getUserFromRequest(app, request.headers.authorization);
    if (!user) return reply.status(401).send({ error: 'Unauthorised' });

    const body = (request.body ?? {}) as Partial<Design>;
    const now = new Date().toISOString();

    const newDesign: Design = {
      id: randomUUID(),
      userId: user.id,
      name: body.name ?? 'Untitled Design',
      archetype: body.archetype ?? 'full_house',
      status: 'draft',
      location: body.location ?? user.location ?? { city: 'Mumbai' },
      plot: body.plot ?? {},
      floors: body.floors ?? [{ index: 0, heightFt: 10, rooms: [], stairs: [] }],
      schemaVersion: '1.0.0',
      createdAt: now,
      updatedAt: now,
    };

    db.designs.push(newDesign);
    return reply.status(201).send({ data: newDesign });
  });

  /** GET /v1/designs/:id */
  app.get('/v1/designs/:id', async (request, reply) => {
    const user = getUserFromRequest(app, request.headers.authorization);
    if (!user) return reply.status(401).send({ error: 'Unauthorised' });

    const { id } = request.params as { id: string };
    const design = db.designs.find((d) => d.id === id && d.userId === user.id);
    if (!design) return reply.status(404).send({ error: 'Design not found' });

    return reply.send({ data: design });
  });

  /** PUT /v1/designs/:id */
  app.put('/v1/designs/:id', async (request, reply) => {
    const user = getUserFromRequest(app, request.headers.authorization);
    if (!user) return reply.status(401).send({ error: 'Unauthorised' });

    const { id } = request.params as { id: string };
    const idx = db.designs.findIndex((d) => d.id === id && d.userId === user.id);
    if (idx === -1) return reply.status(404).send({ error: 'Design not found' });

    const body = (request.body ?? {}) as Partial<Design>;
    db.designs[idx] = {
      ...db.designs[idx],
      ...body,
      id,
      userId: user.id,
      updatedAt: new Date().toISOString(),
    };

    return reply.send({ data: db.designs[idx] });
  });
}
