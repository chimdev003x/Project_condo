alter table public.properties
  add column if not exists latitude numeric,
  add column if not exists longitude numeric;

alter table public.properties
  drop constraint if exists properties_latitude_range,
  add constraint properties_latitude_range
    check (latitude is null or latitude between -90 and 90),
  drop constraint if exists properties_longitude_range,
  add constraint properties_longitude_range
    check (longitude is null or longitude between -180 and 180);

comment on column public.properties.latitude is
  'Optional latitude used to display the listing map.';
comment on column public.properties.longitude is
  'Optional longitude used to display the listing map.';

create table if not exists public.listing_settings (
  id smallint primary key default 1 check (id = 1),
  description_max_length integer not null default 10000
    check (description_max_length between 100 and 50000),
  updated_at timestamptz not null default now()
);

insert into public.listing_settings (id, description_max_length)
values (1, 10000)
on conflict (id) do nothing;

alter table public.listing_settings enable row level security;

drop policy if exists "Listing settings are publicly readable" on public.listing_settings;
create policy "Listing settings are publicly readable"
on public.listing_settings for select
to anon, authenticated
using (true);

drop policy if exists "Admins update listing settings" on public.listing_settings;
create policy "Admins update listing settings"
on public.listing_settings for update
to authenticated
using ((select app_private.is_admin()))
with check ((select app_private.is_admin()));

grant select on public.listing_settings to anon, authenticated;
grant update on public.listing_settings to authenticated;

create or replace function public.enforce_property_description_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  maximum_length integer;
begin
  select description_max_length
  into maximum_length
  from public.listing_settings
  where id = 1;

  if new.description is not null and char_length(new.description) > coalesce(maximum_length, 10000) then
    raise exception 'รายละเอียดประกาศยาวเกิน % ตัวอักษร', coalesce(maximum_length, 10000)
      using errcode = '22001';
  end if;
  return new;
end;
$$;

revoke execute on function public.enforce_property_description_limit() from public, anon, authenticated;

drop trigger if exists enforce_property_description_limit on public.properties;
create trigger enforce_property_description_limit
before insert or update of description on public.properties
for each row execute function public.enforce_property_description_limit();

create table if not exists public.amenity_catalog (
  id bigint generated always as identity primary key,
  name text not null unique check (char_length(name) between 1 and 100),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.amenity_catalog (name, sort_order)
values
  ('สระว่ายน้ำ', 1),
  ('ฟิตเนส', 2),
  ('Lobby', 3),
  ('Co-working space', 4),
  ('ที่จอดรถ', 5),
  ('CCTV', 6),
  ('ระบบรักษาความปลอดภัย', 7),
  ('สวนส่วนกลาง', 8)
on conflict (name) do nothing;

alter table public.amenity_catalog enable row level security;

drop policy if exists "Amenity catalog is readable" on public.amenity_catalog;
create policy "Amenity catalog is readable"
on public.amenity_catalog for select
to anon, authenticated
using (is_active or (select app_private.is_admin()));

drop policy if exists "Admins insert amenities" on public.amenity_catalog;
create policy "Admins insert amenities"
on public.amenity_catalog for insert
to authenticated
with check ((select app_private.is_admin()));

drop policy if exists "Admins update amenities" on public.amenity_catalog;
create policy "Admins update amenities"
on public.amenity_catalog for update
to authenticated
using ((select app_private.is_admin()))
with check ((select app_private.is_admin()));

drop policy if exists "Admins delete amenities" on public.amenity_catalog;
create policy "Admins delete amenities"
on public.amenity_catalog for delete
to authenticated
using ((select app_private.is_admin()));

grant select on public.amenity_catalog to anon, authenticated;
grant insert, update, delete on public.amenity_catalog to authenticated;
grant usage, select on sequence public.amenity_catalog_id_seq to authenticated;
