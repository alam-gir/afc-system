INSERT INTO "batch_levels" ("name")
SELECT DISTINCT "level"::text FROM "batches"
ON CONFLICT ("name") DO NOTHING;--> statement-breakpoint
UPDATE "batches" SET "level_id" = "batch_levels"."id"
FROM "batch_levels"
WHERE "batches"."level_id" IS NULL AND "batch_levels"."name" = "batches"."level"::text;--> statement-breakpoint
ALTER TABLE "batches" ALTER COLUMN "level_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "batches" DROP COLUMN "level";--> statement-breakpoint
DROP TYPE "public"."batch_level";
