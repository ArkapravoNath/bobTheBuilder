/**
 * In-memory store — loads JSON fixtures on startup, resets on restart.
 * Fixture files are watched by `tsx watch` so editing them triggers a server reload.
 */
import path from 'path';
import fs from 'fs';
import type { FastifyInstance } from 'fastify';
import type { User, Design, RateItem } from '@bob/shared-schemas';

const FIXTURES = path.join(__dirname, '../fixtures');

function loadFixture<T>(name: string): T[] {
  const file = path.join(FIXTURES, `${name}.json`);
  return JSON.parse(fs.readFileSync(file, 'utf-8')) as T[];
}

export const db = {
  users: loadFixture<User>('users'),
  designs: loadFixture<Design>('designs'),
  rateItems: loadFixture<RateItem>('rate-items'),
};

export function reloadFixtures() {
  db.users = loadFixture<User>('users');
  db.designs = loadFixture<Design>('designs');
  db.rateItems = loadFixture<RateItem>('rate-items');
}

// Watch fixture files for changes (hot-reload in dev)
if (process.env.NODE_ENV !== 'test') {
  for (const file of fs.readdirSync(FIXTURES).filter((f) => f.endsWith('.json'))) {
    fs.watch(path.join(FIXTURES, file), () => {
      reloadFixtures();
      console.log(`♻️   Reloaded fixtures/${file}`);
    });
  }
}

/** Generate a mock JWT — not cryptographically valid, just parseable */
export function makeFakeJwt(userId: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({ sub: userId, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 86400 * 30 }),
  ).toString('base64url');
  const sig = 'MOCK_SIGNATURE';
  return `${header}.${payload}.${sig}`;
}

export function decodeFakeJwt(token: string): { sub: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8')) as { sub: string };
  } catch {
    return null;
  }
}

export function getUserFromRequest(app: FastifyInstance, authHeader?: string): User | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const decoded = decodeFakeJwt(token);
  if (!decoded) return null;
  return db.users.find((u) => u.id === decoded.sub) ?? null;
}
