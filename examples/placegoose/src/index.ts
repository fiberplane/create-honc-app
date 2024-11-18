import { Hono } from "hono";
import { instrument } from "@fiberplane/hono-otel";
import * as routes from "./routes";

const app = new Hono();

app.route("/gaggles", routes.gaggles);
  
app.route("/geese", routes.geese);

app.route("/honks", routes.honks);

export default instrument(app);