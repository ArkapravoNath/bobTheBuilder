import { z } from 'zod';

// ── Enums ─────────────────────────────────────────────────────────────────────

export const ArchetypeSchema = z.enum([
  'single_room',
  'partial_home',
  'full_house',
  'mansion',
]);

export const RoomTypeSchema = z.enum([
  'bedroom',
  'bathroom',
  'kitchen',
  'living',
  'dining',
  'utility',
  'garage',
  'balcony',
  'custom',
]);

export const FixtureKindSchema = z.enum(['door', 'window', 'stairs', 'storage']);

export const DoorStyleSchema = z.enum(['standard', 'sliding', 'double']);

export const WindowStyleSchema = z.enum(['standard', 'bay', 'french']);

export const FloorFinishSchema = z.enum([
  'vitrified_tile',
  'italian_marble',
  'ceramic_tile',
  'hardwood',
  'laminate',
  'granite',
  'bare_concrete',
]);

export const WallFinishSchema = z.enum([
  'plaster_paint',
  'teak_paneling',
  'wallpaper',
  'exposed_brick',
  'stone_cladding',
]);

export const RateItemCategorySchema = z.enum(['material', 'fixture', 'labour']);

export const DesignStatusSchema = z.enum(['draft', 'saved', 'shared', 'archived']);

// ── Sub-schemas ───────────────────────────────────────────────────────────────

export const LocationSchema = z.object({
  city: z.string().min(1),
  postcode: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export const PlotSchema = z.object({
  width: z.number().positive().optional(),
  depth: z.number().positive().optional(),
  unit: z.enum(['sqft', 'sqm']).default('sqft'),
  totalArea: z.number().positive().optional(),
});

export const FinishesSchema = z.object({
  floor: FloorFinishSchema.optional(),
  walls: WallFinishSchema.optional(),
  ceiling: z.string().optional(),
  doorStyle: DoorStyleSchema.optional(),
  paint: z.string().optional(),
});

export const FixtureSpecSchema = z.object({
  width: z.number().positive(),
  height: z.number().positive(),
  style: z.union([DoorStyleSchema, WindowStyleSchema]).optional(),
  glazing: z.string().optional(),
});

export const FixtureSchema = z.object({
  id: z.string().uuid(),
  kind: FixtureKindSchema,
  spec: FixtureSpecSchema,
  wallAnchor: z
    .object({
      roomId: z.string().uuid(),
      wallIndex: z.number().int().min(0),
      positionAlongWall: z.number().min(0).max(1),
    })
    .optional(),
});

export const PointSchema = z.object({ x: z.number(), y: z.number() });

export const RoomSchema = z.object({
  id: z.string().uuid(),
  type: RoomTypeSchema,
  label: z.string().optional(),
  polygon: z.array(PointSchema).min(4),
  ceilingHeight: z.number().positive().default(9),
  finishes: FinishesSchema.default({}),
  fixtures: z.array(FixtureSchema).default([]),
  areaSqft: z.number().positive().optional(),
});

export const FloorSchema = z.object({
  index: z.number().int().min(0),
  label: z.string().optional(),
  heightFt: z.number().positive().default(10),
  rooms: z.array(RoomSchema).default([]),
  stairs: z.array(FixtureSchema).default([]),
});

export const DesignSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  name: z.string().min(1).default('Untitled Design'),
  archetype: ArchetypeSchema,
  status: DesignStatusSchema.default('draft'),
  location: LocationSchema,
  plot: PlotSchema.default({}),
  floors: z.array(FloorSchema).min(1).default([{ index: 0, rooms: [], stairs: [] }]),
  schemaVersion: z.string().default('1.0.0'),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// ── Rate Card ─────────────────────────────────────────────────────────────────

export const RateItemSchema = z.object({
  id: z.string().uuid(),
  rateCardVersionId: z.string(),
  category: RateItemCategorySchema,
  sku: z.string().min(1),
  name: z.string().min(1),
  unit: z.string().min(1),
  baseRate: z.number().positive(),
  currency: z.literal('INR').default('INR'),
  meta: z.record(z.string()).optional(),
});

export const RegionalMultiplierSchema = z.object({
  id: z.string().uuid(),
  rateCardVersionId: z.string(),
  city: z.string().min(1),
  tier: z.enum(['tier1', 'tier2', 'tier3']),
  multiplier: z.number().positive(),
  effectiveFrom: z.string().datetime().optional(),
  effectiveTo: z.string().datetime().optional(),
});

// ── Estimate ──────────────────────────────────────────────────────────────────

export const EstimateCategoryBreakdownSchema = z.object({
  category: z.string(),
  items: z.array(
    z.object({
      sku: z.string(),
      name: z.string(),
      quantity: z.number(),
      unit: z.string(),
      rate: z.number(),
      total: z.number(),
    }),
  ),
  subtotal: z.number(),
});

export const EstimateSchema = z.object({
  id: z.string().uuid(),
  designId: z.string().uuid(),
  rateCardVersionId: z.string(),
  location: LocationSchema,
  breakdown: z.array(EstimateCategoryBreakdownSchema),
  totals: z.object({
    materials: z.number(),
    fixtures: z.number(),
    materialsSubtotal: z.number(),
    labour: z.number(),
    labourRate: z.number().describe('Labour coefficient, e.g. 0.40'),
    regionalMultiplier: z.number(),
    overhead: z.number(),
    overheadRate: z.number(),
    grandTotal: z.number(),
    currency: z.literal('INR').default('INR'),
    confidenceBand: z
      .object({ low: z.number(), high: z.number() })
      .default({ low: -0.12, high: 0.12 }),
  }),
  createdAt: z.string().datetime().optional(),
});

// ── Auth ──────────────────────────────────────────────────────────────────────

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string().optional(),
  role: z.enum(['user', 'admin']).default('user'),
  onboardingComplete: z.boolean().default(false),
  archetype: ArchetypeSchema.optional(),
  location: LocationSchema.optional(),
  plot: PlotSchema.optional(),
  budgetHint: z.number().positive().optional(),
  createdAt: z.string().datetime().optional(),
});

