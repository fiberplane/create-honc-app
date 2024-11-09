import { createMiddleware } from "hono/factory";

export const authenticationMiddleware = createMiddleware(async (c, next) => {


    const authHeader = c.req.header("X-Custom-Auth");
    if (!authHeader || !authHeader.startsWith("Basic ")) {
        return c.text("Unauthorized", 401);
    }
    
    const base64Credentials = authHeader.split(" ")[1];
    const credentials = Buffer.from(base64Credentials, "base64").toString("ascii");
    const [username, password] = credentials.split(":");
    

     const validUsername = c.env.USER;
     const validPassword = c.env.PASSWORD;
    
    if (username !== validUsername || password !== validPassword) {
        return c.text("Unauthorized", 401);
    }
    
    await next();
});

