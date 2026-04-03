CREATE TABLE "domain_verifications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "project_id" uuid NOT NULL,
  "registrable_domain" text NOT NULL,
  "record_name" text NOT NULL,
  "token" text NOT NULL,
  "status" text DEFAULT 'pending' NOT NULL,
  "last_checked_at" timestamp with time zone,
  "verified_at" timestamp with time zone,
  "last_error" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "domain_verifications" ADD CONSTRAINT "domain_verifications_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "domain_verifications_project_idx" ON "domain_verifications" USING btree ("project_id");
--> statement-breakpoint
CREATE INDEX "domain_verifications_domain_status_idx" ON "domain_verifications" USING btree ("registrable_domain","status");
--> statement-breakpoint
ALTER TABLE "domain_verifications" ADD CONSTRAINT "domain_verifications_status_check" CHECK ("status" in ('pending','verified','failed','revoked'));