export const SessionSchema = z.object({
  token: z.string(),
  user: UserSchema,
  expiresAt: z.string().datetime(),
});

// ── Request/Response shapes ────────────────────────────────────────────────────

export const OnboardingPatchSchema = z.object({
  archetype: ArchetypeSchema.optional(),
  location: LocationSchema.optional(),
  plot: PlotSchema.optional(),
  budgetHint: z.number().positive().optional(),
  onboardingComplete: z.boolean().optional(),
});

// ── Type exports ──────────────────────────────────────────────────────────────

export type Archetype = z.infer<typeof ArchetypeSchema>;
export type RoomType = z.infer<typeof RoomTypeSchema>;
export type FixtureKind = z.infer<typeof FixtureKindSchema>;
export type Location = z.infer<typeof LocationSchema>;
export type Plot = z.infer<typeof PlotSchema>;
export type Finishes = z.infer<typeof FinishesSchema>;
export type Fixture = z.infer<typeof FixtureSchema>;
export type Room = z.infer<typeof RoomSchema>;
export type Floor = z.infer<typeof FloorSchema>;
export type Design = z.infer<typeof DesignSchema>;
export type RateItem = z.infer<typeof RateItemSchema>;
export type RegionalMultiplier = z.infer<typeof RegionalMultiplierSchema>;
export type Estimate = z.infer<typeof EstimateSchema>;
export type EstimateCategoryBreakdown = z.infer<typeof EstimateCategoryBreakdownSchema>;
export type User = z.infer<typeof UserSchema>;
export type Session = z.infer<typeof SessionSchema>;
export type OnboardingPatch = z.infer<typeof OnboardingPatchSchema>;
