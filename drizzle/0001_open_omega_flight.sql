ALTER TABLE "class_logs" DROP CONSTRAINT "class_logs_created_by_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "class_logs" ALTER COLUMN "created_by_user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "class_logs" ADD CONSTRAINT "class_logs_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;