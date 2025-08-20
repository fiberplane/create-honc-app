import type { AsyncBatchRemoteCallback, AsyncRemoteCallback } from "drizzle-orm/sqlite-proxy";

/**
 * Creates a connection to a remote Cloudflare D1 database using the sqlite-proxy driver.
 * @param accountId - Cloudflare account ID
 * @param databaseId - D1 database ID
 * @param apiToken - Cloudflare API token with write access to D1
 * @returns Single and Batch async query functions
 */
export const createProxyCallbacks = ({
  accountId,
  databaseId,
  apiToken,
}: {
  accountId: string;
  databaseId: string;
  apiToken: string;
}): {
  /**
   * Asynchronously axecutes a single query against the Cloudflare D1 HTTP API.
   * @param {string} sql - The SQL statement to execute
   * @param {unknown[]} params - Parameters for the SQL statement
   * @param {string} method - The method type for the SQL operation
   * @returns {Promise<{ rows: unknown[][] }>} The result rows from the query
   * @throws {Error} If the HTTP request fails or returns an error
   * @see https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/query/
   */
  httpQueryD1: AsyncRemoteCallback;
  /**
   * Asynchronously executes a batch of queries.
   */
  httpBatchQueryD1: AsyncBatchRemoteCallback;
} => {

  const httpQueryD1: AsyncRemoteCallback = async (sql, params, method) => {
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql, params, method }),
    });

    const dbResponse: {
      errors?: { code: number; message: string; }[];
      messages?: { code: number; message: string; }[];
      result?: { results: unknown[]; success: boolean; }[];
      success?: boolean;
    } = await response.json();

    if (response.status !== 200) {
      throw new Error(
        `Query Request Failed: ${response.status} ${response.statusText}`,
        { cause: response },
      );
    }

    if (dbResponse.errors?.length || !dbResponse.success) {
      throw new Error(
        `Query Failed: \n${JSON.stringify(dbResponse)}}`,
        { cause: dbResponse },
      );
    }

    const queryResult = dbResponse?.result?.at(0);
    if (!queryResult?.success) {
      throw new Error(
        `Query Failed: \n${JSON.stringify(dbResponse)}`,
        { cause: queryResult },
      );
    }

    const rows = queryResult.results.map((row) => {
      if (row instanceof Object) {
        return Object.values(row);
      }

      throw new TypeError('Unexpected Response: Malformed rows', {
        cause: dbResponse,
      });
    });

    return { rows };
  }

  return {
    httpQueryD1,
    httpBatchQueryD1: async (queries) => {
      const results: { rows: unknown[][] }[] = [];

      for (const query of queries) {
        const { sql, params, method } = query;
        const result = await httpQueryD1(sql, params, method);
        results.push(result);
      }

      return results;
    },
  }
}
