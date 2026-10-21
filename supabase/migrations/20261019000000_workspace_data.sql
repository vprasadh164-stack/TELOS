create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 160),
  timezone text not null default 'UTC',
  currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  plan_id text not null default 'starter',
  created_at timestamptz not null default now()
);

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create index workspace_members_user_id_idx on public.workspace_members (user_id);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 160),
  email text check (email is null or char_length(email) <= 254),
  phone text check (phone is null or char_length(phone) <= 64),
  source text check (source is null or char_length(source) <= 120),
  owner_id uuid references auth.users (id) on delete set null,
  estimated_value numeric(12, 2) check (estimated_value is null or estimated_value >= 0),
  stage text not null default 'new'
    check (stage in ('new', 'contacted', 'qualified', 'proposal', 'won', 'lost')),
  won_at timestamptz,
  converted_client_id uuid,
  lost_at timestamptz,
  lost_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, workspace_id),
  check (
    (stage = 'won' and won_at is not null and converted_client_id is not null
      and lost_at is null and lost_reason is null)
    or (stage = 'lost' and lost_at is not null and lost_reason is not null
      and char_length(btrim(lost_reason)) > 0
      and won_at is null and converted_client_id is null)
    or (stage not in ('won', 'lost') and won_at is null and converted_client_id is null
      and lost_at is null and lost_reason is null)
  )
);

create index leads_workspace_created_at_idx on public.leads (workspace_id, created_at desc);
create index leads_workspace_stage_idx on public.leads (workspace_id, stage);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 160),
  email text check (email is null or char_length(email) <= 254),
  phone text check (phone is null or char_length(phone) <= 64),
  source_lead_id uuid,
  owner_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, workspace_id),
  unique (source_lead_id),
  foreign key (source_lead_id, workspace_id)
    references public.leads (id, workspace_id)
);

alter table public.leads
  add constraint leads_converted_client_workspace_fk
  foreign key (converted_client_id, workspace_id)
  references public.clients (id, workspace_id);

create index clients_workspace_created_at_idx on public.clients (workspace_id, created_at desc);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  client_id uuid not null,
  name text not null check (char_length(btrim(name)) between 1 and 160),
  status text not null default 'planning'
    check (status in ('planning', 'in_progress', 'on_hold', 'completed', 'cancelled')),
  owner_id uuid references auth.users (id) on delete set null,
  start_date date,
  deadline date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (client_id, workspace_id)
    references public.clients (id, workspace_id),
  check (deadline is null or start_date is null or deadline >= start_date)
);

create index projects_workspace_created_at_idx on public.projects (workspace_id, created_at desc);
create index projects_client_id_idx on public.projects (client_id);

create table public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  lead_id uuid,
  client_id uuid,
  owner_id uuid references auth.users (id) on delete set null,
  due_at timestamptz not null,
  status text not null default 'open' check (status in ('open', 'sent', 'done')),
  note text not null check (char_length(btrim(note)) between 1 and 1000),
  created_at timestamptz not null default now(),
  check ((lead_id is null) <> (client_id is null)),
  foreign key (lead_id, workspace_id) references public.leads (id, workspace_id),
  foreign key (client_id, workspace_id) references public.clients (id, workspace_id)
);

