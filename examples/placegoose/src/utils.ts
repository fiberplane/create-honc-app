import type { HonoRequest } from "hono";
import { z } from "zod";


export function generateId() {
    return 1;
};

export function parseId(value: string) {
  const maybeId = Number(value);

  if (!value || isNaN(maybeId)) {
    // todo
    throw new Error("Invalid Id");
  }
  return maybeId;
};

export async function parseBody<S extends z.AnyZodObject>(
    req: HonoRequest, 
    schema: S
  ): Promise<S["_output"]> {
    const body = await req.json();
    console.log("body", body)
    const result = schema.safeParse(body);

    if (result.success) return result.data;
    // todo
    throw new Error("Invalid Payload");
  }