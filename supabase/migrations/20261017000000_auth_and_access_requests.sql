create table if not exists public.business_applications (
  owner_id uuid primary key references auth.users (id) on delete cascade,
  business_name text not null check (char_length(business_name) between 2 and 160),
  contact_email text not null check (char_length(contact_email) between 3 and 254),
  description text not null check (char_length(description) between 10 and 1200),
  website text check (website is null or char_length(website) <= 2048),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create unique index if not exists business_applications_contact_email_unique
  on public.business_applications (lower(contact_email));

create table if not exists public.customer_access_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users (id) on delete cascade,
  business_owner_id uuid not null references auth.users (id) on delete cascade,
  business_email text not null,
  project_reference text not null check (char_length(project_reference) between 3 and 160),
  note text not null default '' check (char_length(note) <= 1000),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists customer_access_requests_customer_id_created_at_idx
  on public.customer_access_requests (customer_id, created_at desc);

create index if not exists customer_access_requests_business_owner_created_at_idx
  on public.customer_access_requests (business_owner_id, created_at desc);

create unique index if not exists customer_access_requests_one_pending_per_project_idx
  on public.customer_access_requests (
    customer_id,
    business_owner_id,
    lower(project_reference)
  )
  where status = 'pending';

alter table public.business_applications enable row level security;
alter table public.customer_access_requests enable row level security;

revoke all on public.business_applications from anon, authenticated;
grant select on public.business_applications to authenticated;
grant insert (owner_id, business_name, contact_email, description, website, status)
  on public.business_applications to authenticated;
grant update (business_name, contact_email, description, website, status)
  on public.business_applications to authenticated;

create policy "business owners can read their own application"
  on public.business_applications
  for select
  to authenticated
  using (owner_id = (select auth.uid()));

create policy "business owners can submit a pending application"
  on public.business_applications
  for insert
  to authenticated
  with check (
    owner_id = (select auth.uid())
    and status = 'pending'
  );

create policy "business owners can revise an unapproved application"
  on public.business_applications
  for update
  to authenticated
  using (
    owner_id = (select auth.uid())
    and status in ('pending', 'rejected')
  )
  with check (
    owner_id = (select auth.uid())
    and status = 'pending'
  );

revoke all on public.customer_access_requests from anon, authenticated;
grant select on public.customer_access_requests to authenticated;
grant update (status) on public.customer_access_requests to authenticated;

create policy "customers and target businesses can read access requests"
  on public.customer_access_requests
  for select
  to authenticated
  using (
    customer_id = (select auth.uid())
    or business_owner_id = (select auth.uid())
  );

create policy "verified businesses can review their own access requests"
  on public.customer_access_requests
  for update
  to authenticated
  using (
    business_owner_id = (select auth.uid())
    and status = 'pending'
    and exists (
      select 1
      from public.business_applications
      where owner_id = (select auth.uid())
        and status = 'approved'
    )
  )
  with check (
    business_owner_id = (select auth.uid())
    and status in ('approved', 'rejected')
  );

create or replace function public.set_customer_access_request_reviewed_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.status = 'pending' and new.status in ('approved', 'rejected') then
    new.reviewed_at = now();
  end if;
  return new;
end;
$$;

create trigger customer_access_request_reviewed_at
  before update of status on public.customer_access_requests
  for each row
  execute function public.set_customer_access_request_reviewed_at();

revoke all on function public.set_customer_access_request_reviewed_at()
  from public, anon, authenticated;

create or replace function public.submit_customer_access_request(
  p_business_email text,
  p_project_reference text,
  p_note text default ''
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  requesting_user_id uuid := auth.uid();
  target_business_owner_id uuid;
  new_request_id uuid;
  normalized_business_email text := lower(btrim(p_business_email));
  normalized_project_reference text := btrim(p_project_reference);
  normalized_note text := btrim(coalesce(p_note, ''));
begin
  if requesting_user_id is null then
    raise exception 'Sign in before requesting project access.';
  end if;

  if normalized_business_email is null
    or char_length(normalized_business_email) not between 3 and 254
    or normalized_project_reference is null
    or char_length(normalized_project_reference) not between 3 and 160
    or char_length(normalized_note) > 1000
  then
    raise exception 'Enter a valid business email, project reference, and optional note.';
  end if;

  select owner_id
  into target_business_owner_id
  from public.business_applications
  where lower(contact_email) = normalized_business_email
    and status = 'approved';

  if target_business_owner_id is null then
    raise exception 'No verified TELOS business was found for that email.';
  end if;

  if target_business_owner_id = requesting_user_id then
    raise exception 'You cannot request project access from your own business account.';
  end if;

  if (
    select count(*)
    from public.customer_access_requests
    where customer_id = requesting_user_id
      and created_at > now() - interval '1 hour'
  ) >= 10 then
    raise exception 'Too many requests were submitted. Please try again later.';
  end if;

  insert into public.customer_access_requests (
    customer_id,
    business_owner_id,
    business_email,
    project_reference,
    note
  )
  values (
    requesting_user_id,
    target_business_owner_id,
    normalized_business_email,
    normalized_project_reference,
    normalized_note
  )
  returning id into new_request_id;

  return new_request_id;
end;
$$;

revoke all on function public.submit_customer_access_request(text, text, text) from public, anon;
grant execute on function public.submit_customer_access_request(text, text, text) to authenticated;
