import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";

/**
 * @returns Validation fn for Hono body validator, responsible
 * for processing payload errors
 */
export function makeBodyValidator<T extends Zod.AnyZodObject>(schema: T) {
  return (body: unknown): T["_output"] => {
    const result = schema.safeParse(body);

    if (result.success) {
      // Return value must be consistent with shape of "body"
      // Available through Context.req.valid
      return result.data;
    }

    throw new HTTPException(400, {
      message: "Invalid Payload",
      cause: result.error,
    });
  };
}

/**
 * Verify that query or param value is valid id, and
 * coerce to number. Throws if id is missing or invalid
 * @returns Valid number id
 */
export function validateId(value: string | string[]) {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    throw new HTTPException(400, {
      message: "ID values must be positive integers",
    });
  }

  return Number.parseInt(value);
}

/**
 * Validation fn for hono param validator. Throws if id is missing
 * or invalid
 * @returns Any validated params, available through Context.req.valid
 */
export function validateIdParam(params: Record<string, string>, c: Context) {
  const idParam = params.id;

  if (!idParam) {
    throw new HTTPException(400, {
      message: `The 'id' parameter is required: ${c.req.path}`,
    });
  }

  // Return value must be consistent with shape of "params"
  return { id: validateId(idParam) };
}

/**
 * Checks error name as a simple alternative to an instanceof,
 * as Zod is not a direct project dependency
 */
export function isZodError(error: Error): error is Zod.ZodError {
  return error.name === "ZodError";
}

/**
 * @returns Record of field paths with arrays of field-specific error messages
 */
export function formatZodError(zodError: Zod.ZodError) {
  return zodError.issues.reduce(
    (result: Record<string, string[]>, { path, message }) => {
      const dotPath = path.join(".");

      /**
       * This implementation will break if any validation targets have
       * nested data. In that case, consider using Lodash.get, or alternative
       * @see https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore?tab=readme-ov-file#_get
       */
      if (result[dotPath]) {
        result[dotPath].push(message);
      } else {
        result[dotPath] = [message];
      }

      return result;
    },
    {},
  );
}
