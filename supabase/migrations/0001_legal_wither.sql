ALTER TABLE "projects" DROP CONSTRAINT "projects_owner_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN IF EXISTS "owner_id";