create index follow_ups_workspace_due_at_idx on public.follow_ups (workspace_id, due_at);
create index follow_ups_lead_id_idx on public.follow_ups (lead_id) where lead_id is not null;
create index follow_ups_client_id_idx on public.follow_ups (client_id) where client_id is not null;

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  entity_type text not null check (entity_type in ('lead', 'client', 'project')),
  entity_id uuid not null,
  actor_kind text not null check (actor_kind in ('member', 'client', 'system')),
  actor_user_id uuid references auth.users (id) on delete set null,
  actor_portal_access_id uuid,
  type text not null check (
    type in (
      'lead_created', 'lead_stage_changed', 'lead_lost', 'lead_converted',
      'follow_up_scheduled', 'follow_up_sent', 'follow_up_completed',
      'project_created', 'project_status_changed', 'milestone_completed',
      'task_completed', 'message_sent', 'file_uploaded', 'client_approved',
      'changes_requested', 'note_added'
    )
  ),
  summary text not null check (char_length(btrim(summary)) between 1 and 1000),
  visibility text not null default 'internal' check (visibility in ('internal', 'portal')),
  occurred_at timestamptz not null default now(),
  check (
    (actor_kind = 'member' and actor_user_id is not null and actor_portal_access_id is null)
    or (actor_kind = 'client' and actor_user_id is null and actor_portal_access_id is not null)
    or (actor_kind = 'system' and actor_user_id is null and actor_portal_access_id is null)
  )
);

create index activities_workspace_occurred_at_idx
  on public.activities (workspace_id, occurred_at desc);
create index activities_entity_idx on public.activities (entity_type, entity_id, occurred_at desc);

create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = target_workspace_id
      and user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_workspace_member(uuid) from public, anon;
grant execute on function public.is_workspace_member(uuid) to authenticated;

create or replace function public.provision_approved_business_workspace()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_workspace_id uuid;
begin
  if tg_op = 'UPDATE' then
    if old.status = new.status then
      return new;
    end if;
  end if;

  if new.status = 'approved' then
    if not exists (
      select 1 from public.workspace_members
      where user_id = new.owner_id and role = 'owner'
    ) then
      insert into public.workspaces (name)
      values (new.business_name)
      returning id into new_workspace_id;

      insert into public.workspace_members (workspace_id, user_id, role)
      values (new_workspace_id, new.owner_id, 'owner');
    end if;
  end if;
  return new;
end;
$$;

revoke all on function public.provision_approved_business_workspace() from public, anon, authenticated;

create trigger business_application_workspace_provisioned
  after insert or update of status on public.business_applications
  for each row
  execute function public.provision_approved_business_workspace();

do $$
declare
  application record;
  new_workspace_id uuid;
begin
  for application in
    select owner_id, business_name
    from public.business_applications
    where status = 'approved'
      and not exists (
        select 1
        from public.workspace_members as member
        where member.user_id = business_applications.owner_id and member.role = 'owner'
      )
  loop
    insert into public.workspaces (name)
    values (application.business_name)
    returning id into new_workspace_id;

    insert into public.workspace_members (workspace_id, user_id, role)
    values (new_workspace_id, application.owner_id, 'owner');
  end loop;
end;
$$;

create or replace function public.set_workspace_row_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_workspace_row_updated_at() from public, anon, authenticated;

create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function public.set_workspace_row_updated_at();
create trigger clients_set_updated_at
  before update on public.clients
  for each row execute function public.set_workspace_row_updated_at();
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_workspace_row_updated_at();

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.leads enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.follow_ups enable row level security;
alter table public.activities enable row level security;

revoke all on public.workspaces, public.workspace_members, public.leads, public.clients,
  public.projects, public.follow_ups, public.activities from anon, authenticated;
grant select on public.workspaces, public.workspace_members to authenticated;
grant select, insert, update on public.leads, public.clients, public.projects, public.follow_ups to authenticated;
grant select, insert on public.activities to authenticated;

create policy "workspace members can read their workspaces"
  on public.workspaces for select to authenticated
  using (public.is_workspace_member(id));
create policy "members can read their workspace membership"
  on public.workspace_members for select to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "workspace members can manage leads"
  on public.leads for all to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
create policy "workspace members can manage clients"
  on public.clients for all to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
create policy "workspace members can manage projects"
  on public.projects for all to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
create policy "workspace members can manage follow-ups"
  on public.follow_ups for all to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
create policy "workspace members can read workspace activities"
  on public.activities for select to authenticated
  using (public.is_workspace_member(workspace_id));
