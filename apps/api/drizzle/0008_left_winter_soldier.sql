CREATE TYPE "public"."rotation_strategy" AS ENUM('FAIR_ROTATION', 'ROUND_ROBIN', 'LEAST_ASSIGNED');--> statement-breakpoint
CREATE TYPE "public"."log_severity" AS ENUM('INFO', 'WARNING', 'CRITICAL');--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY NOT NULL,
	"church_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone,
	"location" varchar(255),
	"cover_image_url" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" uuid PRIMARY KEY NOT NULL,
	"church_id" uuid NOT NULL,
	"rotation_strategy" "rotation_strategy" NOT NULL,
	"weight_participation" integer NOT NULL,
	"weight_recency" integer NOT NULL,
	"weight_assignment" integer NOT NULL,
	"weight_availability" integer NOT NULL,
	"weight_skill" integer NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "site_settings_church_id_unique" UNIQUE("church_id")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"church_id" uuid NOT NULL,
	"actor_id" varchar(255) NOT NULL,
	"action" varchar(100) NOT NULL,
	"module" varchar(100) NOT NULL,
	"entity_id" varchar(255),
	"description" text NOT NULL,
	"old_value" jsonb,
	"new_value" jsonb,
	"severity" "log_severity" NOT NULL,
	"ip_address" varchar(45),
	"correlation_id" varchar(100),
	"hash" varchar(64) NOT NULL,
	"previous_hash" varchar(64),
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "publications" ALTER COLUMN "cover_image_url" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_church_date_idx" ON "audit_logs" USING btree ("church_id","created_at");