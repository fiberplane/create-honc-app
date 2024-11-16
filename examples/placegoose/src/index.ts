import { Context, Hono, HonoRequest } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { instrument } from "@fiberplane/hono-otel";
import * as schema from "./db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

type Bindings = {
  DB: D1Database;
};

const generateId = () => 1;

const parseId = (req: HonoRequest, key: string = "id") => {
  const value = req.query(key);

  const maybeId = Number(value);
  if (!value || isNaN(maybeId)) {
    // todo
    throw new Error();
  }
  return maybeId;
};

const parseBody = async <S extends z.AnyZodObject>(
  req: HonoRequest, 
  schema: S
): Promise<S["_output"]> => {
  const body = await req.parseBody();
  return schema.parse(body);
}

const app = new Hono();

const gagglesApp = new Hono<{ Bindings: Bindings }>();

const ZNumberId = z.coerce.number();

const ZGaggleData = z.object({
  name: z.string().min(1)
})

const getGaggleById = async (c: Context, id: number) => {
  const db = drizzle(c.env.DB);
  const gagglesById = await db
    .select()
    .from(schema.gaggles)
    .where(eq(schema.gaggles.id, id));

  if (gagglesById.length > 1) {
    // todo
    throw new Error();
  };

  return gagglesById.at(0);
}

// Get all Gaggles
gagglesApp.get("/", async (c) => {
  const db = drizzle(c.env.DB);
  const gaggles = await db
    .select()
    .from(schema.gaggles);

  return c.json(gaggles);
});

// Create a new Gaggle
gagglesApp.post("/", async (c) => {
  const { name } = await parseBody(c.req, ZGaggleData)

  const newGaggle: schema.Gaggle = {
    id: generateId(),
    name,
  };

  return c.json(newGaggle);
});
  
// Get a specific Gaggle by id
gagglesApp.get("/:id", async (c) => {
  const id = parseId(c.req);

  const gaggleById = await getGaggleById(c, id);

  if (!gaggleById) {
    // todo: 404
    throw new Error();
  }

  return c.json(gaggleById);
});
  
// Get Geese in the Gaggle specified by id
gagglesApp.get("/:id/geese", async (c) => {
  const id = parseId(c.req);

  // todo: redundant client?
  const gaggleById = await getGaggleById(c, id);

  if (!gaggleById) {
    // todo: 404
    throw new Error();
  }

  const db = drizzle(c.env.DB);
  const geeseByGaggleId = await db
    .select()
    .from(schema.geese)
    .where(eq(schema.geese.gaggleId, id));

  return c.json(geeseByGaggleId);
})

// Update Gaggle specified by id
gagglesApp.put("/:id", async (c) => {
  const id = parseId(c.req);
  const gaggleData = await parseBody(c.req, ZGaggleData);
  
  const gaggleById = await getGaggleById(c, id);

  if (!gaggleById) {
    // todo: 404
    throw new Error();
  }

  const updatedGaggle: schema.Gaggle = {
    ...gaggleById,
    ...gaggleData,
  };

  return c.json(updatedGaggle);
});

// Delete Gaggle specified by id
gagglesApp.delete("/:id", async (c) => {
  const id = parseId(c.req);
  
  const gaggleById = await getGaggleById(c, id);

  if (!gaggleById) {
    // todo: 404
    throw new Error();
  }

  return c.json({}, 204);
});

app.route("/gaggles", gagglesApp);

  
const geeseApp = new Hono<{ Bindings: Bindings }>();

const getGooseById = async (c: Context, id: number) => {
  const db = drizzle(c.env.DB);
  const geeseById = await db
    .select()
    .from(schema.geese)
    .where(eq(schema.geese.id, id));

  if (geeseById.length > 0) {
    // todo
    throw new Error();
  };

  return geeseById.at(0);
}

// Get all Geese
geeseApp.get("/", async (c) => {
  const db = drizzle(c.env.DB);
  const geese = await db
    .select()
    .from(schema.geese);

  return c.json(geese);
});

// Get Goose by specified id
geeseApp.get("/:id", async (c) => {
  const id = parseId(c.req);

  const gooseById = await getGooseById(c, id);

  if (!gooseById) {
    // todo: 404
    throw new Error();
  }

  return c.json(gooseById);
});

geeseApp.get("/:id/honks", async (c) => {
  const id = parseId(c.req);
  
  const gooseById = await getGooseById(c, id);

  if (!gooseById) {
    // todo: 404
    throw new Error();
  }

  const db = drizzle(c.env.DB);
  const honksByGooseId = await db
    .select()
    .from(schema.honks)
    .where(eq(schema.honks.gooseId, id));

  return c.json(honksByGooseId);
});
  
app.route("/geese", geeseApp);


const honksApp = new Hono<{ Bindings: Bindings }>();

const getHonkById = async (c: Context, id: number) => {
  const db = drizzle(c.env.DB);
  const honksById = await db
    .select()
    .from(schema.honks)
    .where(eq(schema.honks.id, id));

  if (honksById.length > 0) {
    // todo
    throw new Error();
  };

  return honksById.at(0);
}

// Get all Honks (or just those from Goose specified by gooseId)
honksApp.get("/", async (c) => {
  // todo: optional
  const gooseId = parseId(c.req, "gooseId");

  const db = drizzle(c.env.DB);

  const honks = await db
    .select()
    .from(schema.honks)
    .where(eq(schema.honks.gooseId, gooseId));

  return c.json(honks);
});

// Create a new Honk
honksApp.post("/", async (c) => {
  const honkData = await parseBody(c.req, ZHonkData);

  const newHonk: schema.Honk = {
    id: generateId(),
    ...honkData,
  };

  return c.json(newHonk);
});

// Get a Honk by specified id
honksApp.get("/:id", async (c) => {
  const id = parseId(c.req);

  const honkById = await getHonkById(c, id);

  if (!honkById) {
    // todo: 404
    throw new Error();
  }
    
  return c.json(honkById);
});

// Modify Honk with specified id
honksApp.patch("/:id", async (c) => {
  const id = parseId(c.req);
  
  const {
    gooseId
  } = await parseBody(c.req, ZHonkData.partial());

  const honkById = await getHonkById(c, id);

  if (!honkById) {
    // todo: 404
    throw new Error();
  }

  const updatedHonk: schema.Honk = {
    ...honkById,
    ...(gooseId && { gooseId }),
  };

  return c.json(updatedHonk);
});

const ZHonkData = z.object({
  gooseId: ZNumberId
})

// Update the Honk with the specified id
honksApp.put("/:id", async (c) => {
  const id = parseId(c.req);

  const {
    gooseId
  } = await parseBody(c.req, ZHonkData)

  const honkById = await getHonkById(c, id);

  if (!honkById) {
    // todo: 404
    throw new Error();
  }

  const updatedHonk: schema.Honk = {
    id,
    gooseId,
  };

  return c.json(updatedHonk);
})

// Delete the Honk with the specified id
honksApp.delete("/:id", async (c) => {
  const id = parseId(c.req);
  
  const honkById = await getHonkById(c, id);

  if (!honkById) {
    // todo: 404
    throw new Error();
  }

  return c.json(null, 204);
});

app.route("/honks", honksApp);


export default instrument(app);