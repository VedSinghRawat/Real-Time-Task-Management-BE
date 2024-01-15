create table "public"."invites" (
    "id" uuid not null default gen_random_uuid(),
    "project_id" bigint not null,
    "user_id" bigint,
    "created_at" timestamp with time zone not null default now()
);


CREATE UNIQUE INDEX invites_pkey ON public.invites USING btree (id);

alter table "public"."invites" add constraint "invites_pkey" PRIMARY KEY using index "invites_pkey";

alter table "public"."invites" add constraint "invites_project_id_fkey" FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE not valid;

alter table "public"."invites" validate constraint "invites_project_id_fkey";

alter table "public"."invites" add constraint "invites_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."invites" validate constraint "invites_user_id_fkey";

grant delete on table "public"."invites" to "anon";

grant insert on table "public"."invites" to "anon";

grant references on table "public"."invites" to "anon";

grant select on table "public"."invites" to "anon";

grant trigger on table "public"."invites" to "anon";

grant truncate on table "public"."invites" to "anon";

grant update on table "public"."invites" to "anon";

grant delete on table "public"."invites" to "authenticated";

grant insert on table "public"."invites" to "authenticated";

grant references on table "public"."invites" to "authenticated";

grant select on table "public"."invites" to "authenticated";

grant trigger on table "public"."invites" to "authenticated";

grant truncate on table "public"."invites" to "authenticated";

grant update on table "public"."invites" to "authenticated";

grant delete on table "public"."invites" to "service_role";

grant insert on table "public"."invites" to "service_role";

grant references on table "public"."invites" to "service_role";

grant select on table "public"."invites" to "service_role";

grant trigger on table "public"."invites" to "service_role";

grant truncate on table "public"."invites" to "service_role";

grant update on table "public"."invites" to "service_role";


