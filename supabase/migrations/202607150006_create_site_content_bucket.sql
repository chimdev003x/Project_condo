insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-content',
  'site-content',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins manage site content images" on storage.objects;

create policy "Admins manage site content images"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'site-content'
  and (select app_private.is_admin())
)
with check (
  bucket_id = 'site-content'
  and (select app_private.is_admin())
);
