import fs from "node:fs";
import path from "node:path";
import { ServiceError } from "../lib/errors";

/**
 * @returns Path to most recent .sqlite file in the .wrangler directory
 */
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
      throw new ServiceError(`No .sqlite file found at ${basePath}`);
    }

    return path.resolve(basePath, dbFile);
  } catch (error) {
    if (error instanceof ServiceError) {
      throw error;
    }

    if (error instanceof Error) {
      throw new ServiceError(`Error resolving local D1 DB: ${error.message}`, {
        cause: error,
      });
    }

    throw new ServiceError("Error resolving local D1 DB", { cause: error });
  }
}
