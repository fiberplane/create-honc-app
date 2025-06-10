import type { ValidationTargets } from "hono";
import { HTTPException } from "hono/http-exception";
import { validator } from "hono/validator";
import type { z } from "zod";

/**
 * A wrapper around `hono/validator` configured for Zod schemas
 * that standardizes error handling.
 * @param target The relevant Hono validation target, e.g., "json" or "query"
 * @param schema A Zod schema used to validate the selected target
 */
export const zodValidator = <
  Target extends keyof ValidationTargets,
  Schema extends z.AnyZodObject,
>(
  target: Target,
  schema: Schema,
) => {
  return validator(target, (value): Schema["_output"] => {
    const result = schema.safeParse(value);

    if (!result.success) {
      throw new HTTPException(400, {
        message: "Invalid Request",
        cause: result.error,
      });
    }

    return result.data;
  });
};