create policy "workspace members can add their own activities"
  on public.activities for insert to authenticated
  with check (
    public.is_workspace_member(workspace_id)
    and actor_kind = 'member'
    and actor_user_id = (select auth.uid())
  );

create or replace function public.create_lead_with_activity(
  p_workspace_id uuid,
  p_name text,
  p_email text default null,
  p_phone text default null,
  p_source text default null,
  p_estimated_value numeric default null
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  new_lead_id uuid;
  clean_name text := btrim(p_name);
  clean_source text := nullif(btrim(coalesce(p_source, '')), '');
begin
  if char_length(clean_name) not between 1 and 160
    or (p_estimated_value is not null and p_estimated_value < 0)
  then
    raise exception 'Enter a valid lead name and estimated value.';
  end if;

  insert into public.leads (
    workspace_id, name, email, phone, source, owner_id, estimated_value
  )
  values (
    p_workspace_id,
    clean_name,
    nullif(lower(btrim(coalesce(p_email, ''))), ''),
    nullif(btrim(coalesce(p_phone, '')), ''),
    clean_source,
    (select auth.uid()),
    p_estimated_value
  )
  returning id into new_lead_id;

  insert into public.activities (
    workspace_id, entity_type, entity_id, actor_kind, actor_user_id, type, summary
  )
  values (
    p_workspace_id, 'lead', new_lead_id, 'member', (select auth.uid()),
    'lead_created',
    'Lead added' || case when clean_source is null then '' else ' from ' || clean_source end
  );

  return new_lead_id;
end;
$$;

create or replace function public.convert_lead_to_client(p_lead_id uuid)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  source_lead public.leads%rowtype;
  target_client_id uuid;
  target_client_name text;
begin
  select * into source_lead
  from public.leads
  where id = p_lead_id
  for update;

  if not found then
    raise exception 'Lead not found or access denied.';
  end if;
  if source_lead.stage not in ('qualified', 'proposal') then
    raise exception 'Only qualified or proposal-stage leads can be converted.';
  end if;

  select id into target_client_id
  from public.clients
  where workspace_id = source_lead.workspace_id
    and (
      source_lead_id = source_lead.id
      or (
        source_lead.email is not null
        and lower(email) = lower(source_lead.email)
      )
    )
  order by (source_lead_id = source_lead.id) desc, created_at
  limit 1;

  if target_client_id is null then
    insert into public.clients (
      workspace_id, name, email, phone, source_lead_id, owner_id
    )
    values (
      source_lead.workspace_id,
      source_lead.name,
      source_lead.email,
      source_lead.phone,
      source_lead.id,
      (select auth.uid())
    )
    returning id into target_client_id;
  else
    update public.clients
    set email = coalesce(email, source_lead.email),
        phone = coalesce(phone, source_lead.phone),
        source_lead_id = coalesce(source_lead_id, source_lead.id)
    where id = target_client_id
    returning name into target_client_name;
  end if;

  update public.leads
  set stage = 'won',
      won_at = now(),
      converted_client_id = target_client_id
  where id = source_lead.id;

  update public.follow_ups
  set lead_id = null, client_id = target_client_id
  where lead_id = source_lead.id and status = 'open';

  insert into public.activities (
    workspace_id, entity_type, entity_id, actor_kind, actor_user_id, type, summary
  )
  values (
    source_lead.workspace_id, 'lead', source_lead.id, 'member', (select auth.uid()),
    'lead_converted',
    'Converted to client: ' || coalesce(target_client_name, source_lead.name)
  );

  return target_client_id;
end;
$$;

create or replace function public.create_project_with_activity(
  p_workspace_id uuid,
  p_client_id uuid,
  p_name text,
  p_start_date date default null,
  p_deadline date default null
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  new_project_id uuid;
  clean_name text := btrim(p_name);
begin
  if char_length(clean_name) not between 1 and 160
    or (p_start_date is not null and p_deadline is not null and p_deadline < p_start_date)
  then
    raise exception 'Enter a valid project name and date range.';
  end if;

  insert into public.projects (
    workspace_id, client_id, name, owner_id, start_date, deadline
  )
  values (
    p_workspace_id, p_client_id, clean_name, (select auth.uid()), p_start_date, p_deadline
  )
  returning id into new_project_id;

  insert into public.activities (
    workspace_id, entity_type, entity_id, actor_kind, actor_user_id, type, summary
  )
  values (
    p_workspace_id, 'project', new_project_id, 'member', (select auth.uid()),
    'project_created', 'Project created: ' || clean_name
  );

  return new_project_id;
end;
$$;

create or replace function public.create_follow_up_with_activity(
  p_workspace_id uuid,
  p_lead_id uuid,
  p_due_at timestamptz,
  p_note text
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  new_follow_up_id uuid;
  clean_note text := btrim(p_note);
begin
  if char_length(clean_note) not between 1 and 1000 then
    raise exception 'Enter a valid follow-up note.';
  end if;

  insert into public.follow_ups (workspace_id, lead_id, owner_id, due_at, note)
  values (p_workspace_id, p_lead_id, (select auth.uid()), p_due_at, clean_note)
  returning id into new_follow_up_id;

  insert into public.activities (
    workspace_id, entity_type, entity_id, actor_kind, actor_user_id, type, summary
  )
  values (
    p_workspace_id, 'lead', p_lead_id, 'member', (select auth.uid()),
    'follow_up_scheduled', 'Follow-up scheduled: ' || clean_note
  );

  return new_follow_up_id;
end;
$$;

create or replace function public.update_follow_up_status(
  p_follow_up_id uuid,
  p_status text,
  p_message text default null
)
returns void
language plpgsql
set search_path = ''
as $$
declare
  target_follow_up public.follow_ups%rowtype;
  activity_summary text;
  activity_type text;
begin
  if p_status not in ('sent', 'done') then
    raise exception 'Unsupported follow-up status.';
  end if;

  select * into target_follow_up
  from public.follow_ups
  where id = p_follow_up_id and status = 'open'
  for update;

  if not found then
    raise exception 'Open follow-up not found or access denied.';
  end if;

  if p_status = 'sent' then
    activity_type := 'follow_up_sent';
    activity_summary := 'Follow-up logged as sent: ' || left(coalesce(p_message, ''), 90);
  else
    activity_type := 'follow_up_completed';
    activity_summary := 'Follow-up completed: ' || target_follow_up.note;
  end if;

  update public.follow_ups set status = p_status where id = p_follow_up_id;

  insert into public.activities (
    workspace_id, entity_type, entity_id, actor_kind, actor_user_id, type, summary
  )
  values (
    target_follow_up.workspace_id,
    case when target_follow_up.lead_id is null then 'client' else 'lead' end,
    coalesce(target_follow_up.lead_id, target_follow_up.client_id),
    'member',
    (select auth.uid()),
    activity_type,
    activity_summary
  );
end;
$$;

revoke all on function public.create_lead_with_activity(uuid, text, text, text, text, numeric)
  from public, anon;
revoke all on function public.convert_lead_to_client(uuid) from public, anon;
revoke all on function public.create_project_with_activity(uuid, uuid, text, date, date)
  from public, anon;
revoke all on function public.create_follow_up_with_activity(uuid, uuid, timestamptz, text)
  from public, anon;
revoke all on function public.update_follow_up_status(uuid, text, text) from public, anon;

grant execute on function public.create_lead_with_activity(uuid, text, text, text, text, numeric)
  to authenticated;
grant execute on function public.convert_lead_to_client(uuid) to authenticated;
grant execute on function public.create_project_with_activity(uuid, uuid, text, date, date)
  to authenticated;
grant execute on function public.create_follow_up_with_activity(uuid, uuid, timestamptz, text)
  to authenticated;
grant execute on function public.update_follow_up_status(uuid, text, text) to authenticated;
