import type { Context } from "hono";
import type { z } from "zod";
import { RequestError } from "./errors";

export function makeBodyValidator<S extends z.AnyZodObject>(schema: S) {
  return (body: unknown) => {
    try {
      const data: S["_output"] = schema.parse(body);
      return data;
    } catch (error) {
      console.error(error);

      //   if (error instanceof z.ZodError) {

      //   }
      throw new RequestError("Invalid Payload", {
        statusCode: 400,
      });
    }
  };
}

export function validateIdParam(params: Record<string, string>, c: Context) {
  const idParam = params.id;

  if (!idParam) {
    throw new RequestError(`The 'id' parameter is required: ${c.req.path}`, {
      statusCode: 400,
    });
  }

  if (!/^[1-9]\d*$/.test(idParam)) {
    throw new RequestError(
      "The 'id' parameter must be a positive integer > 0",
      {
        statusCode: 400,
      },
    );
  }

  return { id: Number(idParam) };
}
