ALTER TABLE "class_logs" ADD COLUMN "followed_calendar" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "class_logs" ADD COLUMN "calendar_deviation_reason" text;