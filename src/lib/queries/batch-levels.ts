import { asc } from "drizzle-orm";
import { db } from "@/db";
import { batchLevels } from "@/db/schema";

export async function listBatchLevels() {
  return db
    .select({ id: batchLevels.id, name: batchLevels.name })
    .from(batchLevels)
    .orderBy(asc(batchLevels.name));
}
