import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';
import fs from "node:fs";
import path from "node:path";

config({ path: './.dev.vars' })
const localD1 = getLocalD1DB();
if(!localD1){
  process.exit(1);
}



export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: localD1,
  }
})


function getLocalD1DB() {
  try{
    const basePath = path.resolve(".wrangler");
    const files = fs
    .readdirSync(basePath, { encoding: "utf-8", recursive: true })
    .filter((f) => f.endsWith(".sqlite"));

     // In case there are multiple .sqlite files, we want the most recent one.
     files.sort((a, b) => {
      const statA = fs.statSync(path.join(basePath, a));
      const statB = fs.statSync(path.join(basePath, b));
      return statB.mtime.getTime() - statA.mtime.getTime();
    });
    const dbFile = files[0];


    if (!dbFile) {
      throw new Error(`.sqlite file not found in ${basePath}`);
    }

    const url = path.resolve(basePath, dbFile);

    return url;
  }catch (err){
    if (err instanceof Error) {
      console.log(`Error resolving local D1 DB: ${err.message}`);
    } else {
      console.log(`Error resolving local D1 DB: ${err}`);
    }

  }
}
