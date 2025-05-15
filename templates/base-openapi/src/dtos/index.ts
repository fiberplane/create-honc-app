import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import "zod-openapi/extend";
import * as schema from "../db/schema";

export const ZUserInsert = createInsertSchema(schema.users)
  .pick({
    name: true,
    email: true,
  })
  .openapi({
    ref: "UserInsert",
  });

export const ZUserSelect = createSelectSchema(schema.users).openapi({
  ref: "UserSelect",
});

export const ZUserByIDParams = z
  .object({
    id: z.string().uuid().openapi({
      example: "3e0bb3d0-2074-4a1e-6263-d13dd10cb0cf",
    }),
  })
  .openapi({
    ref: "UserByIdParams",
  });
