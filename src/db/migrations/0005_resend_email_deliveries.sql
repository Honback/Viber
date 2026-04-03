CREATE TABLE "email_deliveries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "provider" text DEFAULT 'resend' NOT NULL,
  "template" text NOT NULL,
  "status" text DEFAULT 'queued' NOT NULL,
  "recipient" text NOT NULL,
  "subject" text NOT NULL,
  "from_email" text NOT NULL,
  "html_body" text NOT NULL,
  "text_body" text DEFAULT '' NOT NULL,
  "metadata_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "provider_message_id" text,
  "error" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "sent_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX "email_deliveries_created_idx" ON "email_deliveries" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX "email_deliveries_recipient_idx" ON "email_deliveries" USING btree ("recipient","created_at");
--> statement-breakpoint
CREATE INDEX "email_deliveries_status_idx" ON "email_deliveries" USING btree ("status","created_at");
--> statement-breakpoint
ALTER TABLE "email_deliveries" ADD CONSTRAINT "email_deliveries_status_check" CHECK ("status" in ('queued','sent','failed','simulated'));
