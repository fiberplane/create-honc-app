import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import "zod-openapi/extend";
import * as schema from "../db/schema";

export const ZUserInsert = createInsertSchema(schema.users, {
  name: (schema) =>
    schema.openapi({
      example: "Goose McCloud",
    }),
  email: (schema) =>
    schema.email().openapi({
      example: "goose@honc.dev",
    }),
})
  .pick({
    name: true,
    email: true,
  })
  .openapi({
    ref: "UserInsert",
  });

export const ZUserSelect = createSelectSchema(schema.users, {
  id: (schema) =>
    schema.uuid().openapi({
      example: "3e0bb3d0-2074-4a1e-6263-d13dd10cb0cf",
    }),
  name: (schema) =>
    schema.openapi({
      example: "Goose McCloud",
    }),
  email: (schema) =>
    schema.email().openapi({
      example: "goose@honc.dev",
    }),
  createdAt: (schema) =>
    schema.openapi({
      example: "2026-03-29T11:22:48.462Z",
    }),
  updatedAt: (schema) =>
    schema.openapi({
      example: "2026-03-29T11:22:48.462Z",
    }),
}).openapi({
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
