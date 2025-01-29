Optimize for Cloudflare Worker's edge computing environment. 
Do not rely on persistent application state across requests.

We have enabled limited compatibility with Node.js, but not all Node APIs are guaranteed to work.

DO NOT use Node.js filesystem APIs (`fs`, `fsSync`, `fsPromises`, etc.) as we do not have access to the filesystem in a Cloudflare Worker.

> TODO - Document available Node APIs
