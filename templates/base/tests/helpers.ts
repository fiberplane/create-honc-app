import { env } from "cloudflare:test";

const PROJECT_ID = env.NEON_PROJECT_ID;
if (!PROJECT_ID) {
  throw new Error("Missing Environment Variable: NEON_PROJECT_ID");
}

const BEARER_TOKEN = env.NEON_API_TOKEN;
if (!BEARER_TOKEN) {
  throw new Error("Missing Environment Variable: NEON_API_TOKEN");
}

const BASE_URL = `https://console.neon.tech/api/v2/projects/${PROJECT_ID}`;

/**
 * Branch the target database, copying the schema and all current data.
 * @see https://neon.tech/docs/manage/branches#create-a-branch-with-the-api
 * @see https://api-docs.neon.tech/reference/createprojectbranch
 */
const createBranch = async (branchName: string) => {
  const response = await fetch(`${BASE_URL}/branches`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${BEARER_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      branch: {
        name: branchName,
      },
      endpoints: [
        {
          type: "read_write",
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create test branch ${branchName}`, {
      cause: await response.json(),
    });
  }

  const { branch } = await response.json<{
    branch: { id: string };
  }>();

  return branch;
};

/**
 * Get branch connection URI by branch ID.
 * @see https://api-docs.neon.tech/reference/getconnectionuri
 */
const getConnectionUri = async (branchId: string) => {
  const response = await fetch(
    `${BASE_URL}/connection_uri?branch_id=${branchId}&database_name=neondb&role_name=neondb_owner`,
    {
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to get connection URI", {
      cause: await response.json(),
    });
  }

  const { uri } = await response.json<{ uri: string }>();
  return uri;
};

/**
 * Create a test branch based on the database associated with `NEON_PROJECT_ID` in `.dev.vars`.
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
 * @see https://api-docs.neon.tech/reference/deleteprojectbranch
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
