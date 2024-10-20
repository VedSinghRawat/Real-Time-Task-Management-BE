ALTER TYPE "role" ADD VALUE 'team_leader';--> statement-breakpoint
ALTER TYPE "role" ADD VALUE 'owner';--> statement-breakpoint
ALTER TABLE "projects" DROP CONSTRAINT "projects_name_owner_id_unique";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "password" SET DATA TYPE varchar;