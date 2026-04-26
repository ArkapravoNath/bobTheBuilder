import { randomUUID } from 'crypto';
import type { FastifyInstance } from 'fastify';
import { db, getUserFromRequest } from '../store';
import type { Design, EstimateCategoryBreakdown } from '@bob/shared-schemas';

const REGIONAL_MULTIPLIERS: Record<string, number> = {
  Mumbai: 1.25,
  Delhi: 1.18,
  Bengaluru: 1.22,
  Hyderabad: 1.15,
  Chennai: 1.12,
  Kolkata: 1.08,
  Pune: 1.10,
  Ahmedabad: 1.05,
  Jaipur: 1.02,
  default: 1.0,
};

const FINISH_MULTIPLIERS: Record<string, number> = {
  italian_marble: 2.2,
  hardwood: 1.8,
  stone_cladding: 1.6,
  vitrified_tile: 1.2,
  ceramic_tile: 1.0,
  plaster_paint: 0.8,
  wallpaper: 1.4,
  teak_paneling: 2.0,
  bare_concrete: 0.6,
};

const BASE_RATE_PER_SQFT = 1800; // ₹ per sqft base material cost
const LABOUR_COEFFICIENT = 0.40;
const OVERHEAD_RATE = 0.12;

function totalAreaSqft(design: Design): number {
  let total = 0;
  for (const floor of design.floors) {
    for (const room of floor.rooms) {
      total += room.areaSqft ?? estimateRoomArea(room.polygon);
    }
  }
  return total || (design.plot?.totalArea ?? 1000);
}

function estimateRoomArea(polygon: Array<{ x: number; y: number }>): number {
  if (polygon.length < 3) return 100;
  // Shoelace formula — coordinates are in arbitrary units, assume 1 unit = 0.1 sqft
  let area = 0;
  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    area += polygon[i].x * polygon[j].y;
    area -= polygon[j].x * polygon[i].y;
  }
  return Math.abs(area) / 2 / 100;
}

function averageFinishMultiplier(design: Design): number {
  const multipliers: number[] = [];
  for (const floor of design.floors) {
    for (const room of floor.rooms) {
      const f = room.finishes;
      if (f.floor && FINISH_MULTIPLIERS[f.floor]) multipliers.push(FINISH_MULTIPLIERS[f.floor]);
      if (f.walls && FINISH_MULTIPLIERS[f.walls]) multipliers.push(FINISH_MULTIPLIERS[f.walls]);
    }
  }
  if (multipliers.length === 0) return 1.0;
  return multipliers.reduce((a, b) => a + b, 0) / multipliers.length;
}

export async function registerEstimateRoutes(app: FastifyInstance) {
  /**
   * POST /v1/designs/:id/estimate
   *
   * Deterministic mock estimate:
   *   materials = totalArea × ₹1800/sqft × finishMultiplier
   *   fixtures  = count × 15000 (average fixture rate)
   *   labour    = 0.40 × (materials + fixtures)
   *   regional  = city multiplier
   *   overhead  = 12%
   */
  app.post('/v1/designs/:id/estimate', async (request, reply) => {
    const user = getUserFromRequest(app, request.headers.authorization);
    if (!user) return reply.status(401).send({ error: 'Unauthorised' });

    const { id } = request.params as { id: string };
    const design = db.designs.find((d) => d.id === id && d.userId === user.id);
    if (!design) return reply.status(404).send({ error: 'Design not found' });

    const areaSqft = totalAreaSqft(design);
    const finishMult = averageFinishMultiplier(design);
    const city = design.location?.city ?? 'default';
    const regionalMultiplier = REGIONAL_MULTIPLIERS[city] ?? REGIONAL_MULTIPLIERS.default;

    const fixtureCount = design.floors.reduce(
      (acc, floor) => acc + floor.rooms.reduce((ra, room) => ra + room.fixtures.length, 0),
      0,
    );

    const materialsBase = Math.round(areaSqft * BASE_RATE_PER_SQFT * finishMult);
    const fixturesTotal = fixtureCount * 15000;
    const materialsSubtotal = materialsBase + fixturesTotal;
    const labour = Math.round(LABOUR_COEFFICIENT * materialsSubtotal);
    const preRegional = materialsSubtotal + labour;
    const overhead = Math.round(preRegional * OVERHEAD_RATE);
    const grandTotal = Math.round((preRegional + overhead) * regionalMultiplier);

    const breakdown: EstimateCategoryBreakdown[] = [
      {
        category: 'Structural & Civil',
        items: [
          {
            sku: 'MAT-CEMENT-OPC53',
            name: 'Cement & Concrete',
            quantity: Math.round(areaSqft * 0.4),
            unit: 'sqft',
            rate: 180,
            total: Math.round(areaSqft * 0.4 * 180),
          },
          {
            sku: 'MAT-STEEL-TMT-FE500D',
            name: 'TMT Steel Reinforcement',
            quantity: Math.round(areaSqft * 4),
            unit: 'kg',
            rate: 72,
            total: Math.round(areaSqft * 4 * 72),
          },
          {
            sku: 'MAT-BRICK-RED-STD',
            name: 'Brickwork & Masonry',
            quantity: Math.round(areaSqft * 0.3),
            unit: 'sqft',
            rate: 220,
            total: Math.round(areaSqft * 0.3 * 220),
          },
        ],
        subtotal: Math.round(areaSqft * (180 * 0.4 + 72 * 4 + 220 * 0.3)),
      },
      {
        category: 'Flooring & Tiling',
        items: [
          {
            sku: design.floors[0]?.rooms[0]?.finishes?.floor ?? 'MAT-TILE-VITRIFIED-600',
            name: 'Floor Finish',
            quantity: areaSqft,
            unit: 'sqft',
            rate: Math.round(BASE_RATE_PER_SQFT * finishMult * 0.25),
            total: Math.round(areaSqft * BASE_RATE_PER_SQFT * finishMult * 0.25),
          },
        ],
        subtotal: Math.round(areaSqft * BASE_RATE_PER_SQFT * finishMult * 0.25),
      },
      {
        category: 'Fixtures & Fittings',
        items: fixtureCount > 0 ? [
          {
            sku: 'FIX-PKG',
            name: 'Doors, Windows & Fixtures',
            quantity: fixtureCount,
            unit: 'unit',
            rate: 15000,
            total: fixturesTotal,
          },
        ] : [
          {
            sku: 'FIX-DOOR-TEAK-STD',
            name: 'Standard Doors & Windows Package',
            quantity: design.floors.length * 2,
            unit: 'unit',
            rate: 14000,
            total: design.floors.length * 2 * 14000,
          },
        ],
        subtotal: fixtureCount > 0 ? fixturesTotal : design.floors.length * 2 * 14000,
      },
    ];

    const estimate = {
      id: randomUUID(),
      designId: design.id,
      rateCardVersionId: 'rcv_mock_v1',
      location: design.location,
      breakdown,
      totals: {
        materials: materialsBase,
        fixtures: fixturesTotal,
        materialsSubtotal,
        labour,
        labourRate: LABOUR_COEFFICIENT,
        regionalMultiplier,
        overhead,
        overheadRate: OVERHEAD_RATE,
        grandTotal,
        currency: 'INR' as const,
        confidenceBand: { low: -0.12, high: 0.12 },
      },
      createdAt: new Date().toISOString(),
    };

    return reply.status(201).send({ data: estimate });
  });
}
