ALTER TABLE "project_users" DROP CONSTRAINT "project_users_project_id_user_id_unique";--> statement-breakpoint
ALTER TABLE "project_users" ADD CONSTRAINT "project_users_project_id_user_id_pk" PRIMARY KEY("project_id","user_id");--> statement-breakpoint
ALTER TABLE "project_users" DROP COLUMN IF EXISTS "id";--> statement-breakpoint
ALTER TABLE "project_users" DROP COLUMN IF EXISTS "created_at";