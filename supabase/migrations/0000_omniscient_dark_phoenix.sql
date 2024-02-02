
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

CREATE SCHEMA IF NOT EXISTS "supabase_migrations";

ALTER SCHEMA "supabase_migrations" OWNER TO "postgres";

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE TYPE "public"."role" AS ENUM (
    'manager',
    'worker'
);

ALTER TYPE "public"."role" OWNER TO "postgres";

CREATE TYPE "public"."type" AS ENUM (
    'todo',
    'doing',
    'done'
);

ALTER TYPE "public"."type" OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."project_users" (
    "id" bigint NOT NULL,
    "project_id" bigint NOT NULL,
    "user_id" bigint NOT NULL,
    "role" "public"."role",
    "created_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE "public"."project_users" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."project_users_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."project_users_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."project_users_id_seq" OWNED BY "public"."project_users"."id";

CREATE TABLE IF NOT EXISTS "public"."projects" (
    "id" bigint NOT NULL,
    "name" character varying(50) NOT NULL,
    "owner_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE "public"."projects" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."projects_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."projects_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."projects_id_seq" OWNED BY "public"."projects"."id";

CREATE TABLE IF NOT EXISTS "public"."task_users" (
    "id" bigint NOT NULL,
    "user_id" bigint NOT NULL,
    "task_uuid" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE "public"."task_users" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."task_users_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."task_users_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."task_users_id_seq" OWNED BY "public"."task_users"."id";

CREATE TABLE IF NOT EXISTS "public"."tasks" (
    "uuid" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" bigint NOT NULL,
    "description" "text" NOT NULL,
    "estimated_time" integer NOT NULL,
    "time_left" integer NOT NULL,
    "over_time" integer DEFAULT 0 NOT NULL,
    "type" "public"."type" DEFAULT 'todo'::"public"."type" NOT NULL,
    "order" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE "public"."tasks" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" bigint NOT NULL,
    "username" character varying(24) NOT NULL,
    "email" character varying(320) NOT NULL,
    "password" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE "public"."users" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."users_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."users_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."users_id_seq" OWNED BY "public"."users"."id";

CREATE TABLE IF NOT EXISTS "supabase_migrations"."schema_migrations" (
    "version" "text" NOT NULL,
    "statements" "text"[],
    "name" "text"
);

ALTER TABLE "supabase_migrations"."schema_migrations" OWNER TO "postgres";

ALTER TABLE ONLY "public"."project_users" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."project_users_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."projects" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."projects_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."task_users" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."task_users_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."users" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."users_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."project_users"
    ADD CONSTRAINT "project_users_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."project_users"
    ADD CONSTRAINT "project_users_project_id_user_id_unique" UNIQUE ("project_id", "user_id");

ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_name_owner_id_unique" UNIQUE ("name", "owner_id");

ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."task_users"
    ADD CONSTRAINT "task_users_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."task_users"
    ADD CONSTRAINT "task_users_user_id_task_uuid_unique" UNIQUE ("user_id", "task_uuid");

ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_order_type_unique" UNIQUE ("order", "type");

ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_pkey" PRIMARY KEY ("uuid");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_unique" UNIQUE ("email");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_username_unique" UNIQUE ("username");

ALTER TABLE ONLY "supabase_migrations"."schema_migrations"
    ADD CONSTRAINT "schema_migrations_pkey" PRIMARY KEY ("version");

ALTER TABLE ONLY "public"."project_users"
    ADD CONSTRAINT "project_users_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."project_users"
    ADD CONSTRAINT "project_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."task_users"
    ADD CONSTRAINT "task_users_task_uuid_tasks_uuid_fk" FOREIGN KEY ("task_uuid") REFERENCES "public"."tasks"("uuid") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."task_users"
    ADD CONSTRAINT "task_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON TABLE "public"."project_users" TO "anon";
GRANT ALL ON TABLE "public"."project_users" TO "authenticated";
GRANT ALL ON TABLE "public"."project_users" TO "service_role";

GRANT ALL ON SEQUENCE "public"."project_users_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."project_users_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."project_users_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."projects" TO "anon";
GRANT ALL ON TABLE "public"."projects" TO "authenticated";
GRANT ALL ON TABLE "public"."projects" TO "service_role";

GRANT ALL ON SEQUENCE "public"."projects_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."projects_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."projects_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."task_users" TO "anon";
GRANT ALL ON TABLE "public"."task_users" TO "authenticated";
GRANT ALL ON TABLE "public"."task_users" TO "service_role";

GRANT ALL ON SEQUENCE "public"."task_users_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."task_users_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."task_users_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."tasks" TO "anon";
GRANT ALL ON TABLE "public"."tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."tasks" TO "service_role";

GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";

GRANT ALL ON SEQUENCE "public"."users_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."users_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."users_id_seq" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;
