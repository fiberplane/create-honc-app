import { createMiddleware } from "hono/factory";


export const validateInputMiddleware = createMiddleware(async (c, next) => {

    try{
        const {name, email, githubHandle} = await c.req.json();
        if (typeof name !== 'string' || typeof email !== 'string' || typeof githubHandle !== 'string') {
            return c.json({ error: 'Invalid input values' }, 400);
          }
          await next();
    }
    catch (error) {
        return c.json({ error: `Invalid request body${error}`}, 400);
      }
  
 });

export default validateInputMiddleware;


