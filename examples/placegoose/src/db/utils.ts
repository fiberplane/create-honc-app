import fs from "node:fs";
import path from "node:path";
import { KnownError } from "../lib/errors";

export function getLocalD1DBPath() {
  try {
    const basePath = path.resolve(".wrangler");

    const files = fs
      .readdirSync(basePath, {
        encoding: "utf-8",
        recursive: true,
      })
      .filter((fileName) => fileName.endsWith(".sqlite"));

    // Retrieve most recent .sqlite file
    files.sort((a, b) => {
      const statA = fs.statSync(path.join(basePath, a));
      const statB = fs.statSync(path.join(basePath, b));

      return statB.mtime.getTime() - statA.mtime.getTime();
    });

    const dbFile = files.at(0);

    if (!dbFile) {
      throw new KnownError(`.sqlite file not found at ${basePath}`);
    }

    return path.resolve(basePath, dbFile);
  } catch (error) {
    const message = error instanceof Error ? error.message : error;

    console.error(`Error resolving local D1 DB: ${message}`);
  }
}
