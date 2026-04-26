import Fastify from 'fastify';
import cors from '@fastify/cors';
import { registerAuthRoutes } from './routes/auth';
import { registerUserRoutes } from './routes/users';
import { registerDesignRoutes } from './routes/designs';
import { registerRateItemRoutes } from './routes/rate-items';
import { registerEstimateRoutes } from './routes/estimates';

const PORT = Number(process.env.PORT ?? 4000);
const HOST = process.env.HOST ?? '0.0.0.0';

export async function buildServer() {
  const isDev = process.env.NODE_ENV !== 'production';
  const app = Fastify({
    logger: isDev
      ? { level: 'info' }
      : { level: 'warn' },
  });

  await app.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.get('/healthz', async () => ({ status: 'ok', service: 'mock-api', ts: new Date().toISOString() }));

  await registerAuthRoutes(app);
  await registerUserRoutes(app);
  await registerDesignRoutes(app);
  await registerRateItemRoutes(app);
  await registerEstimateRoutes(app);

  return app;
}

async function main() {
  const app = await buildServer();
  try {
    await app.listen({ port: PORT, host: HOST });
    console.log(`\n🚀  Mock API running at http://localhost:${PORT}`);
    console.log(`   Android emulator: http://10.0.2.2:${PORT}`);
    console.log('   Endpoints:');
    console.log('     POST /v1/auth/session');
    console.log('     GET  /v1/me  |  PATCH /v1/me/onboarding');
    console.log('     GET  /v1/designs  |  POST /v1/designs');
    console.log('     GET  /v1/designs/:id  |  PUT /v1/designs/:id');
    console.log('     POST /v1/designs/:id/estimate');
    console.log('     GET  /v1/rate-items\n');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
