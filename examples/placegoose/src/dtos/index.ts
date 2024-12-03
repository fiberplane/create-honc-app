import { ZGaggleInsert, ZHonkInsert } from "../db/validation";

export const ZGaggleInsertPayload = ZGaggleInsert.omit({
  id: true,
});

export const ZHonkInsertPayload = ZHonkInsert.omit({
  id: true,
});

export const ZHonkUpdatePayload = ZHonkInsertPayload.omit({
  gooseId: true,
});
