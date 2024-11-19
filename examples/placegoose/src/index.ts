import { Hono } from "hono";
import { instrument } from "@fiberplane/hono-otel";
import * as routes from "./routes";
import { DrizzleError } from "drizzle-orm";
import { KnownError, NotFoundError, RequestError } from "./lib/errors";

const app = new Hono();

app.route("/gaggles", routes.gaggles);
  
app.route("/geese", routes.geese);

app.route("/honks", routes.honks);

app.onError((error, c) => {
    console.error(error);

    if (error instanceof DrizzleError) {
        return c.text(error.message, 500);
    }

    if (error instanceof NotFoundError) {
        return c.text(error.message, error.statusCode);
    }

    if (error instanceof RequestError) {
        return c.text(error.message, error.statusCode);
    }

    if (error instanceof KnownError) {
        return c.text(error.message, 500);
    }

    return c.text("Something went wrong", 500);
})

export default instrument(app);