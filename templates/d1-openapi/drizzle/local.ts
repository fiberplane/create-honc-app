import crypto from "node:crypto";
import fs from "node:fs";
import { unstable_readConfig } from "wrangler";

/**
 * Finds the path to the local D1 database inside the `.wrangler` directory.
 * @returns Path to local D1 database
 */
export function getLocalD1DbPath() {
  const { d1_databases } = unstable_readConfig({});
  if (d1_databases.length > 1) {
    throw new Error('Could not resolve local D1 DB path: Multiple DBs found.');
  }

  const databaseName = d1_databases.at(0)?.database_id;

  if (!databaseName) {
    throw new Error('Could not resolve local D1 DB path: No local D1 DB found.\nTry running `npm run db:touch` to create one.');
  }

  const uniqueKey = "miniflare-D1DatabaseObject";
  const dirPath = `.wrangler/state/v3/d1/${uniqueKey}`;
  const hash = databaseObjectId(uniqueKey, databaseName)
  const path = `${dirPath}/${hash}.sqlite`;

  if (!fs.existsSync(path)) {
    throw new Error('Could not resolve local D1 DB path: No local D1 DB found.\nTry running `npm run db:touch` to create one.');
  }

  return path;
}

/**
 * In v3.2, miniflare uses durable object to implement D1 and hashes the local sqlite filename.
 * @see https://github.com/cloudflare/miniflare/releases/tag/v3.20230918.0
 * @see https://github.com/cloudflare/workers-sdk/issues/4548
 * @param uniqueKey 
 * @param name 
 * @returns 
 */
function databaseObjectId(uniqueKey: string, name: string) {
	const key = crypto.createHash("sha256").update(uniqueKey).digest();

  const nameHmac = crypto.createHmac("sha256", key).update(name).digest().subarray(0, 16);
	const hmac = crypto.createHmac("sha256", key).update(nameHmac).digest().subarray(0, 16);

	return Buffer.concat([nameHmac, hmac]).toString("hex");
}
