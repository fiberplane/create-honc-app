import type { Context } from "hono";
import type { z } from "zod";
import { ServiceError } from "./errors";

export function makeBodyValidator<S extends z.AnyZodObject>(schema: S) {
  return (body: unknown) => {
    try {
      const data: S["_output"] = schema.parse(body);
      return data;
    } catch (error) {
      console.error(error);

      //   if (error instanceof z.ZodError) {

      //   }
      throw ServiceError.invalidRequest("Invalid Payload");
    }
  };
}

export function validateId(value: string | string[]) {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    throw ServiceError.invalidRequest("ID values must be positive integers");
  }

  return Number(value);
}

export function validateIdParam(params: Record<string, string>, c: Context) {
  const idParam = params.id;

  if (!idParam) {
    throw ServiceError.invalidRequest(`The 'id' parameter is required: ${c.req.path}`);
  }

  return { id: validateId(idParam) };
}
