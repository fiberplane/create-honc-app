import { ZGaggleInsert, ZHonkInsert } from "../db/validation";

// Define runtime validation for request data. This need not be
// derived from the Drizzle schema, but it is here for convenience.

export const ZGaggleInsertPayload = ZGaggleInsert.omit({
  id: true,
});

export const ZHonkInsertPayload = ZHonkInsert.omit({
  id: true,
});

export const ZHonkUpdatePayload = ZHonkInsertPayload.omit({
  gooseId: true,
});
