CREATE TYPE "public"."membership_status" AS ENUM('LOCAL_BAPTIZED', 'EXTERNAL_BAPTIZED', 'UNBAPTIZED');--> statement-breakpoint
CREATE TYPE "public"."responsibility_level" AS ENUM('LOHOLONA', 'DIAKONA', 'MAMBRA_TSOTRA');--> statement-breakpoint
CREATE TABLE "churches" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"city" varchar(255) NOT NULL,
	"country" varchar(255) NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" uuid PRIMARY KEY NOT NULL,
	"church_id" uuid NOT NULL,
	"first_name" varchar(120) NOT NULL,
	"last_name" varchar(120) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(40) NOT NULL,
	"membership_status" "membership_status" NOT NULL,
	"responsibility_level" "responsibility_level" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "members_church_email_unique" ON "members" USING btree ("church_id","email");