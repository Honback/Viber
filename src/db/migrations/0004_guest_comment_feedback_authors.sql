ALTER TABLE "project_posts" ADD COLUMN "author_user_id" uuid;
--> statement-breakpoint
UPDATE "project_posts" AS "pp"
SET "author_user_id" = "owner_lookup"."user_id"
FROM (
  SELECT DISTINCT ON ("po"."project_id")
    "po"."project_id",
    "po"."user_id"
  FROM "project_owners" AS "po"
  WHERE "po"."user_id" IS NOT NULL
  ORDER BY "po"."project_id", "po"."is_primary" DESC, "po"."created_at" ASC
) AS "owner_lookup"
WHERE "pp"."project_id" = "owner_lookup"."project_id"
  AND "pp"."author_user_id" IS NULL;
--> statement-breakpoint
ALTER TABLE "project_posts" ADD CONSTRAINT "project_posts_author_user_id_profiles_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "project_posts_author_created_idx" ON "project_posts" USING btree ("author_user_id","created_at");
--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "user_id" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "guest_name" text;
--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "guest_session_hash" text;
--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_identity_check" CHECK (
  ("user_id" IS NOT NULL AND "guest_name" IS NULL AND "guest_session_hash" IS NULL)
  OR ("user_id" IS NULL AND "guest_name" IS NOT NULL AND "guest_session_hash" IS NOT NULL)
);
--> statement-breakpoint
CREATE INDEX "comments_guest_session_created_idx" ON "comments" USING btree ("guest_session_hash","created_at");
