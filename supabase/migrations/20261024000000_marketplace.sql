create table if not exists public.provider_profiles (
  owner_id uuid primary key references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  kind text not null default 'Freelancer' check (kind in ('Freelancer', 'Company')),
  service text not null check (service in ('plumbing', 'electrical', 'web-design')),
  headline text not null default '' check (char_length(headline) <= 240),
  pricing text not null default '' check (char_length(pricing) <= 240),
  location text not null default '' check (char_length(location) <= 120),
  portfolio text[] not null default '{}' check (cardinality(portfolio) <= 12),
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.provider_contacts (
  owner_id uuid primary key references public.provider_profiles (owner_id) on delete cascade,
  email text not null check (char_length(email) between 3 and 254),
  phone text check (phone is null or char_length(phone) <= 40)
);

create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users (id) on delete cascade,
  provider_id uuid not null references public.provider_profiles (owner_id) on delete cascade,
  service text not null,
  customer_name text not null default '' check (char_length(customer_name) <= 120),
  customer_email text not null check (char_length(customer_email) between 3 and 254),
  message text not null default '' check (char_length(message) <= 1000),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  responded_at timestamptz
);

create unique index if not exists service_requests_one_open_idx
  on public.service_requests (customer_id, provider_id)
  where status in ('pending', 'accepted');
create index if not exists service_requests_provider_idx
  on public.service_requests (provider_id, created_at desc);
create index if not exists service_requests_customer_idx
  on public.service_requests (customer_id, created_at desc);

create table if not exists public.request_messages (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.service_requests (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists request_messages_request_idx
  on public.request_messages (request_id, created_at);

alter table public.provider_profiles enable row level security;
alter table public.provider_contacts enable row level security;
alter table public.service_requests enable row level security;
alter table public.request_messages enable row level security;

revoke all on public.provider_profiles, public.provider_contacts,
  public.service_requests, public.request_messages from anon, authenticated;

grant select on public.provider_profiles to authenticated;
grant insert (owner_id, name, kind, service, headline, pricing, location, portfolio, published)
  on public.provider_profiles to authenticated;
grant update (name, kind, service, headline, pricing, location, portfolio, published)
  on public.provider_profiles to authenticated;

grant select, insert, update on public.provider_contacts to authenticated;

grant select on public.service_requests to authenticated;
grant insert (customer_id, provider_id, service, customer_name, customer_email, message)
  on public.service_requests to authenticated;
grant update (status, responded_at) on public.service_requests to authenticated;

grant select on public.request_messages to authenticated;
grant insert (request_id, sender_id, body) on public.request_messages to authenticated;

create or replace function public.is_approved_business(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.business_applications
    where owner_id = uid and status = 'approved'
  );
$$;

revoke all on function public.is_approved_business(uuid) from public, anon;
grant execute on function public.is_approved_business(uuid) to authenticated;

create policy "published profiles are visible, owners see their own"
  on public.provider_profiles for select to authenticated
  using (published or owner_id = (select auth.uid()));

create policy "approved businesses create their profile"
  on public.provider_profiles for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and (not published or public.is_approved_business((select auth.uid())))
  );

create policy "owners edit their profile"
  on public.provider_profiles for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (
    owner_id = (select auth.uid())
    and (not published or public.is_approved_business((select auth.uid())))
  );

create policy "owners manage their contact details"
  on public.provider_contacts for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "customers see contacts after acceptance"
  on public.provider_contacts for select to authenticated
  using (
    exists (
      select 1 from public.service_requests r
      where r.provider_id = provider_contacts.owner_id
        and r.customer_id = (select auth.uid())
        and r.status = 'accepted'
    )
  );

create policy "participants read requests"
  on public.service_requests for select to authenticated
  using (customer_id = (select auth.uid()) or provider_id = (select auth.uid()));

create policy "customers send requests to published professionals"
  on public.service_requests for insert to authenticated
  with check (
    customer_id = (select auth.uid())
    and provider_id <> (select auth.uid())
    and exists (
      select 1 from public.provider_profiles p
      where p.owner_id = provider_id and p.published
    )
  );

create policy "professionals answer their requests"
  on public.service_requests for update to authenticated
  using (provider_id = (select auth.uid()) and status = 'pending')
  with check (provider_id = (select auth.uid()) and status in ('accepted', 'declined'));

create policy "participants read accepted-request messages"
  on public.request_messages for select to authenticated
  using (
    exists (
      select 1 from public.service_requests r
      where r.id = request_id
        and r.status = 'accepted'
        and (r.customer_id = (select auth.uid()) or r.provider_id = (select auth.uid()))
    )
  );

create policy "participants send accepted-request messages"
  on public.request_messages for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and exists (
      select 1 from public.service_requests r
      where r.id = request_id
        and r.status = 'accepted'
        and (r.customer_id = (select auth.uid()) or r.provider_id = (select auth.uid()))
    )
  );
