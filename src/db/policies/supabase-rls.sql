-- Supabase RLS draft for the current project-centered model.
-- Apply this on the Supabase project after schema migrations are synced there.
-- Guest comments and reports stay server-only and should use the service role path.

alter table public.projects enable row level security;
alter table public.project_posts enable row level security;
alter table public.comments enable row level security;
alter table public.project_saves enable row level security;
alter table public.reports enable row level security;
alter table public.project_owners enable row level security;
alter table public.profiles enable row level security;

drop policy if exists projects_public_select on public.projects;
create policy projects_public_select
on public.projects
for select
using (status in ('published', 'limited', 'archived'));

drop policy if exists project_posts_public_select on public.project_posts;
create policy project_posts_public_select
on public.project_posts
for select
using (
  status = 'published'
  and exists (
    select 1
    from public.projects
    where projects.id = project_posts.project_id
      and projects.status in ('published', 'limited', 'archived')
  )
);

drop policy if exists comments_public_select on public.comments;
create policy comments_public_select
on public.comments
for select
using (
  status in ('active', 'deleted')
  and exists (
    select 1
    from public.projects
    where projects.id = comments.project_id
      and projects.status in ('published', 'limited', 'archived')
  )
);

drop policy if exists profiles_select_self on public.profiles;
create policy profiles_select_self
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists project_owners_select_self on public.project_owners;
create policy project_owners_select_self
on public.project_owners
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists project_saves_select_self on public.project_saves;
create policy project_saves_select_self
on public.project_saves
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists project_saves_insert_self on public.project_saves;
create policy project_saves_insert_self
on public.project_saves
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists project_saves_delete_self on public.project_saves;
create policy project_saves_delete_self
on public.project_saves
for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists project_posts_owner_insert on public.project_posts;
create policy project_posts_owner_insert
on public.project_posts
for insert
to authenticated
with check (
  author_user_id = auth.uid()
  and type in ('launch', 'update', 'feedback')
  and exists (
    select 1
    from public.project_owners
    where project_owners.project_id = project_posts.project_id
      and project_owners.user_id = auth.uid()
  )
);

drop policy if exists project_posts_member_feedback_insert on public.project_posts;
create policy project_posts_member_feedback_insert
on public.project_posts
for insert
to authenticated
with check (
  type = 'feedback'
  and author_user_id = auth.uid()
  and exists (
    select 1
    from public.projects
    where projects.id = project_posts.project_id
      and projects.status in ('published', 'limited', 'archived')
  )
);

drop policy if exists reports_select_self on public.reports;
create policy reports_select_self
on public.reports
for select
to authenticated
using (reporter_user_id = auth.uid());

drop policy if exists reports_insert_self on public.reports;
create policy reports_insert_self
on public.reports
for insert
to authenticated
with check (reporter_user_id = auth.uid());

-- Keep direct inserts to comments and anonymous reports disabled at the DB layer.
-- Those routes should continue to go through the server and service-role connection
-- so Turnstile, rate limit, guest fingerprint, and moderation checks run first.
