alter table public.properties
  add column if not exists contact_facebook text;

comment on column public.properties.contact_facebook is
  'Optional Facebook profile or page URL supplied for a property listing.';
