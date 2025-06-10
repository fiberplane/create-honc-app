import { env } from "cloudflare:test";

const PROJECT_REF = env.SUPABASE_PROJECT_REF;
if (!PROJECT_REF) {
  throw new Error("Missing Environment Variable: SUPABASE_PROJECT_REF");
}

const BEARER_TOKEN = env.SUPABASE_ANON_KEY;
if (!BEARER_TOKEN) {
  throw new Error("Missing Environment Variable: SUPABASE_ANON_KEY");
}

const BASE_URL = "https://api.supabase.com/v1";

/**
 * This file isn't actively used in this template, since Supabase requires
 * a paid subscription to create branches. It has been included to demonstrate
 * how to create temporary testing branches via API.
 * @note To protect user privacy (and minimize branch setup time) it is vital
 * to branch from a dedicated testing or development database.
 */

/**
 * Branch the target database, copying the schema and all current data.
 * Requires Supabase "Pro" plan.
 * @see https://api.supabase.com/api/v1#tag/environments/POST/v1/projects/{ref}/branches
 */
const createBranch = async (branchName: string) => {
  const response = await fetch(`${BASE_URL}/projects/${PROJECT_REF}/branches`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${BEARER_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      branch_name: branchName,
      desired_instance_size: "pico",
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create test branch ${branchName}`, {
      cause: await response.json(),
    });
  }

  const branch = await response.json<{ id: string }>();

  return branch;
};

/**
 * Get branch connection URI by branch ID.
 * @see https://api.supabase.com/api/v1#tag/environments/GET/v1/branches/{branch_id}
 */
const getConnectionUri = async (branchId: string) => {
  const response = await fetch(`${BASE_URL}/branches/${branchId}`, {
    headers: {
      "Authorization": `Bearer ${BEARER_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get connection URI", {
      cause: await response.json(),
    });
  }

  const data = await response.json<{
    db_host: string;
    db_port: number;
    db_user: string;
    db_pass: string;
  }>();

  const { db_host, db_port, db_user, db_pass } = data;

  // connection_string="postgresql://$user.$db_slug:$password@$yourpooler.pooler.supabase.com:5432/postgres"
  return `postgresql://${db_user}:${db_pass}@${db_host}:${db_port}/postgres`;
};

/**
 * Create a test branch based on the database associated with `SUPABASE_PROJECT_REF` in `.dev.vars`.
 * @returns New branch connection URI, and branch ID for post-test cleanup.
 * @throws Error with response data in `cause` if either branch creation or
 * connection URI request fails.
 */
export const createTestBranch = async () => {
  const { id } = await createBranch(`test-${crypto.randomUUID()}`);
  const uri = await getConnectionUri(id);

  return { id, uri };
};

/**
 * Delete branch by ID.
 * @see https://api.supabase.com/api/v1#tag/environments/DELETE/v1/branches/{branch_id}
 */
export const deleteBranch = async (branchId: string) => {
  const response = await fetch(`${BASE_URL}/branches/${branchId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${BEARER_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete branch ${branchId}`, {
      cause: response,
    });
  }
};
