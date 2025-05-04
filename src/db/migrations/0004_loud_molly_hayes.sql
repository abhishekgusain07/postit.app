CREATE TYPE "public"."integration_provider" AS ENUM('youtube', 'instagram', 'facebook', 'twitter', 'linkedin', 'tiktok');--> statement-breakpoint
CREATE TYPE "public"."integration_type" AS ENUM('social_media', 'email', 'crm', 'analytics', 'other');--> statement-breakpoint
CREATE TABLE "integration" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"internal_id" varchar(255) NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"name" varchar(255) NOT NULL,
	"picture" varchar(255),
	"provider_identifier" "integration_provider" NOT NULL,
	"type" "integration_type" NOT NULL,
	"token" text NOT NULL,
	"disabled" boolean DEFAULT false,
	"token_expiration" timestamp with time zone,
	"refresh_token" text,
	"profile" varchar(255),
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"in_between_steps" boolean DEFAULT false,
	"refresh_needed" boolean DEFAULT false,
	"posting_times" jsonb DEFAULT '[]' NOT NULL,
	"custom_instance_details" jsonb,
	"customer_id" varchar(36),
	"root_internal_id" varchar(255),
	"additional_settings" jsonb DEFAULT '[]' NOT NULL,
	CONSTRAINT "integration_internal_id_unique" UNIQUE("internal_id"),
	CONSTRAINT "user_provider_unique" UNIQUE("user_id","provider_identifier")
);
--> statement-breakpoint
ALTER TABLE "integration" ADD CONSTRAINT "integration_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_provider_idx" ON "integration" USING btree ("user_id","provider_identifier");--> statement-breakpoint
CREATE INDEX "internal_id_idx" ON "integration" USING btree ("internal_id");