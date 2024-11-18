import type { HonoRequest } from "hono";
import { z } from "zod";
import { RequestError } from "./lib/errors";

function getNumberBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// todo: params
export function generateId() {
    return getNumberBetween(50, 100);
};

export function parseId(value: string) {
  const maybeId = Number(value);

  if (!value || isNaN(maybeId)) {
    throw new RequestError("Invalid Id", { statusCode: 400 });
  }
  return maybeId;
};

export async function parseBody<S extends z.AnyZodObject>(
    req: HonoRequest, 
    schema: S
  ): Promise<S["_output"]> {
    const body = await req.json();
    const result = schema.safeParse(body);

    if (result.success) return result.data;
    throw new RequestError("Invalid Payload", { statusCode: 400 });
  }