CREATE TABLE "batch_levels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "batch_levels_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "batches" ADD COLUMN "level_id" uuid;--> statement-breakpoint
ALTER TABLE "batches" ADD CONSTRAINT "batches_level_id_batch_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."batch_levels"("id") ON DELETE restrict ON UPDATE no action;