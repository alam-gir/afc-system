"use server";

import { ilike } from "drizzle-orm";
import { db } from "@/db";
import { batchLevels } from "@/db/schema";
import { assertRole } from "@/lib/actions/assert-role";

type CreateBatchLevelResult =
  | { success: true; id: string; name: string }
  | { success: false; error: string };

/** Creates a new batch level, or returns the existing one if the name already exists (case-insensitive). */
export async function createBatchLevel(name: string): Promise<CreateBatchLevelResult> {
  await assertRole("admin");

  const trimmed = name.trim();
  if (!trimmed) return { success: false, error: "invalidInput" };

  const [existing] = await db
    .select({ id: batchLevels.id, name: batchLevels.name })
    .from(batchLevels)
    .where(ilike(batchLevels.name, trimmed))
    .limit(1);
  if (existing) return { success: true, id: existing.id, name: existing.name };

  const [created] = await db
    .insert(batchLevels)
    .values({ name: trimmed })
    .returning({ id: batchLevels.id, name: batchLevels.name });

  return { success: true, id: created.id, name: created.name };
}
