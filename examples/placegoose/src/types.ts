/** Used to type Hono Context object, making bindings available */
export type AppType = {
  Variables: {
    rateLimit: boolean;
  };
  Bindings: {
    DB: D1Database;
    ENVIRONMENT: "production" | "development";
    RATE_LIMITER: RateLimit;
  };
};
