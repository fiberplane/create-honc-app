import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { instrument } from '@fiberplane/hono-otel';
import * as schema from "./db/schema";
import { eq } from 'drizzle-orm';

type Bindings = {
  DB: D1Database;
};

const app = new Hono();

const gagglesApp = new Hono<{ Bindings: Bindings }>();

// Get all Gaggles
gagglesApp.get('/', async (c) => {
  const db = drizzle(c.env.DB);
  const gaggles = await db
    .select()
    .from(schema.gaggles);

  return c.json(gaggles);
});

// Create a new Gaggle
gagglesApp.post('/', async (c) => {
  const { id, name } = await c.req.parseBody();
  // todo: validate, check, generate id if omitted?

  const newGaggle: schema.Gaggle = {
    id,
    name,
  };

  return c.json(newGaggle);
});
  
// Get a specific Gaggle by id
gagglesApp.get('/:id', async (c) => {
  const id = c.req.query("id");
  // todo: validate

  const db = drizzle(c.env.DB);
  const gagglesById = await db
    .select()
    .from(schema.gaggles)
    .where(eq(schema.gaggles.id, id));

  if (gagglesById.length !== 0) {
    // todo: handle db error/invalid param
  };

  return c.json(gagglesById[0]);
});
  
// Get Geese in the Gaggle specified by id
gagglesApp.get('/:id/geese', async (c) => {
  const id = c.req.query("id");
  // todo: validate, parse

  const db = drizzle(c.env.DB);
  const geeseByGaggleId = await db
    .select()
    .from(schema.geese)
    .where(eq(schema.geese.gaggleId, id));

  // todo: what if none/invalid id?
  return c.json(geeseByGaggleId);
})

// Update Gaggle specified by id
gagglesApp.put('/:id', async (c) => {
  const id = c.req.query("id");
  const { name } = await c.req.parseBody();
  // todo: validate, confirm id is valid

  const updatedGaggle: schema.Gaggle = {
    id,
    name,
  };

  return c.json(updatedGaggle);
});

// Delete Gaggle specified by id
gagglesApp.delete('/:id', async (c) => {
  const id = c.req.query("id");
  // todo: confirm id is valid

  return c.json({});
});

app.route('/gaggles', gagglesApp);

  
const geeseApp = new Hono<{ Bindings: Bindings }>();

// Get all Geese
geeseApp.get('/', async (c) => {
  const db = drizzle(c.env.DB);
  const geese = await db
    .select()
    .from(schema.geese);

  return c.json(geese);
});

// Get Goose by specified id
geeseApp.get('/:id', async (c) => {
  const id = c.req.query("id");
  // todo: validate

  const db = drizzle(c.env.DB);
  const geeseById = await db
    .select()
    .from(schema.geese)
    .where(eq(schema.geese.id, id));

  if (geeseById.length !== 0) {
    // todo: handle
  }

  return c.json(geeseById[0]);
})

geeseApp.get('/:id/honks', async (c) => {
  const id = c.req.query("id");
  // todo: validate, verify id?

  const db = drizzle(c.env.DB);
  const honksByGooseId = await db
    .select()
    .from(schema.honks)
    .where(eq(schema.honks.id, id));

  return c.json(honksByGooseId);
});
  
app.route('/geese', geeseApp);


const honksApp = new Hono<{ Bindings: Bindings }>();

// Get all Honks (or just those from Goose specified by gooseId)
honksApp.get('/', async (c) => {
  const gooseId = c.req.query("gooseId");
  // todo: validate, verify id?

  const db = drizzle(c.env.DB);
  const honks = await db
    .select()
    .from(schema.honks)
    .where(eq(schema.honks.gooseId, gooseId)); // conditional

  return c.json(honks);
});

// Create a new Honk
honksApp.post('/', async (c) => {
  const { id, gooseId } = await c.req.parseBody();
  // todo: validate, gen id?

  const newHonk: schema.Honk = {
    id,
    gooseId,
  };

  return c.json(newHonk);
});

// Get a Honk by specified id
honksApp.get('/:id', async (c) => {
  const id = c.req.query("gooseId");
  // todo: validate

  const db = drizzle(c.env.DB);
  const honksById = await db
    .select()
    .from(schema.honks)
    .where(eq(schema.honks.id, id));

  if (honksById.length !== 0) {
    // handle
  };

  return c.json(honksById[0]);
});

// Modify Honk with specified id
honksApp.patch('/:id', async (c) => {
  const id = c.req.query("gooseId");
  const { gooseId } = await c.req.parseBody();
  // todo: validate, consolidate?

  const updatedHonk: schema.Honk = {
    id,
    gooseId,
  };

  return c.json(updatedHonk);
});

honksApp.put('/:id', async (c) => {
  const id = c.req.query("gooseId");
  const { gooseId } = await c.req.parseBody();
  // todo: validate, consolidate?

  const updatedHonk: schema.Honk = {
    id,
    gooseId,
  };

  return c.json(updatedHonk);
})

honksApp.delete('/:id', (c) => {
  const id = c.req.query("gooseId");
  // todo: validate id
  // todo: what to return here?
  return c.json({});
});

app.route('/honks', honksApp);


export default instrument(app);