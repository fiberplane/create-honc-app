import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";

/**
 * @returns Validation fn for Hono body validator, responsible
 * for processing payload errors
 */
export function makeBodyValidator<T extends Record<string, unknown>>(
  parse: (data: unknown) => T,
) {
  return (body: unknown) => {
    try {
      // Return value must be consistent with shape of "body"
      // Available through Context.req.valid
      return parse(body);
    } catch (error) {
      console.error(error);

      // todo

      throw new HTTPException(400, {
        message: "Invalid Payload",
        cause: error,
      });
    }
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
