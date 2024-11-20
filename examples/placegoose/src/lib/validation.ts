import type { Context } from "hono";
import type { z } from "zod";

export function makeBodyValidator<S extends z.AnyZodObject>(schema: S) {
  return (body: unknown, c: Context) => {
    try {
      const data: S["_output"] = schema.parse(body);
      return data;
    } catch (error) {
      console.error(error);

      //   if (error instanceof z.ZodError) {

      //   }

      return c.json(
        {
          code: "INVALID_PAYLOAD",
          message: "",
        },
        400,
      );
    }
  };
}

export function validateIdParam(params: Record<string, string>, c: Context) {
  const idParam = params.id;

  if (!idParam) {
    return c.json(
      {
        code: "INVALID_ID",
        message: `The 'id' parameter is required: ${c.req.path}`,
      },
      400,
    );
  }

  if (!/^[1-9]\d*$/.test(idParam)) {
    return c.json(
      {
        code: "INVALID_ID",
        message: `The 'id' parameter must be a positive integer > 0`,
      },
      400,
    );
  }

  return { id: Number(idParam) };
}
